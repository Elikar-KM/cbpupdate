// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

type ApiKeyListType = {
  title: string
  access: string
  date: string
  key: string
}

// Vars
const apiKeyList: ApiKeyListType[] = [
  {
    title: 'Clé Serveur 1',
    access: 'Accès complet',
    date: '28 Avr 2021, 18:20 GTM+4:10',
    key: '23eaf7f0-f4f7-495e-8b86-fad3261282ac'
  },
  {
    title: 'Clé Serveur 2',
    access: 'Lecture seule',
    date: '12 Fév 2021, 10:30 GTM+2:30',
    key: 'bb98e571-a2e2-4de8-90a9-2e231b5e99'
  },
  {
    title: 'Clé Serveur 3',
    access: 'Accès complet',
    date: '28 Déc 2021, 12:21 GTM+4:10',
    key: '2e915e59-3105-47f2-8838-6e46bf83b711'
  }
]

const ApiKeyList = () => {
  return (
    <Card>
      <CardHeader title='Liste des clés API et accès' className='pbe-4' />
      <CardContent className='flex flex-col gap-6'>
        <Typography>
          Une clé API est une simple chaîne chiffrée qui identifie une application sans aucun principal. Elles sont
          utiles pour accéder aux données publiques de manière anonyme et sont utilisées pour associer les demandes
          d'API à votre projet pour les quotas et la facturation.
        </Typography>
        {apiKeyList.map((item, index) => (
          <div key={index} className='flex flex-col gap-2 p-4 rounded bg-actionHover'>
            <div className='flex items-center gap-3'>
              <Typography variant='h5'>{item.title}</Typography>
              <Chip color='primary' variant='tonal' label={item.access} size='small' />
            </div>
            <div className='flex items-center gap-1'>
              <Typography className='font-medium'>{item.key}</Typography>
              <div className='flex'>
                <IconButton size='small'>
                  <i className='tabler-copy text-textSecondary' />
                </IconButton>
              </div>
            </div>
            <Typography color='text.disabled'>{`Créé le ${item.date}`}</Typography>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ApiKeyList
