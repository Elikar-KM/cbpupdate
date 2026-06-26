// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
  userRole?: string
): VerticalMenuDataType[] => {
  const isAdmin = userRole === 'super-admin' || userRole === 'system-admin' || userRole === 'admin'

  const menu: VerticalMenuDataType[] = []

  // Section: Gestion Globale (Admin uniquement)
  if (isAdmin) {
    // Paramétrage (Admin uniquement)
    menu.push({
      label: 'Paramétrage',
      icon: 'tabler-server',
      children: [
        { label: 'Infos. Générales', href: '/administration/setting', icon: 'tabler-circle' },
        { label: 'Modes de Paiement', href: '/administration/wallet', icon: 'tabler-circle' },
        { label: 'Gérer les Packages', href: '/administration/package', icon: 'tabler-circle' },
        { label: 'Gestion du MLM', href: '/administration/mlm', icon: 'tabler-circle' },
        { label: 'Modules du Système', href: '/administration/department', icon: 'tabler-circle' },
        { label: 'Rôles et Permissions', href: '/administration/role', icon: 'tabler-circle' },
        { label: 'Gérer Utilisateurs', href: '/administration/user', icon: 'tabler-circle' }
      ]
    })
  }

  // Tableau de Bord (Dynamique selon le rôle)
  menu.push({
    label: 'Tableau de Bord',
    icon: 'tabler-smart-home',
    href: isAdmin ? '/dashboards/crm' : '/investment'
  })

  // Gérer Investisseurs (Admin uniquement)
  if (isAdmin) {
    menu.push({
      label: 'Gérer Investisseurs',
      icon: 'tabler-users',
      children: [{ label: 'Mes Investisseurs', href: '/invest/investor', icon: 'tabler-circle' }]
    })
  }

  // Souscriptions (Tous les utilisateurs)
  menu.push({
    label: 'Souscriptions',
    icon: 'tabler-star',
    children: [{ label: 'Mes Souscriptions', href: '/subscription/subscription', icon: 'tabler-circle' }]
  })

  // Recharges (Tous les utilisateurs)
  menu.push({
    label: 'Recharges',
    icon: 'tabler-credit-card',
    children: [{ label: 'Mes Recharges', href: '/transaction/recharge', icon: 'tabler-circle' }]
  })

  // Transactions (Tous les utilisateurs)
  menu.push({
    label: 'Transactions',
    icon: 'tabler-arrows-exchange',
    children: [
      { label: 'Retraits', href: '/transaction/cash', icon: 'tabler-circle' },
      { label: 'Transferts', href: '/transaction/transfert', icon: 'tabler-circle' },
      { label: 'Achat Cryptos', href: '/transaction/coin', icon: 'tabler-circle' },
      { label: 'Vente Cryptos', href: '/transaction/coinsale', icon: 'tabler-circle' }
    ]
  })

  // Bonus (Tous les utilisateurs)
  menu.push({
    label: 'Bonus',
    icon: 'tabler-gift',
    children: [
      { label: 'Mes Bonus', href: '/bonus/bonus', icon: 'tabler-circle' },
      { label: 'Mes Gains', href: '/bonus/gain', icon: 'tabler-circle' }
    ]
  })

  // Parrainages (Tous les utilisateurs)
  menu.push({
    label: 'Parrainages',
    icon: 'tabler-share',
    children: [{ label: 'Mes Parrainages', href: '/parring/parring', icon: 'tabler-circle' }]
  })

  // Portefeuilles (Tous les utilisateurs)
  menu.push({
    label: 'Portefeuilles',
    icon: 'tabler-wallet',
    children: [{ label: 'Mes Portefeuilles', href: '/payment/payment', icon: 'tabler-circle' }]
  })

  // Notifications (Tous les utilisateurs)
  menu.push({
    label: 'Notifications',
    icon: 'tabler-bell',
    children: [{ label: 'Mes Notifications', href: '/notification/notification', icon: 'tabler-circle' }]
  })

  // Gestion des Notifications (Admin uniquement)
  if (isAdmin) {
    menu.push({
      label: 'Gestion Notifications',
      icon: 'tabler-mail-cog',
      children: [
        { label: 'Templates', href: '/notification-admin/templates', icon: 'tabler-circle' },
        { label: 'Campagnes', href: '/notification-admin/campaigns', icon: 'tabler-circle' }
      ]
    })
  }

  // Support (Tous les utilisateurs)
  menu.push({
    label: 'Support',
    icon: 'tabler-help',
    children: [{ label: 'Mes Tickets', href: '/apps/support/tickets', icon: 'tabler-circle' }]
  })

  // Paramètres (Tous les utilisateurs)
  menu.push({
    label: 'Paramètres',
    icon: 'tabler-settings',
    children: [{ label: 'Configuration du Thème', href: '/theme-configuration', icon: 'tabler-palette' }]
  })

  return menu
}

export default verticalMenuData
