import { ArrowLeft, Check, Heart, PawPrint, ShieldCheck, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AdoptionModal } from '@/components/AdoptionModal/AdoptionModal'
import { Button } from '@/components/Button/Button'
import { animalesService } from '@/services/animalesService'
import {
  formatearColor,
  formatearEdad,
  formatearEspecie,
  formatearEstadoAnimal,
  formatearTamano,
} from '@/utils/formateadoresAnimal'

import './PetDetailPage.css'

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const animalId = Number(id)
  const animalQuery = useQuery({
    queryKey: ['mascota', animalId],
    queryFn: () => animalesService.obtenerPorId(animalId),
    enabled: Number.isInteger(animalId) && animalId > 0,
  })
  const animal = animalQuery.data
  const [fotoActivaIndex, setFotoActivaIndex] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)

  if (animalQuery.isLoading) {
    return <div className="page-container"><p role="status">Cargando perfil...</p></div>
  }

  if (animalQuery.isError || !animal) {
    return (
      <div className="page-container pet-detail-page pet-detail-page--missing">
        <p className="page-kicker">Perfil no encontrado</p>
        <h1 className="page-title">Esta mascota no se encuentra en el sistema.</h1>
        <Button asChild variant="outline">
          <Link to="/mascotas">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a la galería
          </Link>
        </Button>
      </div>
    )
  }

  const fotos = animal.fotos && animal.fotos.length > 0 ? animal.fotos : []
  const fotoPrincipal = fotos[fotoActivaIndex] ?? fotos[0]

  return (
    <div className="page-container pet-detail-page">
      <div className="pet-detail-page__nav">
        <Link className="pet-detail-page__back" to="/mascotas">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>VOLVER AL LISTADO</span>
        </Link>
      </div>

      <section className="pet-detail-page__layout" aria-labelledby="pet-name">
        {/* Columna Izquierda: Foto principal + miniaturas */}
        <div className="pet-detail-page__gallery">
          <div className="pet-detail-page__main-image">
            {fotoPrincipal ? (
              <img src={fotoPrincipal.url} alt={`Foto principal de ${animal.nombre}`} />
            ) : (
              <div className="pet-detail-page__placeholder">
                <PawPrint size={72} strokeWidth={1.5} aria-hidden="true" />
                <span>Foto de {animal.nombre}</span>
              </div>
            )}
            <span className={`pet-detail-page__status pet-detail-page__status--${animal.estado}`}>
              {formatearEstadoAnimal(animal.estado)}
            </span>
          </div>

          {fotos.length > 1 && (
            <div className="pet-detail-page__thumbs" role="tablist" aria-label="Fotos adicionales">
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  type="button"
                  className={`pet-detail-page__thumb ${
                    index === fotoActivaIndex ? 'pet-detail-page__thumb--active' : ''
                  }`}
                  onClick={() => setFotoActivaIndex(index)}
                  aria-label={`Ver foto ${index + 1} de ${animal.nombre}`}
                >
                  <img src={foto.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Datos en grid + Reseña + Botón Solicitar Adopción */}
        <div className="pet-detail-page__info">
          <header className="pet-detail-page__header">
            <p className="page-kicker">{formatearEspecie(animal.especie)} en adopción</p>
            <h1 id="pet-name" className="pet-detail-page__title">
              {animal.nombre}
            </h1>
          </header>

          {/* Grid de 2 columnas de cajas redondeadas según el wireframe */}
          <div className="pet-detail-page__data-grid">
            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Raza</span>
              <span className="pet-detail-page__data-value">{animal.raza ?? 'Mestizo/a'}</span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Edad</span>
              <span className="pet-detail-page__data-value">{formatearEdad(animal.edad)}</span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Sexo</span>
              <span className="pet-detail-page__data-value">
                {animal.sexo === 'hembra' ? 'Hembra' : 'Macho'}
              </span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Tamaño</span>
              <span className="pet-detail-page__data-value">{formatearTamano(animal.tamano)}</span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Vacunación</span>
              <span className="pet-detail-page__data-value pet-detail-page__data-value--pill">
                {animal.vacunado ? (
                  <>
                    <Check size={14} className="pet-detail-page__check-icon" /> Al día
                  </>
                ) : (
                  <>
                    <X size={14} className="pet-detail-page__x-icon" /> Pendiente
                  </>
                )}
              </span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Color</span>
              <span className="pet-detail-page__data-value">{formatearColor(animal.color)}</span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Castración</span>
              <span className="pet-detail-page__data-value">
                {animal.esterilizado ? 'Esterilizado/a' : 'Pendiente'}
              </span>
            </div>

            <div className="pet-detail-page__data-card">
              <span className="pet-detail-page__data-label">Salud y cuidado</span>
              <span className="pet-detail-page__data-value">
                <ShieldCheck size={14} /> Desparasitado/a
              </span>
            </div>
          </div>

          {/* Sección BREVE RESEÑA según el wireframe */}
          <div className="pet-detail-page__review-section">
            <h2 className="pet-detail-page__review-title">BREVE RESEÑA</h2>
            <div className="pet-detail-page__review-box">
              <p>
                {animal.comportamiento ??
                  `${animal.nombre} espera ansiosamente una familia responsable que le brinde cariño, tiempo y cuidados. Acercate a conocerlo/a y dale una segunda oportunidad.`}
              </p>
            </div>
          </div>

          {/* Botón de acción destacado: Solicitar Adopción */}
          <div className="pet-detail-page__actions">
            <Button
              className="pet-detail-page__cta-button"
              size="lg"
              type="button"
              disabled={animal.estado !== 'disponible'}
              onClick={() => setModalAbierto(true)}
            >
              <Heart size={20} fill="currentColor" aria-hidden="true" />
              <span>
                {animal.estado === 'disponible'
                  ? 'Solicitar Adopción'
                  : animal.estado === 'en_proceso'
                    ? 'Adopción en proceso'
                    : 'Mascota ya adoptada'}
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Modal de Solicitud de Adopción */}
      <AdoptionModal
        animal={animal}
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  )
}
