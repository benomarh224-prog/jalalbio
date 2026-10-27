'use client'

import { useState, type FormEvent } from 'react'
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
import { useMounted } from '@/hooks/use-mounted'

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
  const mounted = useMounted()

  const totalItems = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  )
  const toggleCart = useCart((s) => s.toggleCart)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMobileSearchOpen(false)
    requestAnimationFrame(() => scrollToId('#products'))
  }

  const toggleTheme = () => {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => scrollToId('#home')}
          className="flex items-center gap-2 shrink-0"
          aria-label="جلال بيو - الرئيسية"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#244d37] text-[#e9cc8d] shadow-sm dark:bg-[#dfbd76] dark:text-[#233e29]">
            <Leaf className="size-5" />
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground font-amiri">
            جلال بيو
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
        <form role="search" aria-label="البحث في المتجر" onSubmit={submitSearch} className="hidden md:flex relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            type="search"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="h-10 rounded-full border-border/65 bg-muted/40 pr-9 text-sm shadow-none"
            aria-label="بحث"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-11 min-w-11 rounded-full"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="بحث"
          >
            {mobileSearchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 rounded-full"
            onClick={toggleTheme}
            aria-label="تبديل المظهر"
          >
            <Sun className="hidden size-5 dark:block" />
            <Moon className="size-5 dark:hidden" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-11 min-w-11 rounded-full"
            onClick={toggleCart}
            aria-label="سلة التسوق"
          >
            <ShoppingCart className="size-5" />
            {mounted && totalItems > 0 && (
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
          <form role="search" aria-label="البحث في المتجر على الهاتف" onSubmit={submitSearch} className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              enterKeyHint="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="h-12 rounded-2xl bg-card pr-10 pl-24 text-sm"
              aria-label="بحث"
            />
            <button type="submit" className="store-action absolute bottom-1 left-1 top-1 rounded-xl px-4 text-xs font-semibold">بحث</button>
          </form>
        </div>
      )}
    </header>
  )
}
