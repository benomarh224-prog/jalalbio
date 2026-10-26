import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const ADMIN_COOKIE = 'jalalbio-admin-session'
export const ADMIN_SESSION_AGE = 60 * 60 * 8

function adminPassword() {
  return process.env.ADMIN_PASSWORD
}

export function isValidAdminPassword(candidate: string) {
  const expected = adminPassword()
  if (!expected) return false

  const candidateHash = createHash('sha256').update(candidate).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(candidateHash, expectedHash)
}

function signature(payload: string) {
  const password = adminPassword()
  if (!password) return null
  return createHmac('sha256', password)
    .update(`jalalbio-admin:${payload}`)
    .digest('hex')
}

export function createAdminSession() {
  const payload = `${Date.now()}.${randomBytes(16).toString('hex')}`
  const signed = signature(payload)
  if (!signed) throw new Error('Admin password is not configured')
  return `${payload}.${signed}`
}

function isValidAdminSession(token: string | undefined) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [issuedAt, nonce, signed] = parts
  const issued = Number(issuedAt)
  if (!Number.isSafeInteger(issued) || !/^[a-f0-9]{32}$/.test(nonce)) return false
  if (issued > Date.now() || Date.now() - issued > ADMIN_SESSION_AGE * 1000) {
    return false
  }

  const expected = signature(`${issuedAt}.${nonce}`)
  if (!expected || !/^[a-f0-9]{64}$/.test(signed)) return false
  return timingSafeEqual(Buffer.from(signed, 'hex'), Buffer.from(expected, 'hex'))
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return isValidAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)
}

export async function requireAdmin() {
  if (await isAdminAuthenticated()) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
