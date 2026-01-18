import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'
import type { Ticket, CreateTicketData, SupportMessage } from '@/types/support'

export const SupportService = {
  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Ticket[]>>('/support/tickets')
      return response.data.data
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return []
    }
  },

  getTicket: async (id: number): Promise<Ticket | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Ticket>>(`/support/tickets/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error)
      return null
    }
  },

  createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
    const response = await axiosInstance.post<ApiResponse<Ticket>>('/support/tickets', data)
    return response.data
  },

  replyToTicket: async (id: number, message: string): Promise<ApiResponse<SupportMessage>> => {
    const response = await axiosInstance.post<ApiResponse<SupportMessage>>(`/support/tickets/${id}/reply`, { message })
    return response.data
  },

  updateTicketStatus: async (id: number, status: string): Promise<ApiResponse<Ticket>> => {
    const response = await axiosInstance.put<ApiResponse<Ticket>>(`/support/tickets/${id}/status`, { status })
    return response.data
  }
}
