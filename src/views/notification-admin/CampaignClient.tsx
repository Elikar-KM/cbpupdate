'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

// Component Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import TableHeader from '@/components/tables/TableHeader'

// Service Imports
import {
  NotificationCampaignService,
  NotificationTemplateService,
  type NotificationCampaign,
  type NotificationTemplate
} from '@/services/notification-admin.service'

// React Table Imports
import { formatDateTime } from '@/utils/date'

const columnHelper = createColumnHelper<NotificationCampaign>()

const CampaignClient = () => {
  // States
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [filteredData, setFilteredData] = useState<NotificationCampaign[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [openDialog, setOpenDialog] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    type: 'web' as 'email' | 'web' | 'sms' | 'push',
    template_id: 0,
    target_type: 'all' as 'all' | 'role' | 'status' | 'custom' | 'manual',
    target_filters: {},
    scheduled_at: null as string | null
  })

  const steps = ['Informations', 'Template', 'Ciblage', 'Planification']

  // Hooks
  const router = useRouter()

  // Fetch data
  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [])

  const fetchCampaigns = async () => {
    const data = await NotificationCampaignService.getAll()

    setCampaigns(data)
    setFilteredData(data)
  }

  const fetchTemplates = async () => {
    const data = await NotificationTemplateService.getAll()

    setTemplates(data.filter(t => t.is_active))
  }

  // Filter data
  useEffect(() => {
    const filtered = campaigns.filter(
      campaign =>
        campaign.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        campaign.type.toLowerCase().includes(searchValue.toLowerCase()) ||
        campaign.status.toLowerCase().includes(searchValue.toLowerCase())
    )

    setFilteredData(filtered)
  }, [searchValue, campaigns])

  // Columns
  const columns = [
    columnHelper.accessor('name', {
      header: 'Nom',
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => {
        const typeColors = { email: 'primary', web: 'info', sms: 'warning', push: 'success' }

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
    columnHelper.accessor('status', {
      header: 'Statut',
      cell: ({ row }) => {
        const statusColors = {
          draft: 'default',
          scheduled: 'warning',
          sending: 'info',
          sent: 'success',
          cancelled: 'error',
          failed: 'error'
        }

        const statusLabels = {
          draft: 'Brouillon',
          scheduled: 'Planifié',
          sending: 'Envoi en cours',
          sent: 'Envoyé',
          cancelled: 'Annulé',
          failed: 'Échoué'
        }

        return (
          <Chip
            label={statusLabels[row.original.status]}
            color={statusColors[row.original.status] as any}
            size='small'
            variant='tonal'
          />
        )
      }
    }),
    columnHelper.accessor('stats', {
      header: 'Statistiques',
      cell: ({ row }) => {
        const stats = row.original.stats

        if (!stats) return '-'

        return (
          <div className='text-sm'>
            <div>
              Envoyés: {stats.sent}/{stats.total}
            </div>
            <div>Taux d'ouverture: {stats.open_rate.toFixed(1)}%</div>
          </div>
        )
      }
    }),
    columnHelper.accessor('scheduled_at', {
      header: 'Planification',
      cell: ({ row }) => (row.original.scheduled_at ? formatDateTime(row.original.scheduled_at) : 'Immédiat')
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          {row.original.status === 'draft' && (
            <IconButton size='small' onClick={() => handleSend(row.original.id)}>
              <i className='tabler-send text-success' />
            </IconButton>
          )}
          {row.original.status === 'scheduled' && (
            <IconButton size='small' onClick={() => handleCancel(row.original.id)}>
              <i className='tabler-x text-error' />
            </IconButton>
          )}
          <IconButton size='small' onClick={() => handleViewStats(row.original.id)}>
            <i className='tabler-chart-bar text-info' />
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
    setFormData({
      name: '',
      type: 'web',
      template_id: 0,
      target_type: 'all',
      target_filters: {},
      scheduled_at: null
    })
    setActiveStep(0)
    setOpenDialog(true)
  }

  const handleNext = () => {
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSave = async () => {
    try {
      await NotificationCampaignService.create(formData)
      setOpenDialog(false)
      fetchCampaigns()
    } catch (error) {
      console.error('Error saving campaign:', error)
    }
  }

  const handleSend = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir envoyer cette campagne maintenant ?')) {
      try {
        await NotificationCampaignService.send(id)
        fetchCampaigns()
      } catch (error) {
        console.error('Error sending campaign:', error)
      }
    }
  }

  const handleCancel = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette campagne ?')) {
      await NotificationCampaignService.cancel(id)
      fetchCampaigns()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      await NotificationCampaignService.delete(id)
      fetchCampaigns()
    }
  }

  const handleViewStats = (id: number) => {
    router.push(`/notification-admin/campaigns/${id}/stats`)
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className='flex flex-col gap-4'>
            <TextField
              label='Nom de la campagne'
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
          </div>
        )
      case 1:
        return (
          <FormControl fullWidth>
            <InputLabel>Template</InputLabel>
            <Select
              value={formData.template_id}
              label='Template'
              onChange={e => setFormData({ ...formData, template_id: Number(e.target.value) })}
            >
              {templates.map(template => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 2:
        return (
          <FormControl fullWidth>
            <InputLabel>Ciblage</InputLabel>
            <Select
              value={formData.target_type}
              label='Ciblage'
              onChange={e => setFormData({ ...formData, target_type: e.target.value as any })}
            >
              <MenuItem value='all'>Tous les utilisateurs</MenuItem>
              <MenuItem value='role'>Par rôle</MenuItem>
              <MenuItem value='status'>Par statut</MenuItem>
              <MenuItem value='custom'>Critères personnalisés</MenuItem>
              <MenuItem value='manual'>Sélection manuelle</MenuItem>
            </Select>
          </FormControl>
        )
      case 3:
        return (
          <TextField
            label='Date et heure de planification (optionnel)'
            type='datetime-local'
            value={formData.scheduled_at || ''}
            onChange={e => setFormData({ ...formData, scheduled_at: e.target.value || null })}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText='Laissez vide pour un envoi immédiat'
          />
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <TableHeader
        title='Campagnes de Notifications'
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredData.length}
        actions={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAdd}>
            Nouvelle Campagne
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
        <DialogTitle>Nouvelle Campagne</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} className='mb-6 mt-4'>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Retour</Button>}
          {activeStep < steps.length - 1 ? (
            <Button variant='contained' onClick={handleNext}>
              Suivant
            </Button>
          ) : (
            <Button variant='contained' onClick={handleSave}>
              Créer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default CampaignClient
