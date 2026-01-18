'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import CircularProgress from '@mui/material/CircularProgress'
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

import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import FormModal from '@/components/modals/FormModal'

import { MlmService } from '@/services/mlm.service'
import type { Mlm } from '@/types/mlm'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Mlm>()

const MlmClient = () => {
  // States
  const [data, setData] = useState<Mlm[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form States
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingMlm, setEditingMlm] = useState<Mlm | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sum_parring: '',
    status: 'active'
  })

  // Delete States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMlm, setDeletingMlm] = useState<Mlm | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await MlmService.getAllMlms()
      // @ts-ignore
      setData(response.data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des données MLM:', err)
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingMlm(null)
    setFormData({
      code: '',
      name: '',
      sum_parring: '',
      status: 'active'
    })
    setFormModalOpen(true)
  }

  const handleOpenEdit = (mlm: Mlm) => {
    setEditingMlm(mlm)
    setFormData({
      code: mlm.code,
      name: mlm.name,
      sum_parring: mlm.sum_parring.toString(),
      status: mlm.status
    })
    setFormModalOpen(true)
  }

  const handleOpenDelete = (mlm: Mlm) => {
    setDeletingMlm(mlm)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setSubmitting(true)

      if (!formData.code || !formData.name || !formData.sum_parring) {
        setError('Veuillez remplir tous les champs obligatoires')
        return
      }

      const payload = {
        ...formData,
        sum_parring: Number(formData.sum_parring)
      }

      if (editingMlm) {
        await MlmService.updateMlm(editingMlm.id, payload as any)
      } else {
        await MlmService.createMlm(payload as any)
      }

      setFormModalOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMlm) return

    try {
      setSubmitting(true)
      await MlmService.deleteMlm(deletingMlm.id)
      setDeleteDialogOpen(false)
      setDeletingMlm(null)
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la suppression')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<Mlm, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: '#',
        cell: info => `ML0${info.getValue()}`
      }),
      columnHelper.accessor('code', {
        header: 'Code',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: 'Nom de la matrice',
        cell: info => (
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('sum_parring', {
        header: 'Nombre de Parrainage',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: info => {
          const status = info.getValue()
          const colors: any = {
            active: 'success',
            inactive: 'secondary',
            pending: 'warning'
          }
          const labels: any = {
            active: 'En Activité',
            inactive: 'Inactif',
            pending: 'Non-Spécifié'
          }
          return (
            <Chip label={labels[status] || status} color={colors[status] || 'default'} size='small' variant='tonal' />
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <IconButton size='small' color='primary' onClick={() => handleOpenEdit(row.original)}>
              <i className='tabler-edit' />
            </IconButton>
            <IconButton size='small' color='error' onClick={() => handleOpenDelete(row.original)}>
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
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='Gestion du MLM'
          action={
            <div className='flex items-center gap-2'>
              <CustomTextField
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder='Rechercher...'
                className='w-full sm:w-auto'
              />
              <Button variant='contained' onClick={handleOpenCreate} startIcon={<i className='tabler-plus' />}>
                Ajouter MLM
              </Button>
            </div>
          }
        />

        <div className='overflow-x-auto'>
          {error && (
            <Alert severity='error' sx={{ m: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

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
                          }[header.column.getIsSorted() as string] ?? null}
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
                  <td colSpan={columns.length} className='text-center p-6'>
                    <CircularProgress />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center'>
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
        <TablePaginationComponent table={table} />
      </Card>

      <FormModal
        open={formModalOpen}
        title={editingMlm ? 'Modifier MLM' : 'Ajouter MLM'}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className='flex flex-col gap-4 mt-4'>
          <CustomTextField
            label='Code'
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            fullWidth
            required
          />
          <CustomTextField
            label='Nom'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <CustomTextField
            label='Nombre de Parrainage'
            type='number'
            value={formData.sum_parring}
            onChange={e => setFormData({ ...formData, sum_parring: e.target.value })}
            fullWidth
            required
          />
          <CustomTextField
            select
            label='Statut'
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            fullWidth
          >
            <MenuItem value='active'>Actif</MenuItem>
            <MenuItem value='inactive'>Inactif</MenuItem>
          </CustomTextField>
        </div>
      </FormModal>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce MLM ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary' disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={24} color='inherit' /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MlmClient
