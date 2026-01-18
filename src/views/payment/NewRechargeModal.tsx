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
import { RechargeService } from '@/services/recharge.service'

interface NewRechargeModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  amount: number
  payment_method: string
  payment_code: string
}

const PAYMENT_METHODS = [
  { type: 'bitcoin', name: 'Bitcoin' },
  { type: 'usdt', name: 'USDT' },
  { type: 'airtel-money', name: 'Airtel Money' },
  { type: 'm-pesa', name: 'M-Pesa' },
  { type: 'orange-money', name: 'Orange Money' }
]

const NewRechargeModal = ({ open, onClose, onSuccess }: NewRechargeModalProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      amount: 0,
      payment_method: '',
      payment_code: ''
    }
  })

  useEffect(() => {
    if (open) {
      reset()
      setError(null)
    }
  }, [open, reset])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError(null)

    try {
      await RechargeService.create({
        ...data,
        is_free_recharge: true // Wallet top-up, skip subscription validation
      })
      toast.success('Recharge créée avec succès')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      const message = err.message || 'Erreur lors de la création de la recharge'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Recharger mon Wallet</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <div className='flex flex-col gap-4'>
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
                  disabled={submitting}
                />
              )}
            />

            <Controller
              name='payment_method'
              control={control}
              rules={{ required: 'La méthode de paiement est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label='Méthode de Paiement'
                  fullWidth
                  error={!!errors.payment_method}
                  helperText={errors.payment_method?.message}
                  disabled={submitting}
                >
                  {PAYMENT_METHODS.map(method => (
                    <MenuItem key={method.type} value={method.type}>
                      {method.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name='payment_code'
              control={control}
              rules={{ required: 'Le code de paiement/référence est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Code / Référence de Paiement'
                  fullWidth
                  error={!!errors.payment_code}
                  helperText={errors.payment_code?.message}
                  disabled={submitting}
                  placeholder='Ex: TXN123456789'
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
            {submitting ? <CircularProgress size={24} /> : 'Recharger'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default NewRechargeModal
