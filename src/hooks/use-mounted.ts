'use client'

import { useSyncExternalStore } from 'react'

// Mount detection hook — uses useSyncExternalStore to avoid the
// set-state-in-effect anti-pattern. Returns false during SSR and the
// initial client render, then true once the client is hydrated.
const emptySubscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  )
}
