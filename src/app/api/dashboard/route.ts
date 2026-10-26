import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { catalogProducts } from '@/lib/catalog'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.DATABASE_URL) {
    const dailyRevenue = Array.from({ length: 7 }, (_, index) => ({
      date: new Date(Date.now() - (6 - index) * 86_400_000).toISOString().slice(0, 10),
      revenue: 0,
    }))
    return NextResponse.json({
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: catalogProducts.length,
        lowStock: catalogProducts.filter((product) => product.stock < 50).length,
        pendingOrders: 0,
        recentOrders: [],
        topProducts: [],
        revenueByStatus: [],
        dailyRevenue,
        databaseConnected: false,
      },
    })
  }

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
      databaseConnected: true,
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
