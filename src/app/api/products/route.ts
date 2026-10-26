import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { readStore, saveProduct, storageConnected, withCategories } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { document, revision } = await readStore()
    const params = request.nextUrl.searchParams
    const category = params.get('categoryId')
    const featured = params.get('featured') === 'true'
    const search = params.get('search')?.trim().toLocaleLowerCase() || ''
    const products = withCategories(document).filter((product) => (!category || category === 'all' || product.categoryId === category) && (!featured || product.featured) && (!search || [product.name, product.nameAr, product.descriptionAr || ''].some((value) => value.toLocaleLowerCase().includes(search))))
    return NextResponse.json({ products, storageConnected: storageConnected(), revision: revision || 'seed' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return storeFailure(error) }
}
export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try { return NextResponse.json({ product: await saveProduct(await request.json()) }, { status: 201 }) }
  catch (error) { return storeFailure(error) }
}
