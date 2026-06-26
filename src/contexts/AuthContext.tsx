'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { authService, type User, type LoginParams } from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginParams) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser()

      if (storedUser) {
        setUser(storedUser)
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginParams) => {
    try {
      const response = await authService.login(credentials)

      if (response.user) {
        setUser(response.user)

        const role = response.user.role ? String(response.user.role).toLowerCase() : 'investor'

        const dashboard =
          role === 'admin' || role === 'super-admin' || role === 'system-admin' ? '/dashboards/crm' : '/investment'

        router.push(dashboard)
      } else {
        throw new Error('Données utilisateur manquantes après connexion')
      }
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
