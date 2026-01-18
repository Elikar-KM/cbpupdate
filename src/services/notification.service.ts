import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface Notification {
  id: number
  sku_notification: string
  sku_user: string
  type: string
  ref: string
  date: string
  destination_name?: string
  destination_description?: string
  destination_adress?: string
  destination_gender?: string
  header: string
  object: string
  content: string
  description?: string
  email_destination?: string
  status?: number
  read?: number
  created_at?: string
  updated_at?: string
}

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Notification[]>>('/notification')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur:', error)

      return []
    }
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.put(`/notification/${id}/read`)
  }
}
