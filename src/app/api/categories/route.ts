import { NextResponse } from 'next/server'
import { readStore } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const { document } = await readStore()
    const categories = document.categories.map((category) => ({ ...category, _count: { products: document.products.filter((product) => product.categoryId === category.id).length } }))
    return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return storeFailure(error) }
}
