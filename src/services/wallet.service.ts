import axiosInstance from '@/libs/axios'
import { ApiResponse, Wallet } from '@/types/api'

export const WalletService = {
  getAllWallets: async (): Promise<Wallet[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Wallet[]>>('/wallet')
      return response.data.data
    } catch (error) {
      console.error('Error fetching wallets:', error)
      return []
    }
  },

  createWallet: async (data: Partial<Wallet>): Promise<boolean> => {
    try {
      await axiosInstance.post('/wallet', data)
      return true
    } catch (error) {
      console.error('Error creating wallet:', error)
      return false
    }
  },

  getWalletTypes: async (): Promise<{ type: string; name: string }[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<{ type: string; name: string }[]>>('/wallettype')

      return response.data.data
    } catch (error) {
      // Fallback si l'endpoint n'existe pas (vu dans WalletController mais route incertaine)
      return [
        { type: 'bitcoin', name: 'Bitcoin' },
        { type: 'usdt', name: 'USDT' },
        { type: 'airtel-money', name: 'Airtel Money' },
        { type: 'm-pesa', name: 'M-Pesa' },
        { type: 'orange-money', name: 'Orange Money' }
      ]
    }
  }
}
