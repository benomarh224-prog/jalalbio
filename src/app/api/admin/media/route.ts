import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/admin-auth'
import { saveMedia, StoreError } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const file = (await request.formData()).get('file')
    if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4_000_000) throw new StoreError('اختر صورة JPG أو PNG أو WebP أقل من 4 ميغابايت', 400)
    let bytes: Buffer
    try { bytes = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 }).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer() }
    catch { throw new StoreError('الصورة غير صالحة', 400) }
    return NextResponse.json({ url: await saveMedia(bytes) }, { status: 201 })
  } catch (error) { return storeFailure(error) }
}
