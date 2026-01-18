'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import { useDebounce, useMedia } from 'react-use'
import { HexColorPicker, HexColorInput } from 'react-colorful'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { Direction } from '@core/types'
import type { PrimaryColorConfig } from '@configs/primaryColorConfig'

// Icon Imports
import SkinDefault from '@core/svg/SkinDefault'
import SkinBordered from '@core/svg/SkinBordered'
import LayoutVertical from '@core/svg/LayoutVertical'
import LayoutCollapsed from '@core/svg/LayoutCollapsed'
import LayoutHorizontal from '@core/svg/LayoutHorizontal'
import ContentCompact from '@core/svg/ContentCompact'
import ContentWide from '@core/svg/ContentWide'
import DirectionLtr from '@core/svg/DirectionLtr'

// Config Imports
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Style Imports
import styles from '@core/components/customizer/styles.module.css'

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')

  segments[1] = locale

  return segments.join('/')
}

type DebouncedColorPickerProps = {
  settings: Settings
  isColorFromPrimaryConfig: PrimaryColorConfig | undefined
  handleChange: (field: keyof Settings | 'primaryColor', value: Settings[keyof Settings] | string) => void
}

const DebouncedColorPicker = (props: DebouncedColorPickerProps) => {
  // Props
  const { settings, isColorFromPrimaryConfig, handleChange } = props

  // States
  const [debouncedColor, setDebouncedColor] = useState(settings.primaryColor ?? primaryColorConfig[0].main)

  // Hooks
  useDebounce(() => handleChange('primaryColor', debouncedColor), 200, [debouncedColor])

  return (
    <>
      <HexColorPicker
        color={!isColorFromPrimaryConfig ? (settings.primaryColor ?? primaryColorConfig[0].main) : '#eee'}
        onChange={setDebouncedColor}
      />
      <HexColorInput
        className={styles.colorInput}
        color={!isColorFromPrimaryConfig ? (settings.primaryColor ?? primaryColorConfig[0].main) : '#eee'}
        onChange={setDebouncedColor}
        prefixed
        placeholder='Type a color'
      />
    </>
  )
}

