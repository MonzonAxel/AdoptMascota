import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { AnimalForm } from '@/components/AnimalForm/AnimalForm'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
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
    mutationFn: ({ datos, fotos }: { datos: DatosCrearAnimal; fotos: File[] }) =>
      animalesService.crear(datos, fotos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
  })
  const actualizarMutation = useMutation({
    mutationFn: async ({ id, datos, fotos }: { id: number; datos: DatosCrearAnimal; fotos: File[] }) => {
      let animal = await animalesService.actualizar(id, datos)
      if (fotos.length) animal = await animalesService.agregarFotos(id, fotos)
      return animal
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
  })
  const principalMutation = useMutation({
    mutationFn: ({ animalId, fotoId }: { animalId: number; fotoId: number }) =>
      animalesService.establecerFotoPrincipal(animalId, fotoId),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['mascota', variables.animalId] }),
  })
  const eliminarFotoMutation = useMutation({
    mutationFn: ({ animalId, fotoId }: { animalId: number; fotoId: number }) =>
      animalesService.eliminarFoto(animalId, fotoId),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['mascota', variables.animalId] }),
  })
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => animalesService.darDeBaja(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
  })
  const animales = animalesQuery.data?.items ?? []
  const animalEnEdicion = detalleQuery.data

  async function guardarAnimal(datos: DatosCrearAnimal, fotos: File[]) {
    setMensajeError('')
    try {
      if (animalEnEdicionId === null) await crearMutation.mutateAsync({ datos, fotos })
      else await actualizarMutation.mutateAsync({ id: animalEnEdicionId, datos, fotos })
      setMostrarFormulario(false)
      setAnimalEnEdicionId(null)
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo guardar la mascota.')
    }
  }

  async function marcarFotoPrincipal(fotoId: number) {
    if (animalEnEdicionId === null) return
    try {
      await principalMutation.mutateAsync({ animalId: animalEnEdicionId, fotoId })
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo actualizar la foto principal.')
    }
  }

  async function eliminarFoto(fotoId: number) {
    if (animalEnEdicionId === null) return
    try {
      await eliminarFotoMutation.mutateAsync({ animalId: animalEnEdicionId, fotoId })
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo eliminar la foto.')
    }
  }

  function confirmarBaja(id: number, nombre: string) {
    if (window.confirm(`¿Dar de baja a ${nombre}?`)) eliminarMutation.mutate(id)
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
        animalEnEdicionId !== null && detalleQuery.isLoading ? (
          <p role="status">Cargando mascota...</p>
        ) : animalEnEdicionId !== null && detalleQuery.isError ? (
          <p role="alert">{detalleQuery.error.message}</p>
        ) : (
          <AnimalForm
            key={animalEnEdicionId ?? 'nueva'}
            animal={animalEnEdicionId === null ? undefined : animalEnEdicion}
            onGuardar={guardarAnimal}
            onFotoPrincipal={marcarFotoPrincipal}
            onEliminarFoto={eliminarFoto}
            onCancelar={cancelarFormulario}
          />
        )
      ) : null}
      {mensajeError ? <p role="alert">{mensajeError}</p> : null}
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
      <div className="admin-pets-page__pagination">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Página anterior"
          disabled={pagina <= 1 || animalesQuery.isFetching}
          onClick={() => setPagina((actual) => actual - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        <span>Página {animalesQuery.data?.page ?? pagina} de {animalesQuery.data?.totalPages ?? 1}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Página siguiente"
          disabled={pagina >= (animalesQuery.data?.totalPages ?? 1) || animalesQuery.isFetching}
          onClick={() => setPagina((actual) => actual + 1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
