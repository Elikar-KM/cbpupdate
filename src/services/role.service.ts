import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'
import type { Role } from '@/types/role'

export const RoleService = {
  getAll: async (): Promise<Role[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Role[]>>('/role')
      return response.data.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      return []
    }
  },

  getOne: async (id: number): Promise<Role | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Role>>(`/role/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error)
      return null
    }
  },

  create: async (data: Partial<Role>): Promise<ApiResponse<Role>> => {
    const response = await axiosInstance.post<ApiResponse<Role>>('/role', data)
    return response.data
  },

  update: async (id: number, data: Partial<Role>): Promise<ApiResponse<Role>> => {
    const response = await axiosInstance.put<ApiResponse<Role>>(`/role/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/role/${id}`)
    return response.data
  },

  suspend: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/role/${id}/suspend`)
    return response.data
  },

  activate: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/role/${id}/activate`)
    return response.data
  }
}
