'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Types & Services
import { PackageService } from '@/services/package.service'
import { SubscriptionService } from '@/services/subscription.service'
import type { Package } from '@/types/api'

interface NewSubscriptionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  package_code: string
  amount: number
}

const NewSubscriptionModal = ({ open, onClose, onSuccess }: NewSubscriptionModalProps) => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      package_code: '',
      amount: 0
    }
  })

  const selectedPackageCode = watch('package_code')

  // Fetch packages on mount
  useEffect(() => {
    if (open) {
      fetchPackages()
      reset()
      setError(null)
    }
  }, [open, reset])

  // Update amount when package changes
  useEffect(() => {
    if (selectedPackageCode && packages.length > 0) {
      const selectedPkg = packages.find(p => p.code === selectedPackageCode)
      if (selectedPkg) {
        setValue('amount', selectedPkg.amount)
      }
    }
  }, [selectedPackageCode, packages, setValue])

  const fetchPackages = async () => {
    setLoadingPackages(true)
    try {
      const data = await PackageService.getAll()
      setPackages(data)
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les packages')
    } finally {
      setLoadingPackages(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError(null)
    try {
      await SubscriptionService.create(data)
      toast.success('Souscription créée avec succès')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      const message = err.response?.data?.message || 'Erreur lors de la création de la souscription'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Nouvelle Souscription</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <div className='flex flex-col gap-4'>
            <Controller
              name='package_code'
              control={control}
              rules={{ required: 'Le package est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label='Package'
                  fullWidth
                  error={!!errors.package_code}
                  helperText={errors.package_code?.message}
                  disabled={loadingPackages}
                >
                  {loadingPackages ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} className='mr-2' /> Chargement...
                    </MenuItem>
                  ) : (
                    packages.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.code}>
                        {pkg.name} ({pkg.amount} $)
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name='amount'
              control={control}
              rules={{
                required: 'Le montant est requis',
                min: { value: 1, message: 'Le montant doit être supérieur à 0' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Montant ($)'
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  disabled={submitting} // Amount is usually fixed by package but API allows sending it, maybe for custom amounts? Keeping it editable but pre-filled.
                />
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary' disabled={submitting}>
            Annuler
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Souscrire'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default NewSubscriptionModal
