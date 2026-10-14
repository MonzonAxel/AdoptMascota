import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '@/components/Button/Button'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { UsuarioForm } from '@/components/UsuarioForm/UsuarioForm'
import { useAuth } from '@/hooks/useAuth'
import { usuariosService } from '@/services/usuariosService'
import type { DatosActualizarUsuario, DatosCrearUsuario, Usuario } from '@/types/usuario'

import './AdminUsersPage.css'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { usuario: usuarioActual } = useAuth()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null)
  const [mensajeError, setMensajeError] = useState('')
  const usuariosQuery = useQuery({ queryKey: ['usuarios'], queryFn: () => usuariosService.listar() })
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
  const usuarios = usuariosQuery.data ?? []
  const mutando = crearMutation.isPending || actualizarMutation.isPending

  async function guardarUsuario(datos: DatosCrearUsuario | DatosActualizarUsuario) {
    setMensajeError('')
    try {
      if (usuarioEnEdicion) {
        await actualizarMutation.mutateAsync({ id: usuarioEnEdicion.id, datos })
      } else {
        await crearMutation.mutateAsync(datos as DatosCrearUsuario)
      }
      setMostrarFormulario(false)
      setUsuarioEnEdicion(null)
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
    if (window.confirm(`¿Dar de baja a ${usuario.perfil.nombre} ${usuario.perfil.apellido}?`)) {
      eliminarMutation.mutate(usuario.id)
    }
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
        <UsuarioForm
          usuario={usuarioEnEdicion ?? undefined}
          rolEditable={usuarioEnEdicion?.id !== usuarioActual?.id}
          onGuardar={guardarUsuario}
          onCancelar={cancelarFormulario}
        />
      ) : null}
      {mensajeError ? <p role="alert">{mensajeError}</p> : null}
      {usuariosQuery.isError ? <p role="alert">{usuariosQuery.error.message}</p> : null}
      {eliminarMutation.isError ? <p role="alert">{eliminarMutation.error.message}</p> : null}
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
              <tr><td colSpan={4}>No hay usuarios registrados.</td></tr>
            ) : usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <strong>{usuario.perfil.nombre} {usuario.perfil.apellido}</strong>
                  <span>{usuario.correoElectronico}</span>
                </td>
                <td>{usuario.rol === 'admin' ? 'Administrador' : 'Administrativo'}</td>
                <td><span>Activo</span></td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
