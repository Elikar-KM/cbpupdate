import React from 'react'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'

interface FormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  maxWidth = 'sm',
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' disabled={loading}>
          {cancelText}
        </Button>
        <LoadingButton onClick={onSubmit} color='primary' variant='contained' loading={loading}>
          {submitText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default FormModal
