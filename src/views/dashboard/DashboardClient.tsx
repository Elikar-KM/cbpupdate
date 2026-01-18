'use client'

// Dashboard Layout Updated: Horizontal Transactions, 50/50 Graphs

import { useEffect, useState, useMemo } from 'react'

import { useSession } from 'next-auth/react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import classnames from 'classnames'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { DashboardService } from '@/services/dashboard.service'
import { TransactionService } from '@/services/transaction.service'
import type { DashboardData, Transaction, DashboardStatistics } from '@/types/api'
import tableStyles from '@core/styles/table.module.css'
import { formatDateTime } from '@/utils/date'

const columnHelper = createColumnHelper<Transaction>()

const DashboardClient = () => {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<DashboardStatistics | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, transactionsData, statsData] = await Promise.all([
          DashboardService.getClientDashboard(),
          TransactionService.getAllTransactions(),
          DashboardService.getStatistics()
        ])

        setData(dashboardData)
        setTransactions(transactionsData.slice(0, 5)) // Dernières 5 transactions
        setStats(statsData)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: info => formatDateTime(info.getValue())
      }),
      columnHelper.accessor('user_email', {
        header: 'Membre/Email',
        cell: info => {
          const email = info.getValue()
          const name = info.row.original.user_name

          return (
            <div className='flex flex-col'>
              {name && (
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {name}
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary'>
                {email || '-'}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: info => {
          const type = info.getValue()

          const colors: any = {
            deposit: 'success',
            withdrawal: 'error',
            transfer: 'info',
            bonus: 'warning'
          }

          return <Chip label={type} color={colors[type] || 'default'} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('amount', {
        header: 'Montant',
        cell: info => `${Number(info.getValue()).toFixed(2)} $`,
        meta: {
          align: 'right'
        }
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: info => {
          const status = Number(info.getValue())

          const labels: any = {
            0: 'En attente',
            1: 'Validé',
            2: 'Rejeté'
          }

          const colors: any = {
            0: 'warning',
            1: 'success',
            2: 'error'
          }

          return (
            <Chip label={labels[status] || status} color={colors[status] || 'default'} size='small' variant='tonal' />
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant='h6' color='text.secondary'>
          Erreur lors du chargement des données
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
      {/* Message de dette si applicable */}
      {data.show_debt_message && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='warning'>{data.debt_message}</Alert>
        </Grid>
      )}

      {/* SECTION: ACTIONS RAPIDES */}
      <Grid size={{ xs: 12 }}>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            display: 'inline-block',
            mb: 3,
            pb: 1
          }}
        >
          Actions Rapides
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            height: '100%',
            minHeight: 120,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              bgcolor: 'primary.main',
              '& .MuiTypography-root': { color: 'white' },
              '& .MuiAvatar-root': { bgcolor: 'white', color: 'primary.main' }
            }
          }}
          onClick={() => (window.location.href = '/account/account')}
        >
          <CardContent className='flex items-center gap-4 h-full'>
            <Avatar variant='rounded' className='bg-primary/10' sx={{ width: 56, height: 56 }}>
              <i className='tabler-search text-3xl text-primary' />
            </Avatar>
            <div className='flex flex-col'>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Rechercher Compte
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Trouver un compte utilisateur
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            height: '100%',
            minHeight: 120,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              bgcolor: 'success.main',
              '& .MuiTypography-root': { color: 'white' },
              '& .MuiAvatar-root': { bgcolor: 'white', color: 'success.main' }
            }
          }}
          onClick={() => (window.location.href = '/subscription/subscription')}
        >
          <CardContent className='flex items-center gap-4 h-full'>
            <Avatar variant='rounded' className='bg-success/10' sx={{ width: 56, height: 56 }}>
              <i className='tabler-file-plus text-3xl text-success' />
            </Avatar>
            <div className='flex flex-col'>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Nouvelle Souscription
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Souscrire à un package
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            height: '100%',
            minHeight: 120,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              bgcolor: 'info.main',
              '& .MuiTypography-root': { color: 'white' },
              '& .MuiAvatar-root': { bgcolor: 'white', color: 'info.main' }
            }
          }}
          onClick={() => (window.location.href = '/transfert/transfert')}
        >
          <CardContent className='flex items-center gap-4 h-full'>
            <Avatar variant='rounded' className='bg-info/10' sx={{ width: 56, height: 56 }}>
              <i className='tabler-arrows-exchange text-3xl text-info' />
            </Avatar>
            <div className='flex flex-col'>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Transférer les Fonds
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Envoyer de l'argent
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            height: '100%',
            minHeight: 120,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              bgcolor: 'warning.main',
              '& .MuiTypography-root': { color: 'white' },
              '& .MuiAvatar-root': { bgcolor: 'white', color: 'warning.main' }
            }
          }}
          onClick={() => {
            const userSku = session?.user?.sku_user || 'USER_ID'
            const referralLink = window.location.origin + '/register?ref=' + userSku

            navigator.clipboard.writeText(referralLink)
            alert('Lien de parrainage copié!')
          }}
        >
          <CardContent className='flex items-center gap-4 h-full'>
            <Avatar variant='rounded' className='bg-warning/10' sx={{ width: 56, height: 56 }}>
              <i className='tabler-link text-3xl text-warning' />
            </Avatar>
            <div className='flex flex-col'>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Copier Lien Parrainage
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Partager votre lien
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {stats && (
        <>
          {/* SECTION 1: VUE D'ENSEMBLE */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
                mb: 2,
                pb: 1
              }}
            >
              Vue d'ensemble
            </Typography>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-primary/10 p-2' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-users text-2xl text-primary' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                      Utilisateurs
                    </Typography>
                    <Typography variant='h5' color='primary' sx={{ fontWeight: 700 }}>
                      {stats.users.total}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {stats.users.active} Actifs
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid> */}

          {/* <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-primary/10 p-2' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-chart-pie text-2xl text-primary' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                      Investisseurs
                    </Typography>
                    <Typography variant='h5' color='primary' sx={{ fontWeight: 700 }}>
                      {stats.investors}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid> */}

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-success/10 p-2' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-file-check text-2xl text-success' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                      Souscriptions
                    </Typography>
                    <Typography variant='h5' color='success.main' sx={{ fontWeight: 700 }}>
                      {stats.subscriptions}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-info/10 p-2' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-bell text-2xl text-info' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                      Notifications
                    </Typography>
                    <Typography variant='h5' color='info.main' sx={{ fontWeight: 700 }}>
                      {stats.notifications}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-success/10 p-2' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-ticket text-2xl text-success' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                      Tickets
                    </Typography>
                    <Typography variant='h5' color='success.main' sx={{ fontWeight: 700 }}>
                      {stats.tickets.total}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {stats.tickets.open} Ouverts
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* SECTION 3: STATISTIQUES FINANCIÈRES */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
                mb: 2,
                pb: 1
              }}
            >
              Statistiques Financières
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ minHeight: 160, height: '100%' }}>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-primary/10 p-2'>
                    <i className='tabler-wallet text-xl text-primary' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='h6' color='text.secondary'>
                      Solde Total
                    </Typography>
                    <Typography variant='h4' color='primary'>
                      {data.wallet_balance}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ minHeight: 160, height: '100%' }}>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-success/10 p-2'>
                    <i className='tabler-chart-bar text-xl text-success' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='h6' color='text.secondary'>
                      Gains Totaux
                    </Typography>
                    <Typography variant='h4' color='success.main'>
                      {data.somme_gain}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ minHeight: 160, height: '100%' }}>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-info/10 p-2'>
                    <i className='tabler-gift text-xl text-info' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='h6' color='text.secondary'>
                      Bonus Totaux
                    </Typography>
                    <Typography variant='h4' color='info.main'>
                      {data.somme_bonus}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ minHeight: 160, height: '100%' }}>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-warning/10 p-2'>
                    <i className='tabler-users text-xl text-warning' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='h6' color='text.secondary'>
                      Parrainage Filleuls
                    </Typography>
                    <Typography variant='h4' color='warning.main'>
                      {data.total_invite}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ minHeight: 160, height: '100%' }}>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <Avatar variant='rounded' className='bg-success/10 p-2'>
                    <i className='tabler-trending-up text-xl text-success' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography variant='h6' color='text.secondary'>
                      Octroyés{' '}
                      {data.gains_change && (
                        <Chip
                          label={`${data.gains_change > 0 ? '+' : ''}${data.gains_change}%`}
                          size='small'
                          color={data.gains_change > 0 ? 'success' : data.gains_change < 0 ? 'error' : 'default'}
                          variant='tonal'
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                    <div className='flex items-center gap-2'>
                      <Typography variant='h5' color='success.main'>
                        {data.gains_today || '0.00 $'}
                      </Typography>
                    </div>
                    <div className='flex items-center gap-1 mt-1'>
                      <Typography variant='caption' color='text.disabled'>
                        Hier: <br /> {data.gains_yesterday || '0.00 $'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid> */}

          {/* SECTION 2: DÉTAILS TRANSACTIONS */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
                mb: 2,
                pb: 1
              }}
            >
              Détails Transactions
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: { xs: 120, md: 160 },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar
                    variant='rounded'
                    className='bg-success/10 p-2'
                    sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
                  >
                    <i className='tabler-arrow-up-right text-2xl text-success' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      Recharges
                    </Typography>
                    <Typography
                      variant='h5'
                      color='text.primary'
                      sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                    >
                      {stats.transactions.recharge}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: { xs: 120, md: 160 },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar
                    variant='rounded'
                    className='bg-error/10 p-2'
                    sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
                  >
                    <i className='tabler-arrow-down-left text-2xl text-error' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      Retraits
                    </Typography>
                    <Typography
                      variant='h5'
                      color='text.primary'
                      sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                    >
                      {stats.transactions.withdrawal}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: { xs: 120, md: 160 },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar
                    variant='rounded'
                    className='bg-info/10 p-2'
                    sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
                  >
                    <i className='tabler-arrows-left-right text-2xl text-info' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      Transferts
                    </Typography>
                    <Typography
                      variant='h5'
                      color='text.primary'
                      sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                    >
                      {stats.transactions.transfer}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: { xs: 120, md: 160 },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar
                    variant='rounded'
                    className='bg-warning/10 p-2'
                    sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
                  >
                    <i className='tabler-currency-bitcoin text-2xl text-warning' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      Achat Cryptos
                    </Typography>
                    <Typography
                      variant='h5'
                      color='text.primary'
                      sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                    >
                      {stats.transactions.crypto_buy}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: { xs: 120, md: 160 },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent className='flex flex-col gap-3 justify-center h-full'>
                <div className='flex items-center gap-4'>
                  <Avatar
                    variant='rounded'
                    className='bg-primary/10 p-2'
                    sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
                  >
                    <i className='tabler-currency-dollar text-2xl text-primary' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      Vente Cryptos
                    </Typography>
                    <Typography
                      variant='h5'
                      color='text.primary'
                      sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                    >
                      {stats.transactions.crypto_sell}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}

      {/* SECTION 4: ANALYSES & RAPPORTS */}
      {/* <Grid item xs={12}>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            display: 'inline-block',
            mb: 2,
            pb: 1
          }}
        >
          Analyses & Rapports
        </Typography>
      </Grid> */}

      {/* Graphique de Gains */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Évolution des Gains & Frais (Mois en cours)
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={data.gains_evolution || []}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='gains' name='Gains Utilisateur' stroke='#8884d8' activeDot={{ r: 8 }} />
                <Line type='monotone' dataKey='system' name='Gains Système (Frais)' stroke='#ff7300' />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Graphique de Distribution des Packages */}
      {/* <Grid size={{ xs: 12 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Répartition des Investisseurs par Package
            </Typography>
            {!data.package_distribution || data.package_distribution.length === 0 ? (
              <Alert severity='info'>Aucune donnée de distribution disponible</Alert>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={data.package_distribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {data.package_distribution.map((entry, index) => {
                      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid> */}

      {/* Graphique de Répartition */}
      {/* <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Statistiques Financières
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart
                data={[
                  { name: 'Gains', value: parseFloat(data.somme_gain || '0') },
                  { name: 'Bonus', value: parseFloat(data.somme_bonus || '0') },
                  { name: 'Retraits', value: parseFloat(data.total_retrait || '0') }
                ]}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='value' fill='#82ca9d' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid> */}

      {/* Dernières Transactions */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Dernières Transactions
            </Typography>
            {transactions.length === 0 ? (
              <Alert severity='info'>Aucune transaction récente</Alert>
            ) : (
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
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
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
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* SECTION 5: ACTIONS RAPIDES */}
      {/* <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Actions Rapides
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant='contained' color='primary' href='/investment'>
                Investir
              </Button>
              <Button variant='outlined' color='primary' href='/wallet'>
                Gérer Wallets
              </Button>
              <Button variant='outlined' color='secondary' href='/transaction'>
                Voir Transactions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid> */}
    </Grid>
  )
}

export default DashboardClient
