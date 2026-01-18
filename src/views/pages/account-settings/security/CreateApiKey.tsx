'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const CreateApiKey = () => {
  return (
    <Card>
      <CardHeader title='Créer une clé API' />
      <CardContent className='!pb-0'>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <form className='flex justify-end items-end bs-full flex-col gap-5 pbe-6'>
              <CustomTextField
                select
                fullWidth
                label='Choisissez le type de clé API que vous souhaitez créer'
                defaultValue=''
              >
                <MenuItem value='full-control'>Contrôle total</MenuItem>
                <MenuItem value='modify'>Modifier</MenuItem>
                <MenuItem value='read-execute'>Lecture et exécution</MenuItem>
                <MenuItem value='list-folder-contents'>Lister le contenu du dossier</MenuItem>
                <MenuItem value='read-only'>Lecture seule</MenuItem>
                <MenuItem value='read-write'>Lecture et écriture</MenuItem>
              </CustomTextField>
              <CustomTextField label='Nommez la clé API' placeholder='Clé Serveur 1' fullWidth />
              <Button variant='contained' fullWidth>
                Créer la clé
              </Button>
            </form>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} className='flex items-end justify-center '>
            <img src='/images/illustrations/characters/4.png' width={197} height={224} alt='api illustration' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CreateApiKey
