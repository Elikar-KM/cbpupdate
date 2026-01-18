// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type DefaultSuggestionsType = {
  sectionLabel: string
  items: {
    label: string
    href: string
    icon?: string
  }[]
}

const defaultSuggestions: DefaultSuggestionsType[] = [
  {
    sectionLabel: 'Recherches Populaires',
    items: [
      {
        label: 'Tableau de Bord',
        href: '/dashboards/crm',
        icon: 'tabler-smart-home'
      },
      {
        label: 'Mes Recharges',
        href: '/transaction/recharge',
        icon: 'tabler-credit-card'
      },
      {
        label: 'Mes Souscriptions',
        href: '/subscription/subscription',
        icon: 'tabler-star'
      },
      {
        label: 'Mes Bonus',
        href: '/bonus/bonus',
        icon: 'tabler-gift'
      }
    ]
  },
  {
    sectionLabel: 'Transactions',
    items: [
      {
        label: 'Retraits',
        href: '/transaction/cash',
        icon: 'tabler-cash'
      },
      {
        label: 'Transferts',
        href: '/transaction/transfert',
        icon: 'tabler-arrows-exchange'
      },
      {
        label: 'Achat Cryptos',
        href: '/transaction/coin',
        icon: 'tabler-coin'
      },
      {
        label: 'Vente Cryptos',
        href: '/transaction/coinsale',
        icon: 'tabler-coin-off'
      }
    ]
  },
  {
    sectionLabel: 'Administration',
    items: [
      {
        label: 'Gérer Utilisateurs',
        href: '/administration/user',
        icon: 'tabler-users'
      },
      {
        label: 'Modes de Paiement',
        href: '/administration/wallet',
        icon: 'tabler-wallet'
      },
      {
        label: 'Gérer les Packages',
        href: '/administration/package',
        icon: 'tabler-package'
      },
      {
        label: 'Rôles et Permissions',
        href: '/administration/role',
        icon: 'tabler-lock'
      }
    ]
  },
  {
    sectionLabel: 'Autres',
    items: [
      {
        label: 'Mes Parrainages',
        href: '/parring/parring',
        icon: 'tabler-share'
      },
      {
        label: 'Mes Portefeuilles',
        href: '/payment/payment',
        icon: 'tabler-wallet'
      },
      {
        label: 'Mes Notifications',
        href: '/notification/notification',
        icon: 'tabler-bell'
      },
      {
        label: 'Support',
        href: '/apps/support/tickets',
        icon: 'tabler-help'
      }
    ]
  }
]

const DefaultSuggestions = ({ setOpen }: { setOpen: (value: boolean) => void }) => {
  // Hooks

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase text-textDisabled tracking-[0.8px]'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl shrink-0')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
