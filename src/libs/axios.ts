import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Interceptor pour ajouter le token
axiosInstance.interceptors.request.use(
  async config => {
    // Check for impersonation token first (takes priority)
    const impersonationToken = typeof window !== 'undefined' ? sessionStorage.getItem('impersonationToken') : null

    if (impersonationToken) {
      config.headers.Authorization = `Bearer ${impersonationToken}`
      return config
    }

    // Otherwise, use normal session
    const session = await getSession()
    const token = session?.user?.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Interceptor pour gérer les erreurs (ex: 401)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Redirection login ou nettoyage token
      if (typeof window !== 'undefined') {
        // Use signOut to clear the NextAuth session and redirect to login
        await signOut({ callbackUrl: '/login' })
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
