'use client'

import { useEffect, useState, useMemo } from 'react'

import CircularProgress from '@mui/material/CircularProgress'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
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

import { InvestmentService, type Package } from '@/services/investment.service'
import FormModal from '@/components/modals/FormModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Package>()

const PackageClient = () => {
  const [data, setData] = useState<Package[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    amount: '',
    gain_daily: '',
    gain_annual: '',
    week: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await InvestmentService.getPackages()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setSubmitting(true)

      if (!formData.code || !formData.name || !formData.amount) {
        setError('Veuillez remplir tous les champs obligatoires')

        return
      }

      await InvestmentService.createPackage({
        ...formData,
        amount: Number(formData.amount),
        gain_daily: Number(formData.gain_daily),
        gain_annual: Number(formData.gain_annual),
        week: Number(formData.week)
      })

      setFormModalOpen(false)
      setFormData({ code: '', name: '', amount: '', gain_daily: '', gain_annual: '', week: '' })
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<Package, any>[]>(
    () => [
      columnHelper.accessor('code', {
        header: 'Code'
      }),
      columnHelper.accessor('name', {
        header: 'Nom'
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: ({ row }) => `${row.original.amount} $`
      }),
      columnHelper.accessor('gain_daily', {
        header: 'Gain Journalier',
        cell: ({ row }) => `${row.original.gain_daily} $`
      }),
      columnHelper.accessor('gain_annual', {
        header: 'Gain Annuel',
        cell: ({ row }) => `${row.original.gain_annual}%`
      }),
      columnHelper.accessor('week', {
        header: 'Durée (semaines)'
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
    <>
      <Card>
        <CardHeader
          title='Gestion des Packages'
          action={
            <Button
              variant='contained'
              onClick={() => setFormModalOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              Ajouter un Package
            </Button>
          }
        />
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
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-6'>
                    <CircularProgress />
                  </td>
                </tr>
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Aucun package trouvé
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
        title='Ajouter un Package'
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label='Code'
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='Nom'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='Montant'
            type='number'
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='Gain Journalier'
            type='number'
            value={formData.gain_daily}
            onChange={e => setFormData({ ...formData, gain_daily: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='Gain Annuel (%)'
            type='number'
            value={formData.gain_annual}
            onChange={e => setFormData({ ...formData, gain_annual: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='Durée (semaines)'
            type='number'
            value={formData.week}
            onChange={e => setFormData({ ...formData, week: e.target.value })}
            fullWidth
            required
          />
        </Box>
      </FormModal>
    </>
  )
}

export default PackageClient
