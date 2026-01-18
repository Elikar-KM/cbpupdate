import type { User } from './user'

export type TicketStatus = 'open' | 'pending' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface SupportMessage {
  id: number
  ticket_id: number
  user_id: number
  message: string
  attachment?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Ticket {
  id: number
  user_id: number
  subject: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  user?: User
  messages?: SupportMessage[]
}

export interface CreateTicketData {
  subject: string
  message: string
  priority: TicketPriority
}
