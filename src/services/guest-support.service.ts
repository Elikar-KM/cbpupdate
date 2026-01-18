import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'
import type { Ticket, CreateTicketData, SupportMessage } from '@/types/support'

interface CreateGuestTicketData extends CreateTicketData {
  guest_name: string
  guest_email: string
  guest_phone?: string
}

export const GuestSupportService = {
  createTicket: async (data: CreateGuestTicketData): Promise<{ data: Ticket; token: string; message: string }> => {
    const response = await axiosInstance.post<{ data: Ticket; token: string; message: string }>(
      '/guest/support/tickets',
      data
    )

    return response.data
  },

  getTicket: async (token: string): Promise<Ticket | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Ticket>>(`/guest/support/tickets/${token}`)

      return response.data.data
    } catch (error) {
      console.error(`Error fetching guest ticket ${token}:`, error)

      return null
    }
  },

  replyToTicket: async (token: string, message: string): Promise<ApiResponse<SupportMessage>> => {
    const response = await axiosInstance.post<ApiResponse<SupportMessage>>(`/guest/support/tickets/${token}/reply`, {
      message
    })

    return response.data
  }
}
