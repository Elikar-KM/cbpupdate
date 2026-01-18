// Re-export client-side services to maintain import compatibility during refactoring
// These functions must ONLY be called from Client Components or inside useEffect
import {
  getUserData as getUserDataService,
  getProfileData as getProfileDataService,
  getPricingData as getPricingDataService,
  getFaqData as getFaqDataService,
  getInvoiceData as getInvoiceDataService
} from '@/services/apiService'

export const getUserData = getUserDataService
export const getProfileData = getProfileDataService
export const getPricingData = getPricingDataService
export const getFaqData = getFaqDataService
export const getInvoiceData = getInvoiceDataService

// Dummy exports to satisfy build
export const getAcademyData = async () => []
export const getEcommerceData = async () => []
export const getLogisticsData = async () => []
export const getPermissionsData = async () => []
export const getStatisticsData = async () => []
