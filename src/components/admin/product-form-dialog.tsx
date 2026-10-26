'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Loader2, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import type { Category, Product } from '@/lib/types'
import Image from 'next/image'

const UNITS = [
  { value: 'كغ', label: 'كيلوغرام (كغ)' },
  { value: 'لتر', label: 'لتر' },
  { value: '500غ', label: '500 غرام' },
  { value: 'حبة', label: 'حبة' },
]

const schema = z.object({
  name: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.coerce.number().min(0.01, 'السعر مطلوب'),
  oldPrice: z.coerce.number().optional(),
  unit: z.string().min(1, 'الوحدة مطلوبة'),
  categoryId: z.string().min(1, 'الصنف مطلوب'),
  stock: z.coerce.number().min(0, 'المخزون مطلوب'),
  featured: z.boolean(),
  origin: z.string().optional(),
  image: z.string().min(1, 'الصورة مطلوبة'),
})

// Input type (what the form receives — coerced numbers come in as
// strings from <input type="number"> and are validated/coerced by zod).
type FormInput = z.input<typeof schema>
// Output type (what zodResolver produces after successful validation —
// numeric fields are now proper numbers).
type FormOutput = z.output<typeof schema>

type CategoryWithCount = Category & { _count?: { products: number } }

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: CategoryWithCount[]
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const isEdit = !!product

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      oldPrice: 0,
      unit: 'كغ',
      categoryId: '',
      stock: 0,
      featured: false,
      origin: '',
      image: '',
    },
  })

  useEffect(() => {
    if (!open) return
    if (product) {
      form.reset({
        name: product.name,
        nameAr: product.nameAr,
        description: product.description ?? '',
        descriptionAr: product.descriptionAr ?? '',
        price: product.price,
        oldPrice: product.oldPrice ?? 0,
        unit: product.unit,
        categoryId: product.categoryId,
        stock: product.stock,
        featured: product.featured,
        origin: product.origin ?? '',
        image: product.image,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        price: 0,
        oldPrice: 0,
        unit: 'كغ',
        categoryId: categories[0]?.id ?? '',
        stock: 0,
        featured: false,
        origin: '',
        image: '',
      })
    }
  }, [open, product, form, categories])

  const mutation = useMutation({
    mutationFn: async (values: FormOutput) => {
      const body = {
        ...values,
        rating: 5,
        reviews: 0,
        oldPrice: values.oldPrice ? Number(values.oldPrice) : null,
        description: values.description || null,
        descriptionAr: values.descriptionAr || null,
        origin: values.origin || null,
      }
      const url = isEdit ? `/api/products/${product!.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'فشل في الحفظ' }))
        throw new Error(e.error || 'فشل في الحفظ')
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast({
        title: isEdit ? 'تم التحديث' : 'تمت الإضافة',
        description: isEdit
          ? 'تم تحديث المنتج بنجاح'
          : 'تمت إضافة المنتج بنجاح',
      })
      onOpenChange(false)
    },
    onError: (e: Error) => {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' })
    },
  })

  const generateImage = async () => {
    const nameAr = form.getValues('nameAr')
    if (!nameAr || nameAr.trim().length < 2) {
      toast({
        title: 'تنبيه',
        description: 'أدخل اسم المنتج بالعربية أولاً',
        variant: 'destructive',
      })
      return
    }
    setIsGenerating(true)
    try {
      const r = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${nameAr} Moroccan natural product` }),
      })
      if (!r.ok) throw new Error('فشل في توليد الصورة')
      const data = await r.json()
      form.setValue('image', data.url, { shouldValidate: true })
      toast({
        title: 'تم توليد الصورة',
        description: 'تم حفظ الصورة الجديدة',
      })
    } catch (e) {
      toast({
        title: 'خطأ',
        description: (e as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const imageUrl = form.watch('image')
  const unitValue = form.watch('unit')
  const categoryValue = form.watch('categoryId')
  const featuredValue = form.watch('featured')
  const {
    errors,
    isSubmitting,
  } = form.formState

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scroll max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'قم بتعديل تفاصيل المنتج ثم اضغط حفظ'
              : 'أدخل تفاصيل المنتج الجديد ثم اضغط إضافة'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-5"
        >
          {/* Image preview + URL + AI generate */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="معاينة المنتج"
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-muted-foreground">
                  <ImageIcon className="size-5" />
                  لا توجد صورة
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">رابط الصورة</Label>
              <Input
                id="image"
                placeholder="/products/example.png"
                dir="ltr"
                {...form.register('image')}
              />
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={generateImage}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {isGenerating ? 'جاري التوليد...' : 'توليد صورة بالذكاء الاصطناعي'}
              </Button>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameAr">الاسم بالعربية</Label>
              <Input
                id="nameAr"
                placeholder="مثلاً: عسل حر طبيعي"
                {...form.register('nameAr')}
              />
              {errors.nameAr && (
                <p className="text-xs text-destructive">{errors.nameAr.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">الاسم بالإنجليزية</Label>
              <Input
                id="name"
                placeholder="Natural honey"
                dir="ltr"
                {...form.register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <Label htmlFor="descriptionAr">الوصف بالعربية</Label>
            <Textarea
              id="descriptionAr"
              rows={3}
              placeholder="وصف المنتج بالعربية..."
              {...form.register('descriptionAr')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف بالإنجليزية (اختياري)</Label>
            <Textarea
              id="description"
              rows={2}
              dir="ltr"
              placeholder="English description..."
              {...form.register('description')}
            />
          </div>

          {/* Numeric fields */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (درهم)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                {...form.register('price')}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPrice">السعر القديم</Label>
              <Input
                id="oldPrice"
                type="number"
                min={0}
                step="0.01"
                {...form.register('oldPrice')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">المخزون</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                {...form.register('stock')}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">المنشأ</Label>
              <Input
                id="origin"
                placeholder="مثلا: فاس"
                {...form.register('origin')}
              />
            </div>
          </div>

          {/* Unit + category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الوحدة</Label>
              <Select
                value={unitValue}
                onValueChange={(v) => form.setValue('unit', v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>الصنف</Label>
              <Select
                value={categoryValue}
                onValueChange={(v) =>
                  form.setValue('categoryId', v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الصنف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 && (
                    <SelectItem value="_none" disabled>
                      لا توجد أصناف
                    </SelectItem>
                  )}
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          {/* Featured switch */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="featured">منتج مميّز</Label>
              <p className="text-xs text-muted-foreground">
                يظهر في الصفحة الرئيسية ضمن المنتجات المميزة
              </p>
            </div>
            <Switch
              id="featured"
              checked={featuredValue}
              onCheckedChange={(v) => form.setValue('featured', v)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending || isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || isSubmitting}
              className="gap-2"
            >
              {(mutation.isPending || isSubmitting) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEdit ? 'حفظ التغييرات' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
