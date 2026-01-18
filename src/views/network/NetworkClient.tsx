'use client'

import { useEffect, useState, useMemo } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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

import { NetworkService } from '@/services/network.service'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

interface NetworkMember {
  id: string
  name: string
  email: string
  date_joined: string
  status: number
  level: number
}

const columnHelper = createColumnHelper<NetworkMember>()

const NetworkClient = () => {
  const [networkData, setNetworkData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  // Données fictives pour la démo (à remplacer par les vraies données de l'API)
  const mockNetworkMembers: NetworkMember[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      date_joined: '2024-01-15',
      status: 1,
      level: 1
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      date_joined: '2024-02-20',
      status: 1,
      level: 1
    },
    {
      id: '3',
      name: 'Pierre Bernard',
      email: 'pierre.bernard@example.com',
      date_joined: '2024-03-10',
      status: 0,
      level: 2
    }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await NetworkService.getMyNetwork()

      setNetworkData(data)
    } catch (error) {
      console.error('Erreur lors du chargement du réseau:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = useMemo<ColumnDef<NetworkMember, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Nom',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('date_joined', {
        header: "Date d'inscription",
        cell: info => formatDate(info.getValue())
      }),
      columnHelper.accessor('level', {
        header: 'Niveau',
        cell: info => info.getValue(),
        meta: {
          align: 'center'
        }
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
    data: mockNetworkMembers,
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
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4'>Mon Réseau de Parrainage</Typography>
      </Grid>

      {/* Statistiques du Réseau */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              Total Filleuls
            </Typography>
            <Typography variant='h3' color='primary'>
              {mockNetworkMembers.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              Filleuls Actifs
            </Typography>
            <Typography variant='h3' color='success.main'>
              {mockNetworkMembers.filter(m => m.status === 1).length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              Bonus de Parrainage
            </Typography>
            <Typography variant='h3' color='info.main'>
              {networkData?.referral_bonus || 0} $
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Visualisation de l'Arbre */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Arbre de Parrainage
            </Typography>
            <Alert severity='info' sx={{ mt: 2 }}>
              La visualisation graphique de l'arbre sera disponible prochainement. En attendant, consultez la liste de
              vos filleuls ci-dessous.
            </Alert>
          </CardContent>
        </Card>
      </Grid>

      {/* Tableau des Filleuls */}
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
            <Typography variant='h6' gutterBottom>
              Mes Filleuls Directs
            </Typography>
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
          </CardContent>
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      Vous n'avez pas encore de filleuls
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
      </Grid>

      {/* Lien de Parrainage */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Votre Lien de Parrainage
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
                https://cbp.com/register?ref={networkData?.referral_code || 'USER123'}
              </Typography>
              <Chip
                label='Copier'
                color='primary'
                onClick={() =>
                  navigator.clipboard.writeText(
                    `https://cbp.com/register?ref=${networkData?.referral_code || 'USER123'}`
                  )
                }
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default NetworkClient
