import { Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { AdminDialog } from '@/components/AdminDialog/AdminDialog'
import { Button } from '@/components/Button/Button'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { UsuarioForm } from '@/pages/admin/components/forms/UsuarioForm'
import { useAdminDialog } from '@/hooks/useAdminDialog'
import { useAuth } from '@/hooks/useAuth'
import { usuariosService } from '@/services/usuariosService'
import type { DatosActualizarUsuario, DatosCrearUsuario, Usuario } from '@/types/usuario'

import './AdminUsersPage.css'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const feedback = useAdminDialog()
  const { usuario: usuarioActual } = useAuth()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState<'activos' | 'inactivos'>('activos')
  const [mensajeError, setMensajeError] = useState('')
  const usuariosQuery = useQuery({
    queryKey: ['usuarios', estadoFiltro],
    queryFn: () => usuariosService.listar({ estado: estadoFiltro }),
  })
  const crearMutation = useMutation({
    mutationFn: (datos: DatosCrearUsuario) => usuariosService.crear(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
  const actualizarMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosActualizarUsuario }) =>
      usuariosService.actualizar(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => usuariosService.darDeBaja(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
  const reactivarMutation = useMutation({
    mutationFn: (id: number) => usuariosService.reactivar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
  const usuarios = usuariosQuery.data ?? []
  const mutando = crearMutation.isPending || actualizarMutation.isPending || reactivarMutation.isPending

  async function guardarUsuario(datos: DatosCrearUsuario | DatosActualizarUsuario) {
    setMensajeError('')
    const esEdicion = Boolean(usuarioEnEdicion)
    try {
      if (usuarioEnEdicion) {
        await actualizarMutation.mutateAsync({ id: usuarioEnEdicion.id, datos })
      } else {
        await crearMutation.mutateAsync(datos as DatosCrearUsuario)
      }
      setMostrarFormulario(false)
      setUsuarioEnEdicion(null)
      feedback.showSuccess(
        esEdicion ? 'Usuario actualizado' : 'Usuario creado',
        esEdicion ? 'Los cambios se guardaron correctamente.' : 'El usuario ya puede acceder con sus credenciales.',
      )
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo guardar el usuario.')
    }
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setUsuarioEnEdicion(null)
    setMensajeError('')
  }

  function confirmarBaja(usuario: Usuario) {
    if (usuario.id === usuarioActual?.id) return
    const nombre = `${usuario.perfil.nombre} ${usuario.perfil.apellido}`
    feedback.showConfirmation(
      'Confirmar baja de usuario',
      `¿Querés dar de baja a ${nombre}? Ya no podrá iniciar sesión.`,
      async () => {
        try {
          await eliminarMutation.mutateAsync(usuario.id)
          feedback.showSuccess('Usuario dado de baja', `${nombre} ya no tiene acceso al sistema.`)
        } catch (error) {
          feedback.showError('No se pudo dar de baja al usuario', error, 'Revisá los permisos y volvé a intentarlo.')
        }
      },
      'Dar de baja',
      'error',
    )
  }

  function confirmarReactivacion(usuario: Usuario) {
    const nombre = `${usuario.perfil.nombre} ${usuario.perfil.apellido}`
    feedback.showConfirmation(
      'Reactivar usuario',
      `¿Querés reactivar a ${nombre}? Volverá a poder iniciar sesión.`,
      async () => {
        try {
          await reactivarMutation.mutateAsync(usuario.id)
          feedback.showSuccess('Usuario reactivado', `${nombre} ya puede iniciar sesión nuevamente.`)
        } catch (error) {
          feedback.showError('No se pudo reactivar el usuario', error, 'Volvé a intentarlo en unos minutos.')
        }
      },
      'Reactivar usuario',
      'success',
    )
  }

  return (
    <div className="admin-page admin-users-page">
      <div className="admin-page__heading-row">
        <PageHeader
          kicker="Administracion"
          title="Usuarios"
          description="Administra las personas que colaboran con la gestion de adopciones."
        />
        <Button
          type="button"
          aria-expanded={mostrarFormulario}
          aria-controls="usuario-form"
          onClick={() => {
            if (mostrarFormulario) cancelarFormulario()
            else setMostrarFormulario(true)
          }}
        >
          {mostrarFormulario ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo usuario'}
        </Button>
      </div>
      {mostrarFormulario ? (
        <AdminDialog
          open
          variant={mensajeError ? 'error' : 'form'}
          title={mensajeError ? 'No se pudo guardar el usuario' : usuarioEnEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          message={mensajeError || 'Completá los datos de acceso y el rol correspondiente.'}
          onClose={cancelarFormulario}
          size="wide"
        >
          <UsuarioForm
            key={usuarioEnEdicion?.id ?? 'nuevo'}
            usuario={usuarioEnEdicion ?? undefined}
            rolEditable={usuarioEnEdicion?.id !== usuarioActual?.id}
            onGuardar={guardarUsuario}
            onCancelar={cancelarFormulario}
          />
        </AdminDialog>
      ) : null}
      {usuariosQuery.isError ? <p role="alert">{usuariosQuery.error.message}</p> : null}
      {eliminarMutation.isError ? <p role="alert">{eliminarMutation.error.message}</p> : null}
      <div className="admin-users-page__status-filter" role="group" aria-label="Filtrar usuarios por estado">
        <Button
          type="button"
          variant={estadoFiltro === 'activos' ? 'default' : 'outline'}
          aria-pressed={estadoFiltro === 'activos'}
          onClick={() => setEstadoFiltro('activos')}
        >
          Activos
        </Button>
        <Button
          type="button"
          variant={estadoFiltro === 'inactivos' ? 'default' : 'outline'}
          aria-pressed={estadoFiltro === 'inactivos'}
          onClick={() => setEstadoFiltro('inactivos')}
        >
          Dados de baja
        </Button>
      </div>
      <section className="admin-table-wrap" aria-label="Usuarios administrativos">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {usuariosQuery.isLoading ? (
              <tr><td colSpan={4}>Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={4}>{estadoFiltro === 'activos' ? 'No hay usuarios activos.' : 'No hay usuarios dados de baja.'}</td></tr>
            ) : usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <strong>{usuario.perfil.nombre} {usuario.perfil.apellido}</strong>
                  <span>{usuario.correoElectronico}</span>
                </td>
                <td>{usuario.rol === 'admin' ? 'Administrador' : 'Administrativo'}</td>
                <td>
                  <span className={`admin-users-page__status${usuario.eliminadoEn ? ' admin-users-page__status--inactive' : ''}`}>
                    {usuario.eliminadoEn ? 'Dado de baja' : 'Activo'}
                  </span>
                </td>
                <td>
                  {usuario.eliminadoEn ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Reactivar a ${usuario.perfil.nombre} ${usuario.perfil.apellido}`}
                      disabled={reactivarMutation.isPending}
                      onClick={() => confirmarReactivacion(usuario)}
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${usuario.perfil.nombre} ${usuario.perfil.apellido}`}
                        disabled={mutando}
                        onClick={() => {
                          setMensajeError('')
                          setUsuarioEnEdicion(usuario)
                          setMostrarFormulario(true)
                        }}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Dar de baja a ${usuario.perfil.nombre} ${usuario.perfil.apellido}`}
                        disabled={usuario.id === usuarioActual?.id || eliminarMutation.isPending}
                        onClick={() => confirmarBaja(usuario)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {feedback.dialog ? (
        <AdminDialog open {...feedback.dialog} onClose={feedback.closeDialog} />
      ) : null}
    </div>
  )
}
