import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createOrder, readStore, storageConnected } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const { document } = await readStore()
    const status = request.nextUrl.searchParams.get('status')
    const orders = document.orders.filter((order) => !status || status === 'all' || order.status === status)
    return NextResponse.json({ orders, storageConnected: storageConnected() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return storeFailure(error) }
}
export async function POST(request: NextRequest) {
  try {
    const requestId = request.headers.get('idempotency-key') || randomUUID()
    if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) return NextResponse.json({ error: 'معرف الطلب غير صحيح' }, { status: 400 })
    const order = await createOrder(await request.json(), requestId)
    return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status } }, { status: 201 })
  } catch (error) { return storeFailure(error) }
}
