import 'server-only'
import { randomUUID } from 'node:crypto'
import { BlobPreconditionFailedError, get, head, put } from '@vercel/blob'
import { z } from 'zod'
import { catalogCategories, catalogProducts } from './catalog'
import type { Category, Order, OrderStatus, Product } from './types'

const documentPath = process.env.BLOB_DOCUMENT_PATH || 'jalalbio/store-v1.json'
const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
const optionalText = z.string().max(5000).nullable().optional()
export const productInput = z.object({
  name: z.string().trim().min(1).max(200), nameAr: z.string().trim().min(1).max(200),
  description: optionalText, descriptionAr: optionalText,
  price: z.number().finite().positive().max(1000000), oldPrice: z.number().finite().positive().max(1000000).nullable().optional(),
  unit: z.string().trim().min(1).max(30), image: z.string().max(2000).refine((value) => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value)),
  categoryId: z.string().min(1).max(100), stock: z.number().int().min(0).max(1000000), featured: z.boolean(),
  rating: z.number().min(0).max(5).optional(), reviews: z.number().int().min(0).optional(), origin: z.string().max(200).nullable().optional(),
})
export const orderInput = z.object({
  customerName: z.string().trim().min(2).max(120), phone: z.string().trim().regex(/^(\+?212|0)[5-7]\d{8}$/),
  city: z.string().trim().min(2).max(120), address: z.string().trim().min(5).max(500), notes: z.string().max(2000).nullable().optional(),
  items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(1000) })).min(1).max(100),
})
export const statusInput = z.object({ status: z.enum(statuses) })
type StoreOrder = Order & { requestId?: string }
type StoreDocument = { version: 1; nextOrderNumber: number; categories: Category[]; products: Product[]; orders: StoreOrder[] }
const documentSchema = z.object({
  version: z.literal(1), nextOrderNumber: z.number().int().positive(),
  categories: z.array(z.object({ id: z.string(), name: z.string(), nameAr: z.string(), slug: z.string(), icon: z.string().nullable() })),
  products: z.array(productInput.extend({ id: z.string(), createdAt: z.string(), rating: z.number(), reviews: z.number() })),
  orders: z.array(z.object({ id: z.string(), orderNumber: z.string(), customerName: z.string(), phone: z.string(), city: z.string(), address: z.string(), notes: z.string().nullable(), total: z.number(), status: z.enum(statuses), createdAt: z.string(), requestId: z.string().optional(), items: z.array(z.object({ id: z.string(), orderId: z.string(), productId: z.string(), quantity: z.number(), price: z.number(), name: z.string(), image: z.string() })) })),
})

export class StoreError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
export function storageConnected() { return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) }
const normalizeRevision = (revision: string) => revision.replace(/^W\//i, '')

function initialStore(): StoreDocument {
  return { version: 1, nextOrderNumber: 1001, categories: catalogCategories, products: catalogProducts.map(({ category: _category, ...product }) => product), orders: [] }
}

export async function readStore(): Promise<{ document: StoreDocument; revision: string | null }> {
  if (!storageConnected()) return { document: initialStore(), revision: null }
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await get(documentPath, { access: 'private', useCache: false, headers: { 'Accept-Encoding': 'identity' } })
    if (!result) return { document: initialStore(), revision: null }
    if (result.statusCode !== 200) throw new StoreError('تعذر قراءة بيانات المتجر', 503)
    let revision = result.blob.etag
    if (/^W\//i.test(revision)) {
      const metadata = await head(documentPath)
      if (normalizeRevision(metadata.etag) !== normalizeRevision(revision)) { await result.stream.cancel(); continue }
      revision = metadata.etag
    }
    const document = documentSchema.parse(await new Response(result.stream).json()) as StoreDocument
    return { document, revision: normalizeRevision(revision) }
  }
  throw new StoreError('تغيرت البيانات أثناء القراءة. حاول مجدداً.', 409)
}

