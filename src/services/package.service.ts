import axiosInstance from '@/libs/axios'
import type { ApiResponse, Package } from '@/types/api'

export const PackageService = {
  getAll: async (): Promise<Package[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Package[]>>('/package')
      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des packages:', error)
      return []
    }
  }
}
