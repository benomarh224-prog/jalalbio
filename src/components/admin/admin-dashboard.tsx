'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Moon,
  Sun,
  Menu,
  Lock,
  Store,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar, type AdminView, NAV_ITEMS } from './sidebar'
import { DashboardOverview } from './dashboard-overview'
import { ProductsManager } from './products-manager'
import { OrdersManager } from './orders-manager'
import { useToast } from '@/hooks/use-toast'
import { useMounted } from '@/hooks/use-mounted'

const AUTH_KEY = 'dar-tabiaa-admin-auth'
const ADMIN_PASSWORD = 'admin123'

/* --------------------------------- Login --------------------------------- */

function LoginScreen({
  onLogin,
  onExit,
}: {
  onLogin: (password: string) => boolean
  onExit: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Simulate brief async to give feedback
    setTimeout(() => {
      const ok = onLogin(password)
      if (!ok) {
        setError('كلمة المرور غير صحيحة')
        toast({
          title: 'فشل الدخول',
          description: 'كلمة المرور غير صحيحة',
          variant: 'destructive',
        })
      }
      setLoading(false)
    }, 200)
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-primary/15">
            <Leaf className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">دار الطبيعة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            لوحة تحكم المسؤول
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="size-4" />
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              dir="ltr"
              className="text-center"
            />
            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              كلمة المرور الافتراضية: <span dir="ltr">admin123</span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading || !password}
          >
            <Lock className="size-4" />
            {loading ? 'جاري الدخول...' : 'دخول'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full gap-2 text-muted-foreground"
            onClick={onExit}
          >
            <Store className="size-4" />
            العودة للمتجر
          </Button>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------- ThemeToggle ------------------------------ */

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="تبديل السمة">
        <Sun className="size-4" />
      </Button>
    )
  }

  const current = theme === 'system' ? resolvedTheme : theme
  const isDark = current === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

/* --------------------------------- TopBar --------------------------------- */

function TopBar({
  view,
  onOpenMobileMenu,
  onLogout,
  onExit,
}: {
  view: AdminView
  onOpenMobileMenu: () => void
  onLogout: () => void
  onExit: () => void
}) {
  const currentItem =
    NAV_ITEMS.find((i) => i.id === view) ?? NAV_ITEMS[0]
  const Icon: LucideIcon = currentItem.icon

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="فتح القائمة"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold sm:text-lg">
            {currentItem.label}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 sm:flex">
          <Leaf className="size-4 text-primary" />
          <span className="text-sm font-medium">دار الطبيعة</span>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
          onClick={onLogout}
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
        >
          <Lock className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onExit}
        >
          <Store className="size-4" />
          <span className="hidden sm:inline">المتجر</span>
        </Button>
      </div>
    </header>
  )
}

/* --------------------------- AdminDashboard --------------------------- */

interface AdminDashboardProps {
  onExit: () => void
}

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const mounted = useMounted()
  const [authed, setAuthed] = useState(false)
  const [view, setView] = useState<AdminView>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === 'true') {
      // Reading localStorage on mount and reflecting it in state is a
      // legitimate synchronization pattern (the React docs warning is
      // about cascading renders which doesn't apply here since we only
      // run once on mount).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthed(true)
    }
  }, [])

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Leaf className="size-8 animate-pulse text-primary" />
      </div>
    )
  }

  if (!authed) {
    return <LoginScreen onLogin={login} onExit={onExit} />
  }

  const handleNavigate = (v: AdminView) => {
    setView(v)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-row bg-background">
      {/* Desktop sidebar — first child appears on the right in RTL */}
      <div className="hidden w-64 shrink-0 lg:block">
        <Sidebar
          view={view}
          onNavigate={setView}
          onLogout={logout}
          onExit={onExit}
        />
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <Sidebar
            view={view}
            onNavigate={handleNavigate}
            onLogout={() => {
              logout()
              setMobileOpen(false)
            }}
            onExit={onExit}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          view={view}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={logout}
          onExit={onExit}
        />
        <main className="custom-scroll flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {view === 'overview' && <DashboardOverview />}
          {view === 'products' && <ProductsManager />}
          {view === 'orders' && <OrdersManager />}
        </main>
      </div>
    </div>
  )
}
