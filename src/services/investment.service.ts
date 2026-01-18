import axiosInstance from '@/libs/axios'
import { ApiResponse, Package, Investor } from '@/types/api'

export const InvestmentService = {
  getPackages: async (): Promise<Package[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Package[]>>('/package') // Endpoint déduit
      return response.data.data
    } catch (error) {
      console.error('Error fetching packages:', error)
      return []
    }
  },

  getMyInvestments: async (): Promise<Investor[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Investor[]>>('/investor') // Endpoint déduit
      return response.data.data
    } catch (error) {
      console.error('Error fetching investments:', error)
      return []
    }
  },

  subscribeToPackage: async (packageCode: string, amount: number): Promise<boolean> => {
    try {
      await axiosInstance.post('/investor', { package: packageCode, amount_paid: amount })
      return true
    } catch (error) {
      console.error('Error subscribing to package:', error)
      return false
    }
  },

  createPackage: async (data: any): Promise<boolean> => {
    try {
      await axiosInstance.post('/package', data)
      return true
    } catch (error) {
      console.error('Error creating package:', error)
      throw error
    }
  }
}
