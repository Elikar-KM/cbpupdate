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

import { TransactionService } from '@/services/transaction.service'
import { WalletService } from '@/services/wallet.service'
import type { Transaction } from '@/types/api'
import FormModal from '@/components/modals/FormModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'
import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'

const columnHelper = createColumnHelper<Transaction>()

const CashClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<Transaction[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [wallets, setWallets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    wallet_id: ''
  })

  useEffect(() => {
    fetchData()
    fetchWallets()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cash', {
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

  const fetchWallets = async () => {
    const walletList = await WalletService.getAllWallets()

    setWallets(walletList)
  }

  const handleSubmit = async () => {
    try {
      setError(null)

      if (!formData.amount || Number(formData.amount) <= 0) {
        setError('Veuillez entrer un montant valide')

        return
      }

      if (!formData.wallet_id) {
        setError('Veuillez sélectionner un wallet')

        return
      }

      await TransactionService.createTransaction({
        amount: Number(formData.amount),
        wallet_id: formData.wallet_id
      })
      setFormModalOpen(false)
      setFormData({ amount: '', wallet_id: '' })
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || error.message || 'Une erreur est survenue')
    }
  }

  const handleConfirm = async () => {
    if (!selectedTransaction) return

    try {
      await fetch(`http://localhost:8000/api/cash/${selectedTransaction.id}/confirm`, {
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
      await fetch(`http://localhost:8000/api/cash/${selectedTransaction.id}/reject`, {
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

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `#${row.original.id}`
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
        <div className='p-6'>
          <TableHeader
            title='Retrait des Fonds'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher un retrait...'
            actions={
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setFormModalOpen(true)}
              >
                Demander un Retrait
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
                    Aucun retrait trouvé
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
        title='Demander un Retrait'
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
            label='Montant'
            type='number'
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            required
            error={!!error && !formData.amount}
          />

          <TextField
            select
            label='Wallet de Destination'
            value={formData.wallet_id}
            onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
            fullWidth
            required
            error={!!error && !formData.wallet_id}
          >
            {wallets.map(wallet => (
              <MenuItem key={wallet.id} value={wallet.id}>
                {wallet.type} - {wallet.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </FormModal>

      <ConfirmModal
        open={confirmModalOpen}
        title='Confirmer le Retrait'
        message={`Voulez-vous vraiment confirmer le retrait de ${selectedTransaction?.amount} $ ?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText='Confirmer'
        cancelText='Annuler'
      />

      <ConfirmModal
        open={rejectModalOpen}
        title='Rejeter le Retrait'
        message={`Voulez-vous vraiment rejeter le retrait de ${selectedTransaction?.amount} $ ?`}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        confirmText='Rejeter'
        cancelText='Annuler'
      />
    </>
  )
}

export default CashClient
