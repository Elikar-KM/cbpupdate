'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

const ProfileClient = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+237 600 000 000'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [successMessage, setSuccessMessage] = useState('')

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSavePersonalInfo = () => {
    // Appel API pour mettre à jour les infos personnelles
    console.log('Mise à jour des infos:', personalInfo)
    setSuccessMessage('Informations mises à jour avec succès')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    // Appel API pour changer le mot de passe
    console.log('Changement de mot de passe')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setSuccessMessage('Mot de passe modifié avec succès')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4'>Mon Profil</Typography>
      </Grid>

      {successMessage && (
        <Grid item xs={12}>
          <Alert severity='success'>{successMessage}</Alert>
        </Grid>
      )}

      {/* Informations Personnelles */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Informations Personnelles
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label='Nom Complet'
                value={personalInfo.name}
                onChange={e => handlePersonalInfoChange('name', e.target.value)}
                fullWidth
              />

              <TextField
                label='Email'
                type='email'
                value={personalInfo.email}
                onChange={e => handlePersonalInfoChange('email', e.target.value)}
                fullWidth
                disabled
                helperText="L'email ne peut pas être modifié"
              />

              <TextField
                label='Téléphone'
                value={personalInfo.phone}
                onChange={e => handlePersonalInfoChange('phone', e.target.value)}
                fullWidth
              />

              <Button variant='contained' color='primary' onClick={handleSavePersonalInfo}>
                Enregistrer les Modifications
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Sécurité - Changer Mot de Passe */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Sécurité
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label='Mot de passe actuel'
                type='password'
                value={passwordData.currentPassword}
                onChange={e => handlePasswordChange('currentPassword', e.target.value)}
                fullWidth
              />

              <TextField
                label='Nouveau mot de passe'
                type='password'
                value={passwordData.newPassword}
                onChange={e => handlePasswordChange('newPassword', e.target.value)}
                fullWidth
              />

              <TextField
                label='Confirmer le nouveau mot de passe'
                type='password'
                value={passwordData.confirmPassword}
                onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                fullWidth
              />

              <Button variant='contained' color='secondary' onClick={handleChangePassword}>
                Changer le Mot de Passe
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* KYC - Vérification d'Identité */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Vérification d'Identité (KYC)
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Alert severity='info' sx={{ mb: 3 }}>
              Pour retirer vos fonds, vous devez vérifier votre identité en téléchargeant une pièce d'identité valide.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                type='file'
                label="Pièce d'identité (Recto)"
                InputLabelProps={{ shrink: true }}
                fullWidth
                helperText='Formats acceptés: JPG, PNG, PDF (Max 5MB)'
              />

              <TextField
                type='file'
                label="Pièce d'identité (Verso)"
                InputLabelProps={{ shrink: true }}
                fullWidth
                helperText='Formats acceptés: JPG, PNG, PDF (Max 5MB)'
              />

              <Button variant='contained' color='primary'>
                Soumettre pour Vérification
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileClient
