'use client'

import { motion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

export type CategoryWithCount = Category & { _count: { products: number } }

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return Icons.Tag
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Tag
}

export function CategoriesStrip({
  categories,
  active,
  onSelect,
  productsCount,
}: {
  categories: CategoryWithCount[]
  active: string
  onSelect: (id: string) => void
  productsCount: number
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const categoryIds = categories.map((category) => category.id).join('|')

  useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    // RTL scrollLeft=0 is the logical start. Reset after async items and browser restoration.
    const reset = () => { strip.scrollLeft = 0 }
    reset()
    let frame = requestAnimationFrame(reset)
    const onPageShow = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(reset)
    }
    window.addEventListener('pageshow', onPageShow)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [categoryIds])

  const list: CategoryWithCount[] = [
    {
      id: 'all',
      name: 'All',
      nameAr: 'الكل',
      slug: 'all',
      icon: 'LayoutGrid',
      _count: { products: productsCount },
    },
    ...categories,
  ]

  return (
    <section id="categories" className="scroll-mt-20 py-6 md:py-10 border-b border-border/60">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-center md:mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-1 font-amiri">
            تصفح حسب الصنف
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            اختر الصنف المناسب لاحتياجاتك
          </p>
        </motion.div>

        <div ref={stripRef} dir="rtl" role="group" aria-label="أصناف المنتجات" className="flex gap-2.5 overflow-x-auto overscroll-x-contain custom-scroll pb-2 -mx-4 px-4 [overflow-anchor:none]">
          {list.map((cat) => {
            const Icon = resolveIcon(cat.icon)
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelect(cat.id)
                  if (typeof document !== 'undefined') {
                    document
                      .querySelector('#products')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                aria-pressed={isActive}
                className={cn(
                  'group flex shrink-0 flex-col items-center gap-1.5 px-3 md:px-4 py-3 rounded-2xl border min-w-[104px] transition-colors',
                  'hover:shadow-md min-h-11',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card hover:border-primary/40'
                )}
              >
                <span
                  className={cn(
                    'flex size-9 md:size-10 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-primary-foreground/15' : 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-5',
                      isActive ? 'text-primary-foreground' : 'text-primary'
                    )}
                  />
                </span>
                <span className="font-semibold text-xs md:text-sm whitespace-nowrap">
                  {cat.nameAr}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {cat._count.products} منتج
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
