export interface User {
  id: number
  sku_user: string
  email: string
  fullName: string
  phone: string
  role: string
  level: string
  avatar: string
  currentPlan: string
  sku_corporation?: string
  sku_user_parent?: string
  status: string
  accessToken?: string
}

export interface Wallet {
  id: number
  sku_wallet: string
  sku_user: string
  type: string
  name: string
  status: number
  created_at: string
  updated_at: string

  // Note: Balance is not in the wallet model, but calculated
}

export interface Transaction {
  id: number
  sku_transaction: string
  sku_user: string
  type: 'DEPOT' | 'RETRAIT' | 'TRANSFERT' | 'FRAIS-RETRAIT' | 'ACHAT-PACK' | string
  amount: number
  status: number | string
  created_at: string
  description?: string
  sku_user_destination?: string
  payment_method?: string
  user_email?: string
  user_name?: string
  user?: User
  destinationUser?: User
}

export interface Package {
  id: number
  sku_package: string
  code: string
  name: string
  description?: string
  amount: number
  gain_daily: number
  gain_annual: number
  week: number
  currency: string
}

export interface Investor {
  id: number
  sku_investor: string
  sku_user: string
  package: string
  amount_paid: number
  date_start: string
  date_end: string
  status: number
  stop_gain: number
}

export interface DashboardData {
  wallet_balance: string // Formatted
  balanceAmount: number // Raw
  somme_gain: string
  somme_bonus: string
  total_retrait: string
  total_transfert: string
  total_invite: number | string
  prix_package: number
  subscriptions: string
  can_download_files: boolean
  dette_restante_achat_packet: string
  show_debt_message: boolean
  debt_message: string
  investType: string
  gains_today?: string // Gains octroyés aujourd'hui
  gains_yesterday?: string // Gains octroyés hier
  gains_change?: number // Pourcentage de changement
  package_distribution?: Array<{ name: string; value: number }> // Distribution des investisseurs par package
  gains_evolution?: Array<{ name: string; gains: number; system: number }> // Evolution des gains (7 derniers jours)
}

export interface DashboardStatistics {
  users: {
    total: number
    active: number
  }
  departments: number
  roles: number
  corporations: number
  tickets: {
    total: number
    open: number
    closed: number
  }
  investors: number
  subscriptions: number
  notifications: number
  transactions: {
    total: number
    recharge: number
    withdrawal: number
    transfer: number
    crypto_buy: number
    crypto_sell: number
  }
}

export interface ApiResponse<T> {
  data: T
  message: string
  code?: number
}
