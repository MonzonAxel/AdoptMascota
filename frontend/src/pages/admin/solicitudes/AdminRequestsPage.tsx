import { Check, Eye, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import type { EstadoSolicitud } from '@/types/solicitud'
import { animalesDeEjemplo } from '@/utils/datosAnimales'
import { formatearFecha } from '@/utils/formatearFecha'
import { solicitudesDeEjemplo } from '@/utils/solicitudesDeEjemplo'

import './AdminRequestsPage.css'

const solicitudes = solicitudesDeEjemplo.map((solicitud) => ({
  ...solicitud,
  animal: {
    id: solicitud.animalId,
    nombre:
      animalesDeEjemplo.find((animal) => animal.id === solicitud.animalId)?.nombre ??
      `Animal #${solicitud.animalId}`,
  },
}))

const etiquetasEstado: Record<EstadoSolicitud, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  aprobada: { label: 'Aprobada', tone: 'success' },
  rechazada: { label: 'Rechazada', tone: 'danger' },
}

export function AdminRequestsPage() {
  return (
    <div className="admin-page admin-requests-page">
      <PageHeader
        kicker="Administracion"
        title="Solicitudes"
        description="Revisa y acompaña las solicitudes de quienes quieren adoptar."
      />
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
            {solicitudes.map((solicitud) => {
              const estado = etiquetasEstado[solicitud.estado]

              return (
                <tr key={solicitud.id}>
                  <td>
                    <strong>{solicitud.nombreApellido}</strong>
                    <span>{solicitud.id}</span>
                  </td>
                  <td>{solicitud.animal.nombre}</td>
                  <td>{formatearFecha(solicitud.creadoEn)}</td>
                  <td>
                    <StatusBadge label={estado.label} tone={estado.tone} />
                  </td>
                  <td>
                    <div className="admin-requests-page__actions">
                      <Button asChild variant="outline" className="admin-requests-page__view">
                        <Link
                          to={`/solicitud/${solicitud.id}`}
                          aria-label={`Ver solicitud de ${solicitud.nombreApellido}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                          Ver
                        </Link>
                      </Button>
                      {solicitud.estado === 'pendiente' ? (
                        <>
                          <Button variant="ghost" size="icon" aria-label="Aprobar solicitud">
                            <Check size={16} aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Rechazar solicitud">
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
    </div>
  )
}
