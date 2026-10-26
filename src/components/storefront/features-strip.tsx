'use client'

import { motion } from 'framer-motion'
import { Truck, Leaf, BadgeDollarSign, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: Truck, title: 'توصيل سريع', desc: 'خلال 24-48 ساعة لجميع المدن' },
  { icon: Leaf, title: 'منتجات طبيعية 100%', desc: 'بدون إضافات كيميائية' },
  { icon: BadgeDollarSign, title: 'الدفع عند الاستلام', desc: 'ادفع بعد التسليم' },
  { icon: ShieldCheck, title: 'جودة مضمونة', desc: 'منتجات أصلية ومختارة' },
]

export function FeaturesStrip() {
  return (
    <section aria-label="مزايا التسوق" className="border-b border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5 md:gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-2.5 sm:items-center sm:gap-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
                <f.icon className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-5 text-foreground sm:text-sm">
                  {f.title}
                </div>
                <div className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                  {f.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
