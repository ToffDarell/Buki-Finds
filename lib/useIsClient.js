'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

// false during the server render and hydration, true once running in the browser. Lets
// auth-dependent UI wait for the client without a setState-in-effect "mounted" flag.
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
