'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Leaf,
  ShoppingCart,
  Search,
  Moon,
  Sun,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/lib/cart-store'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المنتجات', href: '#products' },
  { label: 'الأصناف', href: '#categories' },
  { label: 'من نحن', href: '#about' },
]

function scrollToId(href: string) {
  if (typeof document === 'undefined') return
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export function Header({
  search,
  onSearch,
}: {
  search: string
  onSearch: (v: string) => void
}) {
  const { setTheme } = useTheme()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const totalItems = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  )
  const toggleCart = useCart((s) => s.toggleCart)

  const toggleTheme = () => {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        {/* Logo */}
        <button
          onClick={() => scrollToId('#home')}
          className="flex items-center gap-2 shrink-0"
          aria-label="دار الطبيعة - الرئيسية"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Leaf className="size-5" />
          </span>
          <span className="hidden sm:inline text-lg font-bold text-foreground font-amiri">
            دار الطبيعة
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="القائمة الرئيسية">
          {NAV_LINKS.map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              size="sm"
              onClick={() => scrollToId(l.href)}
              className="min-h-9"
            >
              {l.label}
            </Button>
          ))}
        </nav>

        {/* Search - desktop */}
        <div className="hidden md:flex relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="pr-9"
            aria-label="بحث"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-11 min-w-11"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="بحث"
          >
            {mobileSearchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={toggleTheme}
            aria-label="تبديل المظهر"
          >
            <Sun className="hidden size-5 dark:block" />
            <Moon className="size-5 dark:hidden" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-11 min-w-11"
            onClick={toggleCart}
            aria-label="سلة التسوق"
          >
            <ShoppingCart className="size-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-background">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Button>

        </div>
      </div>

      {/* Mobile search */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-border/60 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="pr-9"
              aria-label="بحث"
            />
          </div>
        </div>
      )}
    </header>
  )
}
