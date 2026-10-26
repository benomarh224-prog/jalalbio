import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { catalogProducts } from '@/lib/catalog'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    if (!process.env.DATABASE_URL) {
      const query = search?.toLocaleLowerCase() ?? ''
      const products = catalogProducts.filter((product) =>
        (!categoryId || categoryId === 'all' || product.categoryId === categoryId) &&
        (featured !== 'true' || product.featured) &&
        (!query || [product.name, product.nameAr, product.descriptionAr ?? '']
          .some((value) => value.toLocaleLowerCase().includes(query)))
      )
      return NextResponse.json({ products })
    }

    const where: Record<string, unknown> = {}
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId
    if (featured === 'true') where.featured = true
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { descriptionAr: { contains: search } },
      ]
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!name || !nameAr || !price || !unit || !image || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        nameAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        unit,
        image,
        categoryId,
        stock: Number(stock) || 0,
        featured: Boolean(featured),
        rating: rating ? Number(rating) : 5,
        reviews: reviews ? Number(reviews) : 0,
        origin: origin || null,
      },
      include: { category: true },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
