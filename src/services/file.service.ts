import axiosInstance from '@/libs/axios'
import type { ApiResponse } from '@/types/api'

export interface FileItem {
  id: number
  name: string
  path: string
  size: number
  type: string
  created_at: string
}

export const FileService = {
  getAll: async (): Promise<FileItem[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<FileItem[]>>('/file')

      return response.data.data || []
    } catch (error) {
      console.error('Erreur:', error)

      return []
    }
  },

  download: async (id: number): Promise<void> => {
    const response = await axiosInstance.get(`/download/${id}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', 'file')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
