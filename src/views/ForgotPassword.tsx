'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
// import { useParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
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
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { AuthService } from '@/services/auth.service'

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
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
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

type FormData = {
  email: string
}

const schema = object({
  email: string([minLength(1, "L'email est requis"), email('Email invalide')])
})

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  // States
  const [errorState, setErrorState] = useState<string | null>(null)
  const [successState, setSuccessState] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'

  // Hooks
  // const { lang: locale } = useParams()
  const locale = 'fr'
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setErrorState(null)
    setSuccessState(null)

    const res = await AuthService.forgotPassword(data.email)

    if (res.success) {
      setSuccessState(res.message)
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
        <ForgotPasswordIllustration src={characterIllustration} alt='character-illustration' />
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
            <Typography variant='h4'>Mot de passe oublié 🔒</Typography>
            <Typography>
              Entrez votre email et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
            </Typography>
          </div>

          {errorState && <Alert severity='error'>{errorState}</Alert>}
          {successState && <Alert severity='success'>{successState}</Alert>}

          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='Email'
                  placeholder='Entrez votre email'
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Button fullWidth variant='contained' type='submit'>
              Envoyer le lien
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon
                  ltrIconClass='tabler-chevron-left'
                  rtlIconClass='tabler-chevron-right'
                  className='text-xl'
                />
                <span>Retour à la connexion</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
