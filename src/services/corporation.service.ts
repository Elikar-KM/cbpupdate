import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'
import type { Corporation } from '@/types/corporation'

export const CorporationService = {
  getCorporation: async (id: string | number = 1): Promise<Corporation | null> => {
    try {
      // Using ID 1 as default since the controller seems to fetch based on user's SKU anyway in show()
      // or hardcodes ID 1 in some places.
      const response = await axiosInstance.get<ApiResponse<Corporation>>(`/corporation/${id}`)

      return response.data.data
    } catch (error) {
      console.error('Error fetching corporation:', error)

      return null
    }
  },

  getPublicInfos: async (): Promise<Partial<Corporation> | null> => {
    try {
      const response = await axiosInstance.get<{ data: Partial<Corporation> }>('/public/corporation/infos')

      return response.data.data
    } catch (error) {
      console.error('Error fetching public corporation infos:', error)

      return null
    }
  },

  updateCorporation: async (data: FormData): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/update_corporation_infos', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  },

  uploadLogo: async (data: FormData): Promise<ApiResponse<{ full_url: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ full_url: string }>>('/upload_corporation_logo', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }
}
