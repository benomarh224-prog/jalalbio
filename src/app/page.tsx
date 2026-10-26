'use client'

import { useState, useSyncExternalStore } from 'react'
import Storefront from '@/components/storefront/storefront'
import AdminDashboard from '@/components/admin/admin-dashboard'

const VIEW_KEY = 'dar-tabiaa-view'
const noopSubscribe = () => () => {}

function readStoredView(): 'store' | 'admin' {
  if (typeof window === 'undefined') return 'store'
  return localStorage.getItem(VIEW_KEY) === 'admin' ? 'admin' : 'store'
}

export default function Home() {
  // useSyncExternalStore avoids setState-in-effect: returns 'store' on SSR
  // and during hydration, then the actual localStorage value post-mount.
  const storedView = useSyncExternalStore(
    noopSubscribe,
    readStoredView,
    () => 'store' as const
  )
  const [overrideView, setOverrideView] = useState<'store' | 'admin' | null>(
    null
  )
  const view = overrideView ?? storedView

  const goToStore = () => {
    setOverrideView('store')
    localStorage.setItem(VIEW_KEY, 'store')
  }

  if (view === 'admin') {
    return <AdminDashboard onExit={goToStore} />
  }
  return <Storefront />
}
