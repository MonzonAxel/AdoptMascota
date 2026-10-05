import {
  ArrowRight,
  ClipboardCheck,
  Heart,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/Button/Button'
import { PetCard } from '@/components/PetCard/PetCard'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './HomePage.css'

const adoptionSteps = [
  {
    icon: Search,
    step: '01',
    title: 'Explora',
    description:
      'Navegá nuestra galería de perros y gatos rescatados. Usá los filtros para encontrar perfiles según tamaño, especie y edad.',
  },
  {
    icon: HeartHandshake,
    step: '02',
    title: 'Conecta',
    description:
      'Revisá la historia de cada animal, sus fotos, su temperamento y sus necesidades de salud para ver si es compatible con tu rutina.',
  },
  {
    icon: ClipboardCheck,
    step: '03',
    title: 'Solicita Adopción',
    description:
      'Completá el formulario en línea. El equipo del refugio se pondrá en contacto para coordinar una entrevista y dar inicio a la adopción.',
  },
]

export function HomePage() {
  const mascotasDestacadas = animalesDeEjemplo.slice(0, 3)

  return (
    <div className="home-page">
      {/* Hero section con imagen de fondo referida a mascotas */}
      <section className="home-page__hero">
        <div className="home-page__hero-overlay" />
        <div className="page-container home-page__hero-content">
          <div className="home-page__hero-copy">
            <div className="home-page__pill">
              <Sparkles size={14} />
              <span>Plataforma de adopción responsable</span>
            </div>
            <h1 className="home-page__title">Una nueva historia puede empezar hoy.</h1>
            <p className="home-page__description">
              Encontrá un perro o gato que encaje con tu forma de vivir y da el primer paso
              hacia un hogar compartido lleno de cariño y lealtad.
            </p>

            <div className="home-page__actions">
              <Button asChild size="lg">
                <Link to="/mascotas">
                  Ver mascotas disponibles
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Link className="home-page__secondary-action" to="/login">
                Acceso administrativo →
              </Link>
            </div>

            <div className="home-page__badges">
              <div className="home-page__badge-item">
                <ShieldCheck size={18} />
                <span>Salud al día</span>
              </div>
              <div className="home-page__badge-item">
                <Heart size={18} />
                <span>Adopción sin costo</span>
              </div>
              <div className="home-page__badge-item">
                <Sparkles size={18} />
                <span>Acompañamiento continuo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pasos a seguir para realizar la adopción */}
      <section className="page-container home-page__steps" aria-labelledby="steps-title">
        <div className="home-page__section-heading">
          <div>
            <p className="page-kicker">Guía de adopción</p>
            <h2 id="steps-title">Pasos para realizar la adopción</h2>
          </div>
          <p className="home-page__section-subtitle">
            Un proceso claro, empático y pensado en el bienestar de cada animal.
          </p>
        </div>

        <div className="home-page__step-grid">
          {adoptionSteps.map(({ icon: Icon, step, title, description }) => (
            <article className="home-page__step-card" key={title}>
              <span className="home-page__step-number">{step}</span>
              <div className="home-page__step-icon">
                <Icon size={26} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Mascotas destacadas en adopción */}
      <section className="home-page__featured" aria-labelledby="featured-title">
        <div className="page-container">
          <div className="home-page__section-heading">
            <div>
              <p className="page-kicker">Esperando un hogar</p>
              <h2 id="featured-title">Mascotas destacadas</h2>
            </div>
            <Link className="home-page__view-all-link" to="/mascotas">
              Ver todas ({animalesDeEjemplo.length})
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-page__featured-grid">
            {mascotasDestacadas.map((animal) => (
              <PetCard key={animal.id} animal={animal} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner de compromiso */}
      <section className="page-container home-page__banner">
        <div className="home-page__banner-box">
          <div className="home-page__banner-icon">
            <Heart size={36} strokeWidth={2} />
          </div>
          <div className="home-page__banner-text">
            <h3>¿Por qué adoptar en lugar de comprar?</h3>
            <p>
              Adoptar salva vidas y le da una segunda oportunidad a un animal rescatado de la calle o
              del abandono. Cada perro o gato en nuestro refugio recibe atención veterinaria, cariño y
              socialización para integrarse plenamente a tu familia.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/mascotas">Conocerlos ahora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
