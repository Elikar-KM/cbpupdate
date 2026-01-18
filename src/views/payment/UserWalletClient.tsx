'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
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

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'

import { formatDate } from '@/utils/date'

import { WalletService } from '@/services/wallet.service'
import type { Wallet } from '@/types/api'
import CustomTextField from '@core/components/mui/TextField'
import FormModal from '@/components/modals/FormModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Wallet>()

const UserWalletClient = () => {
  const [data, setData] = useState<Wallet[]>([])
  const [walletTypes, setWalletTypes] = useState<{ type: string; name: string }[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: '',
    name: ''
  })

  useEffect(() => {
    fetchData()
    fetchWalletTypes()
  }, [])

  const fetchData = async () => {
    try {
      const result = await WalletService.getAllWallets()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchWalletTypes = async () => {
    const types = await WalletService.getWalletTypes()

    setWalletTypes(types)
  }

  const handleSubmit = async () => {
    try {
      setError(null)

      if (!formData.type || !formData.name) {
        setError('Veuillez remplir tous les champs')

        return
      }

      await WalletService.createWallet(formData)
      setFormModalOpen(false)
      setFormData({ type: '', name: '' })
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Une erreur est survenue')
    }
  }

  const columns = useMemo<ColumnDef<Wallet, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `WAL${row.original.id.toString().padStart(5, '0')}`
      }),
      columnHelper.accessor('type', {
        header: 'Type'
      }),
      columnHelper.accessor('name', {
        header: 'Nom/Adresse'
      }),
      columnHelper.accessor('created_at', {
        header: 'Date de Création',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 1 ? 'Actif' : 'Inactif'}
            color={row.original.status === 1 ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data,
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

  return (
    <>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <Typography variant='h5'>Mes Portefeuilles</Typography>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Typography>Afficher</Typography>
              <CustomTextField
                select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className='max-sm:is-full sm:is-[70px]'
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='25'>25</MenuItem>
                <MenuItem value='50'>50</MenuItem>
              </CustomTextField>
            </div>
            <CustomTextField
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder='Rechercher...'
              className='max-sm:is-full'
            />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setFormModalOpen(true)}
              className='max-sm:is-full'
            >
              Nouveau Portefeuille
            </Button>
          </div>
        </div>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Aucun portefeuille trouvé
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
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

      <FormModal
        open={formModalOpen}
        title='Nouveau Portefeuille'
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            select
            label='Type'
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            fullWidth
            required
          >
            {walletTypes.map(type => (
              <MenuItem key={type.type} value={type.type}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label='Nom/Adresse du Portefeuille'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            placeholder='Ex: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
          />
        </Box>
      </FormModal>
    </>
  )
}

export default UserWalletClient
