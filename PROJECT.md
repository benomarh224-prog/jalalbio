# دار الطبيعة - Dar Tabiaa

متجر إلكتروني لبيع المنتجات المغربية الطبيعية (زيت، عسل، تين مجفف، زيتون مخلل، خليع مغربي، عنب مشكل، زبدة البقر) مع لوحة تحكم أدمن.

## التشغيل

```bash
bun install
bun run db:push
bun run prisma/seed.ts
bun run dev
```

## لوحة التحكم

افتح `/dashboard` للدخول إلى لوحة التحكم، ثم أدخل كلمة المرور: `admin123`

## التقنيات
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite)
- React Query + Zustand
- Recharts (لوحة التحكم)
- z-ai-web-dev-sdk (توليد الصور)

## الوصول
كلمة مرور الأدمن: admin123
