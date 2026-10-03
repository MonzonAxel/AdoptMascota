import { UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button/Button'
import { useAuth } from '@/hooks/useAuth'

import './LoginPage.css'

const esquemaInicioSesion = z.object({
  correoElectronico: z.string().email('Ingresa un correo electrónico válido.'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

type DatosFormularioInicioSesion = z.infer<typeof esquemaInicioSesion>

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: {
      correoElectronico: '',
      contrasena: '',
    },
  })

  function onSubmit() {
    signIn()
    navigate('/admin/mascotas')
  }

  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-page__avatar" aria-hidden="true">
        <UserRound size={28} strokeWidth={1.7} />
      </div>
      <p className="login-page__eyebrow">Acceso solo administradores</p>
      <h1 id="login-title">Iniciar sesión</h1>

      <form className="login-page__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="login-page__field">
          <label htmlFor="correo-electronico">Usuario</label>
          <input
            id="correo-electronico"
            type="email"
            autoComplete="username"
            {...register('correoElectronico')}
            aria-invalid={Boolean(errors.correoElectronico)}
            aria-describedby={errors.correoElectronico ? 'correo-electronico-error' : undefined}
          />
          {errors.correoElectronico ? (
            <span id="correo-electronico-error" className="login-page__error" role="alert">
              {errors.correoElectronico.message}
            </span>
          ) : null}
        </div>

        <div className="login-page__field">
          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            {...register('contrasena')}
            aria-invalid={Boolean(errors.contrasena)}
            aria-describedby={errors.contrasena ? 'contrasena-error' : undefined}
          />
          {errors.contrasena ? (
            <span id="contrasena-error" className="login-page__error" role="alert">
              {errors.contrasena.message}
            </span>
          ) : null}
        </div>

        <Button className="login-page__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </section>
  )
}
