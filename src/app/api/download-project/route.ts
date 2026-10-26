import { NextResponse } from 'next/server'
import { ZipArchive } from 'archiver'
import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// Files and folders to include in the project zip
const INCLUDE_PATHS = [
  'src',
  'public',
  'package.json',
  'bun.lock',
  'next.config.ts',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'eslint.config.mjs',
  'components.json',
  'Caddyfile',
  'start-dev.sh',
  'next-env.d.ts',
]

// Patterns to exclude (within included folders)
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\/db\/.*\.db$/,
  /\.db-journal$/,
  /dev\.log$/,
  /server\.log$/,
  /\/download\//,
  /\/upload\//,
  /\/tests\//,
  /\/examples\//,
  /\/skills\//,
  /\/mini-services\//,
  /\/\.git\//,
  /\.DS_Store$/,
]

function shouldExclude(relPath: string): boolean {
  return EXCLUDE_PATTERNS.some((re) => re.test(relPath))
}

function addPathToArchive(
  archive: ZipArchive,
  absBase: string,
  relBase: string
) {
  if (!fs.existsSync(absBase)) return

  const stat = fs.statSync(absBase)

  if (stat.isFile()) {
    if (!shouldExclude(relBase)) {
      archive.file(absBase, { name: relBase })
    }
    return
  }

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(absBase)
    for (const entry of entries) {
      const absChild = path.join(absBase, entry)
      const relChild = path.join(relBase, entry)
      addPathToArchive(archive, absChild, relChild)
    }
  }
}

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const projectRoot = process.cwd()

    const archive = new ZipArchive({ zlib: { level: 6 } })

    // Collect files
    for (const rel of INCLUDE_PATHS) {
      addPathToArchive(archive, path.join(projectRoot, rel), rel)
    }

    // Add a sanitized .env.example
    archive.append(
      Buffer.from(
        [
          '# Environment variables',
          'BLOB_READ_WRITE_TOKEN=replace-with-the-project-blob-token',
          '',
          'ADMIN_PASSWORD=replace-with-a-private-password',
        ].join('\n')
      ),
      { name: '.env.example' }
    )

    // Add a project README
    archive.append(
      Buffer.from(
        [
          '# جلال بيو - Jalalbio',
          '',
          'متجر إلكتروني لبيع المنتجات المغربية الطبيعية (زيت، عسل، تين مجفف، زيتون مخلل، خليع مغربي، عنب مشكل، زبدة البقر) مع لوحة تحكم أدمن.',
          '',
          '## التشغيل',
          '',
          '```bash',
          'bun install',
          'bun run dev',
          '```',
          '',
          '## لوحة التحكم',
          '',
          'افتح `/dashboard` للدخول إلى لوحة التحكم. تُضبط كلمة المرور في متغير البيئة `ADMIN_PASSWORD` على الخادم.',
          '',
          '## التقنيات',
          '- Next.js 16 (App Router) + TypeScript',
          '- Tailwind CSS 4 + shadcn/ui',
          '- Vercel Blob (تخزين خاص للمنتجات والطلبات والصور)',
          '- React Query + Zustand',
          '- z-ai-web-dev-sdk (توليد الصور)',
          '',
          '## الوصول',
          'لا تضع كلمة مرور لوحة التحكم في ملفات المشروع أو في واجهة الدخول.',
        ].join('\n')
      ),
      { name: 'PROJECT.md' }
    )

    // Build zip into a buffer
    const chunks: Buffer[] = []
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))

    const done = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve())
      archive.on('error', reject)
      archive.finalize()
    })

    await done
    const buffer = Buffer.concat(chunks)

    const filename = encodeURIComponent('جلال-بيو-project.zip')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="jalalbio-project.zip"; filename*=UTF-8''${filename}`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('GET /api/download-project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project zip' },
      { status: 500 }
    )
  }
}
