import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

// Types
export interface NotificationTemplate {
  id: number
  name: string
  subject: string | null
  content: string
  type: 'email' | 'web' | 'sms' | 'push'
  variables: string[] | null
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
  creator?: {
    id: number
    name: string
    email: string
  }
}

export interface NotificationCampaign {
  id: number
  name: string
  type: 'email' | 'web' | 'sms' | 'push'
  template_id: number | null
  target_type: 'all' | 'role' | 'status' | 'custom' | 'manual'
  target_filters: Record<string, any> | null
  scheduled_at: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed'
  stats: CampaignStats | null
  created_by: number
  created_at: string
  updated_at: string
  template?: NotificationTemplate
  creator?: {
    id: number
    name: string
    email: string
  }
}

export interface CampaignStats {
  total: number
  sent: number
  failed: number
  read: number
  clicked: number
  delivery_rate: number
  open_rate: number
  click_rate: number
}

export interface NotificationLog {
  id: number
  campaign_id: number | null
  user_id: number
  type: 'email' | 'web' | 'sms' | 'push'
  subject: string | null
  content: string
  status: 'pending' | 'sent' | 'failed' | 'read' | 'clicked'
  sent_at: string | null
  read_at: string | null
  clicked_at: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface TargetPreview {
  count: number
  users: Array<{
    id: number
    name: string
    email: string
    role: string
  }>
}

// Template Service
export const NotificationTemplateService = {
  // Get all templates
  getAll: async (): Promise<NotificationTemplate[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<NotificationTemplate[]>>('/notification-templates')

      return response.data.data || []
    } catch (error) {
      console.error('Error fetching templates:', error)

      return []
    }
  },

  // Get single template
  getById: async (id: number): Promise<NotificationTemplate | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<NotificationTemplate>>(`/notification-templates/${id}`)

      return response.data.data
    } catch (error) {
      console.error('Error fetching template:', error)

      return null
    }
  },

  // Create template
  create: async (data: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> => {
    try {
      const response = await axiosInstance.post<ApiResponse<NotificationTemplate>>('/notification-templates', data)

      return response.data.data
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  },

  // Update template
  update: async (id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> => {
    try {
      const response = await axiosInstance.put<ApiResponse<NotificationTemplate>>(`/notification-templates/${id}`, data)

      return response.data.data
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    }
  },

  // Delete template
  delete: async (id: number): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/notification-templates/${id}`)

      return true
    } catch (error) {
      console.error('Error deleting template:', error)

      return false
    }
  },

  // Preview template
  preview: async (id: number): Promise<{ subject: string; content: string; variables: string[] } | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<{ subject: string; content: string; variables: string[] }>>(
        `/notification-templates/${id}/preview`
      )

      return response.data.data
    } catch (error) {
      console.error('Error previewing template:', error)

      return null
    }
  }
}

// Campaign Service
export const NotificationCampaignService = {
  // Get all campaigns
  getAll: async (): Promise<NotificationCampaign[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<NotificationCampaign[]>>('/notification-campaigns')

      return response.data.data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)

      return []
    }
  },

  // Get single campaign
  getById: async (id: number): Promise<NotificationCampaign | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<NotificationCampaign>>(`/notification-campaigns/${id}`)

      return response.data.data
    } catch (error) {
      console.error('Error fetching campaign:', error)

      return null
    }
  },

  // Create campaign
  create: async (data: Partial<NotificationCampaign>): Promise<NotificationCampaign | null> => {
    try {
      const response = await axiosInstance.post<ApiResponse<NotificationCampaign>>('/notification-campaigns', data)

      return response.data.data
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  },

  // Update campaign
  update: async (id: number, data: Partial<NotificationCampaign>): Promise<NotificationCampaign | null> => {
    try {
      const response = await axiosInstance.put<ApiResponse<NotificationCampaign>>(`/notification-campaigns/${id}`, data)

      return response.data.data
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  },

  // Delete campaign
  delete: async (id: number): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/notification-campaigns/${id}`)

      return true
    } catch (error) {
      console.error('Error deleting campaign:', error)

      return false
    }
  },

  // Send campaign
  send: async (id: number): Promise<{ total: number; sent: number; failed: number } | null> => {
    try {
      const response = await axiosInstance.post<ApiResponse<{ total: number; sent: number; failed: number }>>(
        `/notification-campaigns/${id}/send`
      )

      return response.data.data
    } catch (error) {
      console.error('Error sending campaign:', error)
      throw error
    }
  },

  // Schedule campaign
  schedule: async (id: number, scheduledAt: string): Promise<NotificationCampaign | null> => {
    try {
      const response = await axiosInstance.post<ApiResponse<NotificationCampaign>>(
        `/notification-campaigns/${id}/schedule`,
        { scheduled_at: scheduledAt }
      )

      return response.data.data
    } catch (error) {
      console.error('Error scheduling campaign:', error)
      throw error
    }
  },

  // Cancel campaign
  cancel: async (id: number): Promise<boolean> => {
    try {
      await axiosInstance.post(`/notification-campaigns/${id}/cancel`)

      return true
    } catch (error) {
      console.error('Error cancelling campaign:', error)

      return false
    }
  },

  // Get campaign stats
  getStats: async (id: number): Promise<CampaignStats | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<CampaignStats>>(`/notification-campaigns/${id}/stats`)

      return response.data.data
    } catch (error) {
      console.error('Error fetching stats:', error)

      return null
    }
  },

  // Preview target users
  previewTargets: async (id: number): Promise<TargetPreview | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<TargetPreview>>(
        `/notification-campaigns/${id}/preview-targets`
      )

      return response.data.data
    } catch (error) {
      console.error('Error previewing targets:', error)

      return null
    }
  }
}
