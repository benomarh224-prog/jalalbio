'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Star, Package, AlertTriangle } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { ProductFormDialog } from './product-form-dialog'
import { formatMAD } from '@/lib/admin-utils'
import type { Category, Product } from '@/lib/types'
import Image from 'next/image'

type CategoryWithCount = Category & { _count?: { products: number } }

export function ProductsManager() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: productsData, isLoading } = useQuery<{
    products: Product[]
    databaseConnected: boolean
  }>({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const r = await fetch('/api/products')
      if (!r.ok) throw new Error('فشل في تحميل المنتجات')
      return r.json()
    },
  })

  const { data: categoriesData } = useQuery<{ categories: CategoryWithCount[] }>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const r = await fetch('/api/categories')
      if (!r.ok) throw new Error('فشل في تحميل الأصناف')
      return r.json()
    },
  })

  const products = productsData?.products ?? []
  const databaseConnected = productsData?.databaseConnected ?? false
  const categories = categoriesData?.categories ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(search.trim()) ||
        (p.descriptionAr ?? '').includes(search.trim()) ||
        (p.origin ?? '').includes(search.trim()),
    )
  }, [products, search])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'فشل في حذف المنتج' }))
        throw new Error(e.error || 'فشل في حذف المنتج')
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المنتج بنجاح',
      })
      setDeleteId(null)
    },
    onError: (e: Error) => {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' })
    },
  })

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setFormOpen(true)
  }
  const openCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const productToDelete = deleteId
    ? products.find((p) => p.id === deleteId)
    : null

  return (
    <div className="space-y-5">
      {!isLoading && !databaseConnected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          المنتجات المعروضة من الكتالوج الثابت. ربط قاعدة البيانات مطلوب لإضافة المنتجات أو تعديلها أو حذفها.
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} منتج في المتجر
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <Button onClick={openCreate} disabled={!databaseConnected} className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span className="hidden sm:inline">إضافة منتج</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead className="hidden md:table-cell">الصنف</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المخزون</TableHead>
              <TableHead className="hidden sm:table-cell">مميّز</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Package className="size-10 opacity-40" />
                    <p>لا توجد منتجات مطابقة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filtered.map((p) => {
                const lowStock = p.stock < 50
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={p.image}
                            alt={p.nameAr}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.nameAr}</div>
                          <div
                            dir="ltr"
                            className="truncate text-xs text-muted-foreground"
                          >
                            {p.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {p.category?.nameAr ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatMAD(p.price)}</div>
                      {p.oldPrice ? (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatMAD(p.oldPrice)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {lowStock ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                        >
                          <AlertTriangle className="size-3" />
                          {p.stock} - منخفض
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          {p.stock}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {p.featured ? (
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          disabled={!databaseConnected}
                          aria-label="تعديل"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(p.id)}
                          disabled={!databaseConnected}
                          aria-label="حذف"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        categories={categories}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المنتج
              <span className="mx-1 font-semibold text-foreground">
                {productToDelete?.nameAr}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
