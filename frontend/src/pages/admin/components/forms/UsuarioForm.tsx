import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button/Button'
import type { DatosActualizarUsuario, DatosCrearUsuario, Usuario } from '@/types/usuario'
import { esquemaUsuario, type DatosFormularioUsuario, type UsuarioValidado } from '@/schemas/usuarioSchema'

import './UsuarioForm.css'
import './adminForms.css'

type UsuarioFormProps = {
  usuario?: Usuario
  rolEditable?: boolean
  onGuardar: (datos: DatosCrearUsuario | DatosActualizarUsuario) => Promise<void>
  onCancelar: () => void
}

export function UsuarioForm({ usuario, rolEditable = true, onGuardar, onCancelar }: UsuarioFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioUsuario, unknown, UsuarioValidado>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: {
      nombre: usuario?.perfil.nombre ?? '',
      apellido: usuario?.perfil.apellido ?? '',
      correoElectronico: usuario?.correoElectronico ?? '',
      rol: usuario?.rol ?? '',
      contrasena: '',
      repetirContrasena: '',
    },
  })

  async function guardarUsuario(datos: UsuarioValidado) {
    if (!usuario && !datos.contrasena) {
      setError('contrasena', { message: 'La contraseña es obligatoria al crear el usuario.' })
      return
    }

    await onGuardar({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correoElectronico: datos.correoElectronico,
      ...(rolEditable && { rol: datos.rol || usuario?.rol || 'administrativo' }),
      ...(datos.contrasena ? { contrasena: datos.contrasena } : {}),
    })
  }

  return (
    <form
      id="usuario-form"
      className="admin-form admin-form--modal usuario-form"
      onSubmit={handleSubmit(guardarUsuario)}
      noValidate
      aria-labelledby="usuario-form-title"
    >
      <div className="admin-form__heading">
        <p id="usuario-form-title" className="admin-form__title">
          {usuario ? `Editar ${usuario.perfil.nombre} ${usuario.perfil.apellido}` : 'Formulario de carga de usuario'}
        </p>
        <p className="admin-form__hint">El correo electrónico también será el usuario de acceso.</p>
      </div>

      <div className="admin-form__grid usuario-form__grid">
        <div className="admin-form__field">
          <label htmlFor="usuario-nombre">Nombre</label>
          <input
            id="usuario-nombre"
            autoComplete="given-name"
            {...register('nombre')}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby={errors.nombre ? 'usuario-nombre-error' : undefined}
          />
          {errors.nombre ? (
            <span id="usuario-nombre-error" className="admin-form__error" role="alert">
              {errors.nombre.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="usuario-apellido">Apellido</label>
          <input
            id="usuario-apellido"
            autoComplete="family-name"
            {...register('apellido')}
            aria-invalid={Boolean(errors.apellido)}
            aria-describedby={errors.apellido ? 'usuario-apellido-error' : undefined}
          />
          {errors.apellido ? (
            <span id="usuario-apellido-error" className="admin-form__error" role="alert">
              {errors.apellido.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="usuario-correo">Email</label>
          <input
            id="usuario-correo"
            type="email"
            autoComplete="email"
            {...register('correoElectronico')}
            aria-invalid={Boolean(errors.correoElectronico)}
            aria-describedby={errors.correoElectronico ? 'usuario-correo-error' : undefined}
          />
          {errors.correoElectronico ? (
            <span id="usuario-correo-error" className="admin-form__error" role="alert">
              {errors.correoElectronico.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="usuario-rol">Rol</label>
          <select
            id="usuario-rol"
            {...register('rol')}
            disabled={!rolEditable}
            aria-invalid={Boolean(errors.rol)}
            aria-describedby={errors.rol ? 'usuario-rol-error' : undefined}
          >
            <option value="">Seleccionar rol</option>
            <option value="admin">Administrador</option>
            <option value="administrativo">Administrativo</option>
          </select>
          {errors.rol ? (
            <span id="usuario-rol-error" className="admin-form__error" role="alert">
              {errors.rol.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="usuario-contrasena">{usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
          <input
            id="usuario-contrasena"
            type="password"
            autoComplete="new-password"
            {...register('contrasena')}
            aria-invalid={Boolean(errors.contrasena)}
            aria-describedby={errors.contrasena ? 'usuario-contrasena-error' : undefined}
          />
          {errors.contrasena ? (
            <span id="usuario-contrasena-error" className="admin-form__error" role="alert">
              {errors.contrasena.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="usuario-repetir-contrasena">Repetir contraseña</label>
          <input
            id="usuario-repetir-contrasena"
            type="password"
            autoComplete="new-password"
            {...register('repetirContrasena')}
            aria-invalid={Boolean(errors.repetirContrasena)}
            aria-describedby={errors.repetirContrasena ? 'usuario-repetir-contrasena-error' : undefined}
          />
          {errors.repetirContrasena ? (
            <span id="usuario-repetir-contrasena-error" className="admin-form__error" role="alert">
              {errors.repetirContrasena.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="admin-form__actions">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}