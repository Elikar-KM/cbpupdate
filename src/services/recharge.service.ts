import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Recharge {
  id: number
  sku_user: string
  amount: number
  payment_method: string
  payment_code?: string
  status: number
  created_at: string
  updated_at: string
}

export const RechargeService = {
  getAll: async (): Promise<Recharge[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Recharge[]>>('/recharge')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des recharges:', error)

      return []
    }
  },

  create: async (data: {
    amount: number
    payment_method: string
    payment_code?: string
    paywithmybalance?: boolean
    is_free_recharge?: boolean
  }): Promise<Recharge> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Recharge>>('/recharge', data)

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la recharge'

      throw new Error(errorMessage)
    }
  },

  confirm: async (id: number): Promise<void> => {
    await axiosInstance.put(`/recharge/${id}/confirm`)
  },

  reject: async (id: number): Promise<void> => {
    await axiosInstance.put(`/recharge/${id}/reject`)
  }
}
