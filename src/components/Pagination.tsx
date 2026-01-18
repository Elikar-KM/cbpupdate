import React from 'react'

import MuiPagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <MuiPagination count={totalPages} page={page} onChange={handleChange} color='primary' />
    </Box>
  )
}

export default Pagination
