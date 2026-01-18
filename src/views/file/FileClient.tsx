'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
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

import { FileService, type FileItem } from '@/services/file.service'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<FileItem>()

const FileClient = () => {
  const [data, setData] = useState<FileItem[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await FileService.getAll()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDownload = async (id: number) => {
    try {
      await FileService.download(id)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<FileItem, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nom'
      }),
      columnHelper.accessor('type', {
        header: 'Type'
      }),
      columnHelper.accessor('size', {
        header: 'Taille',
        cell: ({ row }) => `${(row.original.size / 1024).toFixed(2)} KB`
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='contained'
            startIcon={<i className='tabler-download' />}
            onClick={() => handleDownload(row.original.id)}
          >
            Télécharger
          </Button>
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
      <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
        <Typography variant='h5'>Nos Fichiers</Typography>
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
                  Aucun fichier trouvé
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

export default FileClient
