'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { useSession } from 'next-auth/react'
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

import FormModal from '@/components/modals/FormModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'
import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'

interface CoinSaleTransaction {
  id: number
  amount: number
  crypto_type: string
  status: number
  created_at: string
}

const columnHelper = createColumnHelper<CoinSaleTransaction>()

const CoinSaleClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<CoinSaleTransaction[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CoinSaleTransaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    crypto_type: 'BTC'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/coinsale', {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })

      const result = await response.json()

      setData(result.data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      setError(null)

      if (!formData.amount || Number(formData.amount) <= 0) {
        setError('Veuillez entrer un montant valide')

        return
      }

      const response = await fetch('http://localhost:8000/api/coinsale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          crypto_type: formData.crypto_type
        })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Erreur lors de la vente')
      }

      setFormModalOpen(false)
      setFormData({ amount: '', crypto_type: 'BTC' })
      fetchData()
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    }
  }

  const handleConfirm = async () => {
    if (!selectedTransaction) return

    try {
      await fetch(`http://localhost:8000/api/coinsale/${selectedTransaction.id}/confirm`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })
      setConfirmModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedTransaction) return

    try {
      await fetch(`http://localhost:8000/api/coinsale/${selectedTransaction.id}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })
      setRejectModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<CoinSaleTransaction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `#${row.original.id}`
      }),
      columnHelper.accessor('crypto_type', {
        header: 'Crypto'
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 0 ? 'En Attente' : row.original.status === 1 ? 'Confirmé' : 'Rejeté'}
            color={row.original.status === 0 ? 'warning' : row.original.status === 1 ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {isAdmin && row.original.status === 0 && (
              <>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSelectedTransaction(row.original)
                    setConfirmModalOpen(true)
                  }}
                >
                  <i className='tabler-check text-success' />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSelectedTransaction(row.original)
                    setRejectModalOpen(true)
                  }}
                >
                  <i className='tabler-x text-error' />
                </IconButton>
              </>
            )}
          </div>
        )
      })
    ],
    [isAdmin]
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <div className='p-6'>
          <TableHeader
            title='Vente des Cryptos'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher une vente...'
            actions={
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setFormModalOpen(true)}
              >
                Vendre des Cryptos
              </Button>
            }
          />
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
                    Aucune vente trouvée
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
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>

      <FormModal
        open={formModalOpen}
        title='Vendre des Cryptos'
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
            label='Type de Crypto'
            value={formData.crypto_type}
            onChange={e => setFormData({ ...formData, crypto_type: e.target.value })}
            fullWidth
          >
            <MenuItem value='BTC'>Bitcoin (BTC)</MenuItem>
            <MenuItem value='ETH'>Ethereum (ETH)</MenuItem>
            <MenuItem value='USDT'>Tether (USDT)</MenuItem>
          </TextField>

          <TextField
            label='Montant'
            type='number'
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            required
            error={!!error && !formData.amount}
          />
        </Box>
      </FormModal>

      <ConfirmModal
        open={confirmModalOpen}
        title='Confirmer la Vente'
        message={`Voulez-vous vraiment confirmer la vente ?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText='Confirmer'
        cancelText='Annuler'
      />

      <ConfirmModal
        open={rejectModalOpen}
        title='Rejeter la Vente'
        message={`Voulez-vous vraiment rejeter cette vente ?`}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        confirmText='Rejeter'
        cancelText='Annuler'
      />
    </>
  )
}

export default CoinSaleClient
