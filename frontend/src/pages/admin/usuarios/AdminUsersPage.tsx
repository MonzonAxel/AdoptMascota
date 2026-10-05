import { UserPlus } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import type { Usuario } from '@/types/usuario'

import './AdminUsersPage.css'

const usuarios: Usuario[] = [
  {
    id: 1,
    correoElectronico: 'ana.torres@adopta.local',
    rol: 'admin',
    perfil: {
      id: 1,
      usuarioId: 1,
      nombre: 'Ana',
      apellido: 'Torres',
      creadoEn: '2026-08-01T12:00:00.000Z',
      actualizadoEn: null,
    },
    creadoEn: '2026-08-01T12:00:00.000Z',
    actualizadoEn: null,
    eliminadoEn: null,
  },
  {
    id: 2,
    correoElectronico: 'martin.sosa@adopta.local',
    rol: 'administrativo',
    perfil: {
      id: 2,
      usuarioId: 2,
      nombre: 'Martin',
      apellido: 'Sosa',
      creadoEn: '2026-08-02T12:00:00.000Z',
      actualizadoEn: null,
    },
    creadoEn: '2026-08-02T12:00:00.000Z',
    actualizadoEn: null,
    eliminadoEn: null,
  },
]

export function AdminUsersPage() {
  return (
    <div className="admin-page admin-users-page">
      <div className="admin-page__heading-row">
        <PageHeader
          kicker="Administracion"
          title="Usuarios"
          description="Administra las personas que colaboran con la gestion de adopciones."
        />
        <Button type="button">
          <UserPlus size={16} aria-hidden="true" />
          Nuevo usuario
        </Button>
      </div>
      <section className="admin-table-wrap" aria-label="Usuarios administrativos">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <strong>{usuario.perfil.nombre} {usuario.perfil.apellido}</strong>
                  <span>{usuario.correoElectronico}</span>
                </td>
                <td>{usuario.rol === 'admin' ? 'Administrador' : 'Administrativo'}</td>
                <td>
                  <StatusBadge
                    label={usuario.eliminadoEn ? 'Inactivo' : 'Activo'}
                    tone={usuario.eliminadoEn ? 'neutral' : 'success'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
