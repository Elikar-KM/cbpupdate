import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Payment {
  id: number
  sku_user: string
  amount: number
  payment_method: string
  payment_code?: string
  status: number
  created_at: string
  updated_at: string
}

export const PaymentService = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment[]>>('/payment')

      return response.data.data || []
    } catch (error) {
      console.error('Error fetching payments:', error)
      throw error
    }
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await axiosInstance.get<ApiResponse<Payment>>(`/payment/${id}`)

    return response.data.data
  },

  create: async (data: { amount: number; payment_method: string; payment_code?: string }): Promise<Payment> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>('/payment', data)

    return response.data.data
  },

  confirm: async (id: number): Promise<void> => {
    await axiosInstance.post(`/payment/${id}/confirm`)
  },

  reject: async (id: number): Promise<void> => {
    await axiosInstance.post(`/payment/${id}/reject`)
  }
}
