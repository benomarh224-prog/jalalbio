import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [orders, products, pendingOrders, lowStockProducts] = await Promise.all([
      db.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.product.findMany(),
      db.order.count({ where: { status: 'pending' } }),
      db.product.findMany({ where: { stock: { lt: 50 } } }),
    ])

    const deliveredAndActive = orders.filter(
      (o) => o.status !== 'cancelled'
    )
    const totalRevenue = deliveredAndActive.reduce((sum, o) => sum + o.total, 0)

    // Top products by quantity sold
    const productSales = new Map<string, { name: string; nameAr: string; sales: number; revenue: number }>()
    for (const order of orders) {
      if (order.status === 'cancelled') continue
      for (const item of order.items) {
        const existing = productSales.get(item.productId) || {
          name: item.name,
          nameAr: item.name,
          sales: 0,
          revenue: 0,
        }
        existing.sales += item.quantity
        existing.revenue += item.price * item.quantity
        productSales.set(item.productId, existing)
      }
    }
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Revenue by status
    const statusMap = new Map<string, { count: number; revenue: number }>()
    for (const order of orders) {
      const existing = statusMap.get(order.status) || { count: 0, revenue: 0 }
      existing.count += 1
      existing.revenue += order.status === 'cancelled' ? 0 : order.total
      statusMap.set(order.status, existing)
    }
    const revenueByStatus = Array.from(statusMap.entries()).map(([status, v]) => ({
      status,
      ...v,
    }))

    // Daily revenue for last 7 days
    const now = new Date()
    const dailyRevenue: { date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const nextDay = new Date(day)
      nextDay.setDate(day.getDate() + 1)
      const dayOrders = orders.filter(
        (o) => o.createdAt >= day && o.createdAt < nextDay && o.status !== 'cancelled'
      )
      dailyRevenue.push({
        date: day.toISOString().slice(0, 10),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      })
    }

    const stats = {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStock: lowStockProducts.length,
      pendingOrders,
      recentOrders: orders.slice(0, 6),
      topProducts,
      revenueByStatus,
      dailyRevenue,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
