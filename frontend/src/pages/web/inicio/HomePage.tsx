import { ArrowRight, ClipboardCheck, HeartHandshake, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/Button/Button'

import './HomePage.css'

const adoptionSteps = [
  {
    icon: Search,
    title: 'Explora',
    description: 'Conoce mascotas que esperan una familia compatible.',
  },
  {
    icon: HeartHandshake,
    title: 'Conecta',
    description: 'Revisa su perfil y descubre si comparten el mismo ritmo.',
  },
  {
    icon: ClipboardCheck,
    title: 'Adopta',
    description: 'Completa tu solicitud para iniciar un vinculo responsable.',
  },
]

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-page__hero">
        <div className="page-container home-page__hero-grid">
          <div className="home-page__hero-copy">
            <p className="page-kicker">Adopcion responsable</p>
            <h1 className="page-title">Una nueva historia puede empezar hoy.</h1>
            <p className="page-description">
              Encuentra una mascota que encaje con tu forma de vivir y da el primer paso
              hacia un hogar compartido.
            </p>
            <div className="home-page__actions">
              <Button asChild size="lg">
                <Link to="/mascotas">
                  Ver mascotas
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </Button>
              <Link className="home-page__secondary-action" to="/login">
                Acceso administrativo
              </Link>
            </div>
          </div>
          <div className="home-page__hero-art" aria-label="Ilustracion temporal de una huella">
            <div className="home-page__art-circle">
              <HeartHandshake size={76} strokeWidth={1.2} aria-hidden="true" />
            </div>
            <span className="home-page__art-label">Cada encuentro importa</span>
          </div>
        </div>
      </section>

      <section className="page-container home-page__steps" aria-labelledby="steps-title">
        <div className="home-page__section-heading">
          <div>
            <p className="page-kicker">Como funciona</p>
            <h2 id="steps-title">Adoptar puede ser simple.</h2>
          </div>
          <p>Te acompañamos desde la primera busqueda hasta el encuentro.</p>
        </div>
        <div className="home-page__step-grid">
          {adoptionSteps.map(({ icon: Icon, title, description }, index) => (
            <article className="home-page__step" key={title}>
              <span className="home-page__step-number">0{index + 1}</span>
              <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
