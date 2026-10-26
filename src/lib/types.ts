// Shared types for the storefront & admin

export type Category = {
  id: string
  name: string
  nameAr: string
  slug: string
  icon: string | null
}

export type Product = {
  id: string
  name: string
  nameAr: string
  description: string | null
  descriptionAr: string | null
  price: number
  oldPrice: number | null
  unit: string
  image: string
  categoryId: string
  stock: number
  featured: boolean
  rating: number
  reviews: number
  origin: string | null
  createdAt: string
  category?: Category
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  name: string
  image: string
}

export type Order = {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  city: string
  address: string
  notes: string | null
  total: number
  status: OrderStatus
  createdAt: string
  items?: OrderItem[]
}

export type CartItem = {
  productId: string
  name: string
  nameAr: string
  price: number
  image: string
  unit: string
  quantity: number
}

export type DashboardStats = {
  storageConnected: boolean
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  lowStock: number
  pendingOrders: number
  recentOrders: Order[]
  topProducts: { name: string; nameAr: string; sales: number; revenue: number }[]
  revenueByStatus: { status: string; count: number; revenue: number }[]
  dailyRevenue: { date: string; revenue: number }[]
}
