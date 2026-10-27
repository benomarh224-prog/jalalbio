'use client'

import Image from 'next/image'
import { ArrowLeft, Minus, Package, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/storefront-format'

const FREE_SHIP_THRESHOLD = 300

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const items = useCart((state) => state.items)
  const open = useCart((state) => state.isOpen)
  const close = useCart((state) => state.closeCart)
  const remove = useCart((state) => state.removeItem)
  const update = useCart((state) => state.updateQuantity)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal)

  function browse() {
    close()
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Sheet open={open} onOpenChange={(value) => { if (!value) close() }}>
      <SheetContent side="left" className="flex w-full max-w-[440px] flex-col gap-0 border-r-border/60 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-border/60 p-5 text-right">
          <SheetTitle className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#e9f0e3] text-[#315b3d] dark:bg-[#344431] dark:text-[#e3c98e]"><ShoppingBag size={20} /></span><span>سلة التسوق <span className="mr-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}</span></span></SheetTitle>
          <SheetDescription className="mt-1 text-xs">راجع اختياراتك وكمل طلبك بكل سهولة.</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="grid size-20 place-items-center rounded-[28px] bg-muted/60 text-[#879981]"><Package size={34} strokeWidth={1.5} /></div><h3 className="mt-5 text-lg font-bold">سلتك كتسناك</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">اختار من منتجاتنا الطبيعية وزيد المفضلة ديالك للسلة.</p><button type="button" onClick={browse} className="store-action mt-6 inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold">اكتشف المنتجات <ArrowLeft size={17} /></button></div> : <>
          <div className="custom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            <div className="rounded-2xl border border-[#dce6d4] bg-[#f0f5e9] p-3.5 text-[#42633a] dark:border-[#42563b] dark:bg-[#283421] dark:text-[#dfcf9c]"><p className="flex items-center gap-2 text-xs font-medium"><Truck size={17} className="shrink-0" />{remaining === 0 ? 'طلبك مؤهل للتوصيل المجاني' : `باقي ${formatPrice(remaining)} درهم وتستافد من توصيل مجاني`}</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-[#cad9bb] dark:bg-[#495638]"><div className="h-full rounded-full bg-[#678951] transition-[width] dark:bg-[#d5bc77]" style={{ width: `${Math.min(100, subtotal / FREE_SHIP_THRESHOLD * 100)}%` }} /></div></div>
            {items.map((item) => <article key={item.productId} className="rounded-[18px] border border-border/65 bg-card p-3"><div className="flex gap-3"><div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={item.image} alt={item.nameAr} fill sizes="72px" className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h4 className="line-clamp-2 pt-0.5 text-sm font-semibold leading-5">{item.nameAr}</h4><button type="button" aria-label={`حذف ${item.nameAr} من السلة`} onClick={() => remove(item.productId)} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></button></div><p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.price)} درهم / {item.unit}</p></div></div><div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center rounded-xl border border-border/70 bg-muted/25"><button type="button" aria-label={`إنقاص كمية ${item.nameAr}`} onClick={() => update(item.productId, item.quantity - 1)} className="grid size-10 place-items-center rounded-r-xl hover:bg-muted"><Minus size={14} /></button><span className="min-w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span><button type="button" aria-label={`زيادة كمية ${item.nameAr}`} onClick={() => update(item.productId, item.quantity + 1)} className="grid size-10 place-items-center rounded-l-xl hover:bg-muted"><Plus size={14} /></button></div><p className="font-bold text-[#2b5136] dark:text-[#e1c17e]">{formatPrice(item.price * item.quantity)} <span className="text-xs font-medium">درهم</span></p></div></article>)}
          </div>
          <SheetFooter className="gap-3 border-t border-border/60 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>التوصيل</span><span>{remaining === 0 ? 'مجاني' : 'يؤكد عند الاتصال بك'}</span></div><div className="flex items-baseline justify-between"><span className="text-sm font-semibold">مجموع المنتجات</span><strong className="text-2xl text-[#2b5136] dark:text-[#e1c17e]">{formatPrice(subtotal)} <span className="text-xs font-medium">درهم</span></strong></div><button type="button" onClick={() => { close(); onCheckout() }} className="store-action flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold">إتمام الطلب <ArrowLeft size={17} /></button><p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck size={14} />الدفع عند الاستلام</p></SheetFooter>
        </>}
      </SheetContent>
    </Sheet>
  )
}
