import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { catalogProducts } from '@/lib/catalog'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    if (!process.env.DATABASE_URL) {
      const product = catalogProducts.find((item) => item.id === id)
      return product
        ? NextResponse.json({ product })
        : NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (error) {
    console.error('GET /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not connected' }, { status: 503 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      oldPrice,
      unit,
      image,
      categoryId,
      stock,
      featured,
      rating,
      reviews,
      origin,
    } = body

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        nameAr,
        description: description ?? null,
        descriptionAr: descriptionAr ?? null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        unit,
        image,
        categoryId,
        stock: Number(stock),
        featured: Boolean(featured),
        rating: rating ? Number(rating) : 5,
        reviews: reviews ? Number(reviews) : 0,
        origin: origin ?? null,
      },
      include: { category: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not connected' }, { status: 503 })
  }

  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
