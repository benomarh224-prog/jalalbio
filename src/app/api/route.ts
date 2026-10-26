import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'جلال بيو API',
    version: '1.0.0',
    endpoints: ['/api/products', '/api/categories', '/api/orders', '/api/dashboard'],
  })
}
