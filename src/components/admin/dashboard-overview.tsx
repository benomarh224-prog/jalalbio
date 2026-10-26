'use client'

import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  formatMAD,
  formatDateShortAr,
} from '@/lib/admin-utils'
import type { DashboardStats } from '@/lib/types'

type Tint = 'amber' | 'teal' | 'olive' | 'orange'

const TINT_STYLES: Record<Tint, string> = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  olive: 'bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
}

const chartConfig: ChartConfig = {
  revenue: { label: 'المبيعات', color: 'var(--chart-1)' },
  count: { label: 'عدد الطلبات', color: 'var(--chart-3)' },
}

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  tint: Tint
  hint?: string
}

function StatCard({ title, value, icon: Icon, tint, hint }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-xl ${TINT_STYLES[tint]}`}
        >
          <Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="truncate text-2xl font-bold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export function DashboardOverview() {
  const { data, isLoading, isError, error } = useQuery<{ stats: DashboardStats }>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const r = await fetch('/api/dashboard')
      if (!r.ok) throw new Error('فشل في تحميل البيانات')
      return r.json()
    },
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data?.stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          تعذّر تحميل بيانات لوحة التحكم.
          <br />
          <span className="text-xs">{(error as Error)?.message}</span>
        </CardContent>
      </Card>
    )
  }

  const { stats } = data

  const dailyData = stats.dailyRevenue.map((d) => ({
    ...d,
    label: formatDateShortAr(d.date),
  }))

  const statusData = stats.revenueByStatus.map((s) => ({
    ...s,
    label: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] ?? s.status,
  }))

  return (
    <div className="space-y-6">
      {!stats.databaseConnected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          كتالوج المنتجات ظاهر، لكن قاعدة البيانات غير متصلة. الطلبات والتعديلات غير متاحة حتى يتم ربطها.
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نظرة عامة</h1>
        <p className="text-sm text-muted-foreground">
          ملخّص أداء المتجر والإحصائيات الأخيرة
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المبيعات"
          value={formatMAD(stats.totalRevenue)}
          icon={TrendingUp}
          tint="amber"
        />
        <StatCard
          title="إجمالي الطلبات"
          value={String(stats.totalOrders)}
          icon={ShoppingCart}
          tint="teal"
        />
        <StatCard
          title="عدد المنتجات"
          value={String(stats.totalProducts)}
          icon={Package}
          tint="olive"
        />
        <StatCard
          title="طلبات معلقة"
          value={String(stats.pendingOrders)}
          icon={Clock}
          tint="orange"
          hint={stats.lowStock > 0 ? `${stats.lowStock} منتج بمخزون منخفض` : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المبيعات خلال 7 أيام الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart
                data={dailyData}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  fontSize={11}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`
                  }
                />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                  name="المبيعات"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart
                data={statusData}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  fontSize={11}
                  allowDecimals={false}
                />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--chart-3)"
                  radius={[6, 6, 0, 0]}
                  name="عدد الطلبات"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top products + recent orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead className="text-center">المبيعات</TableHead>
                  <TableHead className="text-left">الإيرادات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topProducts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      لا توجد مبيعات بعد
                    </TableCell>
                  </TableRow>
                )}
                {stats.topProducts.map((p, idx) => (
                  <TableRow key={`${p.name}-${idx}`}>
                    <TableCell className="font-medium">{p.nameAr}</TableCell>
                    <TableCell className="text-center">{p.sales}</TableCell>
                    <TableCell className="text-left font-medium">
                      {formatMAD(p.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead className="text-left">المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      لا توجد طلبات بعد
                    </TableCell>
                  </TableRow>
                )}
                {stats.recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell className="font-medium">{o.customerName}</TableCell>
                    <TableCell>{o.city}</TableCell>
                    <TableCell className="text-left font-medium">
                      {formatMAD(o.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_BADGE_CLASS[o.status]}
                      >
                        {STATUS_LABELS[o.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
