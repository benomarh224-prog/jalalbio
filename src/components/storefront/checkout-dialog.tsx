'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShoppingCart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-store'
import { toast } from 'sonner'

const MOROCCAN_PHONE = /^(\+?212|0)([5-7])\d{8}$/

const schema = z.object({
  customerName: z.string().min(2, 'الاسم مطلوب'),
  phone: z
    .string()
    .min(10, 'رقم الهاتف غير صحيح')
    .regex(MOROCCAN_PHONE, 'رقم هاتف مغربي غير صحيح'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  address: z.string().min(5, 'العنوان الكامل مطلوب'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const items = useCart((s) => s.items)
  const totalPrice = useCart((s) => s.totalPrice)
  const clearCart = useCart((s) => s.clearCart)
  const closeCart = useCart((s) => s.closeCart)

  const subtotal = totalPrice()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      phone: '',
      city: '',
      address: '',
      notes: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: values.customerName,
          phone: values.phone,
          city: values.city,
          address: values.address,
          notes: values.notes || null,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      if (!res.ok) {
        if (res.status === 503) {
          toast.error('الطلبات غير متاحة حالياً', {
            description: 'يرجى التواصل مع المتجر مباشرةً لإتمام الطلب.',
          })
          return
        }
        throw new Error('فشل إرسال الطلب')
      }

      const data = (await res.json()) as { order: { orderNumber: string } }
      toast.success('تم إرسال طلبك بنجاح!', {
        description: `رقم الطلب: ${data.order.orderNumber}`,
      })
      clearCart()
      closeCart()
      reset()
      onOpenChange(false)
    } catch {
      toast.error('حدث خطأ أثناء إرسال الطلب', {
        description: 'يرجى المحاولة مرة أخرى',
      })
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="size-5 text-primary" />
            إتمام الطلب
          </DialogTitle>
          <DialogDescription>
            أدخل معلوماتك وسنتصل بك لتأكيد الطلب والدفع عند الاستلام.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="customerName">الاسم الكامل *</Label>
            <Input
              id="customerName"
              placeholder="مثال: محمد العلوي"
              autoComplete="name"
              {...register('customerName')}
            />
            {errors.customerName && (
              <p className="text-xs text-destructive">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="06xxxxxxxx"
              autoComplete="tel"
              className="text-right"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">المدينة *</Label>
            <Input
              id="city"
              placeholder="مثال: الدار البيضاء"
              autoComplete="address-level2"
              {...register('city')}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">العنوان الكامل *</Label>
            <Textarea
              id="address"
              placeholder="الحي، الشارع، رقم المنزل..."
              rows={2}
              autoComplete="street-address"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">عدد المنتجات</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-base items-baseline">
              <span className="font-semibold">المجموع الإجمالي</span>
              <span className="text-xl font-bold text-primary">
                {subtotal} درهم
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 الدفع عند الاستلام متاح في جميع المدن المغربية
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-h-10"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="min-h-10 flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'تأكيد الطلب'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
