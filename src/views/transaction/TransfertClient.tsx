'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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
import { AuthService } from '@/services/auth.service'
import type { Transaction } from '@/types/api'
import FormModal from '@/components/modals/FormModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'

const columnHelper = createColumnHelper<Transaction>()

const TransfertClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<Transaction[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    recipient_sku: ''
  })

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.accessToken) return

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${session.user.accessToken}`
      }

      // Add impersonation header if impersonating
      if (isImpersonating) {
        const impersonatedUser = AuthService.getImpersonatedUser()

        if (impersonatedUser?.sku_user) {
          headers['X-Impersonate-User'] = impersonatedUser.sku_user
        }
      }

      const response = await fetch('http://localhost:8000/api/transfert', {
        headers
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

      if (!formData.recipient_sku) {
        setError('Veuillez entrer le SKU du destinataire')

        return
      }

      const response = await fetch('http://localhost:8000/api/transfert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          recipient_sku: formData.recipient_sku
        })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Erreur lors du transfert')
      }

      setFormModalOpen(false)
      setFormData({ amount: '', recipient_sku: '' })
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.message || 'Une erreur est survenue')
    }
  }

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `#${row.original.id}`
      }),
      ...(isAdmin
        ? [
            columnHelper.accessor('sku_user', {
              header: 'Origine',
              cell: ({ row }) => (
                <div className='flex flex-col'>
                  <span className='font-medium'>{row.original.user?.email || row.original.sku_user}</span>
                  <span className='text-xs text-textSecondary'>{row.original.user?.fullName}</span>
                </div>
              )
            })
          ]
        : []),
      columnHelper.accessor('sku_user_destination', {
        header: 'Destination',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <span className='font-medium'>
              {row.original.destinationUser?.email || row.original.sku_user_destination}
            </span>
            <span className='text-xs text-textSecondary'>{row.original.destinationUser?.fullName}</span>
          </div>
        )
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
            title='Transfert des Fonds'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher un transfert...'
            actions={
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setFormModalOpen(true)}
              >
                Effectuer un Transfert
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
                    Aucun transfert trouvé
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
        title='Effectuer un Transfert'
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
            label='SKU Utilisateur Destinataire'
            value={formData.recipient_sku}
            onChange={e => setFormData({ ...formData, recipient_sku: e.target.value })}
            fullWidth
            required
            placeholder='Ex: USR001'
            error={!!error && !formData.recipient_sku}
          />
        </Box>
      </FormModal>
    </>
  )
}

export default TransfertClient
