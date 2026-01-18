import React from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface Column {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string | React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Aucune donnée disponible'
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          {emptyMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell key={column.id} align={column.align || 'left'}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} hover>
              {columns.map(column => {
                const value = row[column.id]
                return (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DataTable
