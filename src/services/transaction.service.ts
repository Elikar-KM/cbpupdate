import axiosInstance from '@/libs/axios'
import type { ApiResponse, Transaction } from '@/types/api'

export const TransactionService = {
  // Récupérer toutes les transactions (cash + transfert combinés)
  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      const [cashResponse, transfertResponse] = await Promise.all([
        axiosInstance.get<ApiResponse<Transaction[]>>('/cash'),
        axiosInstance.get<ApiResponse<Transaction[]>>('/transfert')
      ])

      const cashTransactions = cashResponse.data.data || []
      const transfertTransactions = transfertResponse.data.data || []

      return [...cashTransactions, ...transfertTransactions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)

      return []
    }
  },

  // Créer une demande de retrait (cash)
  createTransaction: async (data: { amount: number; wallet_id: string }): Promise<Transaction> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>('/cash', data)

    return response.data.data
  }
}
