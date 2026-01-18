import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export const AuthService = {
  signup: async (data: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/auth/signup', data)

      return { success: true, message: response.data.message || 'Inscription réussie' }
    } catch (error: any) {
      console.error('Signup error:', error)
      const message = error.response?.data?.message || "Une erreur est survenue lors de l'inscription"

      return { success: false, message }
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/auth/password-reset', { email })

      return { success: true, message: response.data.message || 'Email de réinitialisation envoyé' }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      const message = error.response?.data?.message || "Impossible d'envoyer l'email de réinitialisation"

      return { success: false, message }
    }
  },

  /**
   * Impersonate a user (Silent Login)
   * Stores the admin token and switches to the impersonated user's token
   */
  impersonate: async (userId: number): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(`/user/${userId}/impersonate`)

      if (response.data.code === 200 && response.data.access_token) {
        // Store impersonation data in sessionStorage (survives page reload)
        sessionStorage.setItem('impersonationToken', response.data.access_token)
        sessionStorage.setItem('impersonatedUser', JSON.stringify(response.data.user))
        sessionStorage.setItem('isImpersonating', 'true')

        return {
          success: true,
          message: response.data.message || 'Impersonation réussie',
          data: response.data.user
        }
      }

      return { success: false, message: "Erreur lors de l'impersonation" }
    } catch (error: any) {
      console.error('Impersonate error:', error)
      const message = error.response?.data?.message || 'Impossible de se connecter en tant que cet utilisateur'

      return { success: false, message }
    }
  },

  /**
   * Stop impersonating and return to admin session
   */
  stopImpersonation: (): { success: boolean; message: string } => {
    try {
      // Clean up impersonation data
      sessionStorage.removeItem('impersonationToken')
      sessionStorage.removeItem('isImpersonating')
      sessionStorage.removeItem('impersonatedUser')

      return { success: true, message: 'Retour à la session admin' }
    } catch (error: any) {
      console.error('Stop impersonation error:', error)

      return { success: false, message: 'Erreur lors du retour à la session admin' }
    }
  },

  /**
   * Check if currently impersonating
   */
  isImpersonating: (): boolean => {
    if (typeof window === 'undefined') return false

    return sessionStorage.getItem('isImpersonating') === 'true'
  },

  /**
   * Get impersonated user info
   */
  getImpersonatedUser: (): any | null => {
    if (typeof window === 'undefined') return null
    const userStr = sessionStorage.getItem('impersonatedUser')

    return userStr ? JSON.parse(userStr) : null
  }
}
