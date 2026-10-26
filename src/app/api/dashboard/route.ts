import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { readStore, storageConnected } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const { document } = await readStore()
    const { orders, products } = document
    const activeOrders = orders.filter((order) => order.status !== 'cancelled')
    const productSales = new Map<string, { name: string; nameAr: string; sales: number; revenue: number }>()
    for (const order of activeOrders) for (const item of order.items || []) {
      const existing = productSales.get(item.productId) || { name: item.name, nameAr: item.name, sales: 0, revenue: 0 }
      existing.sales += item.quantity; existing.revenue += item.price * item.quantity; productSales.set(item.productId, existing)
    }
    const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setUTCDate(date.getUTCDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      return { date: key, revenue: activeOrders.filter((order) => order.createdAt.slice(0, 10) === key).reduce((total, order) => total + order.total, 0) }
    })
    const revenueByStatus = [...new Set(orders.map((order) => order.status))].map((status) => { const matching = orders.filter((order) => order.status === status); return { status, count: matching.length, revenue: status === 'cancelled' ? 0 : matching.reduce((total, order) => total + order.total, 0) } })
    return NextResponse.json({ stats: {
      storageConnected: storageConnected(), totalRevenue: activeOrders.reduce((total, order) => total + order.total, 0), totalOrders: orders.length, totalProducts: products.length, lowStock: products.filter((product) => product.stock < 50).length, pendingOrders: orders.filter((order) => order.status === 'pending').length, recentOrders: orders.slice(0, 6), topProducts: [...productSales.values()].sort((a, b) => b.sales - a.sales).slice(0, 5), dailyRevenue, revenueByStatus,
    } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return storeFailure(error) }
}
