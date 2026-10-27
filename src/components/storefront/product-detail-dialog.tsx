'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MapPin, Plus, Minus, ShoppingCart, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/storefront-format'

export function ProductDetailDialog({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const open = !!product
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90dvh] overflow-y-auto custom-scroll rounded-[26px] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.nameAr ?? 'تفاصيل المنتج'}</DialogTitle>
          <DialogDescription>{product?.descriptionAr ?? ''}</DialogDescription>
        </DialogHeader>
        {product && (
          <ProductDetailContent
            key={product.id}
            product={product}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProductDetailContent({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    addItem(product, qty)
    toast.success('تمت الإضافة إلى السلة', {
      description: `${product.nameAr} × ${qty}`,
    })
    onClose()
  }

  const outOfStock = product.stock <= 0
  const hasDiscount = product.oldPrice !== null && product.oldPrice > product.price

  return (
    <div className="grid md:grid-cols-2">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30 md:aspect-auto md:min-h-[430px]">
        <Image
          src={product.image}
          alt={product.nameAr}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {hasDiscount && (
          <span className="absolute top-4 right-4 bg-[#f3d59a] text-[#47391e] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            -{Math.round(
              ((product.oldPrice! - product.price) / product.oldPrice!) * 100
            )}
            %
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{product.category?.nameAr || 'من خيرات المغرب'}</p>
          <h2 className="text-2xl font-bold mb-3 font-amiri">
            {product.nameAr}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {product.origin && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="size-3" />
                {product.origin}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({product.reviews} تقييم)
              </span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          {product.descriptionAr || 'لا يوجد وصف متاح.'}
        </p>

        <div className="flex items-baseline gap-2 flex-wrap">
          {hasDiscount && (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.oldPrice!)} درهم
            </span>
          )}
          <span className="text-3xl font-bold text-[#2c5339] dark:text-[#e4c383]">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            درهم / {product.unit}
          </span>
        </div>

        <Separator />

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">الكمية:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-xl"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="إنقاص"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-semibold">{qty}</span>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-xl"
              disabled={qty >= product.stock}
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              aria-label="زيادة"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {outOfStock ? (
            <Badge variant="destructive">نفذت الكمية</Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 text-emerald-600 border-emerald-200 dark:border-emerald-800/50 dark:text-emerald-400"
            >
              <Check className="size-3" />
              متوفر ({product.stock})
            </Badge>
          )}
        </div>

        <Button
          size="lg"
          className="store-action mt-1 h-12 w-full rounded-xl"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          <ShoppingCart className="size-4" />
          أضف إلى السلة • {formatPrice(product.price * qty)} درهم
        </Button>
      </div>
    </div>
  )
}
