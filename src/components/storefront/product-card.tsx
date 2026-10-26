'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { toast } from 'sonner'

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: (p: Product) => void
}) {
  const addItem = useCart((s) => s.addItem)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product, 1)
    toast.success('تمت الإضافة إلى السلة', {
      description: product.nameAr,
    })
  }

  const discount = product.oldPrice
    ? Math.round(
        ((product.oldPrice - product.price) / product.oldPrice) * 100
      )
    : 0

  const outOfStock = product.stock <= 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group bg-card rounded-2xl border overflow-hidden shadow-sm flex flex-col"
    >
      {/* Image */}
      <button
        onClick={() => onOpen(product)}
        className="relative aspect-square bg-muted/30 cursor-pointer overflow-hidden block w-full"
        aria-label={`عرض تفاصيل ${product.nameAr}`}
      >
        <Image
          src={product.image}
          alt={product.nameAr}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            -{discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            مميز
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-foreground font-semibold backdrop-blur-[2px]">
            نفذت الكمية
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 sm:p-4 flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm md:text-base">
          {product.nameAr}
        </h3>

        {product.origin && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.oldPrice} درهم
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              {product.price}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                درهم / {product.unit}
              </span>
            </span>
          </div>
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={outOfStock}
            className="size-9 shrink-0"
            aria-label="أضف للسلة"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
