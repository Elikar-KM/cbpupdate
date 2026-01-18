'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
      suppressHydrationWarning
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()} CBP Community 2.0`}</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4' suppressHydrationWarning>
          <Link href='https://dev.arambee.africa' target='_blank' className='text-primary'>
            Dev by Arambee Software
          </Link>
        </div>
      )}
    </div>
  )
}

export default FooterContent
