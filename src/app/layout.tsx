// Next Imports
// import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// import type { Locale } from '@configs/i18n'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports
// import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'CBP - Community',
  description: ''
}

const RootLayout = async (props: ChildrenType) => {
  const { children } = props

  // Vars
  const lang = 'fr'

  // const headersList = await headers() // Removed for SSG
  // const systemMode = await getSystemMode() // Removed for SSG
  const systemMode = 'light' // Default for SSG
  const direction = 'ltr'

  return (
    <TranslationWrapper headersList={undefined} lang={lang}>
      <html id='__next' lang={lang} dir={direction} suppressHydrationWarning={true}>
        <body className='flex is-full min-bs-full flex-auto flex-col' suppressHydrationWarning>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          {children}
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
