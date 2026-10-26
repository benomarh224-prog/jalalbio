'use client'

import { motion } from 'framer-motion'
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
    <section id="categories" className="scroll-mt-20 py-12 md:py-16 border-b border-border/60">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2 font-amiri">
            تصفح حسب الصنف
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            اختر الصنف المناسب لاحتياجاتك
          </p>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto custom-scroll pb-3 -mx-4 px-4 snap-x">
          {list.map((cat) => {
            const Icon = resolveIcon(cat.icon)
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
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
                  'group flex flex-col items-center gap-2 px-4 md:px-5 py-4 rounded-2xl border min-w-[120px] transition-all',
                  'hover:shadow-md hover:-translate-y-0.5 snap-start min-h-11',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card hover:border-primary/40'
                )}
              >
                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-primary-foreground/15' : 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-6',
                      isActive ? 'text-primary-foreground' : 'text-primary'
                    )}
                  />
                </span>
                <span className="font-semibold text-sm whitespace-nowrap">
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
