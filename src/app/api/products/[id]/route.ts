import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteProduct, readStore, saveProduct, withCategories } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

type Params = { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const { document, revision } = await readStore()
    const product = withCategories(document).find((product) => product.id === id)
    return product ? NextResponse.json({ product, revision: revision || 'seed' }, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
  } catch (error) { return storeFailure(error) }
}
export async function PUT(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const revision = request.headers.get('if-match')
  if (!revision) return NextResponse.json({ error: 'حدّث الصفحة قبل التعديل' }, { status: 428 })
  try { return NextResponse.json({ product: await saveProduct(await request.json(), (await params).id, revision) }) }
  catch (error) { return storeFailure(error) }
}
export async function DELETE(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const revision = request.headers.get('if-match')
  if (!revision) return NextResponse.json({ error: 'حدّث الصفحة قبل الحذف' }, { status: 428 })
  try { return NextResponse.json(await deleteProduct((await params).id, revision)) }
  catch (error) { return storeFailure(error) }
}
