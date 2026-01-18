'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import { GuestSupportService } from '@/services/guest-support.service'
import type { Ticket } from '@/types/support'
import { getInitials } from '@/utils/getInitials'
import Logo from '@components/layout/shared/Logo'

const GuestTicketDetails = () => {
  const { token } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const fetchTicket = useCallback(async () => {
    if (!token) return
    try {
      const result = await GuestSupportService.getTicket(token as string)
      setTicket(result)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !ticket || !token) return

    try {
      const newMessage = await GuestSupportService.replyToTicket(token as string, replyMessage)
      setTicket(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage.data]
        }
      })
      setReplyMessage('')
      fetchTicket()
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!ticket) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen p-6 bg-background'>
        <Card className='w-full max-w-md text-center p-6'>
          <Typography variant='h5' className='mb-4'>
            Ticket introuvable
          </Typography>
          <Typography className='mb-6'>Le token fourni est invalide ou le ticket n'existe pas.</Typography>
          <Link href='/guest/support/track'>
            <Button variant='contained'>Réessayer</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <Logo />
          <Link href='/login'>
            <Button variant='outlined'>Connexion</Button>
          </Link>
        </div>

        <Card sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 4, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant='h5'>
                #{ticket.id} - {ticket.subject}
              </Typography>
              <Chip
                label={ticket.status === 'open' ? 'Ouvert' : ticket.status === 'pending' ? 'En attente' : 'Fermé'}
                color={ticket.status === 'open' ? 'success' : ticket.status === 'pending' ? 'warning' : 'default'}
                size='small'
              />
              <Chip
                label={ticket.priority === 'low' ? 'Basse' : ticket.priority === 'medium' ? 'Moyenne' : 'Haute'}
                color={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'info'}
                size='small'
                variant='outlined'
              />
            </Box>
            <Typography variant='body2' color='text.secondary'>
              Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')} par{' '}
              {ticket.user?.fullName || (ticket as any).guest_name || 'Invité'}
            </Typography>
          </Box>

          {/* Messages Area */}
          <CardContent
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              p: 4,
              backgroundColor: '#f5f5f9'
            }}
          >
            {ticket.messages?.map(msg => {
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    maxWidth: '80%',
                    alignSelf: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {getInitials(msg.user?.fullName || 'U')}
                    </Avatar>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                      {msg.user?.fullName || 'Utilisateur'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(msg.created_at).toLocaleString('fr-FR')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: 'white',
                      boxShadow: 1
                    }}
                  >
                    <Typography variant='body1'>{msg.message}</Typography>
                  </Box>
                </Box>
              )
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Reply Area */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: 'white' }}>
            {ticket.status === 'closed' ? (
              <Typography variant='body2' color='text.secondary' align='center'>
                Ce ticket est fermé. Vous ne pouvez plus répondre.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder='Écrivez votre réponse...'
                  multiline
                  maxRows={4}
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply()
                    }
                  }}
                />
                <Button variant='contained' endIcon={<i className='tabler-send' />} onClick={handleReply}>
                  Envoyer
                </Button>
              </Box>
            )}
          </Box>
        </Card>
      </div>
    </div>
  )
}

export default GuestTicketDetails
