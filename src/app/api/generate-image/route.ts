import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()
    const response = await zai.images.generations.create({
      prompt: `${prompt}, professional product photography, clean background, warm natural lighting, high quality`,
      size: '1024x1024',
    })

    const imageBase64 = response.data[0].base64
    const buffer = Buffer.from(imageBase64, 'base64')

    // Save to public/products with unique name
    const filename = `gen-${Date.now()}.png`
    const outputDir = path.join(process.cwd(), 'public', 'products')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const filepath = path.join(outputDir, filename)
    fs.writeFileSync(filepath, buffer)

    return NextResponse.json({ url: `/products/${filename}` })
  } catch (error) {
    console.error('POST /api/generate-image error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
