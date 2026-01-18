'use client'

import { useEffect, useState, useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import classnames from 'classnames'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { formatDate } from '@/utils/date'

import { TransactionService } from '@/services/transaction.service'
import type { Transaction } from '@/types/api'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Transaction>()

const TransactionClient = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await TransactionService.getAllTransactions()

      setTransactions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter
      const matchesStatus = statusFilter === 'all' || String(transaction.status) === statusFilter

      return matchesType && matchesStatus
    })
  }, [transactions, typeFilter, statusFilter])

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: info => formatDate(info.getValue())
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: info => {
          const type = info.getValue()

          const colors: any = {
            deposit: 'success',
            withdrawal: 'error',
            transfer: 'info',
            bonus: 'warning'
          }

          return <Chip label={type} color={colors[type] || 'default'} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: info => `${Number(info.getValue()).toFixed(2)} $`,
        meta: {
          align: 'right'
        }
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: info => {
          const status = Number(info.getValue())

          const labels: any = {
            0: 'En attente',
            1: 'Validé',
            2: 'Rejeté'
          }

          const colors: any = {
            0: 'warning',
            1: 'success',
            2: 'error'
          }

          return (
            <Chip label={labels[status] || status} color={colors[status] || 'default'} size='small' variant='tonal' />
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Filtres */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <CustomTextField
                select
                label='Type'
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value='all'>Tous</MenuItem>
                <MenuItem value='deposit'>Dépôt</MenuItem>
                <MenuItem value='withdrawal'>Retrait</MenuItem>
                <MenuItem value='transfer'>Transfert</MenuItem>
                <MenuItem value='bonus'>Bonus</MenuItem>
              </CustomTextField>

              <CustomTextField
                select
                label='Statut'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value='all'>Tous</MenuItem>
                <MenuItem value='0'>En attente</MenuItem>
                <MenuItem value='1'>Validé</MenuItem>
                <MenuItem value='2'>Rejeté</MenuItem>
              </CustomTextField>

              <Button
                variant='outlined'
                onClick={() => {
                  setTypeFilter('all')
                  setStatusFilter('all')
                }}
              >
                Réinitialiser
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tableau des Transactions */}
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
            <div className='flex items-center justify-between w-full'>
              <Typography variant='h5'>Historique des Transactions</Typography>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Typography>Afficher</Typography>
                  <CustomTextField
                    select
                    value={table.getState().pagination.pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className='is-[70px]'
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </CustomTextField>
                </div>
                <CustomTextField
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  placeholder='Rechercher...'
                  className='is-full sm:is-auto'
                />
              </div>
            </div>
          </CardContent>
          <div className='overflow-x-auto'>
            <table className={classnames(tableStyles.table, 'w-full')}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      Aucune transaction trouvée
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            component={() => <TablePaginationComponent table={table} />}
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => {
              table.setPageIndex(page)
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default TransactionClient
