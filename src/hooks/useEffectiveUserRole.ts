'use client'

import { useEffect, useState } from 'react'

import { AuthService } from '@/services/auth.service'

/**
 * Hook to get the effective user role (impersonated user role if impersonating, otherwise current user role)
 */
export const useEffectiveUserRole = () => {
  const [effectiveRole, setEffectiveRole] = useState<string | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)

    const checkImpersonation = () => {
      if (typeof window === 'undefined') return

      const impersonating = AuthService.isImpersonating()

      setIsImpersonating(impersonating)

      if (impersonating) {
        const impersonatedUser = AuthService.getImpersonatedUser()

        setEffectiveRole(impersonatedUser?.role || null)
      } else {
        setEffectiveRole(null)
      }
    }

    checkImpersonation()

    // Listen for storage changes
    window.addEventListener('storage', checkImpersonation)

    return () => {
      window.removeEventListener('storage', checkImpersonation)
    }
  }, [])

  // Return null for effectiveRole during SSR to match initial client render
  return { effectiveRole: isClient ? effectiveRole : null, isImpersonating: isClient ? isImpersonating : false }
}
