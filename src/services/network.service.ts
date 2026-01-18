import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export const NetworkService = {
  getMyNetwork: async (): Promise<any> => {
    // Type à affiner selon la réponse réelle
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/parring') // Endpoint déduit

      return response.data.data
    } catch (error) {
      console.error('Error fetching network:', error)

      return []
    }
  }
}
