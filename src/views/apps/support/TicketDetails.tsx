'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

import { formatDate, formatDateTime } from '@/utils/date'

import { SupportService } from '@/services/support.service'
import type { Ticket } from '@/types/support'
import { getInitials } from '@/utils/getInitials'

const TicketDetails = () => {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const fetchTicket = useCallback(async () => {
    try {
      const result = await SupportService.getTicket(Number(id))

      setTicket(result)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchTicket()
    }
  }, [id, fetchTicket])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !ticket) return

    try {
      const newMessage = await SupportService.replyToTicket(ticket.id, replyMessage)

      setTicket(prev => {
        if (!prev) return null

        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage.data] // API returns wrapped data
        }
      })
      setReplyMessage('')
      fetchTicket() // Refresh to get full data structure if needed
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return

    try {
      await SupportService.updateTicketStatus(ticket.id, newStatus)
      fetchTicket()
    } catch (error) {
      console.error('Error updating status:', error)
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
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant='h5'>Ticket introuvable</Typography>
        <Button variant='contained' onClick={() => router.back()} sx={{ mt: 2 }}>
          Retour
        </Button>
      </Box>
    )
  }

  return (
    <Card sx={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 4,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
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
            Créé le {formatDate(ticket.created_at)} par {ticket.user?.fullName || 'Utilisateur'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {ticket.status !== 'closed' ? (
            <Button variant='outlined' color='error' onClick={() => handleStatusChange('closed')}>
              Fermer le ticket
            </Button>
          ) : (
            <Button variant='outlined' color='success' onClick={() => handleStatusChange('open')}>
              Rouvrir le ticket
            </Button>
          )}
        </Box>
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
                alignSelf: 'flex-start' // Default to left
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
                  {formatDateTime(msg.created_at)}
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
  )
}

export default TicketDetails
