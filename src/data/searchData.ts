// Type pour les éléments de recherche
type SearchDataType = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

// Données de recherche pour l'application CBP
const searchData: SearchDataType[] = [
  // Tableau de Bord
  {
    id: 'dashboard-crm',
    name: 'Tableau de Bord',
    url: '/dashboards/crm',
    icon: 'tabler-smart-home',
    section: 'Principal'
  },

  // Administration
  {
    id: 'admin-users',
    name: 'Gérer Utilisateurs',
    url: '/administration/user',
    icon: 'tabler-users',
    section: 'Administration'
  },
  {
    id: 'admin-settings',
    name: 'Infos. Générales',
    url: '/administration/setting',
    icon: 'tabler-settings',
    section: 'Administration'
  },
  {
    id: 'admin-wallet',
    name: 'Modes de Paiement',
    url: '/administration/wallet',
    icon: 'tabler-wallet',
    section: 'Administration'
  },
  {
    id: 'admin-packages',
    name: 'Gérer les Packages',
    url: '/administration/package',
    icon: 'tabler-package',
    section: 'Administration'
  },
  {
    id: 'admin-mlm',
    name: 'Gestion du MLM',
    url: '/administration/mlm',
    icon: 'tabler-sitemap',
    section: 'Administration'
  },
  {
    id: 'admin-departments',
    name: 'Modules du Système',
    url: '/administration/department',
    icon: 'tabler-building',
    section: 'Administration'
  },
  {
    id: 'admin-roles',
    name: 'Rôles et Permissions',
    url: '/administration/role',
    icon: 'tabler-lock',
    section: 'Administration'
  },

  // Investissements
  {
    id: 'invest-investors',
    name: 'Mes Investisseurs',
    url: '/invest/investor',
    icon: 'tabler-users',
    section: 'Investissements'
  },

  // Souscriptions
  {
    id: 'subscriptions',
    name: 'Mes Souscriptions',
    url: '/subscription/subscription',
    icon: 'tabler-star',
    section: 'Souscriptions'
  },

  // Transactions
  {
    id: 'transaction-recharge',
    name: 'Mes Recharges',
    url: '/transaction/recharge',
    icon: 'tabler-credit-card',
    section: 'Transactions'
  },
  {
    id: 'transaction-cash',
    name: 'Retraits',
    url: '/transaction/cash',
    icon: 'tabler-cash',
    section: 'Transactions'
  },
  {
    id: 'transaction-transfert',
    name: 'Transferts',
    url: '/transaction/transfert',
    icon: 'tabler-arrows-exchange',
    section: 'Transactions'
  },
  {
    id: 'transaction-coin',
    name: 'Achat Cryptos',
    url: '/transaction/coin',
    icon: 'tabler-coin',
    section: 'Transactions'
  },
  {
    id: 'transaction-coinsale',
    name: 'Vente Cryptos',
    url: '/transaction/coinsale',
    icon: 'tabler-coin-off',
    section: 'Transactions'
  },

  // Bonus et Gains
  {
    id: 'bonus',
    name: 'Mes Bonus',
    url: '/bonus/bonus',
    icon: 'tabler-gift',
    section: 'Bonus & Gains'
  },
  {
    id: 'gains',
    name: 'Mes Gains',
    url: '/bonus/gain',
    icon: 'tabler-chart-line',
    section: 'Bonus & Gains'
  },

  // Parrainages
  {
    id: 'parring',
    name: 'Mes Parrainages',
    url: '/parring/parring',
    icon: 'tabler-share',
    section: 'Parrainages'
  },

  // Portefeuilles
  {
    id: 'wallets',
    name: 'Mes Portefeuilles',
    url: '/payment/payment',
    icon: 'tabler-wallet',
    section: 'Portefeuilles'
  },

  // Notifications
  {
    id: 'notifications',
    name: 'Mes Notifications',
    url: '/notification/notification',
    icon: 'tabler-bell',
    section: 'Notifications'
  },

  // Support
  {
    id: 'support-tickets',
    name: 'Mes Tickets',
    url: '/apps/support/tickets',
    icon: 'tabler-help',
    section: 'Support'
  }
]

export default searchData
