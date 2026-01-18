'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'

import { SupportService } from '@/services/support.service'
import type { CreateTicketData, TicketPriority } from '@/types/support'

interface CreateTicketDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateTicketDialog = ({ open, onClose, onSuccess }: CreateTicketDialogProps) => {
  const [formData, setFormData] = useState<CreateTicketData>({
    subject: '',
    message: '',
    priority: 'medium'
  })

  const handleSubmit = async () => {
    try {
      await SupportService.createTicket(formData)
      setFormData({ subject: '', message: '', priority: 'medium' })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Nouveau Ticket de Support</DialogTitle>
      <DialogContent>
        <Grid container spacing={4} className='mt-1'>
          <Grid item xs={12}>
            <TextField
              label='Sujet'
              fullWidth
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label='Priorité'
              fullWidth
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
            >
              <MenuItem value='low'>Basse</MenuItem>
              <MenuItem value='medium'>Moyenne</MenuItem>
              <MenuItem value='high'>Haute</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Message'
              fullWidth
              multiline
              rows={4}
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant='contained'>
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateTicketDialog
