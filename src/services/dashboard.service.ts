import axiosInstance from '@/libs/axios'
import type { ApiResponse, DashboardData } from '@/types/api'

export const DashboardService = {
  getClientDashboard: async (): Promise<DashboardData> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardData>>('/dashboard-client')

      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard:', error)
      throw error
    }
  },

  getStatistics: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>('/dashboard/statistics')
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return null
    }
  }
}
