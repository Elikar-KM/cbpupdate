import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Corporation {
  id: number
  name: string
  logo?: string
  address?: string
  phone?: string
  email?: string
}

export interface AdminUser {
  id: number
  sku_user: string
  fullName: string
  email: string
  phone: string
  role: string
  status: number
  created_at: string
}

export const AdminService = {
  // Corporation
  getCorporation: async (): Promise<Corporation | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Corporation>>('/corporation')

      return response.data.data
    } catch (error) {
      console.error('Error fetching corporation:', error)

      return null
    }
  },

  updateCorporation: async (data: Partial<Corporation>): Promise<void> => {
    await axiosInstance.put('/corporation', data)
  },

  // Users
  getAllUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<AdminUser[]>>('/user')

      return response.data.data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  suspendUser: async (id: number): Promise<void> => {
    await axiosInstance.post(`/user/${id}/suspend`)
  },

  activateUser: async (id: number): Promise<void> => {
    await axiosInstance.post(`/user/${id}/activate`)
  }
}
