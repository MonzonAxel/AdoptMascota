import { ArrowLeft, PawPrint } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AdminDialog } from '@/components/AdminDialog/AdminDialog'
import { Button } from '@/components/Button/Button'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import type { EstadoSolicitud } from '@/types/solicitud'
import { useAdminDialog } from '@/hooks/useAdminDialog'
import { solicitudesService } from '@/services/solicitudesService'
import { formatearFecha } from '@/utils/formatearFecha'

import './AdminRequestDetailPage.css'

const etiquetasEstado: Record<EstadoSolicitud, { etiqueta: string; tono: 'success' | 'warning' | 'danger' }> = {
  pendiente: { etiqueta: 'Pendiente', tono: 'warning' },
  en_revision: { etiqueta: 'En revisión', tono: 'warning' },
  aprobada: { etiqueta: 'Aprobada', tono: 'success' },
  rechazada: { etiqueta: 'Rechazada', tono: 'danger' },
}

const transicionesPermitidas: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  pendiente: ['pendiente', 'en_revision', 'aprobada', 'rechazada'],
  en_revision: ['en_revision', 'pendiente', 'aprobada', 'rechazada'],
  aprobada: ['aprobada'],
  rechazada: ['rechazada'],
}

type CampoSolicitudProps = {
  titulo: string
  valor: string
  anchoCompleto?: boolean
}

function CampoSolicitud({ titulo, valor, anchoCompleto = false }: CampoSolicitudProps) {
  return (
    <div className={`solicitud-detail__field${anchoCompleto ? ' solicitud-detail__field--wide' : ''}`}>
      <span>{titulo}</span>
      <p>{valor || 'No informado'}</p>
    </div>
  )
}

