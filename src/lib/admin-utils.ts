import type { OrderStatus } from '@/lib/types'

// Arabic labels for order statuses
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'مشحون',
  delivered: 'تم التسليم',
  cancelled: 'ملغى',
}

// Tailwind classes for status badges — warm palette, no pure blue/indigo
export const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900',
  confirmed:
    'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200 dark:border-teal-900',
  shipped:
    'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-200 dark:border-cyan-900',
  delivered:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900',
  cancelled:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900',
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

// Format a number as Moroccan Dirham in Arabic
export function formatMAD(n: number): string {
  const rounded = Math.round(Number(n) || 0)
  return `${rounded.toLocaleString('ar-MA')} درهم`
}

// Format an ISO date string in Arabic with date + time
export function formatDateAr(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// Format an ISO date string in Arabic (date only)
export function formatDateShortAr(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-MA', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}
