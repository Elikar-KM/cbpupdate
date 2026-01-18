'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
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

import { GainService, type Gain } from '@/services/bonus.service'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Gain>()

const GainClient = () => {
  const [data, setData] = useState<Gain[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await GainService.getAll()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Gain, any>[]>(
    () => [
      columnHelper.accessor('sku_investor', {
        header: 'Investissement'
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date)
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
          title='Gérer les Gains'
          searchValue={globalFilter ?? ''}
          onSearchChange={setGlobalFilter}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={size => table.setPageSize(size)}
          totalItems={table.getFilteredRowModel().rows.length}
          searchPlaceholder='Rechercher un gain...'
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
                  Aucun gain trouvé
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

export default GainClient
