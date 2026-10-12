import { ArrowRight, Calendar, PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Animal } from '@/types/animal'
import {
  formatearEdad,
  formatearEspecie,
  formatearEstadoAnimal,
  formatearTamano,
} from '@/utils/formateadoresAnimal'

import './PetCard.css'

type PetCardProps = {
  animal: Animal
}

export function PetCard({ animal }: PetCardProps) {
  const fotoPrincipal = animal.fotos.find((foto) => foto.esPrincipal) ?? animal.fotos[0]

  return (
    <article className="pet-card">
      <div className="pet-card__image-container">
        {fotoPrincipal ? (
          <img
            className="pet-card__image"
            src={fotoPrincipal.url}
            alt={`Foto de ${animal.nombre}`}
            loading="lazy"
          />
        ) : (
          <div className="pet-card__placeholder">
            <PawPrint size={48} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <span className={`pet-card__status pet-card__status--${animal.estado}`}>
          {formatearEstadoAnimal(animal.estado)}
        </span>
      </div>

      <div className="pet-card__body">
        <div className="pet-card__header">
          <span className="pet-card__species-tag">
            {formatearEspecie(animal.especie)} • {animal.raza ?? 'Mestizo/a'}
          </span>
          <h3 className="pet-card__title">{animal.nombre}</h3>
        </div>

        <p className="pet-card__description">
          {animal.comportamiento ?? 'Una mascota leal y cariñosa lista para llenar tu hogar de alegría.'}
        </p>

        <div className="pet-card__chips">
          <span className="pet-card__chip">
            <Calendar size={13} aria-hidden="true" />
            {formatearEdad(animal.edad)}
          </span>
          <span className="pet-card__chip">
            {animal.sexo === 'hembra' ? '♀ Hembra' : '♂ Macho'}
          </span>
          <span className="pet-card__chip">
            {formatearTamano(animal.tamano)}
          </span>
        </div>

        <div className="pet-card__footer">
          <Link className="pet-card__cta" to={`/mascotas/${animal.id}`}>
            <span>Conocer a {animal.nombre}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
