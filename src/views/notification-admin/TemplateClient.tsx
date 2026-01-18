'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

// Component Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import TableHeader from '@/components/tables/TableHeader'

// Service Imports
import { NotificationTemplateService, type NotificationTemplate } from '@/services/notification-admin.service'

// React Table Imports
import { formatDate } from '@/utils/date'

const columnHelper = createColumnHelper<NotificationTemplate>()

const TemplateClient = () => {
  // States
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [filteredData, setFilteredData] = useState<NotificationTemplate[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'web' as 'email' | 'web' | 'sms' | 'push',
    is_active: true
  })

  // Hooks
  const router = useRouter()

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const data = await NotificationTemplateService.getAll()

    setTemplates(data)
    setFilteredData(data)
  }

  // Filter data based on search
  useEffect(() => {
    const filtered = templates.filter(
      template =>
        template.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchValue.toLowerCase()) ||
        template.type.toLowerCase().includes(searchValue.toLowerCase())
    )

    setFilteredData(filtered)
  }, [searchValue, templates])

  // Columns
  const columns = [
    columnHelper.accessor('name', {
      header: 'Nom',
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => {
        const typeColors = {
          email: 'primary',
          web: 'info',
          sms: 'warning',
          push: 'success'
        }

        return (
          <Chip
            label={row.original.type.toUpperCase()}
            color={typeColors[row.original.type] as any}
            size='small'
            variant='tonal'
          />
        )
      }
    }),
    columnHelper.accessor('subject', {
      header: 'Sujet',
      cell: ({ row }) => <span>{row.original.subject || '-'}</span>
    }),
    columnHelper.accessor('is_active', {
      header: 'Statut',
      cell: ({ row }) => (
        <Chip
          label={row.original.is_active ? 'Actif' : 'Inactif'}
          color={row.original.is_active ? 'success' : 'error'}
          size='small'
          variant='tonal'
        />
      )
    }),
    columnHelper.accessor('created_at', {
      header: 'Date de création',
      cell: ({ row }) => formatDate(row.original.created_at)
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <IconButton size='small' onClick={() => handleEdit(row.original)}>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => handlePreview(row.original.id)}>
            <i className='tabler-eye text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => handleDelete(row.original.id)}>
            <i className='tabler-trash text-error' />
          </IconButton>
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: filteredData.slice(0, pageSize),
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const handleAdd = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: 'web',
      is_active: true
    })
    setOpenDialog(true)
  }

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject || '',
      content: template.content,
      type: template.type,
      is_active: template.is_active
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await NotificationTemplateService.update(editingTemplate.id, formData)
      } else {
        await NotificationTemplateService.create(formData)
      }

      setOpenDialog(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      await NotificationTemplateService.delete(id)
      fetchTemplates()
    }
  }

  const handlePreview = async (id: number) => {
    const preview = await NotificationTemplateService.preview(id)

    if (preview) {
      alert(`Sujet: ${preview.subject}\n\nContenu:\n${preview.content}`)
    }
  }

  return (
    <Card>
      <TableHeader
        title='Templates de Notifications'
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredData.length}
        actions={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAdd}>
            Nouveau Template
          </Button>
        }
      />

      <div className='overflow-x-auto'>
        <table className='min-w-full'>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='px-4 py-3 text-left'>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className='border-t'>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='px-4 py-3'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>{editingTemplate ? 'Modifier le Template' : 'Nouveau Template'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mt-4'>
            <TextField
              label='Nom'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label='Type'
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value='web'>Notification Web</MenuItem>
                <MenuItem value='email'>Email</MenuItem>
                <MenuItem value='sms'>SMS</MenuItem>
                <MenuItem value='push'>Push Notification</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label='Sujet'
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              fullWidth
            />

            <TextField
              label='Contenu'
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              fullWidth
              helperText='Variables disponibles: {user.name}, {user.email}, {user.balance}, {date}, {company.name}'
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant='contained' onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TemplateClient
