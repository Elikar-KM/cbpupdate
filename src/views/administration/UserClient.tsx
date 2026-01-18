'use client'

import { useEffect, useState, useMemo } from 'react'

import Card from '@mui/material/Card'

import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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

import TablePagination from '@mui/material/TablePagination'

import { AdminService, type AdminUser } from '@/services/admin.service'
import { AuthService } from '@/services/auth.service'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableHeader from '@/components/tables/TableHeader'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<AdminUser>()

const UserClient = () => {
  const [data, setData] = useState<AdminUser[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [activateModalOpen, setActivateModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const result = await AdminService.getAllUsers()

      setData(result || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSuspend = async () => {
    if (!selectedUser) return

    try {
      await AdminService.suspendUser(selectedUser.id)
      setSuspendModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleActivate = async () => {
    if (!selectedUser) return

    try {
      await AdminService.activateUser(selectedUser.id)
      setActivateModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const columns = useMemo<ColumnDef<AdminUser, any>[]>(
    () => [
      columnHelper.display({
        id: 'number',
        header: 'N°',
        cell: ({ row }) => row.index + 1
      }),
      columnHelper.accessor('fullName', {
        header: 'Nom Complet'
      }),
      columnHelper.accessor('email', {
        header: 'Email'
      }),
      columnHelper.accessor('phone', {
        header: 'Téléphone'
      }),
      columnHelper.accessor('role', {
        header: 'Rôle'
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 1 ? 'Actif' : 'Suspendu'}
            color={row.original.status === 1 ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size='small'
              variant='outlined'
              color='primary'
              onClick={async () => {
                const result = await AuthService.impersonate(row.original.id)

                if (result.success) {
                  // Force full page reload to refresh session
                  window.location.reload()
                } else {
                  alert(result.message)
                }
              }}
            >
              Se connecter
            </Button>
            {row.original.status === 1 ? (
              <Button
                size='small'
                variant='outlined'
                color='error'
                onClick={() => {
                  setSelectedUser(row.original)
                  setSuspendModalOpen(true)
                }}
              >
                Suspendre
              </Button>
            ) : (
              <Button
                size='small'
                variant='contained'
                color='success'
                onClick={() => {
                  setSelectedUser(row.original)
                  setActivateModalOpen(true)
                }}
              >
                Activer
              </Button>
            )}
          </Box>
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
    <>
      <Card>
        <div className='p-6'>
          <TableHeader
            title='Gérer Utilisateurs'
            searchValue={globalFilter ?? ''}
            onSearchChange={setGlobalFilter}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={size => table.setPageSize(size)}
            totalItems={table.getFilteredRowModel().rows.length}
            searchPlaceholder='Rechercher un utilisateur...'
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
                    Aucun utilisateur trouvé
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

      <ConfirmModal
        open={suspendModalOpen}
        title="Suspendre l'Utilisateur"
        message={`Voulez-vous vraiment suspendre ${selectedUser?.fullName} ?`}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendModalOpen(false)}
        confirmText='Suspendre'
        cancelText='Annuler'
      />

      <ConfirmModal
        open={activateModalOpen}
        title="Activer l'Utilisateur"
        message={`Voulez-vous vraiment activer ${selectedUser?.fullName} ?`}
        onConfirm={handleActivate}
        onCancel={() => setActivateModalOpen(false)}
        confirmText='Activer'
        cancelText='Annuler'
      />
    </>
  )
}

export default UserClient
