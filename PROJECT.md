# دار الطبيعة - Dar Tabiaa

متجر إلكتروني لبيع المنتجات المغربية الطبيعية (زيت، عسل، تين مجفف، زيتون مخلل، خليع مغربي، عنب مشكل، زبدة البقر) مع لوحة تحكم أدمن.

## التشغيل

```bash
bun install
bun run db:generate
bun run db:push
bun run db:seed
bun run dev
```

## لوحة التحكم

افتح `/dashboard` للدخول إلى لوحة التحكم. تُضبط كلمة المرور في متغير البيئة `ADMIN_PASSWORD` على الخادم.

## التقنيات
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (PostgreSQL)
- React Query + Zustand
- Recharts (لوحة التحكم)
- z-ai-web-dev-sdk (توليد الصور)

## الوصول
لا تضع كلمة مرور لوحة التحكم في ملفات المشروع أو في واجهة الدخول.
