import axios from 'axios'

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
    const response = await api.post<any>('/auth/login', credentials)
    const result = response.data

    if (result.access_token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', result.access_token)

      // The API returns the user in 'data' field, but the app expects it in 'user' field
      const userData = result.user || result.data

      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData))
      }
    }

    return {
      ...result,
      user: result.user || result.data
    }
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

    if (!userStr || userStr === 'undefined') return null

    try {
      return JSON.parse(userStr) as User
    } catch (e) {
      console.error('Error parsing userData from localStorage', e)
      localStorage.removeItem('userData')

      return null
    }

    return null
  },

  getToken: () => {
    if (typeof window === 'undefined') return null

    return localStorage.getItem('accessToken')
  }
}

export default api
