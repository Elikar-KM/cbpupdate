// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import Link from '@components/Link'

// Component Imports
import TwoFactorAuth from '@components/dialogs/two-factor-auth'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const TwoFactorAuthenticationCard = () => {
  // Vars
  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: "Activer l'authentification à deux facteurs"
  }

  return (
    <>
      <Card>
        <CardHeader title='Vérification en deux étapes' />
        <CardContent className='flex flex-col items-start gap-6'>
          <div className='flex flex-col gap-4'>
            <Typography variant='h5' color='text.secondary'>
              L'authentification à deux facteurs n'est pas encore activée.
            </Typography>
            <Typography>
              L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en
              nécessitant plus qu'un simple mot de passe pour vous connecter.
              <Link className='text-primary'> En savoir plus.</Link>
            </Typography>
          </div>
          <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
        </CardContent>
      </Card>
    </>
  )
}

export default TwoFactorAuthenticationCard
