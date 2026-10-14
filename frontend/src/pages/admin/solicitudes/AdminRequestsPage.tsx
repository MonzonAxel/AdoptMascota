import { Check, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AdminDialog } from '@/components/AdminDialog/AdminDialog'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import { useAdminDialog } from '@/hooks/useAdminDialog'
import type { EstadoSolicitud } from '@/types/solicitud'
import { formatearFecha } from '@/utils/formatearFecha'
import { solicitudesService } from '@/services/solicitudesService'

import './AdminRequestsPage.css'

const etiquetasEstado: Record<EstadoSolicitud, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  en_revision: { label: 'En revisión', tone: 'warning' },
  aprobada: { label: 'Aprobada', tone: 'success' },
  rechazada: { label: 'Rechazada', tone: 'danger' },
}

export function AdminRequestsPage() {
  const queryClient = useQueryClient()
  const feedback = useAdminDialog()
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoSolicitud | 'todos'>('todos')
  const [pagina, setPagina] = useState(1)
  const solicitudesQuery = useQuery({
    queryKey: ['solicitudes', estadoFiltro, pagina],
    queryFn: () => solicitudesService.listar({
      estado: estadoFiltro === 'todos' ? undefined : estadoFiltro,
      page: pagina,
      limit: 20,
    }),
  })
  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoSolicitud }) =>
      solicitudesService.actualizarEstado(id, { estado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solicitudes'] }),
  })
  const solicitudes = solicitudesQuery.data?.items ?? []

  function confirmarCambioEstado(id: number, nombre: string, estado: 'aprobada' | 'rechazada') {
    const accion = etiquetasEstado[estado].label.toLowerCase()
    feedback.showConfirmation(
      `¿${estado === 'aprobada' ? 'Aprobar' : 'Rechazar'} solicitud?`,
      `Vas a ${accion} la solicitud de ${nombre}. Esta decisión cambiará la disponibilidad de la mascota.`,
      async () => {
        try {
          await estadoMutation.mutateAsync({ id, estado })
          feedback.showSuccess(`Solicitud ${accion}`, 'El estado y la disponibilidad de la mascota se actualizaron.')
        } catch (error) {
          feedback.showError('No se pudo cambiar el estado', error, 'Revisá el estado actual e intentá nuevamente.')
        }
      },
      estado === 'aprobada' ? 'Aprobar solicitud' : 'Rechazar solicitud',
    )
  }

  return (
    <div className="admin-page admin-requests-page">
      <PageHeader
        kicker="Administracion"
        title="Solicitudes"
        description="Revisa y acompaña las solicitudes de quienes quieren adoptar."
      />
      <div className="admin-requests-page__toolbar">
        <label htmlFor="filtro-estado-solicitud">Estado</label>
        <select
          id="filtro-estado-solicitud"
          value={estadoFiltro}
          onChange={(evento) => {
            setEstadoFiltro(evento.target.value as EstadoSolicitud | 'todos')
            setPagina(1)
          }}
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>
      {solicitudesQuery.isError ? (
        <p role="alert">{solicitudesQuery.error.message}</p>
      ) : null}
      <section className="admin-table-wrap" aria-label="Solicitudes de adopcion">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Mascota</th>
              <th>Recibida</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {solicitudesQuery.isLoading ? (
              <tr><td colSpan={5}>Cargando solicitudes...</td></tr>
            ) : solicitudes.length === 0 ? (
              <tr><td colSpan={5}>No hay solicitudes para este filtro.</td></tr>
            ) : solicitudes.map((solicitud) => {
              const estado = etiquetasEstado[solicitud.estado]

              return (
                <tr key={solicitud.id}>
                  <td>
                    <strong>{solicitud.nombre_apellido}</strong>
                    <span>{solicitud.id}</span>
                  </td>
                  <td>{solicitud.mascota?.nombre ?? 'Mascota no disponible'}</td>
                  <td>{formatearFecha(solicitud.creado)}</td>
                  <td>
                    <StatusBadge label={estado.label} tone={estado.tone} />
                  </td>
                  <td>
                    <div className="admin-requests-page__actions">
                      <Button asChild variant="outline" className="admin-requests-page__view">
                        <Link
                          to={`/admin/solicitudes/${solicitud.id}`}
                          aria-label={`Ver solicitud de ${solicitud.nombre_apellido}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                          Ver
                        </Link>
                      </Button>
                      {solicitud.estado === 'pendiente' || solicitud.estado === 'en_revision' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Aprobar solicitud"
                            disabled={estadoMutation.isPending}
                            onClick={() => confirmarCambioEstado(solicitud.id, solicitud.nombre_apellido, 'aprobada')}
                          >
                            <Check size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Rechazar solicitud"
                            disabled={estadoMutation.isPending}
                            onClick={() => confirmarCambioEstado(solicitud.id, solicitud.nombre_apellido, 'rechazada')}
                          >
                            <X size={16} aria-hidden="true" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
      <div className="admin-requests-page__pagination">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Página anterior"
          disabled={pagina <= 1 || solicitudesQuery.isFetching}
          onClick={() => setPagina((actual) => actual - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        <span>Página {solicitudesQuery.data?.page ?? pagina} de {solicitudesQuery.data?.totalPages ?? 1}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Página siguiente"
          disabled={pagina >= (solicitudesQuery.data?.totalPages ?? 1) || solicitudesQuery.isFetching}
          onClick={() => setPagina((actual) => actual + 1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
      {feedback.dialog ? (
        <AdminDialog open {...feedback.dialog} onClose={feedback.closeDialog} />
      ) : null}
    </div>
  )
}
