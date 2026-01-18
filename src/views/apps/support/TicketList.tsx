'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
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

import { SupportService } from '@/services/support.service'
import type { Ticket } from '@/types/support'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import CreateTicketDialog from './CreateTicketDialog'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

const columnHelper = createColumnHelper<Ticket>()

const TicketList = () => {
  const [data, setData] = useState<Ticket[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const { lang: locale } = useParams()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await SupportService.getAllTickets()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<Ticket, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: '#',
        cell: info => `#${info.getValue()}`
      }),
      columnHelper.accessor('subject', {
        header: 'Sujet',
        cell: info => (
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('priority', {
        header: 'Priorité',
        cell: info => {
          const priority = info.getValue()

          const colors: any = {
            low: 'success',
            medium: 'warning',
            high: 'error'
          }

          const labels: any = {
            low: 'Basse',
            medium: 'Moyenne',
            high: 'Haute'
          }

          return <Chip label={labels[priority]} color={colors[priority]} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: info => {
          const status = info.getValue()

          const colors: any = {
            open: 'success',
            pending: 'warning',
            closed: 'secondary'
          }

          const labels: any = {
            open: 'Ouvert',
            pending: 'En attente',
            closed: 'Fermé'
          }

          return <Chip label={labels[status]} color={colors[status]} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('created_at', {
        header: 'Date de création',
        cell: ({ row }) => formatDate(row.original.created_at)
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Link href={getLocalizedUrl(`/apps/support/tickets/${row.original.id}`, locale as Locale)} className='flex'>
            <IconButton color='primary'>
              <i className='tabler-eye' />
            </IconButton>
          </Link>
        )
      })
    ],
    [locale]
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
        <Typography variant='h5'>Support Utilisateur</Typography>
        <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setOpenCreate(true)}>
            Nouveau Ticket
          </Button>
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
                  Aucun ticket trouvé
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

      <CreateTicketDialog open={openCreate} onClose={() => setOpenCreate(false)} onSuccess={fetchData} />
    </Card>
  )
}

export default TicketList
