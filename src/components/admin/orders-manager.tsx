'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert, Database, MapPin, Package, Phone, RefreshCcw, Search, ShoppingBag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ORDER_STATUSES, STATUS_LABELS, formatDateAr, formatMAD } from '@/lib/admin-utils'
import type { Order, OrderStatus } from '@/lib/types'

const panel = 'rounded-[22px] border border-[#e5e8de] bg-white shadow-[0_10px_30px_-25px_#2c493b66]'
const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-[#fff4df] text-[#99692c]', confirmed: 'bg-[#e9f2eb] text-[#39724b]', shipped: 'bg-[#e7f0f3] text-[#3d7487]', delivered: 'bg-[#e6f4e9] text-[#327848]', cancelled: 'bg-[#f9eae6] text-[#a85d50]',
}

export function OrdersManager() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const query = useQuery<{ orders: Order[]; storageConnected: boolean }>({
    queryKey: ['admin', 'orders'],
    queryFn: async () => { const response = await fetch('/api/orders', { cache: 'no-store' }); if (!response.ok) throw new Error('فشل تحميل الطلبات'); return response.json() },
    refetchOnWindowFocus: true,
  })
  const orders = query.data?.orders ?? []
  const detail = orders.find((order) => order.id === detailId) ?? null
  const term = search.trim().toLocaleLowerCase()
  const filtered = orders.filter((order) => (status === 'all' || order.status === status) && (!term || [order.orderNumber, order.customerName, order.phone, order.city].some((value) => value.toLocaleLowerCase().includes(term))))
  const update = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: OrderStatus }) => { const response = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }); if (!response.ok) throw new Error('تعذر تحديث حالة الطلب'); return response.json() },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }); toast({ title: 'تم تحديث حالة الطلب' }) },
    onError: (error: Error) => toast({ title: 'خطأ', description: error.message, variant: 'destructive' }),
  })

  return <div className="space-y-5">
    <div><p className="text-xs font-semibold text-[#ab8752]">المبيعات</p><h2 className="mt-1 text-2xl font-bold">إدارة الطلبات</h2><p className="mt-1 text-sm text-[#7d8a7e]">{orders.length} طلب مسجل</p></div>
    {query.data?.storageConnected === false && <div role="status" className="flex items-start gap-3 rounded-[18px] border border-[#ebd39e] bg-[#fff7e7] p-4 text-sm leading-7 text-[#654c26]"><Database size={20} className="mt-1 shrink-0" /><p>حفظ الطلبات غير متاح حالياً. حاول مجدداً لاحقاً.</p></div>}
    <section className={`${panel} p-4 sm:p-5`}><div className="flex flex-col gap-3 sm:flex-row"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#e2e8dd] bg-[#fafbf8] px-3 focus-within:border-[#a7bba8]"><Search size={18} className="text-[#829284]" /><input aria-label="البحث عن طلب" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم، الرقم، الهاتف أو المدينة..." className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select aria-label="تصفية الطلبات حسب الحالة" value={status} onChange={(event) => setStatus(event.target.value as 'all' | OrderStatus)} className="h-11 min-w-40 rounded-xl border border-[#e2e8dd] bg-[#fafbf8] px-3 text-sm outline-none"><option value="all">جميع الحالات</option>{ORDER_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select></div></section>
    {query.isPending ? <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-[22px] bg-white" />)}</div> : query.isError ? <section className={`${panel} p-8 text-center`}><CircleAlert size={32} className="mx-auto text-[#bb8b4a]" /><p className="mt-3 font-semibold">تعذر تحميل الطلبات</p><button type="button" onClick={() => query.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1d4435] px-4 py-2 text-sm text-white"><RefreshCcw size={16} />إعادة المحاولة</button></section> : filtered.length === 0 ? <section className={`${panel} py-16 text-center`}><ShoppingBag size={35} className="mx-auto text-[#adb9ad]" /><p className="mt-3 text-sm font-medium text-[#78867a]">{orders.length === 0 ? 'لا توجد طلبات بعد' : 'لا توجد طلبات مطابقة'}</p></section> : <div className="space-y-3">{filtered.map((order) => <button key={order.id} type="button" onClick={() => setDetailId(order.id)} className={`${panel} flex w-full flex-col gap-4 p-4 text-right transition hover:border-[#b8cbb7] sm:flex-row sm:items-center sm:justify-between sm:p-5`}><div><p className="text-xs font-semibold text-[#9a8156]">{order.orderNumber}</p><h3 className="mt-1 font-bold">{order.customerName}</h3><p className="mt-1 text-xs text-[#8c988c]">{formatDateAr(order.createdAt)}</p></div><div className="flex items-center justify-between gap-4 sm:gap-8"><div className="text-sm text-[#6d7d70]"><p>{order.city}</p><p dir="ltr" className="text-right">{order.phone}</p></div><div className="text-left"><span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${statusColors[order.status]}`}>{STATUS_LABELS[order.status]}</span><p className="mt-2 whitespace-nowrap font-bold">{formatMAD(order.total)}</p></div></div></button>)}</div>}

    <Dialog open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null) }}><DialogContent className="max-h-[90vh] max-w-[640px] overflow-y-auto rounded-[24px] p-0"><DialogHeader className="border-b border-[#e8ebe1] p-5 pb-4 text-right sm:p-6"><DialogTitle>تفاصيل الطلب {detail?.orderNumber}</DialogTitle></DialogHeader>{detail && <div className="space-y-5 p-5 pt-0 sm:p-6 sm:pt-0"><div className="grid gap-3 rounded-2xl bg-[#f7f9f3] p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-[#899589]">العميل</p><p className="mt-1 font-semibold">{detail.customerName}</p></div><div><p className="text-xs text-[#899589]">الهاتف</p><a dir="ltr" href={`tel:${detail.phone}`} className="mt-1 inline-flex items-center gap-1 font-semibold text-[#2d7451]"><Phone size={14} />{detail.phone}</a></div><div><p className="text-xs text-[#899589]">المدينة</p><p className="mt-1 flex items-center gap-1 font-semibold"><MapPin size={14} />{detail.city}</p></div><div><p className="text-xs text-[#899589]">العنوان</p><p className="mt-1 font-semibold">{detail.address}</p></div>{detail.notes && <div className="sm:col-span-2"><p className="text-xs text-[#899589]">ملاحظات</p><p className="mt-1">{detail.notes}</p></div>}</div><div><h3 className="mb-3 font-bold">المنتجات ({detail.items?.length ?? 0})</h3><div className="space-y-2">{detail.items?.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#e9ece3] p-2"><div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f2f3ed]"><Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" unoptimized /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="text-xs text-[#879287]">{item.quantity} × {formatMAD(item.price)}</p></div><p className="text-sm font-bold">{formatMAD(item.price * item.quantity)}</p></div>)}{!detail.items?.length && <p className="rounded-xl border p-4 text-center text-sm text-[#8a958a]"><Package size={20} className="mx-auto mb-2" />لا توجد منتجات</p>}</div></div><div className="flex items-center justify-between border-t border-[#e9ece3] pt-4"><span className="text-sm text-[#788678]">المجموع</span><strong className="text-lg">{formatMAD(detail.total)}</strong></div><label className="block text-sm font-semibold">حالة الطلب<select value={detail.status} onChange={(event) => update.mutate({ id: detail.id, next: event.target.value as OrderStatus })} disabled={update.isPending} className="mt-2 h-11 w-full rounded-xl border border-[#e0e6db] bg-white px-3 text-sm font-normal outline-none disabled:opacity-60">{ORDER_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select></label></div>}</DialogContent></Dialog>
  </div>
}
