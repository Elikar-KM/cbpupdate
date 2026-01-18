'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'

// Component Imports
import VuexyLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.375rem;
  line-height: 1.09091;
  font-weight: 700;
  letter-spacing: 0.25px;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 12px;'}
`

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  // Refs
  const logoTextRef = useRef<HTMLSpanElement>(null)

  // Hooks
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  // States
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [corpName, setCorpName] = useState<string>(themeConfig.templateName)

  useEffect(() => {
    const fetchCorporationData = async () => {
      try {
        // Import dynamically to avoid circular dependencies if any, though standard import is fine usually
        const { CorporationService } = await import('@/services/corporation.service')
        const data = await CorporationService.getPublicInfos()

        if (data) {
          if (data.logo_url) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''

            setLogoUrl(data.logo_url.startsWith('http') ? data.logo_url : `${baseUrl}/${data.logo_url}`)
          }

          if (data.corporation_name_mini) {
            setCorpName(data.corporation_name_mini)
          } else if (data.corporation_name) {
            setCorpName(data.corporation_name)
          }
        }
      } catch (error) {
        console.error('Error fetching corporation logo:', error)
      }
    }

    fetchCorporationData()
  }, [])

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div className='flex items-center gap-2' suppressHydrationWarning>
      {logoUrl ? (
        <img src={logoUrl} alt='Logo' style={{ height: 32, maxWidth: '100%', objectFit: 'contain' }} />
      ) : (
        <span>...</span>
      )}
      <LogoText
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        {corpName}
      </LogoText>
    </div>
  )
}

export default Logo
