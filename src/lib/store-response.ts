import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { StoreError } from './store-data'

export function storeFailure(error: unknown) {
  if (error instanceof StoreError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: 'المعلومات المدخلة غير صحيحة' }, { status: 400 })
  console.error('Store operation failed:', error instanceof Error ? error.message : 'Unknown storage error')
  return NextResponse.json({ error: 'تعذر حفظ أو تحميل البيانات. حاول مجدداً.' }, { status: 503 })
}
