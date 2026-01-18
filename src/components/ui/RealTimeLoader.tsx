'use client'

import { useEffect, useState } from 'react'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { echo } from '@/lib/echo'

type Props = {
  jobId: string
  onComplete?: () => void
}

const RealTimeLoader = ({ jobId, onComplete }: Props) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!echo || !jobId) return

    const channel = echo.channel(`job-progress.${jobId}`)

    channel.listen('.progress.updated', (e: any) => {
      setProgress(e.progress)
      setStatus(e.status)
      if (e.message) setMessage(e.message)

      if (e.status === 'completed' || e.progress >= 100) {
        if (onComplete) onComplete()
      }
    })

    return () => {
      channel.stopListening('.progress.updated')
    }
  }, [jobId, onComplete])

  if (status === 'completed') return null

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant='body2' color='text.secondary'>{`${Math.round(progress)}%`}</Typography>
        </Box>
      </Box>
      {message && (
        <Typography variant='caption' color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  )
}

export default RealTimeLoader
