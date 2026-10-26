'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingBag, Layers, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
  { num: '+1000', label: 'زبون سعيد' },
  { num: '7', label: 'منتجات أصيلة' },
  { num: '100%', label: 'طبيعي' },
]

export function Hero() {
  const scrollTo = (sel: string) => {
    if (typeof document === 'undefined') return
    document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden hero-gradient"
    >
      <div className="absolute inset-0 pattern-zellige opacity-60 pointer-events-none" />

      <div className="container relative mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-right order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="size-3.5" />
              منتجات طبيعية 100% من قلب المغرب
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 font-amiri">
              منتجات مغربية طبيعية أصيلة
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              اكتشف أجود أنواع الزيت والعسل والتين المجفف والمنتجات الطبيعية المغربية،
              مصنوعة بحب من قلب جبال الأطلس.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button size="lg" className="min-h-11" onClick={() => scrollTo('#products')}>
                <ShoppingBag className="size-4" />
                تسوق الآن
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-h-11"
                onClick={() => scrollTo('#categories')}
              >
                <Layers className="size-4" />
                اكتشف الأصناف
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 justify-center md:justify-start">
              {STATS.map((s) => (
                <div key={s.label} className="text-center md:text-right">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {s.num}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative order-1 md:order-2"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative animate-float">
              <Image
                src="/hero.png"
                alt="منتجات مغربية طبيعية أصيلة"
                width={600}
                height={600}
                priority
                className="w-full h-auto max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
