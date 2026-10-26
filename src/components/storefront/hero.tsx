'use client'

import Image from 'next/image'
import { ArrowUpLeft, Leaf, ShoppingBag, ShieldCheck, Truck } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="scroll-mt-20 px-3 pb-5 pt-4 sm:px-6 lg:py-7">
      <div className="relative mx-auto flex min-h-[530px] max-w-7xl overflow-hidden rounded-[28px] bg-[#102c21] shadow-[0_18px_55px_-35px_#163c2b99] sm:min-h-[550px] sm:rounded-[36px] lg:min-h-[570px]">
        <Image
          src="/hero.png"
          alt="زيت زيتون مغربي وزيتون وأعشاب طبيعية"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[46%_center] md:object-center"
        />
        <div className="store-hero-shade pointer-events-none absolute inset-0" />

        <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3 sm:inset-x-9 sm:top-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d4a3]/35 bg-[#163626]/45 px-3 py-1.5 text-[11px] font-semibold text-[#fff2cf] backdrop-blur-md">
            <Leaf className="size-3.5" /> طبيعي وأصيل
          </span>
          <span className="text-[10px] font-semibold tracking-[.22em] text-white/85 sm:text-xs">JALALBIO</span>
        </div>

        <div className="relative z-10 flex w-full flex-col justify-end px-6 pb-7 pt-36 text-right sm:px-9 sm:pb-9 md:max-w-[62%] md:justify-center md:pb-12 md:pt-24 lg:max-w-[58%] lg:px-14">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-[#eed4a0] sm:text-xs">
            <span className="h-px w-6 bg-[#dcb66e]" /> من الأرض المغربية إلى مائدتك
          </div>
          <h1 id="hero-title" className="font-amiri text-[44px] font-bold leading-[1.23] tracking-normal text-[#fff9ec] sm:text-[58px] lg:text-[72px]">
            خيرات المغرب،
            <span className="mt-1 block text-[#efcd86]">لباب دارك.</span>
          </h1>
          <p className="mt-4 max-w-[32ch] text-[13px] leading-[1.9] text-[#edf2e7]/85 sm:max-w-[39ch] sm:text-base">
            زيت بلدي، عسل طبيعي ومختارات أصيلة من أجود المنتجات المغربية. مذاق تختاره بثقة.
          </p>

          <div className="mt-6 grid grid-cols-2 items-center gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
            <a href="#products" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e9bc64] px-3 text-xs font-bold text-[#173225] shadow-lg shadow-black/10 transition hover:bg-[#f4ce83] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ce83] sm:px-6 sm:text-sm">
              <ShoppingBag className="size-4" /> تسوق الآن <ArrowUpLeft className="hidden size-4 sm:block" />
            </a>
            <a href="#categories" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-3 text-xs font-semibold text-[#fff9ec] backdrop-blur-sm transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:text-sm">
              اكتشف الأصناف
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#dae4d5] sm:mt-6 sm:text-xs">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#e0c17e]" />الدفع عند الاستلام</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="size-3.5 text-[#e0c17e]" />توصيل لجميع المدن</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-10 hidden items-center gap-3 rounded-2xl border border-white/25 bg-[#fffaf0]/95 px-5 py-4 text-[#24402c] shadow-xl backdrop-blur-md lg:flex">
          <span className="grid size-10 place-items-center rounded-full bg-[#e8efdf]"><Leaf className="size-5" /></span>
          <div><p className="text-sm font-bold">أصالة من قلب المغرب</p><p className="mt-0.5 text-xs text-[#71816a]">منتجات مختارة بعناية</p></div>
        </div>
      </div>
    </section>
  )
}
