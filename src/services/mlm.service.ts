import axiosInstance from '@/libs/axios'
import type { Mlm } from '@/types/mlm'
import { ApiResponse } from '@/types/api'

export const MlmService = {
  async getAllMlms() {
    const response = await axiosInstance.get<ApiResponse<Mlm[]>>('/mlm')
    return response.data
  },

  async getMlm(id: number) {
    const response = await axiosInstance.get<ApiResponse<Mlm>>(`/mlm/${id}`)
    return response.data
  },

  async createMlm(data: Partial<Mlm>) {
    const response = await axiosInstance.post<ApiResponse<Mlm>>('/mlm', data)
    return response.data
  },

  async updateMlm(id: number, data: Partial<Mlm>) {
    const response = await axiosInstance.put<ApiResponse<Mlm>>(`/mlm/${id}`, data)
    return response.data
  },

  async deleteMlm(id: number) {
    const response = await axiosInstance.delete(`/mlm/${id}`)
    return response.data
  }
}
