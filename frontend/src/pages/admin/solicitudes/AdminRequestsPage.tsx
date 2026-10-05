import { Check, X } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import type { EstadoSolicitud, ResumenSolicitudAdopcion } from '@/types/solicitud'
import { formatearFecha } from '@/utils/formatearFecha'

import './AdminRequestsPage.css'

const solicitudes: ResumenSolicitudAdopcion[] = [
  {
    id: 1,
    nombreApellido: 'Marina Lopez',
    animal: { id: 1, nombre: 'Luna' },
    creadoEn: '2026-09-12T12:00:00.000Z',
    estado: 'pendiente',
  },
  {
    id: 2,
    nombreApellido: 'Diego Acosta',
    animal: { id: 2, nombre: 'Simba' },
    creadoEn: '2026-09-10T12:00:00.000Z',
    estado: 'aprobada',
  },
  {
    id: 3,
    nombreApellido: 'Sofia Perez',
    animal: { id: 3, nombre: 'Mora' },
    creadoEn: '2026-09-08T12:00:00.000Z',
    estado: 'rechazada',
  },
]

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
                    {solicitud.estado === 'pendiente' ? (
                      <div className="admin-requests-page__actions">
                        <Button variant="ghost" size="icon" aria-label="Aprobar solicitud">
                          <Check size={16} aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Rechazar solicitud">
                          <X size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    ) : null}
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