export function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const solicitudId = Number(id)
  const queryClient = useQueryClient()
  const feedback = useAdminDialog()
  const [estadoEditado, setEstadoEditado] = useState<EstadoSolicitud | null>(null)
  const [textoObservacion, setTextoObservacion] = useState('')
  const solicitudQuery = useQuery({
    queryKey: ['solicitud', solicitudId],
    queryFn: () => solicitudesService.obtenerPorId(solicitudId),
    enabled: Number.isInteger(solicitudId) && solicitudId > 0,
  })
  const solicitud = solicitudQuery.data
  const estadoSeleccionado = estadoEditado ?? solicitud?.estado ?? 'pendiente'
  const estadoEsFinal = solicitud?.estado === 'aprobada' || solicitud?.estado === 'rechazada'
  const estadoMutation = useMutation({
    mutationFn: () => solicitudesService.actualizarEstado(solicitudId, { estado: estadoSeleccionado }),
    onSuccess: (solicitudActualizada) => {
      setEstadoEditado(null)
      queryClient.setQueryData(['solicitud', solicitudId], solicitudActualizada)
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
    },
  })
  const observacionMutation = useMutation({
    mutationFn: () => solicitudesService.agregarObservacion(solicitudId, { observacion: textoObservacion.trim() }),
    onSuccess: () => {
      setTextoObservacion('')
      queryClient.invalidateQueries({ queryKey: ['solicitud', solicitudId] })
    },
  })

  function confirmarCambioEstado() {
    if (!solicitud || estadoSeleccionado === solicitud.estado) return
    const nuevoEstado = etiquetasEstado[estadoSeleccionado].etiqueta
    feedback.showConfirmation(
      `¿Cambiar a ${nuevoEstado.toLowerCase()}?`,
      `La solicitud de ${solicitud.nombre_apellido} cambiará de ${etiquetasEstado[solicitud.estado].etiqueta.toLowerCase()} a ${nuevoEstado.toLowerCase()}.`,
      async () => {
        try {
          await estadoMutation.mutateAsync()
          feedback.showSuccess('Estado actualizado', `La solicitud ahora está ${nuevoEstado.toLowerCase()}.`)
        } catch (error) {
          feedback.showError('No se pudo cambiar el estado', error, 'Revisá el estado actual e intentá nuevamente.')
        }
      },
      'Confirmar cambio',
      estadoSeleccionado === 'aprobada' ? 'success' : estadoSeleccionado === 'rechazada' ? 'error' : 'warning',
    )
  }

  async function guardarObservacion() {
    try {
      await observacionMutation.mutateAsync()
      feedback.showSuccess('Observación agregada', 'La nota quedó guardada en el seguimiento de la solicitud.')
    } catch (error) {
      feedback.showError('No se pudo agregar la observación', error, 'Revisá el texto e intentá nuevamente.')
    }
  }

  if (solicitudQuery.isLoading) {
    return <p role="status">Cargando solicitud...</p>
  }

  if (solicitudQuery.isError) {
    return <section role="alert">{solicitudQuery.error.message}</section>
  }

  if (!solicitud) {
    return (
      <section className="solicitud-detail solicitud-detail--missing">
        <p className="page-kicker">Solicitud no encontrada</p>
        <h1 className="page-title">No encontramos esa solicitud.</h1>
        <Link className="solicitud-detail__back" to="/admin/solicitudes">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a solicitudes
        </Link>
      </section>
    )
  }

  const estadoActualizado = etiquetasEstado[estadoSeleccionado]
  const fotoPrincipal = solicitud.mascota?.foto_principal

  return (
    <section className="solicitud-detail" aria-labelledby="solicitud-detail-title">
      <Link className="solicitud-detail__back" to="/admin/solicitudes">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a solicitudes
      </Link>

      <div className="solicitud-detail__heading">
        <div>
          <p className="page-kicker">Detalle de la solicitud</p>
          <h1 id="solicitud-detail-title" className="solicitud-detail__title">
            Solicitud #{solicitud.id}
          </h1>
          <p className="solicitud-detail__received">
            Recibida el {formatearFecha(solicitud.creado)}
          </p>
        </div>
        <div className="solicitud-detail__status-control">
          <label htmlFor="solicitud-estado">Estado:</label>
          <select
            id="solicitud-estado"
            value={estadoSeleccionado}
            disabled={estadoEsFinal || estadoMutation.isPending}
            onChange={(evento) => {
              setEstadoEditado(evento.target.value as EstadoSolicitud)
            }}
          >
            {transicionesPermitidas[solicitud.estado].map((estado) => (
              <option key={estado} value={estado}>{etiquetasEstado[estado].etiqueta}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="solicitud-detail__animal">
        <div className="solicitud-detail__animal-image">
          {fotoPrincipal ? (
            <img src={fotoPrincipal} alt={`Foto de ${solicitud.mascota?.nombre ?? 'la mascota'}`} />
          ) : (
            <PawPrint size={25} aria-hidden="true" />
          )}
        </div>
        <div className="solicitud-detail__animal-copy">
          <span>Mascota solicitada</span>
          <strong>{solicitud.mascota?.nombre ?? 'Mascota no disponible'}</strong>
          {solicitud.mascota ? <small>{solicitud.mascota.especie}</small> : null}
        </div>
        <StatusBadge label={estadoActualizado.etiqueta} tone={estadoActualizado.tono} />
      </div>

      <div className="solicitud-detail__grid">
        <CampoSolicitud titulo="Nombre y apellido" valor={solicitud.nombre_apellido} />
        <CampoSolicitud titulo="DNI" valor={solicitud.dni ?? 'No informado'} />
        <CampoSolicitud titulo="Edad" valor={`${solicitud.edad} años`} />
        <CampoSolicitud titulo="Email" valor={solicitud.email} />
        <CampoSolicitud titulo="Teléfono celular" valor={solicitud.telefono_celular} />
        <CampoSolicitud titulo="Teléfono fijo" valor={solicitud.telefono_fijo ?? 'No informado'} />
        <CampoSolicitud titulo="Ocupación" valor={solicitud.ocupacion} />
        <CampoSolicitud titulo="Zona de residencia" valor={solicitud.localidad_barrio} />
        <CampoSolicitud titulo="Dirección" valor={solicitud.direccion} />
        <CampoSolicitud
          titulo="Tipo de tenencia"
          valor={solicitud.tipo_tenencia === 'propietario' ? 'Propietario' : 'Inquilino'}
        />
        <CampoSolicitud
          titulo="Tipo de vivienda"
          valor={{ casa: 'Casa', departamento: 'Departamento', ph: 'PH', otro: 'Otro' }[solicitud.vivienda]}
        />
        <CampoSolicitud
          titulo="¿Permite animales?"
          valor={solicitud.permite_animales === null ? 'No informado' : solicitud.permite_animales ? 'Sí' : 'No'}
        />
        <CampoSolicitud titulo="Frecuencia de paseo" valor={solicitud.frecuencia_paseo} />
        <CampoSolicitud
          titulo="Detalle de la vivienda"
          valor={solicitud.detalle_vivienda}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Personas que habitan el hogar y edades"
          valor={solicitud.personas_hogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Niños en el hogar"
          valor={solicitud.hay_ninos_hogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Otros animales en el hogar"
          valor={solicitud.otros_animales_hogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Cuidador durante las vacaciones"
          valor={solicitud.cuidador_vacaciones}
          anchoCompleto
        />
        {solicitud.fecha_resolucion ? (
          <CampoSolicitud
            titulo="Fecha de resolución"
            valor={formatearFecha(solicitud.fecha_resolucion)}
            anchoCompleto
          />
        ) : null}
      </div>

      <section className="solicitud-detail__notes" aria-labelledby="observaciones-title">
        <div className="solicitud-detail__section-heading">
          <div>
            <p className="page-kicker">Seguimiento interno</p>
            <h2 id="observaciones-title">Observaciones</h2>
          </div>
          <span>{solicitud.observaciones.length}</span>
        </div>
        {solicitud.observaciones.length ? (
          <div className="solicitud-detail__note-list">
            {solicitud.observaciones.map((observacion) => (
              <article className="solicitud-detail__note" key={observacion.id}>
                <p>{observacion.observacion}</p>
                <small>{observacion.autor?.nombre ?? 'Personal'} · {formatearFecha(observacion.creado)}</small>
              </article>
            ))}
          </div>
        ) : <p className="solicitud-detail__notes-empty">Todavía no hay observaciones.</p>}
        <div className="solicitud-detail__note-form">
          <label htmlFor="observacion-nueva">Agregar observación</label>
          <textarea
            id="observacion-nueva"
            rows={3}
            value={textoObservacion}
            onChange={(evento) => setTextoObservacion(evento.target.value)}
            placeholder="Dejá una nota útil para el seguimiento del caso."
          />
          <Button
            type="button"
            variant="outline"
            disabled={!textoObservacion.trim() || observacionMutation.isPending}
            onClick={guardarObservacion}
          >
            {observacionMutation.isPending ? 'Guardando...' : 'Agregar observación'}
          </Button>
        </div>
      </section>

      <section aria-labelledby="historial-title">
        <h2 id="historial-title">Historial</h2>
        {solicitud.historial.map((cambio) => (
          <p key={cambio.id}>
            {cambio.campo ?? cambio.accion}: {cambio.valor_antiguo ?? '—'} → {cambio.valor_actual ?? '—'}
            {' · '}{formatearFecha(cambio.creado)}
          </p>
        ))}
      </section>

      <div className="solicitud-detail__actions">
        <Button
          type="button"
          disabled={estadoMutation.isPending || estadoEsFinal || estadoSeleccionado === solicitud.estado}
          onClick={confirmarCambioEstado}
        >
          {estadoMutation.isPending ? 'Guardando...' : 'Guardar estado'}
        </Button>
      </div>
      {feedback.dialog ? (
        <AdminDialog open {...feedback.dialog} onClose={feedback.closeDialog} />
      ) : null}
    </section>
  )
}