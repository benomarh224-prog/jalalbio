'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CircleAlert, Package, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { ProductFormDialog } from './product-form-dialog'
import { formatMAD } from '@/lib/admin-utils'
import type { Category, Product } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const panel = 'rounded-[22px] border border-[#e5e8de] bg-white shadow-[0_10px_30px_-25px_#2c493b66]'

export function ProductsManager() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const productsQuery = useQuery<{ products: Product[]; databaseConnected: boolean }>({
    queryKey: ['admin', 'products'],
    queryFn: async () => { const response = await fetch('/api/products', { cache: 'no-store' }); if (!response.ok) throw new Error('فشل تحميل المنتجات'); return response.json() },
  })
  const categoriesQuery = useQuery<{ categories: Category[] }>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => { const response = await fetch('/api/categories', { cache: 'no-store' }); if (!response.ok) throw new Error('فشل تحميل الأصناف'); return response.json() },
  })
  const products = productsQuery.data?.products ?? []
  const categories = categoriesQuery.data?.categories ?? []
  const connected = productsQuery.data?.databaseConnected === true
  const term = search.trim().toLocaleLowerCase()
  const filtered = products.filter((product) => (category === 'all' || product.categoryId === category) && (!term || [product.name, product.nameAr, product.descriptionAr ?? ''].some((value) => value.toLocaleLowerCase().includes(term))))

  const deletion = useMutation({
    mutationFn: async (id: string) => { const response = await fetch(`/api/products/${id}`, { method: 'DELETE' }); if (!response.ok) throw new Error('تعذر حذف المنتج'); return response.json() },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin'] }); queryClient.invalidateQueries({ queryKey: ['products'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleting(null); toast({ title: 'تم حذف المنتج' }) },
    onError: (error: Error) => toast({ title: 'خطأ', description: error.message, variant: 'destructive' }),
  })

  function openForm(product: Product | null) { setEditing(product); setFormOpen(true) }
  return <div className="space-y-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold text-[#ab8752]">الكتالوج</p><h2 className="mt-1 text-2xl font-bold">إدارة المنتجات</h2><p className="mt-1 text-sm text-[#7d8a7e]">{products.length} منتج في المتجر</p></div><button type="button" onClick={() => openForm(null)} disabled={!connected} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1d4435] px-5 text-sm font-semibold text-white hover:bg-[#285743] disabled:cursor-not-allowed disabled:opacity-45"><Plus size={18} />إضافة منتج</button></div>
    {!productsQuery.isPending && !connected && !productsQuery.isError && <div role="status" className="flex items-start gap-3 rounded-[18px] border border-[#ebd39e] bg-[#fff7e7] p-4 text-sm leading-7 text-[#654c26]"><AlertTriangle size={20} className="mt-1 shrink-0" /><p>المنتجات ظاهرة للعرض فقط. ربط قاعدة البيانات مطلوب قبل الإضافة أو التعديل أو الحذف.</p></div>}
    <div className={`${panel} p-4 sm:p-5`}><div className="flex flex-col gap-3 sm:flex-row"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#e2e8dd] bg-[#fafbf8] px-3 focus-within:border-[#a7bba8]"><Search size={18} className="text-[#829284]" /><input aria-label="البحث عن منتج" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن منتج..." className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select aria-label="تصفية حسب الصنف" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 min-w-40 rounded-xl border border-[#e2e8dd] bg-[#fafbf8] px-3 text-sm outline-none"><option value="all">جميع الأصناف</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}</select></div></div>
    {productsQuery.isPending ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-[22px] bg-white" />)}</div> : productsQuery.isError ? <div className={`${panel} p-8 text-center`}><CircleAlert size={32} className="mx-auto text-[#bb8b4a]" /><p className="mt-3 font-semibold">تعذر تحميل المنتجات</p><button type="button" onClick={() => productsQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1d4435] px-4 py-2 text-sm text-white"><RefreshCcw size={16} />إعادة المحاولة</button></div> : filtered.length === 0 ? <div className={`${panel} py-16 text-center`}><Package size={35} className="mx-auto text-[#adb9ad]" /><p className="mt-3 text-sm font-medium text-[#78867a]">لا توجد منتجات مطابقة</p></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <article key={product.id} className={`${panel} flex min-w-0 flex-col overflow-hidden p-4`}>
      <div className="flex min-w-0 gap-4"><div className="relative size-21 shrink-0 overflow-hidden rounded-2xl bg-[#f2f3ed]"><Image src={product.image} alt={product.nameAr} fill sizes="84px" className="object-cover" unoptimized /></div><div className="min-w-0 flex-1"><p className="truncate font-bold">{product.nameAr}</p><p dir="ltr" className="mt-0.5 truncate text-left text-xs text-[#9aa59a]">{product.name}</p><span className="mt-2 inline-block rounded-full bg-[#f3f5ed] px-2.5 py-1 text-[11px] text-[#6e806e]">{product.category?.nameAr ?? categories.find((item) => item.id === product.categoryId)?.nameAr ?? 'بدون صنف'}</span></div></div>
      <div className="mt-5 flex items-end justify-between border-t border-[#edf0e9] pt-4"><div><p className="text-xs text-[#89968a]">السعر</p><p className="mt-1 font-bold text-[#26553b]">{formatMAD(product.price)}</p></div><div className="text-left"><p className="text-xs text-[#89968a]">المخزون</p><p className={`mt-1 text-sm font-bold ${product.stock < 50 ? 'text-[#b26a47]' : 'text-[#516e57]'}`}>{product.stock} {product.unit}</p></div></div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={() => openForm(product)} disabled={!connected} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe6db] text-xs font-semibold hover:bg-[#f3f7f0] disabled:cursor-not-allowed disabled:opacity-45"><Pencil size={15} />تعديل</button><button type="button" onClick={() => setDeleting(product)} disabled={!connected} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#f0ded7] text-xs font-semibold text-[#aa624b] hover:bg-[#fff4ef] disabled:cursor-not-allowed disabled:opacity-45"><Trash2 size={15} />حذف</button></div>
    </article>)}</div>}
    <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} categories={categories} />
    <AlertDialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف المنتج؟</AlertDialogTitle><AlertDialogDescription>سيتم حذف «{deleting?.nameAr}» من المتجر. لا يمكن التراجع عن الحذف.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deletion.isPending}>إلغاء</AlertDialogCancel><AlertDialogAction disabled={deletion.isPending} onClick={() => deleting && deletion.mutate(deleting.id)} className="bg-red-700 text-white hover:bg-red-800">{deletion.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}
