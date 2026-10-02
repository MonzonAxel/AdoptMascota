import { PawPrint } from 'lucide-react'
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
      <div className="pet-card__image">
        {fotoPrincipal ? (
          <img src={fotoPrincipal.url} alt={`Foto de ${animal.nombre}`} />
        ) : (
          <PawPrint size={44} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <div className="pet-card__body">
        <div className="pet-card__heading">
          <div>
            <p className="pet-card__species">{formatearEspecie(animal.especie)}</p>
            <h2>{animal.nombre}</h2>
          </div>
          <span className={`pet-card__status pet-card__status--${animal.estado}`}>
            {formatearEstadoAnimal(animal.estado)}
          </span>
        </div>
        <p className="pet-card__description">
          {animal.comportamiento ?? 'Todavía no hay una descripción disponible.'}
        </p>
        <div className="pet-card__meta">
          <span>{formatearEdad(animal.edad)}</span>
          <span>{formatearTamano(animal.tamano)}</span>
        </div>
        <Link className="pet-card__link" to={`/mascotas/${animal.id}`}>
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
