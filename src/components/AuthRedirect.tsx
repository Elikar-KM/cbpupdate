'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname()

  const login = '/login'
  const redirectUrl = `/login?redirectTo=${pathname}`

  if (pathname === login) {
    return null
  }

  if (pathname === themeConfig.homePageUrl) {
    return redirect(login)
  }

  return redirect(redirectUrl)
}

export default AuthRedirect
