'use client'

import Image from 'next/image'
import { Leaf, Plus, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/storefront-format'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

export function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const addItem = useCart((state) => state.addItem)
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((product.oldPrice - product.price) / product.oldPrice * 100) : 0
  const available = product.stock > 0

  function add() {
    addItem(product, 1)
    toast.success('تمت الإضافة إلى السلة', { description: product.nameAr })
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-border/70 bg-card shadow-[0_8px_24px_-20px_#173d2a66] transition-shadow hover:shadow-[0_14px_30px_-20px_#173d2a77]">
      <button type="button" onClick={() => onOpen(product)} aria-label={`عرض تفاصيل ${product.nameAr}`} className="relative block aspect-[1.08] w-full overflow-hidden bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary">
        <Image src={product.image} alt={product.nameAr} fill sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
        {discount > 0 && <span className="absolute right-2.5 top-2.5 rounded-full bg-[#f3d59a] px-2.5 py-1 text-[10px] font-bold text-[#47391e] shadow-sm sm:text-xs">وفر {discount}%</span>}
        {product.featured && <span className="absolute left-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/95 text-[#315d40] shadow-sm" title="منتج مميز"><Leaf size={15} /></span>}
        {!available && <span className="absolute inset-0 grid place-items-center bg-background/75 text-sm font-semibold text-foreground backdrop-blur-[2px]">نفذت الكمية</span>}
      </button>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
          <span className="truncate">{product.category?.nameAr || 'منتج طبيعي'}</span>
          <span className="inline-flex shrink-0 items-center gap-1"><Star size={11} className="fill-[#d6ab52] text-[#d6ab52]" />{product.rating.toFixed(1)}</span>
        </div>
        <h3 className="mb-3"><button type="button" onClick={() => onOpen(product)} className="min-h-11 w-full text-right text-sm font-semibold leading-5 text-foreground hover:text-primary sm:text-base sm:leading-6"><span className="line-clamp-2">{product.nameAr}</span></button></h3>
        <div className="mt-auto border-t border-border/55 pt-3">
          <div className="flex min-h-7 flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-bold tracking-tight text-[#284d35] dark:text-[#e9c87e] sm:text-2xl">{formatPrice(product.price)} <span className="text-[10px] font-medium sm:text-xs">درهم</span></span>
            {discount > 0 && <span className="text-[10px] text-muted-foreground line-through sm:text-xs">{formatPrice(product.oldPrice!)}</span>}
          </div>
          <p className="mb-3 mt-0.5 text-[10px] text-muted-foreground sm:text-xs">لكل {product.unit}</p>
          <button type="button" onClick={add} disabled={!available} className="store-action inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"><Plus size={16} />{available ? 'أضف للسلة' : 'غير متوفر'}</button>
        </div>
      </div>
    </article>
  )
}
