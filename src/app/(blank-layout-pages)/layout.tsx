// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import BlankLayout from '@layouts/BlankLayout'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType
const Layout = async (props: Props) => {
  const { children } = props

  // Vars
  const lang = 'fr'
  const direction = 'ltr'
  const systemMode = await getSystemMode()

  return <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
}

export default Layout
