'use client'

import React, { useState } from 'react'

import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'

interface WithdrawFormProps {
  onSubmit: (data: { amount: number; wallet_id: string }) => void
  maxAmount: number
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ onSubmit, maxAmount }) => {
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')

  const handleSubmit = () => {
    onSubmit({ amount: parseFloat(amount), wallet_id: walletId })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <TextField
        label='Montant à retirer'
        type='number'
        value={amount}
        onChange={e => setAmount(e.target.value)}
        fullWidth
        required
        InputProps={{
          endAdornment: <InputAdornment position='end'>$</InputAdornment>
        }}
        helperText={`Disponible: ${maxAmount.toFixed(2)} $`}
      />

      <TextField
        label='ID du Wallet de destination'
        value={walletId}
        onChange={e => setWalletId(e.target.value)}
        fullWidth
        required
        helperText="Entrez l'ID du wallet vers lequel vous souhaitez retirer"
      />
    </Box>
  )
}

export default WithdrawForm
