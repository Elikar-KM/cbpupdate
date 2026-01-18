import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export const UserProfileService = {
  getProfile: async (): Promise<any> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/user-profile')

    return response.data
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    // Update names via UserProfileController
    // We assume 'data' contains firstname, lastname
    const response = await axiosInstance.put<ApiResponse<any>>('/me/profile', data)

    return response.data
  },

  updateUser: async (id: number, data: any): Promise<ApiResponse<any>> => {
    // Update other fields via userController
    const response = await axiosInstance.put<ApiResponse<any>>(`/user/${id}`, data)

    return response.data
  },

  uploadAvatar: async (data: FormData): Promise<ApiResponse<{ full_url: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ full_url: string }>>('/upload_user_avatar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  },

  updatePassword: async (data: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/change-password', data)

    return response.data
  }
}
