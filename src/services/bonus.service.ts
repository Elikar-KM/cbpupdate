import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Bonus {
  id: number
  sku_user: string
  type: string
  amount: number
  description?: string
  created_at: string
}

export interface Gain {
  id: number
  sku_user: string
  sku_investor: string
  amount: number
  date: string
  created_at: string
}

export const BonusService = {
  getAll: async (): Promise<Bonus[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Bonus[]>>('/bonus')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des bonus:', error)

      return []
    }
  }
}

export const GainService = {
  getAll: async (): Promise<Gain[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Gain[]>>('/gain')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des gains:', error)

      return []
    }
  },

  getByUser: async (sku_user: string): Promise<any> => {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(`/gain_infos/${sku_user}`)

      return response.data.data
    } catch (error) {
      console.error('Erreur:', error)

      return null
    }
  }
}
