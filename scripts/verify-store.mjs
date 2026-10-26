import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { del, get } from '@vercel/blob'
import sharp from 'sharp'

// Run against a local server with a dedicated BLOB_DOCUMENT_PATH in .env.local.
const origin = process.env.VERIFY_ORIGIN || 'http://127.0.0.1:3100'
const documentPath = process.env.BLOB_DOCUMENT_PATH
assert.ok(documentPath?.startsWith('jalalbio/verification-'), 'Use an isolated verification document')
assert.ok(new URL(origin).hostname === '127.0.0.1', 'This check only creates test orders locally')
let cookie = ''
let mediaPath
async function call(path, method = 'GET', body, headers = {}) {
  const response = await fetch(origin + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined })
  const text = await response.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { response, status: response.status, data }
}
try {
  assert.equal((await call('/api/orders')).status, 401)
  assert.equal((await call('/api/products', 'POST', {})).status, 401)
  assert.equal((await call('/api/admin/media', 'POST', {})).status, 401)
  const login = await call('/api/admin/session', 'POST', { password: process.env.ADMIN_PASSWORD })
  assert.equal(login.status, 200)
  cookie = login.response.headers.get('set-cookie').split(';')[0]
  let catalog = (await call('/api/products')).data
  assert.equal(catalog.storageConnected, true)
  assert.equal(catalog.products.length, 7)

  const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#d3be91' } }).png().toBuffer()
  const form = new FormData(); form.set('file', new Blob([image], { type: 'image/png' }), 'verification.png')
  const upload = await call('/api/admin/media', 'POST', form)
  assert.equal(upload.status, 201, JSON.stringify(upload.data))
  mediaPath = 'jalalbio/media/' + upload.data.url.split('/').pop()
  const media = await fetch(origin + upload.data.url)
  assert.equal(media.status, 200); assert.equal(media.headers.get('content-type'), 'image/webp')
  const input = { name: 'Storage verification', nameAr: 'منتج اختبار التخزين', descriptionAr: null, description: null, price: 12.5, oldPrice: null, unit: 'حبة', image: upload.data.url, categoryId: catalog.products[0].categoryId, stock: 1, featured: false, origin: null }
  const created = await call('/api/products', 'POST', input)
  assert.equal(created.status, 201, JSON.stringify(created.data))
  const id = created.data.product.id
  catalog = (await call('/api/products')).data
  const revision = catalog.revision
  assert.equal((await call('/api/products/' + id, 'PUT', { ...input, nameAr: 'منتج اختبار معدل' }, { 'If-Match': revision })).status, 200)
  assert.equal((await call('/api/products/' + id, 'PUT', input, { 'If-Match': revision })).status, 409)
  const customer = { customerName: 'اختبار آلي', phone: '0600000000', city: 'مدينة الاختبار', address: 'عنوان اختبار محلي فقط', items: [{ productId: id, quantity: 1 }] }
  const keys = [randomUUID(), randomUUID()]
  const results = await Promise.all(keys.map((key) => call('/api/orders', 'POST', customer, { 'Idempotency-Key': key })))
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409])
  const winner = results.findIndex((result) => result.status === 201)
  const order = results[winner].data.order
  const repeated = await call('/api/orders', 'POST', customer, { 'Idempotency-Key': keys[winner] })
  assert.equal(repeated.data.order.id, order.id)
  assert.equal((await call('/api/products/' + id)).data.product.stock, 0)
  assert.equal((await call('/api/orders')).data.orders.length, 1)
  assert.equal((await call('/api/dashboard')).data.stats.totalRevenue, 12.5)
  assert.equal((await call('/api/orders/' + order.id, 'PUT', { status: 'invalid' })).status, 400)
  assert.equal((await call('/api/orders/' + order.id, 'PUT', { status: 'cancelled' })).status, 200)
  assert.equal((await call('/api/orders/' + order.id, 'PUT', { status: 'cancelled' })).status, 200)
  assert.equal((await call('/api/products/' + id)).data.product.stock, 1)
  assert.equal((await call('/api/dashboard')).data.stats.totalRevenue, 0)
  const persisted = await get(documentPath, { access: 'private', useCache: false })
  const saved = await new Response(persisted.stream).json()
  assert.equal(saved.orders[0].status, 'cancelled')
  assert.equal(saved.products.find((product) => product.id === id).nameAr, 'منتج اختبار معدل')
  catalog = (await call('/api/products')).data
  assert.equal((await call('/api/products/' + id, 'DELETE', undefined, { 'If-Match': catalog.revision })).status, 200)
  assert.equal((await call('/api/products/' + id)).status, 404)
  assert.equal((await call('/api/orders/' + order.id)).data.order.items.length, 1)
  console.log('PASS: protected admin APIs, image upload/read, persistent product create/edit/delete, stale-write protection, atomic concurrent orders, idempotency, stock restoration and dashboard totals.')
} finally {
  await del([documentPath, ...(mediaPath ? [mediaPath] : [])])
  console.log('Verification document and image removed.')
}
