'use client'

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
  Store,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AdminView = 'overview' | 'products' | 'orders'

type NavItem = {
  id: AdminView
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'orders', label: 'الطلبات', icon: ClipboardList },
]

interface SidebarProps {
  view: AdminView
  onNavigate: (view: AdminView) => void
  onLogout: () => void
  onExit: () => void
}

export function Sidebar({ view, onNavigate, onLogout, onExit }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col border-l bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="border-b p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15">
            <Leaf className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold">دار الطبيعة</div>
            <div className="text-xs text-muted-foreground">لوحة التحكم</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          القائمة
        </p>
        {NAV_ITEMS.map((item) => {
          const active = view === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0',
                  active
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                )}
              />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="space-y-2 border-t p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onExit}
        >
          <Store className="size-4" />
          العودة للمتجر
        </Button>
      </div>
    </aside>
  )
}
