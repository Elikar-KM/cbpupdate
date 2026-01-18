'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
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

import TablePagination from '@mui/material/TablePagination'

import { formatDate } from '@/utils/date'

import { SubscriptionService, type Subscription } from '@/services/subscription.service'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'
import NewSubscriptionModal from './NewSubscriptionModal'
import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'

const columnHelper = createColumnHelper<Subscription>()

const SubscriptionClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<Subscription[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [newSubscriptionModalOpen, setNewSubscriptionModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await SubscriptionService.getAll()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleConfirm = async () => {
    if (!selectedSubscription) return

    try {
      await SubscriptionService.confirm(selectedSubscription.id)
      setConfirmModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedSubscription) return

    try {
      await SubscriptionService.reject(selectedSubscription.id)
      setRejectModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Subscription, any>[]>(
    () => [
      columnHelper.accessor('package_name', {
        header: 'Package'
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.accessor('paid_at', {
        header: 'Date Payé',
        cell: ({ row }) => formatDate(row.original.paid_at)
      }),
      columnHelper.accessor('end_at', {
        header: 'Date Expiration',
        cell: ({ row }) => formatDate(row.original.end_at)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => {
          const status = Number(row.original.status)

          return (
            <Chip
              label={status === 0 ? 'En Attente' : status === 1 ? 'Confirmé' : 'Rejeté'}
              color={status === 0 ? 'warning' : status === 1 ? 'success' : 'error'}
              size='small'
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {isAdmin && Number(row.original.status) === 0 && (
              <>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSelectedSubscription(row.original)
                    setConfirmModalOpen(true)
                  }}
                >
                  <i className='tabler-check text-success' />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSelectedSubscription(row.original)
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
            title='Mes Souscriptions'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize || 10}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher une souscription...'
            actions={
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setNewSubscriptionModalOpen(true)}
              >
                Nouvelle Souscription
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
                    Aucune souscription trouvée
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

      <ConfirmModal
        open={confirmModalOpen}
        title='Confirmer la Souscription'
        message={`Voulez-vous vraiment confirmer cette souscription de ${selectedSubscription?.amount} $ ?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText='Confirmer'
        cancelText='Annuler'
      />

      <ConfirmModal
        open={rejectModalOpen}
        title='Rejeter la Souscription'
        message={`Voulez-vous vraiment rejeter cette souscription ?`}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        confirmText='Rejeter'
        cancelText='Annuler'
      />

      <NewSubscriptionModal
        open={newSubscriptionModalOpen}
        onClose={() => setNewSubscriptionModalOpen(false)}
        onSuccess={fetchData}
      />
    </>
  )
}

export default SubscriptionClient