const ThemeConfiguration = () => {
  // States
  const [isPrimaryMenuOpen, setIsPrimaryMenuOpen] = useState(false)
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false)

  // Refs
  const primaryAnchorRef = useRef<HTMLDivElement | null>(null)
  const sidebarAnchorRef = useRef<HTMLDivElement | null>(null)

  // Hooks
  const pathName = usePathname()
  const { settings, updateSettings, resetSettings, isSettingsChanged } = useSettings()
  const isSystemDark = useMedia('(prefers-color-scheme: dark)', false)

  const isColorFromPrimaryConfig = primaryColorConfig.find(item => item.main === settings.primaryColor)

  // Update Settings
  const handleChange = (field: keyof Settings | 'direction', value: Settings[keyof Settings] | Direction) => {
    // Update settings in cookie
    updateSettings({ [field]: value })
  }

  const handlePrimaryMenuClose = (event: MouseEvent | TouchEvent): void => {
    if (primaryAnchorRef.current && primaryAnchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setIsPrimaryMenuOpen(false)
  }

  const handleSidebarMenuClose = (event: MouseEvent | TouchEvent): void => {
    if (sidebarAnchorRef.current && sidebarAnchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setIsSidebarMenuOpen(false)
  }

  return (
    <Card>
      <CardHeader
        title='Configuration du Thème'
        subheader='Personnalisez et prévisualisez en temps réel'
        action={
          <div className='flex gap-4 items-center'>
            <div onClick={resetSettings} className='relative flex cursor-pointer items-center gap-2'>
              <i className='tabler-refresh text-textPrimary' />
              <Typography variant='body2' className='cursor-pointer'>
                Réinitialiser
              </Typography>
              <div className={classnames(styles.dotStyles, { [styles.show]: isSettingsChanged })} />
            </div>
          </div>
        }
      />
      <CardContent>
        <div className='flex flex-col gap-6'>
          <Chip label='Thèmes' size='small' color='primary' variant='tonal' className='self-start rounded-sm' />
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Couleur Principale</p>
            <div className='flex items-center gap-2 flex-wrap'>
              {primaryColorConfig.map(item => (
                <div
                  key={item.main}
                  className={classnames(styles.primaryColorWrapper, {
                    [styles.active]: settings.primaryColor === item.main
                  })}
                  onClick={() => handleChange('primaryColor', item.main)}
                >
                  <div className={styles.primaryColor} style={{ backgroundColor: item.main }} />
                </div>
              ))}
              <div
                ref={primaryAnchorRef}
                className={classnames(styles.primaryColorWrapper, {
                  [styles.active]: !isColorFromPrimaryConfig
                })}
                onClick={() => setIsPrimaryMenuOpen(prev => !prev)}
              >
                <div
                  className={classnames(styles.primaryColor, 'flex items-center justify-center')}
                  style={{
                    backgroundColor: !isColorFromPrimaryConfig
                      ? settings.primaryColor
                      : 'var(--mui-palette-action-selected)',
                    color: isColorFromPrimaryConfig
                      ? 'var(--mui-palette-text-primary)'
                      : 'var(--mui-palette-primary-contrastText)'
                  }}
                >
                  <i className='tabler-color-picker text-xl' />
                </div>
              </div>
              <Popper
                transition
                open={isPrimaryMenuOpen}
                disablePortal
                anchorEl={primaryAnchorRef.current}
                placement='bottom-end'
                className='z-[1]'
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} style={{ transformOrigin: 'right top' }}>
                    <Paper elevation={6} className={styles.colorPopup}>
                      <ClickAwayListener onClickAway={handlePrimaryMenuClose}>
                        <div>
                          <DebouncedColorPicker
                            settings={settings}
                            isColorFromPrimaryConfig={isColorFromPrimaryConfig}
                            handleChange={handleChange}
                          />
                        </div>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Couleur Sidebar</p>
            <div className='flex items-center gap-2'>
              <div
                className={classnames(styles.primaryColorWrapper, {
                  [styles.active]: !settings.sidebarColor
                })}
                onClick={() => handleChange('sidebarColor', undefined)}
              >
                <div className={classnames(styles.primaryColor, 'flex items-center justify-center bg-backgroundPaper')}>
                  <i className='tabler-x text-xl' />
                </div>
              </div>
              <div
                ref={sidebarAnchorRef}
                className={classnames(styles.primaryColorWrapper, {
                  [styles.active]: settings.sidebarColor
                })}
                onClick={() => setIsSidebarMenuOpen(prev => !prev)}
              >
                <div
                  className={classnames(styles.primaryColor, 'flex items-center justify-center')}
                  style={{
                    backgroundColor: settings.sidebarColor || 'var(--mui-palette-background-paper)',
                    color: settings.sidebarColor
                      ? 'var(--mui-palette-primary-contrastText)'
                      : 'var(--mui-palette-text-primary)'
                  }}
                >
                  <i className='tabler-color-picker text-xl' />
                </div>
              </div>
              <Popper
                transition
                open={isSidebarMenuOpen}
                disablePortal
                anchorEl={sidebarAnchorRef.current}
                placement='bottom-end'
                className='z-[1]'
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} style={{ transformOrigin: 'right top' }}>
                    <Paper elevation={6} className={styles.colorPopup}>
                      <ClickAwayListener onClickAway={handleSidebarMenuClose}>
                        <div>
                          <HexColorPicker
                            color={settings.sidebarColor || '#ffffff'}
                            onChange={color => handleChange('sidebarColor', color)}
                          />
                          <HexColorInput
                            className={styles.colorInput}
                            color={settings.sidebarColor || '#ffffff'}
                            onChange={color => handleChange('sidebarColor', color)}
                            prefixed
                            placeholder='Type a color'
                          />
                        </div>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Mode</p>
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, styles.modeWrapper, {
                    [styles.active]: settings.mode === 'light'
                  })}
                  onClick={() => handleChange('mode', 'light')}
                >
                  <i className='tabler-sun text-[30px]' />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('mode', 'light')}>
                  Clair
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, styles.modeWrapper, {
                    [styles.active]: settings.mode === 'dark'
                  })}
                  onClick={() => handleChange('mode', 'dark')}
                >
                  <i className='tabler-moon-stars text-[30px]' />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('mode', 'dark')}>
                  Sombre
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, styles.modeWrapper, {
                    [styles.active]: settings.mode === 'system'
                  })}
                  onClick={() => handleChange('mode', 'system')}
                >
                  <i className='tabler-device-laptop text-[30px]' />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('mode', 'system')}>
                  Système
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Apparence</p>
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === 'default' })}
                  onClick={() => handleChange('skin', 'default')}
                >
                  <SkinDefault />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('skin', 'default')}>
                  Défaut
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === 'bordered' })}
                  onClick={() => handleChange('skin', 'bordered')}
                >
                  <SkinBordered />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('skin', 'bordered')}>
                  Bordé
                </p>
              </div>
            </div>
          </div>
          {settings.mode === 'dark' ||
          (settings.mode === 'system' && isSystemDark) ||
          settings.layout === 'horizontal' ? null : (
            <div className='flex items-center justify-between max-w-xs'>
              <label className='font-medium cursor-pointer' htmlFor='customizer-semi-dark'>
                Semi-Sombre
              </label>
              <Switch
                id='customizer-semi-dark'
                checked={settings.semiDark === true}
                onChange={() => handleChange('semiDark', !settings.semiDark)}
              />
            </div>
          )}
        </div>
        <hr className={classnames(styles.hr, 'my-6')} />
        <div className='flex flex-col gap-6'>
          <Chip label='Mise en page' variant='tonal' size='small' color='primary' className='self-start rounded-sm' />
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Dispositions</p>
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'vertical' })}
                  onClick={() => handleChange('layout', 'vertical')}
                >
                  <LayoutVertical />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('layout', 'vertical')}>
                  Vertical
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'collapsed' })}
                  onClick={() => handleChange('layout', 'collapsed')}
                >
                  <LayoutCollapsed />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('layout', 'collapsed')}>
                  Réduit
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === 'horizontal' })}
                  onClick={() => handleChange('layout', 'horizontal')}
                >
                  <LayoutHorizontal />
                </div>
                <p className={styles.itemLabel} onClick={() => handleChange('layout', 'horizontal')}>
                  Horizontal
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Contenu</p>
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, {
                    [styles.active]: settings.contentWidth === 'compact'
                  })}
                  onClick={() =>
                    updateSettings({
                      navbarContentWidth: 'compact',
                      contentWidth: 'compact',
                      footerContentWidth: 'compact'
                    })
                  }
                >
                  <ContentCompact />
                </div>
                <p
                  className={styles.itemLabel}
                  onClick={() =>
                    updateSettings({
                      navbarContentWidth: 'compact',
                      contentWidth: 'compact',
                      footerContentWidth: 'compact'
                    })
                  }
                >
                  Compact
                </p>
              </div>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, { [styles.active]: settings.contentWidth === 'wide' })}
                  onClick={() =>
                    updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                  }
                >
                  <ContentWide />
                </div>
                <p
                  className={styles.itemLabel}
                  onClick={() =>
                    updateSettings({ navbarContentWidth: 'wide', contentWidth: 'wide', footerContentWidth: 'wide' })
                  }
                >
                  Large
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>Direction</p>
            <div className='flex items-center gap-4 flex-wrap'>
              <Link href={getLocalePath(pathName, 'en')}>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, {
                      [styles.active]: settings.direction === 'ltr'
                    })}
                  >
                    <DirectionLtr />
                  </div>
                  <p className={styles.itemLabel}>
                    Gauche à Droite <br />
                    (Anglais)
                  </p>
                </div>
              </Link>
              {/* <Link href={getLocalePath(pathName, 'ar')}>
                <div className='flex flex-col items-start gap-0.5'>
                  <div
                    className={classnames(styles.itemWrapper, {
                      [styles.active]: settings.direction === 'rtl'
                    })}
                  >
                    <DirectionRtl />
                  </div>
                  <p className={styles.itemLabel}>
                    Right to Left <br />
                    (Arabic)
                  </p>
                </div>
              </Link> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ThemeConfiguration
