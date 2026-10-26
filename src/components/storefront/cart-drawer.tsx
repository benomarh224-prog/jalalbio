'use client'

import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-store'

const FREE_SHIP_THRESHOLD = 300

export function CartDrawer({
  onCheckout,
}: {
  onCheckout: () => void
}) {
  const items = useCart((s) => s.items)
  const isOpen = useCart((s) => s.isOpen)
  const closeCart = useCart((s) => s.closeCart)
  const removeItem = useCart((s) => s.removeItem)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const totalPrice = useCart((s) => s.totalPrice)
  const totalItems = useCart((s) => s.totalItems)

  const subtotal = totalPrice()
  const count = totalItems()
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal)
  const freeShipping = remaining === 0 && subtotal > 0

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="border-b border-border/60 p-4 space-y-1">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="size-5 text-primary" />
            سلة التسوق
            {count > 0 && (
              <span className="text-sm text-muted-foreground font-normal">
                ({count} منتج)
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? 'سلتك فارغة حالياً'
              : 'راجع منتجاتك قبل إتمام الطلب'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Package className="size-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">سلتك فارغة</p>
              <p className="text-sm text-muted-foreground mt-1">
                أضف بعض المنتجات الطبيعية لتبدأ التسوق
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                closeCart()
                if (typeof document !== 'undefined') {
                  document
                    .querySelector('#products')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
              {/* Free shipping progress */}
              {freeShipping ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    🎉 رائع! طلبك مؤهل للتوصيل المجاني
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-sm">
                  <p className="text-foreground">
                    أضف{' '}
                    <span className="font-bold text-primary">
                      {remaining} درهم
                    </span>{' '}
                    للحصول على توصيل مجاني!
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-primary/20 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (subtotal / FREE_SHIP_THRESHOLD) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Cart items */}
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-border/60 p-3 bg-card"
                >
                  <div className="relative size-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.nameAr}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.nameAr}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 -mt-1 -me-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.productId)}
                        aria-label="حذف من السلة"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {item.price} درهم / {item.unit}
                    </span>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="إنقاص"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="زيادة"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-primary text-sm">
                        {item.price * item.quantity} درهم
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-border/60 p-4 gap-3 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{subtotal} درهم</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">التوصيل</span>
                <span className="font-semibold">
                  {freeShipping ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      مجاني
                    </span>
                  ) : (
                    'يُحسب عند الدفع'
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">المجموع</span>
                <span className="text-xl font-bold text-primary">
                  {subtotal} درهم
                </span>
              </div>
              <Button
                size="lg"
                className="w-full mt-2 min-h-11"
                onClick={onCheckout}
              >
                إتمام الطلب
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                💡 توصيل مجاني للطلبات فوق {FREE_SHIP_THRESHOLD} درهم
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
