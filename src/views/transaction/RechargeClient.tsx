'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
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

import { RechargeService, type Recharge } from '@/services/recharge.service'
import { WalletService } from '@/services/wallet.service'
import { DashboardService } from '@/services/dashboard.service'
import FormModal from '@/components/modals/FormModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'
import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'

const columnHelper = createColumnHelper<Recharge>()

const RechargeClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<Recharge[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null)
  const [walletTypes, setWalletTypes] = useState<{ type: string; name: string }[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)

  const [formData, setFormData] = useState({
    amount: '',
    payment_method: '',
    payment_code: '',
    paywithmybalance: false
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    fetchWalletTypes()
    fetchDashboardData()
  }, [])

  const fetchData = async () => {
    const recharges = await RechargeService.getAll()

    setData(recharges)
  }

  const fetchWalletTypes = async () => {
    const types = await WalletService.getWalletTypes()

    setWalletTypes(types)
  }

  const fetchDashboardData = async () => {
    try {
      const data = await DashboardService.getClientDashboard()

      setDashboardData(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      setError(null)

      // Validation
      if (!formData.amount || Number(formData.amount) <= 0) {
        setError('Veuillez entrer un montant valide')

        return
      }

      if (!formData.payment_method) {
        setError('Veuillez sélectionner un mode de paiement')

        return
      }

      await RechargeService.create({
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        payment_code: formData.payment_code || undefined,
        paywithmybalance: formData.paywithmybalance
      })
      setFormModalOpen(false)
      setFormData({ amount: '', payment_method: '', payment_code: '', paywithmybalance: false })
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.message || 'Une erreur est survenue lors de la création de la recharge')
    }
  }

  const handleConfirm = async () => {
    if (!selectedRecharge) return

    try {
      await RechargeService.confirm(selectedRecharge.id)
      setConfirmModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedRecharge) return

    try {
      await RechargeService.reject(selectedRecharge.id)
      setRejectModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Recharge, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `CC0${row.original.id}`
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('payment_method', {
        header: 'Mode de Paiement'
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 0 ? 'En Attente' : row.original.status === 1 ? 'Confirmé' : 'Annulé'}
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
                    setSelectedRecharge(row.original)
                    setConfirmModalOpen(true)
                  }}
                >
                  <i className='tabler-check text-success' />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSelectedRecharge(row.original)
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
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const value = row.getValue(columnId)

      return String(value).toLowerCase().includes(search)
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
            title='Recharger Mon Compte'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher une recharge...'
            actions={
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setFormModalOpen(true)}
              >
                Créditer Mon Compte
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
                    Aucune recharge trouvée
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

      {/* Modal Formulaire */}
      <FormModal
        open={formModalOpen}
        title='Créditer Mon Compte'
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {dashboardData && (
            <Typography variant='body2' color='text.secondary'>
              Solde actuel : <strong>{dashboardData.wallet_balance} $</strong>
            </Typography>
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
            label='Mode de Paiement'
            value={formData.payment_method}
            onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
            fullWidth
            required
            error={!!error && !formData.payment_method}
          >
            {walletTypes.map(type => (
              <MenuItem key={type.type} value={type.type}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label='Code Transaction / Référence'
            value={formData.payment_code}
            onChange={e => setFormData({ ...formData, payment_code: e.target.value })}
            fullWidth
            placeholder='Ex: RF00222...'
          />
        </Box>
      </FormModal>

      {/* Modal Confirmation */}
      <ConfirmModal
        open={confirmModalOpen}
        title='Confirmer la Recharge'
        message={`Voulez-vous vraiment confirmer la recharge de ${selectedRecharge?.amount} $ ?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText='Confirmer'
        cancelText='Annuler'
      />

      {/* Modal Rejet */}
      <ConfirmModal
        open={rejectModalOpen}
        title='Rejeter la Recharge'
        message={`Voulez-vous vraiment rejeter la recharge de ${selectedRecharge?.amount} $ ?`}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        confirmText='Rejeter'
        cancelText='Annuler'
      />
    </>
  )
}

export default RechargeClient
