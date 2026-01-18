'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

const GuestOnlyRoute = ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(themeConfig.homePageUrl)
    }
  }, [isAuthenticated, loading, router])

  if (loading || isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default GuestOnlyRoute
