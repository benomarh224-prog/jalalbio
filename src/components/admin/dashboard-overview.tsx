'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowUpLeft, CircleAlert, Clock3, Database, Package, RefreshCcw, ShoppingBag, TrendingUp } from 'lucide-react'
import { STATUS_LABELS, formatDateShortAr, formatMAD } from '@/lib/admin-utils'
import type { DashboardStats } from '@/lib/types'

type View = 'overview' | 'products' | 'orders'

const card = 'rounded-[22px] border border-[#e5e8de] bg-white shadow-[0_10px_30px_-25px_#2c493b66]'

export function DashboardOverview({ onNavigate }: { onNavigate: (view: View) => void }) {
  const query = useQuery<{ stats: DashboardStats }>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard', { cache: 'no-store' })
      if (!response.ok) throw new Error('فشل تحميل الإحصائيات')
      return response.json()
    },
    refetchOnWindowFocus: true,
  })

  if (query.isPending) return <div className="space-y-5 animate-pulse"><div className="h-24 rounded-[22px] bg-white" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-[22px] bg-white" />)}</div><div className="h-72 rounded-[22px] bg-white" /></div>
  if (query.isError || !query.data?.stats) return <section className={`${card} p-8 text-center`}><CircleAlert size={34} className="mx-auto text-[#b8894d]" /><h2 className="mt-4 text-lg font-bold">تعذر تحميل لوحة التحكم</h2><p className="mt-1 text-sm text-[#77867a]">تحقق من الاتصال ثم حاول مجدداً.</p><button type="button" onClick={() => query.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1d4435] px-5 py-2.5 text-sm font-semibold text-white"><RefreshCcw size={16} />إعادة المحاولة</button></section>

  const stats = query.data.stats
  const metrics = [
    { label: 'إجمالي المبيعات', value: formatMAD(stats.totalRevenue), icon: TrendingUp, tone: 'bg-[#eaf3e9] text-[#2c7552]' },
    { label: 'الطلبات', value: String(stats.totalOrders), icon: ShoppingBag, tone: 'bg-[#fcf0dd] text-[#b17b32]' },
    { label: 'المنتجات', value: String(stats.totalProducts), icon: Package, tone: 'bg-[#e7edf4] text-[#557391]' },
    { label: 'في الانتظار', value: String(stats.pendingOrders), icon: Clock3, tone: 'bg-[#f5eae6] text-[#ae6c57]' },
  ]
  const maxRevenue = Math.max(...stats.dailyRevenue.map((day) => day.revenue), 1)

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 rounded-[24px] bg-[#1c4335] p-6 text-white shadow-[0_20px_45px_-30px_#193d30] sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div><p className="text-xs font-semibold tracking-wide text-[#dbc58e]">JALALBIO · مساحة العمل</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">مرحبا بك في إدارة المتجر</h2><p className="mt-2 text-sm text-[#d3e2d6]">تابع الطلبات والمنتجات من مكان واحد.</p></div>
      <button type="button" onClick={() => onNavigate('products')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e9ca87] px-5 text-sm font-bold text-[#244334] hover:bg-[#f1d69b]">إدارة المنتجات <ArrowUpLeft size={17} /></button>
    </section>

    {!stats.databaseConnected && <section role="status" className="flex items-start gap-4 rounded-[20px] border border-[#ebd39e] bg-[#fff7e7] p-5 text-[#654c26]"><Database className="mt-0.5 shrink-0" size={22} /><div><h3 className="font-bold">قاعدة البيانات غير مربوطة</h3><p className="mt-1 text-sm leading-7">كتالوج المنتجات ظاهر للعرض. إضافة المنتجات، تعديلها، واستقبال الطلبات تحتاج ربط قاعدة البيانات بالمشروع.</p><a href="https://vercel.com/powerfit1/jalalbio/stores" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">فتح إعدادات التخزين <ArrowUpLeft size={14} /></a></div></section>}

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{metrics.map((metric) => { const Icon = metric.icon; return <section key={metric.label} className={`${card} min-w-0 p-4 sm:p-5`}><div className={`flex size-10 items-center justify-center rounded-xl ${metric.tone}`}><Icon size={20} /></div><p className="mt-4 text-xs font-medium text-[#7a877c] sm:text-sm">{metric.label}</p><p className="mt-1 truncate text-xl font-bold tabular-nums sm:text-2xl">{metric.value}</p></section> })}</div>

    <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <section className={`${card} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">المبيعات خلال الأسبوع</h3><p className="mt-1 text-xs text-[#829084]">آخر 7 أيام</p></div><TrendingUp className="text-[#b19a6e]" size={21} /></div><div className="mt-7 flex h-44 items-end gap-3 border-b border-[#edf0e9] pb-2 sm:gap-5">{stats.dailyRevenue.map((day) => <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div title={formatMAD(day.revenue)} className="w-full max-w-12 rounded-t-lg bg-[#c8a469] transition-all" style={{ height: `${Math.max(8, Math.round(day.revenue / maxRevenue * 100))}%` }} /><span className="whitespace-nowrap text-[10px] text-[#849184] sm:text-xs">{formatDateShortAr(day.date)}</span></div>)}</div>{stats.totalRevenue === 0 && <p className="mt-4 text-center text-xs text-[#91a092]">لا توجد مبيعات مسجلة حالياً</p>}</section>
      <section className={`${card} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">إجراءات سريعة</h3><p className="mt-1 text-xs text-[#829084]">أكثر المهام استخداماً</p></div><Package className="text-[#b19a6e]" size={21} /></div><div className="mt-6 space-y-3"><button type="button" onClick={() => onNavigate('products')} className="flex w-full items-center justify-between rounded-2xl border border-[#e7ebe2] bg-[#fafbf7] p-4 text-sm font-semibold hover:border-[#a2b9a6]"><span className="flex items-center gap-3"><Package size={19} className="text-[#2e7954]" />عرض وإدارة المنتجات</span><ArrowUpLeft size={17} /></button><button type="button" onClick={() => onNavigate('orders')} className="flex w-full items-center justify-between rounded-2xl border border-[#e7ebe2] bg-[#fafbf7] p-4 text-sm font-semibold hover:border-[#a2b9a6]"><span className="flex items-center gap-3"><ShoppingBag size={19} className="text-[#b4823d]" />عرض الطلبات</span><ArrowUpLeft size={17} /></button></div>{stats.lowStock > 0 && <p className="mt-5 rounded-xl bg-[#fff4ed] p-3 text-xs font-medium text-[#a45c3f]">{stats.lowStock} منتج بمخزون منخفض</p>}</section>
    </div>

    <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-[#edf0e9] px-5 py-5 sm:px-6"><div><h3 className="text-lg font-bold">أحدث الطلبات</h3><p className="mt-1 text-xs text-[#829084]">آخر النشاطات في المتجر</p></div><button type="button" onClick={() => onNavigate('orders')} className="text-sm font-bold text-[#2c7953] hover:underline">عرض الكل</button></div>{stats.recentOrders.length === 0 ? <div className="px-5 py-12 text-center"><ShoppingBag size={32} className="mx-auto text-[#b8c1b5]" /><p className="mt-3 text-sm font-medium text-[#758477]">لا توجد طلبات بعد</p></div> : <div className="divide-y divide-[#edf0e9]">{stats.recentOrders.map((order) => <div key={order.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:px-6"><div><p className="font-semibold">{order.customerName}</p><p className="text-xs text-[#899589]">{order.orderNumber}</p></div><p className="hidden text-sm text-[#6f7e72] sm:block">{order.city}</p><span className="rounded-full bg-[#f1f4ed] px-3 py-1 text-xs font-medium">{STATUS_LABELS[order.status]}</span><p className="col-span-2 text-sm font-bold sm:col-span-1">{formatMAD(order.total)}</p></div>)}</div>}</section>
  </div>
}
