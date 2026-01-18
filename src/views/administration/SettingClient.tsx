'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { styled } from '@mui/material/styles'
import { useSession } from 'next-auth/react'

import { CorporationService } from '@/services/corporation.service'
import type { Corporation } from '@/types/corporation'

const SettingClient = () => {
  const { data: session } = useSession()
  const [corporation, setCorporation] = useState<Corporation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loginCoverSrc, setLoginCoverSrc] = useState<string>('/images/pages/auth-v2-mask-light.png')
  const [selectedLoginCover, setSelectedLoginCover] = useState<File | null>(null)
  const [tabValue, setTabValue] = useState(0)

  const [formData, setFormData] = useState({
    corporation_name: '',
    corporation_name_mini: '',
    ceo: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    town: '',
    adresse: '',
    employee_capacity: '',
    send_message_task: '',
    login_title: '',
    login_subtitle: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await CorporationService.getCorporation()

      if (data) {
        setCorporation(data)
        setFormData({
          corporation_name: data.corporation_name || '',
          corporation_name_mini: data.corporation_name_mini || '',
          ceo: data.ceo || '',
          phone: data.phone || '',
          email: data.email || '',
          country: data.country || '',
          state: data.state || '',
          town: data.town || '',
          adresse: data.adresse || '',
          employee_capacity: data.employee_capacity || '',
          send_message_task: data.send_message_task || '',
          login_title: data.login_title || '',
          login_subtitle: data.login_subtitle || ''
        })

        if (data.logo_url) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''

          setImgSrc(data.logo_url.startsWith('http') ? data.logo_url : `${baseUrl}/${data.logo_url}`)
        }

        if (data.login_cover_image) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''

          setLoginCoverSrc(
            data.login_cover_image.startsWith('http') ? data.login_cover_image : `${baseUrl}/${data.login_cover_image}`
          )
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputImageChange = (file: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      setSelectedFile(files[0])
      reader.readAsDataURL(files[0])
      uploadLogo(files[0])
    }
  }

  const uploadLogo = async (file: File) => {
    if (!corporation) return

    const formData = new FormData()

    formData.append('logo', file)
    formData.append('sku_corporation', corporation.sku_corporation)

    try {
      const response = await CorporationService.uploadLogo(formData)

      if (response.code === 200) {
        setSuccess('Logo mis à jour avec succès')
      } else {
        setError(response.message || "Erreur lors de l'upload du logo")
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError("Erreur lors de l'upload du logo")
    }
  }

  const handleResetImage = () => {
    setImgSrc('/images/avatars/1.png')
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)
    setSubmitting(true)

    if (!corporation) {
      setSubmitting(false)

      return
    }

    const submitData = new FormData()

    submitData.append('sku_corporation', corporation.sku_corporation)

    if (selectedLoginCover) {
      submitData.append('login_cover', selectedLoginCover)
    }

    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value)
    })

    try {
      const response = await CorporationService.updateCorporation(submitData)

      if (response.code === 200) {
        setSuccess('Informations mises à jour avec succès')
        fetchData()
      } else {
        setError(response.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
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
    <form onSubmit={handleSubmit}>
      <Grid container spacing={6}>
        {/* Success/Error Alerts */}
        {(success || error) && (
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
        )}

        {/* Main Content with Vertical Tabs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Vertical Tabs */}
                <Tabs
                  orientation='vertical'
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{
                    borderRight: 1,
                    borderColor: 'divider',
                    minWidth: { xs: '100%', md: 200 },
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      minHeight: 48
                    }
                  }}
                >
                  <Tab label='Logo' icon={<i className='tabler-photo' />} iconPosition='start' />
                  <Tab label='Image de Couverture' icon={<i className='tabler-photo-filled' />} iconPosition='start' />
                  <Tab label='Informations Générales' icon={<i className='tabler-building' />} iconPosition='start' />
                  <Tab label='Personnalisation Login' icon={<i className='tabler-palette' />} iconPosition='start' />
                  <Tab label='Configuration Système' icon={<i className='tabler-settings' />} iconPosition='start' />
                </Tabs>

                {/* Tab Panels */}
                <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minHeight: 400 }}>
                  {/* Tab 0: Logo */}
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                        Logo de l'Organisation
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: 'divider',
                            boxShadow: 2,
                            mb: 3
                          }}
                        >
                          <img src={imgSrc} alt='Logo' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button component='label' variant='contained' size='large'>
                          Choisir un Logo
                          <input
                            hidden
                            type='file'
                            onChange={handleInputImageChange}
                            accept='image/png, image/jpeg'
                            id='logo-upload'
                          />
                        </Button>
                        <Button color='error' variant='outlined' onClick={handleResetImage} size='large'>
                          Réinitialiser
                        </Button>
                      </Box>
                      <Typography
                        variant='caption'
                        display='block'
                        sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}
                      >
                        Formats acceptés: JPG, PNG • Taille max: 100kB • Dimensions recommandées: 200x200px
                      </Typography>
                    </Box>
                  )}

                  {/* Tab 1: Image de Couverture */}
                  {tabValue === 1 && (
                    <Box>
                      <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                        Image de Couverture (Page de Connexion)
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 700,
                          height: 400,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid',
                          borderColor: 'divider',
                          boxShadow: 2,
                          mb: 3,
                          mx: 'auto'
                        }}
                      >
                        <img
                          src={loginCoverSrc}
                          alt='Image de Couverture'
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button component='label' variant='contained' size='large'>
                          Choisir une Image
                          <input
                            hidden
                            type='file'
                            onChange={e => {
                              const { files } = e.target

                              if (files && files.length !== 0) {
                                const reader = new FileReader()

                                reader.onload = () => setLoginCoverSrc(reader.result as string)
                                setSelectedLoginCover(files[0])
                                reader.readAsDataURL(files[0])
                              }
                            }}
                            accept='image/png, image/jpeg'
                            id='login-cover-upload'
                          />
                        </Button>
                        <Button
                          color='error'
                          variant='outlined'
                          size='large'
                          onClick={() => {
                            setLoginCoverSrc('/images/pages/auth-v2-mask-light.png')
                            setSelectedLoginCover(null)
                          }}
                        >
                          Réinitialiser
                        </Button>
                      </Box>
                      <Typography
                        variant='caption'
                        display='block'
                        sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}
                      >
                        Formats acceptés: JPG, PNG • Dimensions recommandées: 1920x1080px
                      </Typography>
                    </Box>
                  )}

                  {/* Tab 2: Informations Générales */}
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                        Informations Générales
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Nom de l\u0027Organisation'
                            placeholder='Nom complet de votre organisation'
                            value={formData.corporation_name}
                            onChange={e => setFormData({ ...formData, corporation_name: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Abréviation / Sigle'
                            placeholder='Ex: CBP'
                            value={formData.corporation_name_mini}
                            onChange={e => setFormData({ ...formData, corporation_name_mini: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Directeur / Coordinateur'
                            placeholder='Nom du responsable principal'
                            value={formData.ceo}
                            onChange={e => setFormData({ ...formData, ceo: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Ville (Siège Social)'
                            placeholder='Ex: Goma, Kinshasa'
                            value={formData.town}
                            onChange={e => setFormData({ ...formData, town: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type='email'
                            label='Adresse E-mail'
                            placeholder='contact@example.com'
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Numéro de Téléphone'
                            placeholder='+243 XXX XXX XXX'
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='Adresse Complète'
                            placeholder='Adresse physique du siège social'
                            value={formData.adresse}
                            onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Tab 3: Personnalisation Login */}
                  {tabValue === 3 && (
                    <Box>
                      <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                        Personnalisation de la Page de Connexion
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='Titre de Bienvenue'
                            placeholder='Ex: Bienvenue sur CBP Community'
                            value={formData.login_title}
                            onChange={e => setFormData({ ...formData, login_title: e.target.value })}
                            helperText='Laissez vide pour utiliser le titre par défaut'
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='Message de Bienvenue'
                            placeholder='Ex: Connectez-vous pour accéder à votre espace'
                            value={formData.login_subtitle}
                            onChange={e => setFormData({ ...formData, login_subtitle: e.target.value })}
                            multiline
                            rows={3}
                            helperText='Laissez vide pour utiliser le message par défaut'
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Tab 4: Configuration Système */}
                  {tabValue === 4 && (
                    <Box>
                      <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                        Configuration Système
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label='Temporisation des Alertes'
                            placeholder='60000'
                            value={formData.send_message_task}
                            onChange={e => setFormData({ ...formData, send_message_task: e.target.value })}
                            helperText='Délai en millisecondes (60000ms = 1 minute)'
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type='reset'
                  variant='outlined'
                  color='secondary'
                  onClick={() => fetchData()}
                  disabled={submitting}
                  size='large'
                  sx={{ minWidth: 150 }}
                >
                  Annuler
                </Button>
                <Button variant='contained' type='submit' disabled={submitting} size='large' sx={{ minWidth: 150 }}>
                  {submitting ? (
                    <>
                      <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les Modifications'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </form>
  )
}

export default SettingClient
