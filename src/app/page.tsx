'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/login')
      } else {
        const role = user.role ? String(user.role).toLowerCase() : 'investor'

        if (role === 'admin' || role === 'super-admin' || role === 'system-admin') {
          router.push('/dashboards/crm')
        } else {
          router.push('/investment')
        }
      }
    }
  }, [loading, isAuthenticated, user, router])

  return null
}
