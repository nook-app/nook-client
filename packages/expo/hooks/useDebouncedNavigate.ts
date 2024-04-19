import { router, useSegments } from 'expo-router'
import { Href } from 'expo-router/build/link/href'
import { useCallback, useRef, useState } from 'react'

export const useDebouncedNavigate = () => {
  const isDebouncingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const segments = useSegments()

  const navigate = useCallback(
    (href: Href, opts?: { replace?: boolean; segments?: boolean }) => {
      if (isDebouncingRef.current) return
      isDebouncingRef.current = true

      let withSegments = href
      if (opts?.segments) {
        if (typeof href === 'string') {
          withSegments = `/(default)/${segments[1]}${href}`
        } else {
          withSegments = {
            ...href,
            pathname: `/(default)/${segments[1]}${href.pathname}`,
          }
        }
      }

      if (opts?.replace) {
        router.replace(withSegments)
      } else {
        router.push(withSegments)
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        isDebouncingRef.current = false
      }, 500)
    },
    [segments]
  )

  return { navigate }
}
