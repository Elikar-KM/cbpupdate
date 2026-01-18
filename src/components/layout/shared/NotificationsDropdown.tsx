'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import { useSession } from 'next-auth/react'

import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { echo } from '@/lib/echo'

// Service Imports
import { NotificationService, type Notification } from '@/services/notification.service'

// Util Imports
import { getInitials } from '@/utils/getInitials'

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
} & (
  | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
  | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
  | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
)

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

// Helper function to format notification time
const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Convert API notification to component format
const convertNotification = (apiNotif: Notification): NotificationsType => {
  return {
    title: apiNotif.header || apiNotif.type,
    subtitle: apiNotif.content || apiNotif.description || '',
    time: formatNotificationTime(apiNotif.created_at || apiNotif.date),
    read: apiNotif.status === 1,
    avatarIcon: 'tabler-bell',
    avatarColor: 'primary' as ThemeColor
  }
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const router = useRouter()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { data: session } = useSession()

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Real-time listener
  useEffect(() => {
    if (session?.user && echo) {
      // @ts-ignore
      const userId = session.user.id
      const channel = echo.private(`App.Models.User.${userId}`)

      channel.listen('.notification.created', () => {
        fetchNotifications() // Refresh list on new notification
      })

      return () => {
        channel.stopListening('.notification.created')
      }
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await NotificationService.getAll()

      setNotifications(data.slice(0, 10)) // Limit to 10 most recent
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert to display format
  const notificationsState = notifications.map(convertNotification)
  const notificationCount = notifications.filter(n => n.status === 0).length
  const readAll = notifications.every(n => n.status === 1)

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when clicked
  const handleReadNotification = async (event: MouseEvent<HTMLElement>, value: boolean, index: number) => {
    event.stopPropagation()

    const notification = notifications[index]

    if (notification && notification.status === 0) {
      try {
        await NotificationService.markAsRead(notification.id)

        const newNotifications = [...notifications]

        newNotifications[index] = { ...newNotifications[index], status: 1 }
        setNotifications(newNotifications)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  // Read all notifications
  const readAllNotifications = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 0)

      await Promise.all(unreadNotifications.map(n => NotificationService.markAsRead(n.id)))

      const newNotifications = notifications.map(n => ({ ...n, status: 1 }))

      setNotifications(newNotifications)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleViewAll = () => {
    router.push('/notification/notification')
    setOpen(false)
  }

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip
                        size='small'
                        variant='tonal'
                        color='primary'
                        label={`${notificationCount} ${notificationCount > 1 ? 'Nouvelles' : 'Nouvelle'}`}
                      />
                    )}
                    <Tooltip
                      title={readAll ? 'Marquer comme non lues' : 'Tout marquer comme lu'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notificationsState.length > 0 ? (
                        <IconButton size='small' onClick={() => readAllNotifications()} className='text-textPrimary'>
                          <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} />
                        </IconButton>
                      ) : (
                        <span />
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading ? (
                      <div className='flex items-center justify-center p-8'>
                        <Typography variant='body2' color='text.secondary'>
                          Chargement...
                        </Typography>
                      </div>
                    ) : notificationsState.length === 0 ? (
                      <div className='flex flex-col items-center justify-center p-8 gap-2'>
                        <i className='tabler-bell-off text-6xl text-textDisabled' />
                        <Typography variant='body2' color='text.secondary'>
                          Aucune notification
                        </Typography>
                      </div>
                    ) : (
                      notificationsState.map((notification, index) => {
                        const {
                          title,
                          subtitle,
                          time,
                          read,
                          avatarImage,
                          avatarIcon,
                          avatarText,
                          avatarColor,
                          avatarSkin
                        } = notification

                        return (
                          <div
                            key={index}
                            className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                              'border-be': index !== notificationsState.length - 1
                            })}
                            onClick={e => handleReadNotification(e, true, index)}
                          >
                            {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                            <div className='flex flex-col flex-auto'>
                              <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                                {title}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' className='mbe-2'>
                                {subtitle}
                              </Typography>
                              <Typography variant='caption' color='text.disabled'>
                                {time}
                              </Typography>
                            </div>
                            <div className='flex flex-col items-end gap-2'>
                              <Badge
                                variant='dot'
                                color={read ? 'secondary' : 'primary'}
                                onClick={e => handleReadNotification(e, !read, index)}
                                className={classnames('mbs-1 mie-1', {
                                  'invisible group-hover:visible': read
                                })}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button fullWidth variant='contained' size='small' onClick={handleViewAll}>
                      Voir Toutes les Notifications
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
