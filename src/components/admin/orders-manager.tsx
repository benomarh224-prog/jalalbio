'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  Loader2,
  Phone,
  MapPin,
  StickyNote,
  User,
  Package as PackageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  ORDER_STATUSES,
  formatMAD,
  formatDateAr,
} from '@/lib/admin-utils'
import type { Order, OrderStatus } from '@/lib/types'
import Image from 'next/image'

type TabValue = 'all' | OrderStatus

const TAB_VALUES: TabValue[] = ['all', ...ORDER_STATUSES]

function InfoRow({
  icon,
  label,
  value,
  ltr,
}: {
  icon: ReactNode
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium" dir={ltr ? 'ltr' : undefined}>
          {value}
        </div>
      </div>
    </div>
  )
}

export function OrdersManager() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  // Always fetch all orders to compute counts per status
  const { data: allData } = useQuery<{ orders: Order[] }>({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const r = await fetch('/api/orders')
      if (!r.ok) throw new Error('فشل في تحميل الطلبات')
      return r.json()
    },
  })

  // Fetch filtered orders by selected tab
  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ['orders', tab],
    queryFn: async () => {
      const url =
        tab === 'all' ? '/api/orders' : `/api/orders?status=${tab}`
      const r = await fetch(url)
      if (!r.ok) throw new Error('فشل في تحميل الطلبات')
      return r.json()
    },
  })

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allData?.orders.length ?? 0 }
    for (const s of ORDER_STATUSES) m[s] = 0
    for (const o of allData?.orders ?? []) {
      m[o.status] = (m[o.status] ?? 0) + 1
    }
    return m
  }, [allData])

  const orders = data?.orders ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.includes(search.trim()) ||
        o.phone.includes(search.trim()) ||
        o.city.includes(search.trim()),
    )
  }, [orders, search])

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const r = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'فشل في تحديث الحالة' }))
        throw new Error(e.error || 'فشل في تحديث الحالة')
      }
      return r.json()
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['orders'] })
      const previousAll = qc.getQueryData<{ orders: Order[] }>([
        'orders',
        'all',
      ])
      qc.setQueriesData<{ orders: Order[] }>(
        { queryKey: ['orders'] },
        (old) => {
          if (!old) return old
          return {
            orders: old.orders.map((o) =>
              o.id === id ? { ...o, status } : o,
            ),
          }
        },
      )
      return { previousAll }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previousAll) {
        qc.setQueryData(['orders', 'all'], ctx.previousAll)
      }
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      })
    },
    onSuccess: (_d, { status }) => {
      toast({
        title: 'تم التحديث',
        description: `تم تغيير الحالة إلى ${STATUS_LABELS[status]}`,
      })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const allOrders = allData?.orders ?? []
  const detailOrder =
    orders.find((o) => o.id === detailId) ??
    allOrders.find((o) => o.id === detailId) ??
    null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الطلبات</h1>
        <p className="text-sm text-muted-foreground">
          {counts.all} طلب إجمالي
        </p>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabValue)}
          className="w-full lg:w-auto"
        >
          <TabsList className="flex h-auto w-full max-w-full flex-wrap justify-start gap-1 lg:w-auto">
            {TAB_VALUES.map((t) => (
              <TabsTrigger key={t} value={t} className="gap-1">
                {t === 'all' ? 'الكل' : STATUS_LABELS[t as OrderStatus]}
                <span className="rounded bg-muted-foreground/15 px-1.5 text-[10px] tabular-nums">
                  {counts[t] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-72">
          <Input
            placeholder="ابحث برقم الطلب، الاسم، الهاتف، المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead className="hidden md:table-cell">الهاتف</TableHead>
              <TableHead className="hidden sm:table-cell">المدينة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="hidden md:table-cell">التاريخ</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <PackageIcon className="size-10 opacity-40" />
                    <p>لا توجد طلبات مطابقة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filtered.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer"
                  onClick={() => setDetailId(o.id)}
                >
                  <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                  <TableCell className="font-medium">{o.customerName}</TableCell>
                  <TableCell dir="ltr" className="hidden text-xs md:table-cell">
                    {o.phone}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{o.city}</TableCell>
                  <TableCell className="font-medium">{formatMAD(o.total)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[o.status]}
                    >
                      {STATUS_LABELS[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                    {formatDateAr(o.createdAt)}
                  </TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="text-left"
                  >
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={o.status}
                        onValueChange={(v) =>
                          updateStatusMutation.mutate({
                            id: o.id,
                            status: v as OrderStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailId(o.id)}
                        aria-label="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Order detail dialog */}
      <Dialog
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
      >
        <DialogContent className="custom-scroll max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>تفاصيل الطلب</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {detailOrder.orderNumber}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {formatDateAr(detailOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Customer info */}
                <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2">
                  <InfoRow
                    icon={<User className="size-4" />}
                    label="العميل"
                    value={detailOrder.customerName}
                  />
                  <InfoRow
                    icon={<Phone className="size-4" />}
                    label="الهاتف"
                    value={detailOrder.phone}
                    ltr
                  />
                  <InfoRow
                    icon={<MapPin className="size-4" />}
                    label="المدينة"
                    value={detailOrder.city}
                  />
                  <InfoRow
                    icon={<MapPin className="size-4" />}
                    label="العنوان"
                    value={detailOrder.address}
                  />
                  {detailOrder.notes && (
                    <div className="sm:col-span-2">
                      <InfoRow
                        icon={<StickyNote className="size-4" />}
                        label="ملاحظات"
                        value={detailOrder.notes}
                      />
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="mb-2 font-medium">
                    المنتجات ({detailOrder.items?.length ?? 0})
                  </h3>
                  <div className="space-y-2">
                    {detailOrder.items?.length === 0 && (
                      <p className="rounded border p-3 text-center text-sm text-muted-foreground">
                        لا توجد منتجات في هذا الطلب
                      </p>
                    )}
                    {detailOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatMAD(item.price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-bold">
                          {formatMAD(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total + status */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">الحالة:</span>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[detailOrder.status]}
                    >
                      {STATUS_LABELS[detailOrder.status]}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold">
                    {formatMAD(detailOrder.total)}
                  </div>
                </div>

                {/* Status updater */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
                  <span className="text-sm font-medium">تغيير الحالة:</span>
                  <Select
                    value={detailOrder.status}
                    onValueChange={(v) =>
                      updateStatusMutation.mutate({
                        id: detailOrder.id,
                        status: v as OrderStatus,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="h-9 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
