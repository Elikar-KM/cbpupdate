'use client'

// React Imports
import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Type Imports
import type { ChildrenType } from '@core/types'

const GuestOnlyRoute = ({ children }: ChildrenType) => {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const role = user.role ? String(user.role).toLowerCase() : 'investor'

      const dashboard =
        role === 'admin' || role === 'super-admin' || role === 'system-admin' ? '/dashboards/crm' : '/investment'

      router.replace(dashboard)
    }
  }, [isAuthenticated, loading, router, user])

  if (loading || isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default GuestOnlyRoute
