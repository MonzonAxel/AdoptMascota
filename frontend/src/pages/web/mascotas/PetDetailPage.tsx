import { ArrowLeft, Heart, PawPrint } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/Button/Button'
import {
  formatearColor,
  formatearEdad,
  formatearEspecie,
  formatearTamano,
} from '@/utils/formateadoresAnimal'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './PetDetailPage.css'

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const animal = animalesDeEjemplo.find((item) => String(item.id) === id)

  if (!animal) {
    return (
      <div className="page-container pet-detail-page pet-detail-page--missing">
        <p className="page-kicker">Perfil no encontrado</p>
        <h1 className="page-title">Esta mascota ya no esta disponible.</h1>
        <Button asChild variant="outline">
          <Link to="/mascotas">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a la galeria
          </Link>
        </Button>
      </div>
    )
  }

  const fotoPrincipal = animal.fotos.find((foto) => foto.esPrincipal) ?? animal.fotos[0]

  return (
    <div className="page-container pet-detail-page">
      <Link className="pet-detail-page__back" to="/mascotas">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a mascotas
      </Link>
      <section className="pet-detail-page__profile">
        <div className="pet-detail-page__image">
          {fotoPrincipal ? (
            <img src={fotoPrincipal.url} alt={`Foto de ${animal.nombre}`} />
          ) : (
            <PawPrint size={80} strokeWidth={1.2} aria-hidden="true" />
          )}
        </div>
        <div className="pet-detail-page__content">
          <p className="page-kicker">Perfil de adopcion</p>
          <h1 className="page-title">{animal.nombre}</h1>
          <p className="pet-detail-page__summary">
            {animal.comportamiento ?? 'Todavía no hay una descripción disponible.'}
          </p>
          <dl className="pet-detail-page__facts">
            <div>
              <dt>Especie</dt>
              <dd>{formatearEspecie(animal.especie)}</dd>
            </div>
            <div>
              <dt>Sexo</dt>
              <dd>{animal.sexo === 'hembra' ? 'Hembra' : 'Macho'}</dd>
            </div>
            <div>
              <dt>Edad</dt>
              <dd>{formatearEdad(animal.edad)}</dd>
            </div>
            <div>
              <dt>Tamaño</dt>
              <dd>{formatearTamano(animal.tamano)}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{formatearColor(animal.color)}</dd>
            </div>
            <div>
              <dt>Vacunación</dt>
              <dd>{animal.vacunado ? 'Al día' : 'Pendiente'}</dd>
            </div>
            <div>
              <dt>Castración</dt>
              <dd>{animal.esterilizado ? 'Castrada/o' : 'Pendiente'}</dd>
            </div>
          </dl>
          <Button type="button" disabled={animal.estado !== 'disponible'}>
            <Heart size={17} aria-hidden="true" />
            {animal.estado === 'disponible'
              ? 'Quiero conocerla'
              : animal.estado === 'en_proceso'
                ? 'Solicitud en proceso'
                : 'Adopción cerrada'}
          </Button>
        </div>
      </section>
    </div>
  )
}
