'use client'

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'

import { Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

interface TableHeaderProps {
  title: string
  searchValue: string
  onSearchChange: (value: string) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalItems: number
  pageSizeOptions?: number[]
  actions?: ReactNode
  searchPlaceholder?: string
}

const TableHeader = ({
  title,
  searchValue,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  actions,
  searchPlaceholder = 'Rechercher...'
}: TableHeaderProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Box sx={{ mb: 3 }}>
      {/* Single Row Layout */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Left: Title */}
        <Typography variant='h5' component='h2' sx={{ minWidth: 'fit-content' }}>
          {title}
        </Typography>

        {/* Right: Search, Page Size, Total, and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Search Field */}
          {mounted && (
            <CustomTextField
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              size='small'
              sx={{ minWidth: 200, width: 250 }}
            />
          )}

          {/* Page Size Selector */}
          <FormControl size='small' sx={{ minWidth: 100 }}>
            <InputLabel id='page-size-label'>Afficher</InputLabel>
            <Select
              labelId='page-size-label'
              value={pageSize || 10}
              label='Afficher'
              onChange={e => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Total Count */}
          <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
            Total: <strong>{totalItems}</strong>
          </Typography>

          {/* Actions */}
          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </Box>
      </Box>
    </Box>
  )
}

export default TableHeader
