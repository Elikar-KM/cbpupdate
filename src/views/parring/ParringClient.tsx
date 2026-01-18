'use client'

import { useEffect, useState, useMemo } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
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

import { NetworkService } from '@/services/network.service'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<any>()

const ParringClient = () => {
  const [networkData, setNetworkData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await NetworkService.getMyNetwork()

      setNetworkData(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${networkData?.user?.sku_user || ''}`

    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('fullName', {
        header: 'Nom Complet'
      }),
      columnHelper.accessor('email', {
        header: 'Email'
      }),
      columnHelper.accessor('phone', {
        header: 'Téléphone'
      }),
      columnHelper.accessor('created_at', {
        header: 'Date Inscription',
        cell: ({ row }) => formatDate(row.original.created_at)
      })
    ],
    []
  )

  const table = useReactTable({
    data: networkData?.referrals || [],
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
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4'>Mes Parrainages</Typography>
      </Grid>

      {/* Statistiques */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary'>
              Total Filleuls
            </Typography>
            <Typography variant='h3' color='primary'>
              {networkData?.total_referrals || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary'>
              Filleuls Actifs
            </Typography>
            <Typography variant='h3' color='success.main'>
              {networkData?.active_referrals || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.secondary'>
              Bonus Parrainage
            </Typography>
            <Typography variant='h3' color='warning.main'>
              {networkData?.referral_bonus || 0} $
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Lien de Parrainage */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Mon Lien de Parrainage
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant='body1' sx={{ flex: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                {`${window.location.origin}/register?ref=${networkData?.user?.sku_user || ''}`}
              </Typography>
              <IconButton color='primary' onClick={handleCopyLink}>
                <i className='tabler-copy' />
              </IconButton>
            </Box>
            {copied && (
              <Typography variant='caption' color='success.main' sx={{ mt: 1 }}>
                Lien copié !
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Liste des Filleuls */}
      <Grid item xs={12}>
        <Card>
          <div className='p-6'>
            <TableHeader
              title='Liste des Filleuls'
              searchValue={globalFilter ?? ''}
              onSearchChange={setGlobalFilter}
              pageSize={table.getState().pagination.pageSize}
              onPageSizeChange={size => table.setPageSize(size)}
              totalItems={table.getFilteredRowModel().rows.length}
              searchPlaceholder='Rechercher un filleul...'
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
                      Aucun filleul trouvé
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
      </Grid>
    </Grid>
  )
}

export default ParringClient
