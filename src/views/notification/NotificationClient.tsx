'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
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

import { NotificationService, type Notification } from '@/services/notification.service'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'
import { formatDate } from '@/utils/date'

const columnHelper = createColumnHelper<Notification>()

const NotificationClient = () => {
  const [data, setData] = useState<Notification[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await NotificationService.getAll()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Notification, any>[]>(
    () => [
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => <Chip label={row.original.type} size='small' variant='tonal' color='info' />
      }),
      columnHelper.accessor('header', {
        header: 'Titre',
        cell: ({ row }) => row.original.header || row.original.object
      }),
      columnHelper.accessor('content', {
        header: 'Message',
        cell: ({ row }) => (
          <div className='max-w-md truncate' title={row.original.content}>
            {row.original.content}
          </div>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.created_at || row.original.date)
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 1 ? 'Lu' : 'Non Lu'}
            color={row.original.status === 1 ? 'default' : 'primary'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) =>
          row.original.status === 0 ? (
            <Button size='small' variant='outlined' onClick={() => handleMarkAsRead(row.original.id)}>
              Marquer comme lu
            </Button>
          ) : null
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
          title='Mes Messages'
          searchValue={globalFilter ?? ''}
          onSearchChange={setGlobalFilter}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={size => table.setPageSize(size)}
          totalItems={table.getFilteredRowModel().rows.length}
          searchPlaceholder='Rechercher un message...'
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
                  Aucune notification trouvée
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

export default NotificationClient
