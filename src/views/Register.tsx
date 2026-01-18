'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, email } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { AuthService } from '@/services/auth.service'

// Styled Custom Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

type FormData = {
  username: string
  email: string
  password: string
}

const schema = object({
  username: string([minLength(1, "Le nom d'utilisateur est requis")]),
  email: string([minLength(1, "L'email est requis"), email('Email invalide')]),
  password: string([minLength(6, 'Le mot de passe doit contenir au moins 6 caractères')])
})

const Register = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [successState, setSuccessState] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const router = useRouter()

  // const { lang: locale } = useParams()
  const locale = 'fr'
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setErrorState(null)
    setSuccessState(null)

    const res = await AuthService.signup({
      name: data.username,
      email: data.email,
      password: data.password,
      password_confirmation: data.password // Assuming simple signup for now
    })

    if (res.success) {
      setSuccessState('Inscription réussie ! Redirection vers la connexion...')
      setTimeout(() => {
        router.push(getLocalizedUrl('/login', locale as Locale))
      }, 2000)
    } else {
      setErrorState(res.message)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>L'aventure commence ici 🚀</Typography>
            <Typography>Gérez vos investissements facilement et efficacement !</Typography>
          </div>

          {errorState && <Alert severity='error'>{errorState}</Alert>}
          {successState && <Alert severity='success'>{successState}</Alert>}

          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='username'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='Nom dutilisateur'
                  placeholder='Entrez votre nom'
                  error={Boolean(errors.username)}
                  helperText={errors.username?.message}
                />
              )}
            />
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Email'
                  placeholder='Entrez votre email'
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Mot de passe'
                  placeholder='············'
                  type={isPasswordShown ? 'text' : 'password'}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />

            <FormControlLabel
              control={<Checkbox />}
              label={
                <>
                  <span>J'accepte les </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    conditions d'utilisation
                  </Link>
                </>
              }
            />
            <Button fullWidth variant='contained' type='submit'>
              S'inscrire
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Vous avez déjà un compte ?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/login', locale as Locale)} color='primary.main'>
                Connectez-vous
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
