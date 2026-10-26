import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { readStore, statusInput, updateOrderStatus } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

type Params = { params: Promise<{ id: string }> }
export async function GET(_request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const { id } = await params
    const { document } = await readStore()
    const order = document.orders.find((order) => order.id === id)
    return order ? NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  } catch (error) { return storeFailure(error) }
}
export async function PUT(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const { status } = statusInput.parse(await request.json())
    return NextResponse.json({ order: await updateOrderStatus((await params).id, status) })
  } catch (error) { return storeFailure(error) }
}
