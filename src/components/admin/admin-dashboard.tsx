'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ChartNoAxesCombined, ExternalLink, Leaf, LoaderCircle, LockKeyhole, LogOut, Menu, Package, ShoppingBag, X } from 'lucide-react'
import { DashboardOverview } from './dashboard-overview'
import { ProductsManager } from './products-manager'
import { OrdersManager } from './orders-manager'

type View = 'overview' | 'products' | 'orders'
const navigation = [
  { id: 'overview', label: 'الرئيسية', icon: ChartNoAxesCombined },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
] as const

function LoginScreen({ onLogin }: { onLogin: (password: string) => Promise<boolean> }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const signedIn = await onLogin(password)
    if (!signedIn) setError('تعذر الدخول. تأكد من كلمة المرور وحاول مجدداً.')
    setBusy(false)
  }

  return <main className="admin-canvas flex min-h-screen items-center justify-center px-5 py-10">
    <div className="w-full max-w-[430px]">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-[22px] bg-[#193e32] text-[#e8cb88] shadow-xl shadow-[#193e32]/20"><Leaf size={30} strokeWidth={1.7} /></div>
        <p className="mb-2 text-xs font-bold tracking-[.25em] text-[#997c4f]">JALALBIO STORE</p>
        <h1 className="text-3xl font-bold text-[#1e392e]">لوحة إدارة المتجر</h1>
        <p className="mt-2 text-sm text-[#667269]">أدخل كلمة المرور للوصول إلى لوحة التحكم</p>
      </div>
      <form onSubmit={submit} className="rounded-[28px] border border-[#e8e6dc] bg-white p-6 shadow-[0_20px_60px_-35px_#23412e55] sm:p-8">
        <label htmlFor="admin-password" className="mb-3 block text-sm font-semibold text-[#304337]">كلمة المرور</label>
        <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dedfd4] bg-[#fafaf7] px-4 focus-within:border-[#b38842] focus-within:ring-2 focus-within:ring-[#b38842]/15">
          <LockKeyhole size={18} className="shrink-0 text-[#9b8a68]" />
          <input id="admin-password" type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" className="h-full w-full bg-transparent text-left text-base outline-none placeholder:text-[#b9bcb1]" required />
        </div>
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !password} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4435] font-semibold text-white transition hover:bg-[#285743] disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <LoaderCircle size={19} className="animate-spin" /> : <ArrowLeft size={19} />}{busy ? 'جاري الدخول...' : 'دخول إلى اللوحة'}
        </button>
      </form>
      <a href="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#52695b] hover:text-[#1d4435]"><ExternalLink size={15} /> الرجوع إلى المتجر</a>
    </div>
  </main>
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [view, setView] = useState<View>('overview')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => { if (active) setAuthenticated(result.authenticated === true) })
      .catch(() => { if (active) setAuthenticated(false) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  async function login(password: string) {
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      if (!response.ok) return false
      setAuthenticated(true)
      return true
    } catch { return false }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => null)
    queryClient.removeQueries({ queryKey: ['admin'] })
    setAuthenticated(false)
    setView('overview')
    setMenuOpen(false)
  }

  function navigate(next: View) { setView(next); setMenuOpen(false) }
  if (checking) return <div className="admin-canvas flex min-h-screen items-center justify-center"><LoaderCircle className="size-8 animate-spin text-[#1d4435]" aria-label="جاري التحقق من الجلسة" /></div>
  if (!authenticated) return <LoginScreen onLogin={login} />

  const title = navigation.find((item) => item.id === view)?.label ?? 'الرئيسية'
  return <div className="admin-canvas min-h-screen text-[#20382d]">
    <div className="mx-auto flex min-h-screen max-w-[1800px]">
      {menuOpen && <button type="button" aria-label="إغلاق القائمة" className="fixed inset-0 z-40 bg-[#142b20]/45 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`${menuOpen ? 'translate-x-0' : 'translate-x-full'} fixed inset-y-0 right-0 z-50 flex w-[270px] flex-col bg-[#193d30] text-[#f7f5e9] shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none`}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#e7c786] text-[#193d30]"><Leaf size={23} /></div><div><p className="font-bold leading-5">جلال بيو</p><p className="mt-1 text-[11px] tracking-[.18em] text-[#dfc795]">ADMIN PANEL</p></div></div>
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"><X size={20} /></button>
        </div>
        <div className="flex-1 px-3 py-7"><p className="mb-3 px-4 text-[11px] font-bold tracking-wide text-[#b7c9bb]">إدارة المتجر</p><nav aria-label="أقسام لوحة التحكم" className="space-y-1">{navigation.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => navigate(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${view === item.id ? 'bg-[#e8cb88] text-[#193d30] shadow-sm' : 'text-[#dae4d9] hover:bg-white/10'}`}><Icon size={19} strokeWidth={1.8} />{item.label}</button> })}</nav></div>
        <div className="space-y-1 border-t border-white/10 px-3 py-4"><a href="/" className="flex h-11 items-center gap-3 rounded-xl px-4 text-sm text-[#dae4d9] hover:bg-white/10"><ExternalLink size={18} />فتح المتجر</a><button type="button" onClick={logout} className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm text-[#dae4d9] hover:bg-white/10"><LogOut size={18} />تسجيل الخروج</button></div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e8e9df] bg-[#fbfbf7]/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><button type="button" aria-label="فتح القائمة" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-xl border border-[#e4e8dd] bg-white lg:hidden"><Menu size={20} /></button><div><p className="text-[11px] font-medium text-[#829083]">لوحة التحكم / {title}</p><h1 className="mt-0.5 text-lg font-bold sm:text-xl">{title}</h1></div></div>
          <div className="flex items-center gap-2"><a href="/" className="hidden h-10 items-center gap-2 rounded-xl border border-[#e2e6dc] bg-white px-4 text-sm font-medium hover:bg-[#f4f5ee] sm:flex"><ExternalLink size={16} />عرض المتجر</a><button type="button" onClick={logout} aria-label="تسجيل الخروج" title="تسجيل الخروج" className="flex size-10 items-center justify-center rounded-xl border border-[#e2e6dc] bg-white hover:bg-[#f4f5ee]"><LogOut size={17} /></button></div>
        </header>
        <main className="mx-auto max-w-[1450px] px-4 pb-24 pt-6 sm:px-8 sm:pt-8 lg:pb-10">{view === 'overview' && <DashboardOverview onNavigate={navigate} />}{view === 'products' && <ProductsManager />}{view === 'orders' && <OrdersManager />}</main>
        <footer className="mx-auto max-w-[1450px] border-t border-[#e9eae1] px-4 py-5 text-xs text-[#859185] sm:px-8">Jalalbio Store · لوحة الإدارة</footer>
      </div>
    </div>
    <nav aria-label="تنقل سريع" className="fixed inset-x-0 bottom-0 z-30 grid h-17 grid-cols-3 border-t border-[#e5e8dc] bg-white/95 backdrop-blur lg:hidden">{navigation.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => navigate(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${view === item.id ? 'text-[#1d5a40]' : 'text-[#8a968c]'}`}><Icon size={21} />{item.label}</button> })}</nav>
  </div>
}
