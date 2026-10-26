'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'
import { ImageIcon, LoaderCircle, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { Category, Product } from '@/lib/types'

type Fields = { nameAr: string; name: string; descriptionAr: string; description: string; price: string; oldPrice: string; stock: string; unit: string; categoryId: string; origin: string; image: string; featured: boolean }
const empty: Fields = { nameAr: '', name: '', descriptionAr: '', description: '', price: '', oldPrice: '', stock: '0', unit: 'كغ', categoryId: '', origin: '', image: '', featured: false }
const input = 'mt-2 h-11 w-full rounded-xl border border-[#dfe6db] bg-[#fafbf8] px-3 text-sm outline-none focus:border-[#9eb99f] focus:ring-2 focus:ring-[#9eb99f]/20'

export function ProductFormDialog({ open, onOpenChange, product, categories }: { open: boolean; onOpenChange: (open: boolean) => void; product: Product | null; categories: Category[] }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [fields, setFields] = useState<Fields>(empty)
  const [busy, setBusy] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setFields(product ? {
      nameAr: product.nameAr, name: product.name, descriptionAr: product.descriptionAr ?? '', description: product.description ?? '', price: String(product.price), oldPrice: product.oldPrice ? String(product.oldPrice) : '', stock: String(product.stock), unit: product.unit, categoryId: product.categoryId, origin: product.origin ?? '', image: product.image, featured: product.featured,
    } : { ...empty, categoryId: categories[0]?.id ?? '' })
  }, [open, product, categories])

  function change<K extends keyof Fields>(key: K, value: Fields[K]) { setFields((current) => ({ ...current, [key]: value })) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(fields.price)
    const stock = Number(fields.stock)
    if (!fields.nameAr.trim() || !fields.image.trim() || !fields.categoryId || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) { setError('أكمل الاسم، الصنف، الصورة، السعر والمخزون بشكل صحيح.'); return }
    if (fields.oldPrice && (Number(fields.oldPrice) <= 0 || !Number.isFinite(Number(fields.oldPrice)))) { setError('السعر القديم غير صحيح.'); return }
    setBusy(true); setError('')
    try {
      const response = await fetch(product ? `/api/products/${product.id}` : '/api/products', {
        method: product ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, nameAr: fields.nameAr.trim(), name: fields.name.trim() || fields.nameAr.trim(), price, oldPrice: fields.oldPrice ? Number(fields.oldPrice) : null, stock, descriptionAr: fields.descriptionAr.trim() || null, description: fields.description.trim() || null, origin: fields.origin.trim() || null, image: fields.image.trim(), rating: product?.rating ?? 5, reviews: product?.reviews ?? 0 }),
      })
      if (!response.ok) throw new Error('تعذر حفظ المنتج. حاول مجدداً.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ])
      toast({ title: product ? 'تم تحديث المنتج' : 'تمت إضافة المنتج' })
      onOpenChange(false)
    } catch (reason) { setError((reason as Error).message) } finally { setBusy(false) }
  }

  async function generateImage() {
    if (!fields.nameAr.trim()) { setError('أدخل اسم المنتج أولاً.'); return }
    setGenerating(true); setError('')
    try {
      const response = await fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `${fields.nameAr.trim()} Moroccan natural product` }) })
      if (!response.ok) throw new Error('تعذر توليد الصورة. يمكنك وضع رابط صورة بدلاً منها.')
      const result = await response.json()
      if (!result.url) throw new Error('لم ترجع خدمة الصور رابطاً صالحاً.')
      change('image', result.url)
    } catch (reason) { setError((reason as Error).message) } finally { setGenerating(false) }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] max-w-[720px] overflow-y-auto rounded-[24px] p-0"><DialogHeader className="border-b border-[#e9ece3] p-5 pb-4 text-right sm:p-6"><DialogTitle className="text-xl">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle><p className="text-sm text-[#839083]">أدخل معلومات المنتج ثم احفظ التغييرات.</p></DialogHeader>
    <form onSubmit={submit} className="space-y-5 p-5 pt-0 sm:p-6 sm:pt-0">
      <div className="grid gap-4 sm:grid-cols-[112px_1fr]"><div className="relative size-28 overflow-hidden rounded-2xl border border-[#e2e8dd] bg-[#f4f6ef]">{fields.image ? <Image src={fields.image} alt="معاينة المنتج" fill sizes="112px" className="object-cover" unoptimized /> : <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-[#a2aea2]"><ImageIcon size={24} />صورة المنتج</div>}</div><div><label className="text-sm font-semibold">رابط الصورة<input value={fields.image} onChange={(event) => change('image', event.target.value)} className={input} dir="ltr" placeholder="https://... أو /products/image.jpg" /></label><button type="button" onClick={generateImage} disabled={generating} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#31714e] disabled:opacity-50">{generating ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}{generating ? 'جاري التوليد...' : 'توليد صورة'}</button></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">الاسم بالعربية *<input value={fields.nameAr} onChange={(event) => change('nameAr', event.target.value)} className={input} required /></label><label className="text-sm font-semibold">الاسم بالإنجليزية<input value={fields.name} onChange={(event) => change('name', event.target.value)} className={input} dir="ltr" /></label></div>
      <label className="block text-sm font-semibold">الوصف بالعربية<textarea value={fields.descriptionAr} onChange={(event) => change('descriptionAr', event.target.value)} rows={3} className={`${input} h-auto min-h-24 py-3`} /></label>
      <label className="block text-sm font-semibold">الوصف بالإنجليزية<textarea value={fields.description} onChange={(event) => change('description', event.target.value)} rows={2} dir="ltr" className={`${input} h-auto min-h-18 py-3`} /></label>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><label className="text-sm font-semibold">السعر *<input type="number" min="0.01" step="0.01" value={fields.price} onChange={(event) => change('price', event.target.value)} className={input} required /></label><label className="text-sm font-semibold">السعر القديم<input type="number" min="0" step="0.01" value={fields.oldPrice} onChange={(event) => change('oldPrice', event.target.value)} className={input} /></label><label className="text-sm font-semibold">المخزون *<input type="number" min="0" step="1" value={fields.stock} onChange={(event) => change('stock', event.target.value)} className={input} required /></label><label className="text-sm font-semibold">المنشأ<input value={fields.origin} onChange={(event) => change('origin', event.target.value)} className={input} /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">الوحدة<select value={fields.unit} onChange={(event) => change('unit', event.target.value)} className={input}><option value="كغ">كيلوغرام (كغ)</option><option value="لتر">لتر</option><option value="500غ">500 غرام</option><option value="حبة">حبة</option></select></label><label className="text-sm font-semibold">الصنف *<select value={fields.categoryId} onChange={(event) => change('categoryId', event.target.value)} className={input} required><option value="">اختر الصنف</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}</select></label></div>
      <label className="flex items-center gap-3 rounded-xl border border-[#e5eade] bg-[#fafbf8] p-4 text-sm font-semibold"><input type="checkbox" checked={fields.featured} onChange={(event) => change('featured', event.target.checked)} className="size-4 accent-[#285b40]" />إظهار المنتج ضمن المنتجات المميزة</label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-[#e9ece3] pt-4"><button type="button" onClick={() => onOpenChange(false)} disabled={busy} className="h-11 rounded-xl border border-[#e1e7dc] px-5 text-sm font-semibold">إلغاء</button><button type="submit" disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1d4435] px-5 text-sm font-semibold text-white disabled:opacity-50">{busy && <LoaderCircle size={16} className="animate-spin" />}{product ? 'حفظ التغييرات' : 'إضافة المنتج'}</button></div>
    </form>
  </DialogContent></Dialog>
}
