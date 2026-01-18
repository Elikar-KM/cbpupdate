'use client'

// MUI Imports
import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Type Imports
import type { ProfileTeamsType, ProfileCommonType, ProfileTabType } from '@/types/pages/profileTypes'

const renderList = (list: ProfileCommonType[]) => {
  return (
    list.length > 0 &&
    list.map((item, index) => {
      return (
        <div key={index} className='flex items-center gap-2'>
          <i className={item.icon} />
          <div className='flex items-center flex-wrap gap-2'>
            <Typography className='font-medium'>
              {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
            </Typography>
            <Typography> {item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
          </div>
        </div>
      )
    })
  )
}

const renderTeams = (teams: ProfileTeamsType[]) => {
  return (
    teams.length > 0 &&
    teams.map((item, index) => {
      return (
        <div key={index} className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {item.property.charAt(0).toUpperCase() + item.property.slice(1)}
          </Typography>
          <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      )
    })
  )
}

const AboutOverview = ({ data }: { data?: ProfileTabType }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // Generate referral link from user SKU (assuming it's available in data)
  const referralCode = (data as any)?.referralCode || 'LOADING...'
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setSnackbarOpen(true)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                À Propos
              </Typography>
              {data?.about && renderList(data?.about)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Contacts
              </Typography>
              {data?.contacts && renderList(data?.contacts)}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Referral Link Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
              <i className='tabler-share' style={{ marginRight: 8 }} />
              Lien de Parrainage
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Partagez ce lien avec vos amis pour les inviter à rejoindre la plateforme.
            </Typography>
            <TextField
              fullWidth
              value={referralLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={handleCopyLink} edge='end'>
                      <i className='tabler-copy' />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <Button variant='contained' startIcon={<i className='tabler-copy' />} onClick={handleCopyLink} fullWidth>
              Copier le Lien
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Aperçu
              </Typography>
              {data?.overview && renderList(data?.overview)}
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity='success' sx={{ width: '100%' }}>
          Lien copié dans le presse-papiers !
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default AboutOverview
