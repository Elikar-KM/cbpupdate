'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import type { SelectChangeEvent } from '@mui/material/Select'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { UserProfileService } from '@/services/user-profile.service'

type Data = {
  firstName: string
  lastName: string
  email: string
  organization: string
  phoneNumber: string
  address: string
  state: string
  zipCode: string
  country: string
  language: string
  timezone: string
  currency: string
}

const initialData: Data = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  phoneNumber: '',
  address: '',
  state: '',
  zipCode: '',
  country: '',
  language: '',
  timezone: '',
  currency: ''
}

const AccountDetails = () => {
  // States
  const [formData, setFormData] = useState<Data>(initialData)
  const [fileInput, setFileInput] = useState<string>('')
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [language, setLanguage] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [corporationSku, setCorporationSku] = useState<string>('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await UserProfileService.getProfile()
      if (response && response.data) {
        const user = response.data
        setUserId(user.id)
        setCorporationSku(user.sku_corporation)

        // Split fullName if firstName/lastName are not available or empty
        // The API returns 'fullName' in user object, but UserProfile might have firstname/lastname
        // But getProfile returns user object.
        // Let's try to split fullName if needed.
        let fName = ''
        let lName = ''
        if (user.fullName) {
          const parts = user.fullName.split(' ')
          fName = parts[0]
          lName = parts.slice(1).join(' ')
        }

        setFormData({
          firstName: fName,
          lastName: lName,
          email: user.email || '',
          organization: user.sku_corporation || '',
          phoneNumber: user.phone || '',
          address: '', // Not in User model
          state: '', // Not in User model
          zipCode: '', // Not in User model
          country: '', // Not in User model
          language: '', // Not in User model
          timezone: '', // Not in User model
          currency: '' // Not in User model
        })

        if (response.userAvatar) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''
          setImgSrc(response.userAvatar.startsWith('http') ? response.userAvatar : `${baseUrl}/${response.userAvatar}`)
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (value: string) => {
    setLanguage(current => current.filter(item => item !== value))
  }

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    setLanguage(event.target.value as string[])
  }

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setFileInput(reader.result as string)
      }

      // Upload immediately
      uploadAvatar(files[0])
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!corporationSku) return // Need sku_corporation for filename as per controller

    const data = new FormData()
    data.append('avatar', file)
    data.append('sku_corporation', corporationSku) // Controller uses this for filename prefix

    try {
      const response = await UserProfileService.uploadAvatar(data)
      if (response.code === 200) {
        setSuccess('Avatar updated successfully')
      } else {
        setError(response.message || 'Failed to upload avatar')
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Failed to upload avatar')
    }
  }

  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
  }

  const handleSubmit = async () => {
    if (!userId) return
    setSuccess(null)
    setError(null)

    try {
      // Prepare data for update
      // We update User model fields: fullName, email, phone
      // And maybe UserProfile fields: firstname, lastname via /me/profile if we want to be precise
      // But let's stick to updating User model via /user/{id} as it seems more general

      const updateData = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phoneNumber
        // Other fields are not in User model, so we ignore them for now or store in a json field if available
      }

      const response = await UserProfileService.updateUser(userId, updateData)
      if (response.code === 200) {
        setSuccess('Profile updated successfully')
      } else {
        setError(response.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Update error:', err)
      setError('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardContent className='mbe-4'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Télécharger une nouvelle photo
                <input
                  hidden
                  type='file'
                  value={fileInput}
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
                Réinitialiser
              </Button>
            </div>
            <Typography>JPG, GIF ou PNG autorisés. Taille max 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              {success && (
                <Alert severity='success' onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Prénom'
                value={formData.firstName}
                placeholder='Jean'
                onChange={e => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Nom'
                value={formData.lastName}
                placeholder='Dupont'
                onChange={e => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='jean.dupont@example.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Organisation'
                value={formData.organization}
                placeholder='CBP'
                onChange={e => handleFormChange('organization', e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Numéro de téléphone'
                value={formData.phoneNumber}
                placeholder='+243 999 999 999'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Enregistrer les modifications
              </Button>
              <Button variant='tonal' type='reset' color='secondary' onClick={() => fetchProfile()}>
                Annuler
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
