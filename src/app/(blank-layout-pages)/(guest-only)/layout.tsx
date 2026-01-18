// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

const Layout = async (props: ChildrenType) => {
  const { children } = props

  const lang = 'fr'

  return <GuestOnlyRoute lang={lang}>{children}</GuestOnlyRoute>
}

export default Layout
