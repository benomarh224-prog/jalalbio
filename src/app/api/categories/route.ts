import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { catalogCategories } from '@/lib/catalog'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ categories: catalogCategories })
    }

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
