import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/admin-auth'
import { saveMedia, StoreError } from '@/lib/store-data'
import { storeFailure } from '@/lib/store-response'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const { prompt } = await request.json()
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 1000) throw new StoreError('اسم المنتج مطلوب', 400)
    const zai = await ZAI.create()
    const response = await zai.images.generations.create({ prompt: `${prompt}, professional product photography, clean background, warm natural lighting, high quality`, size: '1024x1024' })
    const bytes = await sharp(Buffer.from(response.data[0].base64, 'base64')).webp({ quality: 85 }).toBuffer()
    return NextResponse.json({ url: await saveMedia(bytes) })
  } catch (error) { return storeFailure(error) }
}
