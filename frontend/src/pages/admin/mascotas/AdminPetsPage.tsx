import { Pencil, Plus } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import {
  formatearEdad,
  formatearEspecie,
  formatearEstadoAnimal,
  formatearTamano,
} from '@/utils/formateadoresAnimal'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './AdminPetsPage.css'

export function AdminPetsPage() {
  return (
    <div className="admin-page admin-pets-page">
      <div className="admin-page__heading-row">
        <PageHeader
          kicker="Administracion"
          title="Mascotas"
          description="Consulta los perfiles cargados y prepara nuevas publicaciones."
        />
        <Button type="button">
          <Plus size={16} aria-hidden="true" />
          Nueva mascota
        </Button>
      </div>
      <section className="admin-table-wrap" aria-label="Listado de mascotas">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Especie</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {animalesDeEjemplo.map((animal) => (
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
                <td>
                  <Button variant="ghost" size="icon" aria-label={`Editar ${animal.nombre}`}>
                    <Pencil size={16} aria-hidden="true" />
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
