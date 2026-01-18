'use client'

// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { AuthProvider } from '@/contexts/AuthContext'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import ReduxProvider from '@/redux-store/ReduxProvider'

// Styled Component Imports
import AppReactToastify from '@/libs/styles/AppReactToastify'

// Config Imports
import themeConfig from '@configs/themeConfig'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  // For SSG, we use defaults. Cookie handling for settings will be done client-side if supported by SettingsProvider
  const mode = themeConfig.mode
  const systemMode = 'light' // Default standard mode

  return (
    <AuthProvider>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={{}} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            <ReduxProvider>{children}</ReduxProvider>
            <AppReactToastify direction={direction} hideProgressBar />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </AuthProvider>
  )
}

export default Providers
