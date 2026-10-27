'use client'

import { useRef } from 'react'
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
import { formatPrice } from '@/lib/storefront-format'

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
  const requestId = useRef<string | null>(null)

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
      requestId.current ||= crypto.randomUUID()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId.current },
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
        const result = await res.json()
        throw new Error(result.error || 'فشل إرسال الطلب')
      }

      const data = (await res.json()) as { order: { orderNumber: string } }
      toast.success('تم إرسال طلبك بنجاح!', {
        description: `رقم الطلب: ${data.order.orderNumber}`,
      })
      clearCart()
      requestId.current = null
      closeCart()
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب', {
        description: error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى',
      })
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto custom-scroll rounded-[26px] p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#e9f0e3] text-[#315b3d] dark:bg-[#344431] dark:text-[#e3c98e]"><ShoppingCart className="size-5" /></span>
            إتمام الطلب
          </DialogTitle>
          <DialogDescription>
            أدخل معلوماتك وسنتصل بك لتأكيد الطلب والدفع عند الاستلام.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 [&_input]:h-12 [&_input]:rounded-xl [&_input]:bg-muted/25 [&_textarea]:rounded-xl" noValidate>
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
              <span className="font-semibold">مجموع المنتجات</span>
              <span className="text-xl font-bold text-[#2c5339] dark:text-[#e4c383]">
                {formatPrice(subtotal)} درهم
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              الدفع عند الاستلام. تفاصيل التوصيل تتأكد عند الاتصال بك.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-12 rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="store-action h-12 flex-1 rounded-xl"
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
