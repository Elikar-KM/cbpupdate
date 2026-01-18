'use client'

// React Imports
import { useEffect, useState } from 'react'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const { isAuthenticated, loading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || loading) {
    return null
  }

  return <>{isAuthenticated ? children : <AuthRedirect lang={locale} />}</>
}
