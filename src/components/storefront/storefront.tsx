'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, X, SlidersHorizontal, Star } from 'lucide-react'
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
  const [sort, setSort] = useState('recommended')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Fetch products (single source of truth, filter on client)
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = (await res.json()) as { products: Product[] }
      return data.products
    },
  })

  const {
    data: categoriesData,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
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
    const matches = allProducts.filter((p) => {
      const matchCat = categoryId === 'all' || p.categoryId === categoryId
      const matchSearch =
        !q ||
        p.nameAr.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.descriptionAr ?? '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    if (sort === 'price-asc') matches.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') matches.sort((a, b) => b.price - a.price)
    if (sort === 'newest') matches.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return matches
  }, [allProducts, categoryId, search, sort])

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
        onSearch={(value) => { setSearch(value); setCategoryId('all') }}
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
        {categoriesError && (
          <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-3 text-sm text-destructive">
            <span>تعذّر تحميل الأصناف.</span>
            <Button variant="outline" size="sm" onClick={() => refetchCategories()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Featured products */}
        {featuredProducts.length > 0 && (
          <section className="border-b border-border/60 bg-[#eff3e9]/65 py-6 dark:bg-[#202c21]/35 md:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-5 flex items-center justify-between gap-4 md:mb-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="size-3.5 fill-[#b08b4a] text-[#b08b4a]" />
                    <span className="text-[11px] font-semibold text-[#6d805b] dark:text-[#d0bc8b]">
                      مختارات جلال بيو
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-amiri">
                    منتجات مميزة
                  </h2>
                </div>
                <a href="#products" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#375d40] hover:underline dark:text-[#dfc78c]">عرض الكل <ArrowLeft size={15} /></a>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
        <section id="products" className="py-6 md:py-10 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-5 text-right md:mb-6"
            >
              <p className="mb-1 text-[11px] font-semibold text-[#7b8f65] dark:text-[#c5b580]">من خيرات بلادنا</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 font-amiri">
                كل المنتجات
              </h2>
              <p className="text-xs leading-6 md:text-sm text-muted-foreground">
                اختار منتجاتك المفضلة، والتوصيل حتى لباب دارك.
              </p>
            </motion.div>

            {/* Search bar + category filter chips */}
            <div className="mb-4 space-y-4 rounded-[22px] border border-border/65 bg-card p-3 shadow-[0_10px_30px_-28px_#23432d99] sm:p-4">
              <div className="grid gap-2.5 sm:grid-cols-[1fr_190px]">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="h-12 rounded-xl border-border/60 bg-muted/35 pr-10 pl-11 text-sm shadow-none"
                  aria-label="بحث عن المنتجات"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    type="button"
                    className="absolute left-0 top-0 grid size-12 place-items-center text-muted-foreground hover:text-foreground"
                    aria-label="مسح البحث"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <select aria-label="ترتيب المنتجات" value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 w-full rounded-xl border border-border/60 bg-muted/35 px-3 text-xs font-medium outline-none focus:border-primary sm:text-sm">
                <option value="recommended">الترتيب المقترح</option>
                <option value="price-asc">الثمن: من الأقل للأعلى</option>
                <option value="price-desc">الثمن: من الأعلى للأقل</option>
                <option value="newest">الأحدث أولاً</option>
              </select>
              </div>

              {/* Category chips */}
              <div role="group" aria-label="تصفية المنتجات حسب الصنف" className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground me-1">
                  <SlidersHorizontal className="size-3.5" />
                  <span>تصفية:</span>
                </div>
                <button
                  type="button"
                  aria-pressed={categoryId === 'all'}
                  onClick={() => setCategoryId('all')}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors min-h-9 sm:text-xs',
                    categoryId === 'all'
                      ? 'border-[#315a3e] bg-[#315a3e] text-white dark:border-[#ddbf80] dark:bg-[#ddbf80] dark:text-[#203a26]'
                      : 'border-border/60 bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  الكل
                </button>
                {allCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={categoryId === c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors min-h-9 sm:text-xs',
                      categoryId === c.id
                        ? 'border-[#315a3e] bg-[#315a3e] text-white dark:border-[#ddbf80] dark:bg-[#ddbf80] dark:text-[#203a26]'
                        : 'border-border/60 bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    {c.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span aria-live="polite">
              {loadingProducts
                ? 'جاري تحميل المنتجات...'
                : productsError
                  ? 'تعذّر تحميل المنتجات'
                : `${filteredProducts.length} منتج · ${activeCategoryName}`}
              </span>
              {(search || categoryId !== 'all' || sort !== 'recommended') && <button type="button" onClick={() => { setSearch(''); setCategoryId('all'); setSort('recommended') }} className="inline-flex min-h-9 shrink-0 items-center gap-1 font-semibold text-[#56744e] hover:underline dark:text-[#d6bc84]"><X size={13} />مسح التصفية</button>}
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
            ) : productsError ? (
              <div className="text-center py-8 md:py-12">
                <h3 className="text-lg font-semibold mb-2">تعذّر تحميل المنتجات</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.
                </p>
                <Button variant="outline" onClick={() => refetchProducts()}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 md:py-12">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
