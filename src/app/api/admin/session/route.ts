import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_AGE,
  createAdminSession,
  isAdminAuthenticated,
  isValidAdminPassword,
} from '@/lib/admin-auth'

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() })
}

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin login is unavailable' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  if (typeof body?.password !== 'string' || !isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_AGE,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.delete(ADMIN_COOKIE)
  return response
}