export async function updateStore<T>(change: (document: StoreDocument) => T, expectedRevision?: string | null): Promise<T> {
  if (!storageConnected()) throw new StoreError('حفظ البيانات غير متاح حالياً', 503)
  for (let attempt = 0; attempt < 6; attempt++) {
    const { document, revision } = await readStore()
    if (expectedRevision !== undefined && (revision || 'seed') !== normalizeRevision(expectedRevision || 'seed')) throw new StoreError('تغيرت البيانات. حدّث الصفحة ثم أعد التعديل.', 409)
    const result = change(document)
    try {
      await put(documentPath, JSON.stringify(documentSchema.parse(document)), { access: 'private', contentType: 'application/json', addRandomSuffix: false, ...(revision ? { ifMatch: revision } : { allowOverwrite: false }) })
      return result
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError) && !/already exists/i.test(String(error))) throw error
      if (expectedRevision !== undefined || attempt === 5) throw new StoreError('تغيرت البيانات. حدّث الصفحة ثم حاول مجدداً.', 409)
      await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 100))
    }
  }
  throw new StoreError('المتجر مشغول حالياً. حاول مجدداً.', 409)
}

export function withCategories(document: StoreDocument) {
  return document.products.map((product) => ({ ...product, category: document.categories.find((category) => category.id === product.categoryId) }))
}

export async function saveProduct(body: unknown, id?: string, revision?: string) {
  const values = productInput.parse(body)
  const productId = id || randomUUID()
  return updateStore((document) => {
    if (!document.categories.some((category) => category.id === values.categoryId)) throw new StoreError('الصنف غير موجود', 400)
    const existing = document.products.find((product) => product.id === productId)
    if (id && !existing) throw new StoreError('المنتج غير موجود', 404)
    const product: Product = { ...values, description: values.description || null, descriptionAr: values.descriptionAr || null, oldPrice: values.oldPrice || null, origin: values.origin || null, rating: existing?.rating ?? 5, reviews: existing?.reviews ?? 0, id: productId, createdAt: existing?.createdAt || new Date().toISOString() }
    document.products = existing ? document.products.map((item) => item.id === productId ? product : item) : [product, ...document.products]
    return product
  }, id ? revision : undefined)
}

export async function deleteProduct(id: string, revision: string) {
  return updateStore((document) => {
    if (!document.products.some((product) => product.id === id)) throw new StoreError('المنتج غير موجود', 404)
    document.products = document.products.filter((product) => product.id !== id)
    return { success: true }
  }, revision)
}

export async function createOrder(body: unknown, requestId: string) {
  const values = orderInput.parse(body)
  const id = randomUUID()
  return updateStore((document) => {
    const previous = document.orders.find((order) => order.requestId === requestId)
    if (previous) return previous
    const quantities = new Map<string, number>()
    for (const item of values.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
    const items = [...quantities].map(([productId, quantity]) => {
      const product = document.products.find((item) => item.id === productId)
      if (!product) throw new StoreError('أحد المنتجات لم يعد متوفراً', 400)
      if (quantity > product.stock) throw new StoreError(`المخزون غير كافٍ للمنتج: ${product.nameAr}`, 409)
      return { id: randomUUID(), orderId: id, productId, quantity, price: product.price, name: product.nameAr, image: product.image }
    })
    const order: StoreOrder = { id, orderNumber: `CMD-${document.nextOrderNumber++}`, customerName: values.customerName, phone: values.phone, city: values.city, address: values.address, notes: values.notes || null, status: 'pending', createdAt: new Date().toISOString(), total: Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100, items, requestId }
    for (const item of items) document.products.find((product) => product.id === item.productId)!.stock -= item.quantity
    document.orders.unshift(order)
    return order
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateStore((document) => {
    const order = document.orders.find((item) => item.id === id)
    if (!order) throw new StoreError('الطلب غير موجود', 404)
    if (order.status === status) return order
    if (order.status === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items || []) {
        const product = document.products.find((product) => product.id === item.productId)
        if (!product || product.stock < item.quantity) throw new StoreError('المخزون لا يكفي لإعادة تفعيل الطلب', 409)
        product.stock -= item.quantity
      }
    } else if (status === 'cancelled') {
      for (const item of order.items || []) { const product = document.products.find((product) => product.id === item.productId); if (product) product.stock += item.quantity }
    }
    order.status = status
    return order
  })
}

export async function saveMedia(bytes: Buffer) {
  if (!storageConnected()) throw new StoreError('رفع الصور غير متاح حالياً', 503)
  const id = `${randomUUID()}.webp`
  await put(`jalalbio/media/${id}`, bytes, { access: 'private', contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: false })
  return `/api/media/${id}`
}

export async function readMedia(id: string) {
  if (!storageConnected() || !/^[a-f0-9-]{36}\.webp$/.test(id)) return null
  const result = await get(`jalalbio/media/${id}`, { access: 'private' })
  return result?.statusCode === 200 ? result.stream : null
}
