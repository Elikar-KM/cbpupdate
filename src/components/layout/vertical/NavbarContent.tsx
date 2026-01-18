// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import ImpersonationDropdown from '@components/layout/shared/ImpersonationDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  return (
    <div
      className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
      suppressHydrationWarning
    >
      <div className='flex items-center gap-4' suppressHydrationWarning>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center' suppressHydrationWarning>
        <ModeDropdown />
        <NotificationsDropdown />
        <ImpersonationDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
