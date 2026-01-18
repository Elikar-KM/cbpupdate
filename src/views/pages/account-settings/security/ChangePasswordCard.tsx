'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

//Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { UserProfileService } from '@/services/user-profile.service'

const ChangePasswordCard = () => {
  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont requis')

      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')

      return
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')

      return
    }

    setLoading(true)

    try {
      const response = await UserProfileService.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      })

      if (response.code === 200) {
        setSuccess('Mot de passe modifié avec succès')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(response.message || 'Erreur lors de la modification du mot de passe')
      }
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.response?.data?.message || 'Erreur lors de la modification du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setSuccess(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader title='Changer le Mot de Passe' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            {success && (
              <Grid item xs={12}>
                <Alert severity='success' onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              </Grid>
            )}
            {error && (
              <Grid item xs={12}>
                <Alert severity='error' onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Mot de Passe Actuel'
                type={isCurrentPasswordShown ? 'text' : 'password'}
                placeholder='············'
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowCurrentPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isCurrentPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-6' spacing={6}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Nouveau Mot de Passe'
                type={isNewPasswordShown ? 'text' : 'password'}
                placeholder='············'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isNewPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Confirmer le Nouveau Mot de Passe'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                placeholder='············'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6'>Exigences du Mot de Passe :</Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Minimum 8 caractères - plus c&apos;est long, mieux c&apos;est
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Au moins une minuscule et une majuscule
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Au moins un chiffre, symbole ou espace
                </div>
              </div>
            </Grid>
            <Grid item xs={12} className='flex gap-4'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
              <Button variant='tonal' type='button' color='secondary' onClick={handleReset}>
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
