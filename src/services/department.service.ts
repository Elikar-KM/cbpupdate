import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'
import type { Department } from '@/types/department'

export const DepartmentService = {
  getAll: async (): Promise<Department[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Department[]>>('/department')
      return response.data.data
    } catch (error) {
      console.error('Error fetching departments:', error)
      return []
    }
  },

  getOne: async (id: number): Promise<Department | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Department>>(`/department/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error)
      return null
    }
  },

  create: async (data: Partial<Department>): Promise<ApiResponse<Department>> => {
    const response = await axiosInstance.post<ApiResponse<Department>>('/department', data)
    return response.data
  },

  update: async (id: number, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    const response = await axiosInstance.put<ApiResponse<Department>>(`/department/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/department/${id}`)
    return response.data
  },

  suspend: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/department/${id}/suspend`)
    return response.data
  },

  activate: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/department/${id}/activate`)
    return response.data
  }
}
