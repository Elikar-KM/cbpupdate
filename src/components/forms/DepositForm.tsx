'use client'

import React, { useState } from 'react'

import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'

interface DepositFormProps {
  onSubmit: (data: { amount: number; proof: File | null }) => void
}

const DepositForm: React.FC<DepositFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState('')
  const [proof, setProof] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProof(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    onSubmit({ amount: parseFloat(amount), proof })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <TextField
        label='Montant à déposer'
        type='number'
        value={amount}
        onChange={e => setAmount(e.target.value)}
        fullWidth
        required
        InputProps={{
          endAdornment: <InputAdornment position='end'>$</InputAdornment>
        }}
      />

      <TextField
        type='file'
        label='Preuve de paiement'
        onChange={handleFileChange}
        fullWidth
        InputLabelProps={{ shrink: true }}
        helperText="Téléchargez une capture d'écran ou un reçu de votre paiement"
      />
    </Box>
  )
}

export default DepositForm
