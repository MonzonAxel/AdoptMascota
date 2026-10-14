import { ArrowLeft, PawPrint } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/Button/Button'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import type { EstadoSolicitud } from '@/types/solicitud'
import { solicitudesService } from '@/services/solicitudesService'
import { formatearFecha } from '@/utils/formatearFecha'

import './AdminRequestDetailPage.css'

const etiquetasEstado: Record<EstadoSolicitud, { etiqueta: string; tono: 'success' | 'warning' | 'danger' }> = {
  pendiente: { etiqueta: 'Pendiente', tono: 'warning' },
  en_revision: { etiqueta: 'En revisión', tono: 'warning' },
  aprobada: { etiqueta: 'Aprobada', tono: 'success' },
  rechazada: { etiqueta: 'Rechazada', tono: 'danger' },
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
  const [estadoEditado, setEstadoEditado] = useState<EstadoSolicitud | null>(null)
  const [textoObservacion, setTextoObservacion] = useState('')
  const solicitudQuery = useQuery({
    queryKey: ['solicitud', solicitudId],
    queryFn: () => solicitudesService.obtenerPorId(solicitudId),
    enabled: Number.isInteger(solicitudId) && solicitudId > 0,
  })
  const solicitud = solicitudQuery.data
  const estadoSeleccionado = estadoEditado ?? solicitud?.estado ?? 'pendiente'
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
            onChange={(evento) => {
              setEstadoEditado(evento.target.value as EstadoSolicitud)
            }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
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

      <section aria-labelledby="observaciones-title">
        <h2 id="observaciones-title">Observaciones</h2>
        {solicitud.observaciones.map((observacion) => (
          <article key={observacion.id}>
            <p>{observacion.observacion}</p>
            <small>{observacion.autor?.nombre ?? 'Personal'} · {formatearFecha(observacion.creado)}</small>
          </article>
        ))}
        <label htmlFor="observacion-nueva">Agregar observación</label>
        <textarea
          id="observacion-nueva"
          rows={3}
          value={textoObservacion}
          onChange={(evento) => setTextoObservacion(evento.target.value)}
        />
        {observacionMutation.isError ? <p role="alert">{observacionMutation.error.message}</p> : null}
        <Button
          type="button"
          variant="outline"
          disabled={!textoObservacion.trim() || observacionMutation.isPending}
          onClick={() => observacionMutation.mutate()}
        >
          Agregar observación
        </Button>
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
        {estadoMutation.isError ? <p role="alert">{estadoMutation.error.message}</p> : null}
        <Button
          type="button"
          disabled={estadoMutation.isPending || estadoSeleccionado === solicitud.estado}
          onClick={() => estadoMutation.mutate()}
        >
          {estadoMutation.isPending ? 'Guardando...' : 'Guardar estado'}
        </Button>
      </div>
    </section>
  )
}