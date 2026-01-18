'use client'

import { useEffect, useState, useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
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

import { formatDate } from '@/utils/date'

import { InvestmentService } from '@/services/investment.service'
import type { Package, Investor } from '@/types/api'
import ConfirmModal from '@/components/modals/ConfirmModal'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Investor>()

const InvestmentClient = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [myInvestments, setMyInvestments] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesData, investmentsData] = await Promise.all([
        InvestmentService.getPackages(),
        InvestmentService.getMyInvestments()
      ])

      setPackages(packagesData)
      setMyInvestments(investmentsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedPackage) return

    try {
      await InvestmentService.subscribeToPackage(selectedPackage.id)
      setConfirmModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la souscription:', error)
    }
  }

  const columns = useMemo<ColumnDef<Investor, any>[]>(
    () => [
      columnHelper.accessor('package', {
        header: 'Package',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('amount_paid', {
        header: 'Montant',
        cell: info => `${info.getValue()} $`,
        meta: {
          align: 'right'
        }
      }),
      columnHelper.accessor('date_start', {
        header: 'Date Début',
        cell: info => formatDate(info.getValue())
      }),
      columnHelper.accessor('date_end', {
        header: 'Date Fin',
        cell: info => formatDate(info.getValue())
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 1 ? 'Actif' : 'Terminé'}
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
    data: myInvestments,
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant='h4'>Investissements</Typography>
        </Grid>

        {/* Mes Investissements Actifs */}
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
              <Typography variant='h5'>Mes Investissements Actifs</Typography>
              {myInvestments.length > 0 && (
                <div className='flex items-center justify-between w-full md:w-auto gap-4'>
                  <div className='flex items-center gap-2'>
                    <Typography>Afficher</Typography>
                    <CustomTextField
                      select
                      value={table.getState().pagination.pageSize}
                      onChange={e => table.setPageSize(Number(e.target.value))}
                      className='is-[70px]'
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </CustomTextField>
                  </div>
                  <CustomTextField
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder='Rechercher...'
                    className='is-full sm:is-auto'
                  />
                </div>
              )}
            </CardContent>
            {myInvestments.length === 0 ? (
              <Alert severity='info' sx={{ m: 2 }}>
                Vous n'avez aucun investissement actif.
              </Alert>
            ) : (
              <>
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
                    <tbody>
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
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
              </>
            )}
          </Card>
        </Grid>

        {/* Catalogue des Packages */}
        <Grid item xs={12}>
          <Typography variant='h5' gutterBottom>
            Packages Disponibles
          </Typography>
        </Grid>

        {packages.map(pkg => (
          <Grid item xs={12} md={6} lg={4} key={pkg.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid',
                borderColor: 'primary.main',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant='h5' component='div' gutterBottom color='primary'>
                  {pkg.name}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant='h3' color='primary' gutterBottom>
                  {pkg.amount} $
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body1' gutterBottom>
                    📈 Gain Journalier: <strong>{pkg.gain_daily}%</strong>
                  </Typography>
                  <Typography variant='body1' gutterBottom>
                    📊 Gain Annuel: <strong>{pkg.gain_annual}%</strong>
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                    Durée: {pkg.duration || 'Non spécifiée'}
                  </Typography>
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={() => {
                    setSelectedPackage(pkg)
                    setConfirmModalOpen(true)
                  }}
                >
                  Souscrire Maintenant
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modale de Confirmation */}
      <ConfirmModal
        open={confirmModalOpen}
        title='Confirmer la Souscription'
        message={`Êtes-vous sûr de vouloir souscrire au package "${selectedPackage?.name}" pour ${selectedPackage?.amount} $ ?`}
        onConfirm={handleSubscribe}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText='Confirmer'
        cancelText='Annuler'
      />
    </>
  )
}

export default InvestmentClient
