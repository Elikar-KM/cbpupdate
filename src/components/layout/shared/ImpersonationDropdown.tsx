'use client'

import { useEffect, useState, useRef } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

// Service Imports
import { AuthService } from '@/services/auth.service'

const ImpersonationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const router = useRouter()

  useEffect(() => {
    // Check impersonation status
    const checkImpersonation = () => {
      if (typeof window === 'undefined') return

      const impersonating = AuthService.isImpersonating()

      setIsImpersonating(impersonating)

      if (impersonating) {
        const user = AuthService.getImpersonatedUser()

        setImpersonatedUser(user)
      }
    }

    checkImpersonation()

    // Listen for storage changes
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkImpersonation)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', checkImpersonation)
      }
    }
  }, [])

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleStopImpersonation = () => {
    const result = AuthService.stopImpersonation()

    if (result.success) {
      setIsImpersonating(false)
      setImpersonatedUser(null)
      handleClose()

      // Reload to refresh with admin session
      setTimeout(() => {
        window.location.href = '/dashboards/crm'
      }, 500)
    }
  }

  // Don't render if not impersonating
  if (!isImpersonating) {
    return null
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='!text-textPrimary'>
        <i className='tabler-user-shield text-[22px]' />
        <Chip
          label='Admin'
          size='small'
          color='warning'
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            height: 16,
            fontSize: '0.625rem',
            fontWeight: 600
          }}
        />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-end'
        transition
        disablePortal
        className='min-is-[300px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem disabled>
                    <div className='flex flex-col gap-1'>
                      <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 600 }}>
                        Mode Impersonation Actif
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {impersonatedUser?.fullName || impersonatedUser?.email}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {impersonatedUser?.email}
                      </Typography>
                    </div>
                  </MenuItem>
                  <Divider className='mlb-1' />
                  <MenuItem onClick={handleStopImpersonation} className='gap-3'>
                    <i className='tabler-logout text-[22px]' />
                    <Typography>Quitter le mode</Typography>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ImpersonationDropdown
