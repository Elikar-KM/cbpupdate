// Next Imports
// import type { headers } from 'next/headers'

// Type Imports
import type { ChildrenType } from '@core/types'

// import type { Locale } from '@configs/i18n'

// Component Imports
// import LangRedirect from '@components/LangRedirect'

// Config Imports
// import { i18n } from '@configs/i18n'

// ℹ️ We've to create this array because next.js makes request with `_next` prefix for static/asset files
// const invalidLangs = ['_next']

const TranslationWrapper = (props: { headersList?: any; lang: string } & ChildrenType) => {
  return <>{props.children}</>
}

export default TranslationWrapper
