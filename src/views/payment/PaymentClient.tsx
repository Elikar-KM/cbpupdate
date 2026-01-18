'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
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

import Button from '@mui/material/Button'

import { formatDateTime } from '@/utils/date'

import { RechargeService, type Recharge } from '@/services/recharge.service'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

import { useEffectiveUserRole } from '@/hooks/useEffectiveUserRole'
import NewRechargeModal from './NewRechargeModal'

const columnHelper = createColumnHelper<Recharge>()

const PaymentClient = () => {
  const { data: session } = useSession()
  const { effectiveRole, isImpersonating } = useEffectiveUserRole()

  const currentRole = isImpersonating ? effectiveRole : session?.user?.role
  const isAdmin = currentRole === 'super-admin' || currentRole === 'system-admin'

  const [data, setData] = useState<Recharge[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [newRechargeOpen, setNewRechargeOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await RechargeService.getAll()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Recharge, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => `RCH${row.original.id.toString().padStart(5, '0')}`
      }),
      ...(isAdmin
        ? [
            columnHelper.accessor('sku_user', {
              header: 'Utilisateur'
            })
          ]
        : []),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('payment_method', {
        header: 'Méthode'
      }),
      columnHelper.accessor('payment_code', {
        header: 'Code/Référence',
        cell: ({ row }) => row.original.payment_code || '-'
      }),
      columnHelper.accessor('created_at', {
        header: 'Date et Heure',
        cell: ({ row }) => formatDateTime(row.original.created_at)
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
    <Card>
      <div className='flex flex-wrap gap-4 justify-between items-center p-6'>
        <TableHeader
          title='Mes Recharges'
          searchValue={globalFilter ?? ''}
          onSearchChange={setGlobalFilter}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={size => table.setPageSize(size)}
          totalItems={table.getFilteredRowModel().rows.length}
          searchPlaceholder='Rechercher un paiement...'
        />
        <Button variant='contained' onClick={() => setNewRechargeOpen(true)}>
          <i className='tabler-wallet mr-2' />
          Recharger Wallet
        </Button>
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
                  Aucun paiement trouvé
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
        component={() => <TablePaginationComponent table={table as any} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />

      <NewRechargeModal
        open={newRechargeOpen}
        onClose={() => setNewRechargeOpen(false)}
        onSuccess={() => {
          fetchData()
        }}
      />
    </Card>
  )
}

export default PaymentClient
