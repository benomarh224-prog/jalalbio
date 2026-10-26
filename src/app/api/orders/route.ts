import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ orders: [], databaseConnected: false })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders, databaseConnected: true })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Orders are unavailable' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { customerName, phone, city, address, notes, items } = body

    if (!customerName || !phone || !city || !address || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify products & compute total
    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })

    let total = 0
    const orderItems = items.map(
      (i: { productId: string; quantity: number }) => {
        const p = products.find((pr) => pr.id === i.productId)
        if (!p) throw new Error(`Product ${i.productId} not found`)
        total += p.price * i.quantity
        return {
          productId: i.productId,
          quantity: i.quantity,
          price: p.price,
          name: p.nameAr,
          image: p.image,
        }
      }
    )

    // Generate order number
    const count = await db.order.count()
    const orderNumber = `CMD-${1000 + count + 1}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        city,
        address,
        notes: notes || null,
        total,
        status: 'pending',
        items: { create: orderItems },
      },
      include: { items: true },
    })

    // Decrement stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
