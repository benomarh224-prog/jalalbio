import { NextRequest } from 'next/server'
import { readMedia } from '@/lib/store-data'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const stream = await readMedia((await params).id)
    return stream ? new Response(stream, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } }) : new Response('Not found', { status: 404 })
  } catch { return new Response('Image unavailable', { status: 503 }) }
}
