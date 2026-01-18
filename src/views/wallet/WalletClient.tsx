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
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
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

import { WalletService } from '@/services/wallet.service'
import type { Wallet } from '@/types/api'
import FormModal from '@/components/modals/FormModal'
import WalletForm from '@/components/forms/WalletForm'
import WithdrawForm from '@/components/forms/WithdrawForm'
import DepositForm from '@/components/forms/DepositForm'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<Wallet>()

const WalletClient = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      const data = await WalletService.getAllWallets()

      setWallets(data)
    } catch (error) {
      console.error('Erreur lors du chargement des wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWallet = async (data: { type: string; name: string; address: string }) => {
    try {
      await WalletService.createWallet(data)
      setCreateModalOpen(false)
      fetchWallets()
    } catch (error) {
      console.error('Erreur lors de la création du wallet:', error)
    }
  }

  const handleWithdraw = async (data: { amount: number; wallet_id: string }) => {
    try {
      // Appel API pour retrait (à implémenter dans le service)
      console.log('Retrait:', data)
      setWithdrawModalOpen(false)
    } catch (error) {
      console.error('Erreur lors du retrait:', error)
    }
  }

  const handleDeposit = async (data: { amount: number; proof: File | null }) => {
    try {
      // Appel API pour dépôt (à implémenter dans le service)
      console.log('Dépôt:', data)
      setDepositModalOpen(false)
    } catch (error) {
      console.error('Erreur lors du dépôt:', error)
    }
  }

  const columns = useMemo<ColumnDef<Wallet, any>[]>(
    () => [
      columnHelper.accessor('type', {
        header: 'Type',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: 'Nom',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('address', {
        header: 'Adresse',
        cell: info => {
          const value = info.getValue()

          return value ? value.substring(0, 20) + '...' : '-'
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size='small'
              variant='contained'
              color='primary'
              onClick={() => {
                setSelectedWallet(row.original)
                setDepositModalOpen(true)
              }}
            >
              Déposer
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='secondary'
              onClick={() => {
                setSelectedWallet(row.original)
                setWithdrawModalOpen(true)
              }}
            >
              Retirer
            </Button>
          </Box>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: wallets,
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
          {wallets.length === 0 ? (
            <Alert severity='info'>Aucun portefeuille trouvé. Créez-en un pour commencer.</Alert>
          ) : (
            <Card>
              <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
                <div className='flex items-center justify-between w-full'>
                  <Typography variant='h5'>Mes Portefeuilles</Typography>
                  <div className='flex items-center gap-2'>
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
                    <Button variant='contained' color='primary' onClick={() => setCreateModalOpen(true)}>
                      Créer un Wallet
                    </Button>
                  </div>
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
                          Aucun wallet disponible
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
          )}
        </Grid>
      </Grid>

      {/* Modale Création Wallet */}
      <FormModal
        open={createModalOpen}
        title='Créer un Nouveau Wallet'
        onClose={() => setCreateModalOpen(false)}
        onSubmit={() => {
          // La soumission est gérée par le formulaire interne
        }}
      >
        <WalletForm onSubmit={handleCreateWallet} />
      </FormModal>

      {/* Modale Retrait */}
      <FormModal
        open={withdrawModalOpen}
        title='Demande de Retrait'
        onClose={() => setWithdrawModalOpen(false)}
        onSubmit={() => {
          // La soumission est gérée par le formulaire interne
        }}
      >
        <WithdrawForm onSubmit={handleWithdraw} maxAmount={1000} />
      </FormModal>

      {/* Modale Dépôt */}
      <FormModal
        open={depositModalOpen}
        title='Effectuer un Dépôt'
        onClose={() => setDepositModalOpen(false)}
        onSubmit={() => {
          // La soumission est gérée par le formulaire interne
        }}
      >
        <DepositForm onSubmit={handleDeposit} />
      </FormModal>
    </>
  )
}

export default WalletClient
