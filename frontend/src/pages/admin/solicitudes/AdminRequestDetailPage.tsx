import { ArrowLeft, PawPrint } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/Button/Button'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import type { EstadoSolicitud } from '@/types/solicitud'
import { formatearEspecie } from '@/utils/formateadoresAnimal'
import { formatearFecha } from '@/utils/formatearFecha'
import { animalesDeEjemplo } from '@/utils/datosAnimales'
import { solicitudesDeEjemplo } from '@/utils/solicitudesDeEjemplo'

import './AdminRequestDetailPage.css'

const etiquetasEstado: Record<EstadoSolicitud, { etiqueta: string; tono: 'success' | 'warning' | 'danger' }> = {
  pendiente: { etiqueta: 'Pendiente', tono: 'warning' },
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
  const solicitud = solicitudesDeEjemplo.find((item) => String(item.id) === id)
  const animal = solicitud
    ? animalesDeEjemplo.find((item) => item.id === solicitud.animalId)
    : undefined
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoSolicitud>(
    solicitud?.estado ?? 'pendiente',
  )
  const [mensajeEstado, setMensajeEstado] = useState('')

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
  const fotoPrincipal = animal?.fotos.find((foto) => foto.esPrincipal) ?? animal?.fotos[0]

  function guardarEstado(estado: EstadoSolicitud) {
    setEstadoSeleccionado(estado)
    setMensajeEstado('Estado actualizado en esta sesión de prueba.')
  }

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
            Recibida el {formatearFecha(solicitud.creadoEn)}
          </p>
        </div>
        <div className="solicitud-detail__status-control">
          <label htmlFor="solicitud-estado">Estado:</label>
          <select
            id="solicitud-estado"
            value={estadoSeleccionado}
            onChange={(evento) => {
              setEstadoSeleccionado(evento.target.value as EstadoSolicitud)
              setMensajeEstado('')
            }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
      </div>

      <div className="solicitud-detail__animal">
        <div className="solicitud-detail__animal-image">
          {fotoPrincipal ? (
            <img src={fotoPrincipal.url} alt={`Foto de ${animal?.nombre ?? 'la mascota'}`} />
          ) : (
            <PawPrint size={25} aria-hidden="true" />
          )}
        </div>
        <div className="solicitud-detail__animal-copy">
          <span>Mascota solicitada</span>
          <strong>{animal?.nombre ?? `Animal #${solicitud.animalId}`}</strong>
          {animal ? <small>{formatearEspecie(animal.especie)}</small> : null}
        </div>
        <StatusBadge label={estadoActualizado.etiqueta} tone={estadoActualizado.tono} />
      </div>

      <div className="solicitud-detail__grid">
        <CampoSolicitud titulo="Nombre y apellido" valor={solicitud.nombreApellido} />
        <CampoSolicitud titulo="Edad" valor={`${solicitud.edad} años`} />
        <CampoSolicitud titulo="Email" valor={solicitud.correoElectronico} />
        <CampoSolicitud titulo="Teléfono celular" valor={solicitud.telefonoCelular} />
        <CampoSolicitud titulo="Teléfono fijo" valor={solicitud.telefonoFijo ?? 'No informado'} />
        <CampoSolicitud titulo="Ocupación" valor={solicitud.ocupacion} />
        <CampoSolicitud titulo="Zona de residencia" valor={solicitud.localidadBarrio} />
        <CampoSolicitud titulo="Dirección" valor={solicitud.direccion} />
        <CampoSolicitud
          titulo="Tipo de tenencia"
          valor={solicitud.tipoTenencia === 'propietario' ? 'Propietario' : 'Inquilino'}
        />
        <CampoSolicitud
          titulo="Tipo de vivienda"
          valor={{ depto: 'Departamento', casa: 'Casa', otro: 'Otro' }[solicitud.vivienda]}
        />
        <CampoSolicitud
          titulo="¿Permite animales?"
          valor={solicitud.permiteAnimales === null ? 'No informado' : solicitud.permiteAnimales ? 'Sí' : 'No'}
        />
        <CampoSolicitud titulo="Frecuencia de paseo" valor={solicitud.frecuenciaPaseo} />
        <CampoSolicitud
          titulo="Detalle de la vivienda"
          valor={solicitud.detalleVivienda}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Personas que habitan el hogar y edades"
          valor={solicitud.personasHogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Niños en el hogar"
          valor={solicitud.hayNinosHogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Otros animales en el hogar"
          valor={solicitud.otrosAnimalesHogar}
          anchoCompleto
        />
        <CampoSolicitud
          titulo="Cuidador durante las vacaciones"
          valor={solicitud.cuidadorVacaciones}
          anchoCompleto
        />
        {solicitud.fechaResolucion ? (
          <CampoSolicitud
            titulo="Fecha de resolución"
            valor={formatearFecha(solicitud.fechaResolucion)}
            anchoCompleto
          />
        ) : null}
      </div>

      <div className="solicitud-detail__actions">
        {mensajeEstado ? <p role="status">{mensajeEstado}</p> : null}
        <Button type="button" variant="ghost" onClick={() => guardarEstado('rechazada')}>
          Rechazar
        </Button>
        <Button
          type="button"
          onClick={() => guardarEstado(estadoSeleccionado === 'pendiente' ? 'aprobada' : estadoSeleccionado)}
        >
          {estadoSeleccionado === 'pendiente' ? 'Aprobar / Guardar estado' : 'Guardar estado'}
        </Button>
      </div>
    </section>
  )
}