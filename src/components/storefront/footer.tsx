'use client'

import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer
      id="about"
      className="mt-auto bg-card border-t border-border/60"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          {/* Brand */}
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Leaf className="size-5" />
              </span>
              <span className="text-lg font-bold font-amiri">جلال بيو</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              متجر مغربي للمنتجات الطبيعية الأصيلة. نختار لك أجود المنتجات من
              قلب جبال الأطلس والبوادي المغربية.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="تواصل اجتماعي"
                  className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 text-primary shrink-0" />
                <a href="tel:+212626743617" dir="ltr" className="text-right hover:text-primary transition-colors">
                  +212 626-743617
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 text-primary shrink-0" />
                <span>contact@dar-tabiaa.ma</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>المعاريف، الدار البيضاء، المغرب</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} جلال بيو. جميع الحقوق محفوظة.
          </p>
          <p>صُنع بحب في المغرب 🇲🇦</p>
        </div>
      </div>
    </footer>
  )
}
