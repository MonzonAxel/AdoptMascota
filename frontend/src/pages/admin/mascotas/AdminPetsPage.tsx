import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { AdminDialog } from '@/components/AdminDialog/AdminDialog'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import { AdminPagination } from '@/pages/admin/components/AdminPagination'
import { AnimalForm } from '@/pages/admin/components/forms/AnimalForm'
import { useAdminDialog } from '@/hooks/useAdminDialog'
import type { DatosCrearAnimal, EstadoAnimal } from '@/types/animal'
import { animalesService } from '@/services/animalesService'
import {
  formatearEdad,
  formatearEspecie,
  formatearEstadoAnimal,
  formatearTamano,
} from '@/utils/formateadoresAnimal'

import './AdminPetsPage.css'

export function AdminPetsPage() {
  const queryClient = useQueryClient()
  const feedback = useAdminDialog()
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoAnimal | 'todos'>('todos')
  const [pagina, setPagina] = useState(1)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [animalEnEdicionId, setAnimalEnEdicionId] = useState<number | null>(null)
  const [mensajeError, setMensajeError] = useState('')
  const animalesQuery = useQuery({
    queryKey: ['mascotas', 'admin', estadoFiltro, pagina],
    queryFn: () => animalesService.listar({
      estado: estadoFiltro === 'todos' ? undefined : estadoFiltro,
      page: pagina,
      limit: 20,
    }),
  })
  const detalleQuery = useQuery({
    queryKey: ['mascota', animalEnEdicionId],
    queryFn: () => animalesService.obtenerPorId(animalEnEdicionId as number),
    enabled: animalEnEdicionId !== null,
  })
  const crearMutation = useMutation({
    mutationFn: ({ datos, fotos, indiceFotoPrincipal }: {
      datos: DatosCrearAnimal
      fotos: File[]
      indiceFotoPrincipal: number | null
    }) => animalesService.crear(datos, fotos, indiceFotoPrincipal),
    onSuccess: (animal) => {
      queryClient.setQueryData(['mascota', animal.id], animal)
      return queryClient.invalidateQueries({ queryKey: ['mascotas'] })
    },
  })
  const actualizarMutation = useMutation({
    mutationFn: async ({
      id,
      datos,
      fotos,
      indiceFotoPrincipal,
      fotoPrincipalId,
      fotosAEliminar,
    }: {
      id: number
      datos: DatosCrearAnimal
      fotos: File[]
      indiceFotoPrincipal: number | null
      fotoPrincipalId: number | null
      fotosAEliminar: number[]
    }) => {
      let animal = await animalesService.actualizar(id, datos)
      if (fotos.length) {
        animal = await animalesService.agregarFotos(id, fotos, indiceFotoPrincipal)
      }
      for (const fotoId of fotosAEliminar) {
        animal = await animalesService.eliminarFoto(id, fotoId)
      }
      if (fotoPrincipalId !== null) {
        animal = await animalesService.establecerFotoPrincipal(id, fotoPrincipalId)
      }
      return animal
    },
    onSuccess: (animal, variables) => {
      queryClient.setQueryData(['mascota', variables.id], animal)
      return queryClient.invalidateQueries({ queryKey: ['mascotas'] })
    },
  })
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => animalesService.darDeBaja(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
  })
  const animales = animalesQuery.data?.items ?? []
  const animalEnEdicion = detalleQuery.data

  async function guardarAnimal(
    datos: DatosCrearAnimal,
    fotos: File[],
    fotoPrincipalId: number | null,
    indiceFotoPrincipal: number | null,
    fotosAEliminar: number[],
  ) {
    setMensajeError('')
    const esEdicion = animalEnEdicionId !== null
    try {
      if (animalEnEdicionId === null) {
        await crearMutation.mutateAsync({ datos, fotos, indiceFotoPrincipal })
      } else {
        await actualizarMutation.mutateAsync({
          id: animalEnEdicionId,
          datos,
          fotos,
          fotoPrincipalId,
          indiceFotoPrincipal,
          fotosAEliminar,
        })
      }
      setMostrarFormulario(false)
      setAnimalEnEdicionId(null)
      feedback.showSuccess(
        esEdicion ? 'Mascota actualizada' : 'Mascota creada',
        esEdicion ? 'Los cambios se guardaron correctamente.' : 'La mascota ya está disponible para su gestión.',
      )
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo guardar la mascota.')
    }
  }

  function confirmarBaja(id: number, nombre: string) {
    feedback.showConfirmation(
      'Confirmar baja de mascota',
      `¿Querés dar de baja a ${nombre}? Esta acción la retirará del catálogo.`,
      async () => {
        try {
          await eliminarMutation.mutateAsync(id)
          feedback.showSuccess('Mascota dada de baja', `${nombre} ya no aparece en el catálogo.`)
        } catch (error) {
          feedback.showError(
            'No se pudo dar de baja',
            error,
            'La mascota podría tener solicitudes de adopción activas. Resolvelas antes de intentar nuevamente.',
          )
        }
      },
      'Dar de baja',
      'error',
    )
  }

  function cancelarFormulario() {
    setMostrarFormulario(false)
    setAnimalEnEdicionId(null)
    setMensajeError('')
  }

  return (
    <div className="admin-page admin-pets-page">
      <div className="admin-page__heading-row">
        <PageHeader
          kicker="Administracion"
          title="Mascotas"
          description="Consulta los perfiles cargados y prepara nuevas publicaciones."
        />
        <Button
          type="button"
          aria-expanded={mostrarFormulario}
          aria-controls="animal-form"
          onClick={() => {
            if (mostrarFormulario) cancelarFormulario()
            else {
              setAnimalEnEdicionId(null)
              setMostrarFormulario(true)
            }
          }}
        >
          {mostrarFormulario ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {mostrarFormulario ? 'Cerrar formulario' : 'Nueva mascota'}
        </Button>
      </div>
      {mostrarFormulario ? (
        <AdminDialog
          open
          variant={mensajeError ? 'error' : 'form'}
          title={mensajeError ? 'No se pudo guardar la mascota' : animalEnEdicion ? `Editar ${animalEnEdicion.nombre}` : 'Nueva mascota'}
          message={mensajeError || 'Completá los datos del perfil y, si corresponde, agregá fotos.'}
          onClose={cancelarFormulario}
          size="wide"
        >
          {animalEnEdicionId !== null && detalleQuery.isLoading ? (
            <p role="status">Cargando mascota...</p>
          ) : animalEnEdicionId !== null && detalleQuery.isError ? (
            <p role="alert">{detalleQuery.error.message}</p>
          ) : (
            <AnimalForm
              key={animalEnEdicionId ?? 'nueva'}
              animal={animalEnEdicionId === null ? undefined : animalEnEdicion}
              onGuardar={guardarAnimal}
              onCancelar={cancelarFormulario}
            />
          )}
        </AdminDialog>
      ) : null}
      {animalesQuery.isError ? <p role="alert">{animalesQuery.error.message}</p> : null}
      {eliminarMutation.isError ? <p role="alert">{eliminarMutation.error.message}</p> : null}
      <div className="admin-pets-page__toolbar">
        <label htmlFor="filtro-estado-mascota">Estado</label>
        <select
          id="filtro-estado-mascota"
          value={estadoFiltro}
          onChange={(evento) => {
            setEstadoFiltro(evento.target.value as EstadoAnimal | 'todos')
            setPagina(1)
          }}
        >
          <option value="todos">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="en_proceso">En proceso</option>
          <option value="adoptado">Adoptado</option>
        </select>
      </div>
      <section className="admin-table-wrap" aria-label="Listado de mascotas">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Especie</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Fotos</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {animalesQuery.isLoading ? (
              <tr><td colSpan={6}>Cargando mascotas...</td></tr>
            ) : animales.length === 0 ? (
              <tr><td colSpan={6}>No hay mascotas para este filtro.</td></tr>
            ) : animales.map((animal) => (
              <tr key={animal.id}>
                <td>
                  <strong>{animal.nombre}</strong>
                  <span>{formatearEdad(animal.edad)}</span>
                </td>
                <td>{formatearEspecie(animal.especie)}</td>
                <td>{formatearTamano(animal.tamano)}</td>
                <td>
                  <StatusBadge
                    label={formatearEstadoAnimal(animal.estado)}
                    tone={
                      animal.estado === 'disponible'
                        ? 'success'
                        : animal.estado === 'en_proceso'
                          ? 'warning'
                          : 'neutral'
                    }
                  />
                </td>
                <td>{animal.fotos.length}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${animal.nombre}`}
                    onClick={() => {
                      setMensajeError('')
                      setAnimalEnEdicionId(animal.id)
                      setMostrarFormulario(true)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Dar de baja a ${animal.nombre}`}
                    disabled={eliminarMutation.isPending}
                    onClick={() => confirmarBaja(animal.id, animal.nombre)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <AdminPagination
        pagina={animalesQuery.data?.page ?? pagina}
        totalPaginas={animalesQuery.data?.totalPages ?? 1}
        cargando={animalesQuery.isFetching}
        onCambiarPagina={setPagina}
      />
      {feedback.dialog ? (
        <AdminDialog open {...feedback.dialog} onClose={feedback.closeDialog} />
      ) : null}
    </div>
  )
}
