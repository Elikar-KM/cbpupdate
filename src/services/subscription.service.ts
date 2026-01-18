import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Subscription {
  id: number
  sku_user: string
  package_code: string
  package_name: string
  amount: number
  status: number
  created_at: string
  updated_at?: string
  paid_at?: string
  end_at?: string
}

export const SubscriptionService = {
  getAll: async (): Promise<Subscription[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Subscription[]>>('/subscription')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des souscriptions:', error)

      return []
    }
  },

  confirm: async (id: number): Promise<void> => {
    await axiosInstance.put(`/subscription/${id}/confirm`)
  },

  reject: async (id: number): Promise<void> => {
    await axiosInstance.put(`/subscription/${id}/reject`)
  },

  create: async (data: { package_code: string; amount: number }): Promise<void> => {
    await axiosInstance.post('/subscription', data)
  }
}
