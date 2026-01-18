'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
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

import { DepartmentService } from '@/services/department.service'
import type { Department } from '@/types/department'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Department>()

const DepartmentClient = () => {
  const [data, setData] = useState<Department[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku_department: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await DepartmentService.getAll()
      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleOpen = (department?: Department) => {
    if (department) {
      setEditingDepartment(department)
      setFormData({
        name: department.name,
        description: department.description || '',
        sku_department: department.sku_department || ''
      })
    } else {
      setEditingDepartment(null)
      setFormData({
        name: '',
        description: '',
        sku_department: ''
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingDepartment(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingDepartment) {
        await DepartmentService.update(editingDepartment.id, formData)
      } else {
        await DepartmentService.create(formData)
      }
      fetchData()
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      try {
        await DepartmentService.delete(id)
        fetchData()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const columns = useMemo<ColumnDef<Department, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nom',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('sku_department', {
        header: 'Code SKU',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: info => info.getValue()
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <IconButton onClick={() => handleOpen(row.original)} color='primary'>
              <i className='tabler-edit' />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original.id)} color='error'>
              <i className='tabler-trash' />
            </IconButton>
          </div>
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
        <Typography variant='h5'>Gestion des Départements</Typography>
        <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => handleOpen()}>
            Ajouter Département
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
                  Aucun département trouvé
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editingDepartment ? 'Modifier Département' : 'Ajouter Département'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mt-2'>
            <TextField
              label='Nom du Département'
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label='Code SKU'
              fullWidth
              value={formData.sku_department}
              onChange={e => setFormData({ ...formData, sku_department: e.target.value })}
            />
            <TextField
              label='Description'
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant='contained'>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default DepartmentClient
