'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Logo from '@components/layout/shared/Logo'

const GuestTrackTicket = () => {
  const [token, setToken] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      router.push(`/guest/support/${token.trim()}`)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6 bg-background'>
      <Card className='w-full max-w-md'>
        <CardContent>
          <div className='flex justify-center mb-6'>
            <Logo />
          </div>
          <Typography variant='h5' className='mb-1 text-center'>
            Suivi de Ticket
          </Typography>
          <Typography className='mb-6 text-center text-textSecondary'>
            Entrez votre token pour accéder à votre ticket.
          </Typography>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              label='Token du Ticket'
              fullWidth
              required
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder='Entrez votre token ici...'
            />
            <Button type='submit' variant='contained' fullWidth>
              Accéder
            </Button>
            <div className='flex justify-center gap-4 mt-2'>
              <Link href='/login' className='text-primary text-sm'>
                Retour à la connexion
              </Link>
              <Link href='/guest/support/create' className='text-primary text-sm'>
                Nouveau Ticket
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default GuestTrackTicket
