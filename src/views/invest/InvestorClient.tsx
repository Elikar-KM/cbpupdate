'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
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

import TablePagination from '@mui/material/TablePagination'

import { formatDate } from '@/utils/date'

import { InvestmentService, type Investor } from '@/services/investment.service'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Investor>()

const InvestorClient = () => {
  const [data, setData] = useState<Investor[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await InvestmentService.getMyInvestments()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Investor, any>[]>(
    () => [
      columnHelper.accessor('sku_investor', {
        header: 'Référence'
      }),
      columnHelper.accessor('package', {
        header: 'Package'
      }),
      columnHelper.accessor('amount_paid', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount_paid} $`
      }),
      columnHelper.accessor('date_start', {
        header: 'Date Début',
        cell: ({ row }) => formatDate(row.original.date_start)
      }),
      columnHelper.accessor('date_end', {
        header: 'Date Fin',
        cell: ({ row }) => formatDate(row.original.date_end)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 1 ? 'Actif' : 'Inactif'}
            color={row.original.status === 1 ? 'success' : 'default'}
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
    <Card>
      <div className='p-6'>
        <TableHeader
          title='Mes Investissements'
          searchValue={globalFilter ?? ''}
          onSearchChange={setGlobalFilter}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={size => table.setPageSize(size)}
          totalItems={table.getFilteredRowModel().rows.length}
          searchPlaceholder='Rechercher un investissement...'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
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
                  Aucun investissement trouvé
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
  )
}

export default InvestorClient
