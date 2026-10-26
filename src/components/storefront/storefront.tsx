'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

import { Header } from './header'
import { Hero } from './hero'
import { FeaturesStrip } from './features-strip'
import { CategoriesStrip, type CategoryWithCount } from './categories-strip'
import { ProductCard } from './product-card'
import { ProductDetailDialog } from './product-detail-dialog'
import { CartDrawer } from './cart-drawer'
import { CheckoutDialog } from './checkout-dialog'
import { Footer } from './footer'

export default function Storefront() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Fetch products (single source of truth, filter on client)
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = (await res.json()) as { products: Product[] }
      return data.products
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = (await res.json()) as { categories: CategoryWithCount[] }
      return data.categories
    },
  })

  const allProducts = productsData ?? []
  const allCategories = categoriesData ?? []

  // Filter products on client (search + category)
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allProducts.filter((p) => {
      const matchCat = categoryId === 'all' || p.categoryId === categoryId
      const matchSearch =
        !q ||
        p.nameAr.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.descriptionAr ?? '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [allProducts, categoryId, search])

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.featured).slice(0, 4),
    [allProducts]
  )

  const activeCategoryName =
    categoryId === 'all'
      ? 'كل المنتجات'
      : allCategories.find((c) => c.id === categoryId)?.nameAr ?? 'المنتجات'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SonnerToaster position="top-center" richColors closeButton />

      <Header
        search={search}
        onSearch={setSearch}
      />

      <main className="flex-1">
        <Hero />
        <FeaturesStrip />

        <CategoriesStrip
          categories={allCategories}
          active={categoryId}
          onSelect={setCategoryId}
          productsCount={allProducts.length}
        />

        {/* Featured products */}
        {featuredProducts.length > 0 && (
          <section className="py-12 md:py-16 border-b border-border/60">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="size-5 fill-primary text-primary" />
                    <span className="text-sm font-medium text-primary">
                      مختارات دار الطبيعة
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-amiri">
                    منتجات مميزة
                  </h2>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All products */}
        <section id="products" className="py-12 md:py-16 scroll-mt-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-6 text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2 font-amiri">
                كل المنتجات
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                تصفح مجموعتنا الكاملة من المنتجات الطبيعية المغربية
              </p>
            </motion.div>

            {/* Search bar + category filter chips */}
            <div className="mb-8 space-y-3">
              <div className="relative max-w-xl mx-auto">
                <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="pr-9 h-11"
                  aria-label="بحث عن المنتجات"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="مسح البحث"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground me-1">
                  <SlidersHorizontal className="size-3.5" />
                  <span>تصفية:</span>
                </div>
                <button
                  onClick={() => setCategoryId('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-8',
                    categoryId === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  الكل
                </button>
                {allCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-8',
                      categoryId === c.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    {c.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {loadingProducts
                ? 'جاري تحميل المنتجات...'
                : `${filteredProducts.length} منتج في "${activeCategoryName}"`}
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl border overflow-hidden"
                  >
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-muted">
                  <Search className="size-9 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  لا توجد منتجات مطابقة
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  جرّب تعديل البحث أو الفلتر
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setCategoryId('all')
                  }}
                >
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating cart button (mobile) */}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />

      <ProductDetailDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  )
}
