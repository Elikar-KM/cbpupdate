'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'

import { AuthService } from '@/services/auth.service'

const ImpersonationBanner = () => {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check impersonation status on mount and when localStorage changes
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

    // Listen for storage changes (in case impersonation starts in another tab)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkImpersonation)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', checkImpersonation)
      }
    }
  }, [])

  const handleStopImpersonation = () => {
    const result = AuthService.stopImpersonation()

    if (result.success) {
      setSnackbarMessage(result.message)
      setSnackbarOpen(true)
      setIsImpersonating(false)
      setImpersonatedUser(null)

      // Reload the page to refresh with admin session
      setTimeout(() => {
        window.location.href = '/dashboards/crm'
      }, 1000)
    } else {
      setSnackbarMessage(result.message)
      setSnackbarOpen(true)
    }
  }

  if (!isImpersonating) {
    return null
  }

  return (
    <>
      <Alert
        severity='warning'
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        action={
          <Button color='inherit' size='small' onClick={handleStopImpersonation} sx={{ fontWeight: 600 }}>
            Quitter le mode impersonation
          </Button>
        }
      >
        <strong>Mode Impersonation actif</strong> - Vous êtes connecté en tant que{' '}
        <strong>{impersonatedUser?.fullName || impersonatedUser?.email}</strong>
      </Alert>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  )
}

export default ImpersonationBanner
