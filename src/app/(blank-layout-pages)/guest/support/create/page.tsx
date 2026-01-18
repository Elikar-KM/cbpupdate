'use client'

import { useState } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { GuestSupportService } from '@/services/guest-support.service'
import type { CreateGuestTicketData } from '@/services/guest-support.service'
import type { TicketPriority } from '@/types/support'
import Logo from '@components/layout/shared/Logo'

const GuestCreateTicket = () => {
  const [formData, setFormData] = useState<CreateGuestTicketData>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    subject: '',
    message: '',
    priority: 'medium' as TicketPriority
  })

  const [successToken, setSuccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await GuestSupportService.createTicket(formData)

      setSuccessToken(response.token)
    } catch (err) {
      console.error('Error creating ticket:', err)
      setError('Une erreur est survenue lors de la création du ticket.')
    }
  }

  if (successToken) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen p-6 bg-background'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col gap-4 text-center'>
            <div className='flex justify-center mb-4'>
              <Logo />
            </div>
            <Typography variant='h4' color='success.main'>
              Ticket Créé !
            </Typography>
            <Typography>
              Votre ticket a été créé avec succès. Veuillez conserver précieusement le token ci-dessous pour suivre
              votre demande.
            </Typography>
            <Alert severity='warning' className='text-left break-all'>
              <strong>Token :</strong> {successToken}
            </Alert>
            <div className='flex gap-2 justify-center mt-4'>
              <Link href={`/guest/support/${successToken}`}>
                <Button variant='contained'>Accéder au Ticket</Button>
              </Link>
              <Link href='/login'>
                <Button variant='outlined'>Retour à la connexion</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6 bg-background'>
      <Card className='w-full max-w-md'>
        <CardContent>
          <div className='flex justify-center mb-6'>
            <Logo />
          </div>
          <Typography variant='h5' className='mb-1 text-center'>
            Support Invité
          </Typography>
          <Typography className='mb-6 text-center text-textSecondary'>
            Créez un ticket sans compte utilisateur.
          </Typography>

          {error && (
            <Alert severity='error' className='mb-4'>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              label='Nom Complet'
              fullWidth
              required
              value={formData.guest_name}
              onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
            />
            <TextField
              label='Email'
              type='email'
              fullWidth
              required
              value={formData.guest_email}
              onChange={e => setFormData({ ...formData, guest_email: e.target.value })}
            />
            <TextField
              label='Téléphone'
              fullWidth
              value={formData.guest_phone || ''}
              onChange={e => setFormData({ ...formData, guest_phone: e.target.value })}
            />
            <TextField
              label='Sujet'
              fullWidth
              required
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            />
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
            <TextField
              label='Message'
              fullWidth
              multiline
              rows={4}
              required
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
            <Button type='submit' variant='contained' fullWidth>
              Envoyer
            </Button>
            <div className='flex justify-center gap-4 mt-2'>
              <Link href='/login' className='text-primary text-sm'>
                Retour à la connexion
              </Link>
              <Link href='/guest/support/track' className='text-primary text-sm'>
                J'ai déjà un token
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default GuestCreateTicket
