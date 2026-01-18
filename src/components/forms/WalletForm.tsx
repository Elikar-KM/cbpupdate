'use client'

import React, { useState } from 'react'

import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

interface WalletFormProps {
  onSubmit: (data: { type: string; name: string; address: string }) => void
}

const WalletForm: React.FC<WalletFormProps> = ({ onSubmit }) => {
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const walletTypes = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'BANK', label: 'Compte Bancaire' }
  ]

  const handleSubmit = () => {
    onSubmit({ type, name, address })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <TextField select label='Type de Wallet' value={type} onChange={e => setType(e.target.value)} fullWidth required>
        {walletTypes.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField label='Nom du Wallet' value={name} onChange={e => setName(e.target.value)} fullWidth required />

      <TextField
        label='Adresse / Numéro de Compte'
        value={address}
        onChange={e => setAddress(e.target.value)}
        fullWidth
        required
        multiline
        rows={2}
      />
    </Box>
  )
}

export default WalletForm
