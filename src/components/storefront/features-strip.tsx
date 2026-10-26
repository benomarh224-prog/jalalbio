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
    <section className="border-y border-border/60 bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {f.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
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
