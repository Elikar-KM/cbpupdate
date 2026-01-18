import axios from 'axios'
import type { AxiosResponse } from 'axios'

// Types
export interface LoginParams {
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  [key: string]: any
}

export interface AuthResponse {
  user: User
  access_token: string
  token_type: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apiv2.cbpcommunity.com'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Add interceptor to add token
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export const authService = {
  login: async (credentials: LoginParams): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    if (response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.access_token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }

    return response.data
  },

  logout: async () => {
    try {
      if (typeof window !== 'undefined') {
        // Use token from localStorage if available for logout request
        // Interceptor handles header injection
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData')
      }
    }
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('userData')

    if (userStr) return JSON.parse(userStr) as User

    return null
  },

  getToken: () => {
    if (typeof window === 'undefined') return null

    return localStorage.getItem('accessToken')
  }
}

export default api
