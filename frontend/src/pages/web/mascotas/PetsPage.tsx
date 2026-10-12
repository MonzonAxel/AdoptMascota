import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useDeferredValue, useState } from 'react'

import { PetCard } from '@/components/PetCard/PetCard'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import type { TipoEspecieAnimal, TipoSexoAnimal, TipoTamanoAnimal, EstadoAnimal } from '@/types/animal'
import { formatearEspecie } from '@/utils/formateadoresAnimal'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './PetsPage.css'

export function PetsPage() {
  const [busqueda, setBusqueda] = useState('')
  const [especieSeleccionada, setEspecieSeleccionada] = useState<TipoEspecieAnimal | 'todos'>('todos')
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState<TipoTamanoAnimal | 'todos'>('todos')
  const [sexoSeleccionado, setSexoSeleccionado] = useState<TipoSexoAnimal | 'todos'>('todos')
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoAnimal | 'todos'>('todos')

  const busquedaDiferida = useDeferredValue(busqueda)
  const busquedaNormalizada = busquedaDiferida.trim().toLowerCase()

  const hayFiltrosActivos =
    busqueda !== '' ||
    especieSeleccionada !== 'todos' ||
    tamanoSeleccionado !== 'todos' ||
    sexoSeleccionado !== 'todos' ||
    estadoSeleccionado !== 'todos'

  function limpiarFiltros() {
    setBusqueda('')
    setEspecieSeleccionada('todos')
    setTamanoSeleccionado('todos')
    setSexoSeleccionado('todos')
    setEstadoSeleccionado('todos')
  }

  const animalesFiltrados = animalesDeEjemplo.filter((animal) => {
    // Filtro por texto
    if (busquedaNormalizada) {
      const matchTexto = `${animal.nombre} ${formatearEspecie(animal.especie)} ${animal.raza ?? ''} ${
        animal.comportamiento ?? ''
      } ${animal.color}`
        .toLowerCase()
        .includes(busquedaNormalizada)
      if (!matchTexto) return false
    }

    // Filtro por especie
    if (especieSeleccionada !== 'todos' && animal.especie !== especieSeleccionada) {
      return false
    }

    // Filtro por tamaño
    if (tamanoSeleccionado !== 'todos' && animal.tamano !== tamanoSeleccionado) {
      return false
    }

    // Filtro por sexo
    if (sexoSeleccionado !== 'todos' && animal.sexo !== sexoSeleccionado) {
      return false
    }

    // Filtro por estado
    if (estadoSeleccionado !== 'todos' && animal.estado !== estadoSeleccionado) {
      return false
    }

    return true
  })

  return (
    <div className="page-container pets-page">
      <PageHeader
        kicker="Galería de adopción"
        title="Mascotas esperando conocerte."
        description="Explorá los perfiles y utilizá los filtros para encontrar al compañero ideal para tu hogar."
      />

      {/* Barra de búsqueda y filtros */}
      <section className="pets-page__toolbar" aria-label="Filtros de búsqueda">
        <div className="pets-page__search-row">
          <label className="pets-page__search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar mascotas</span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, raza, personalidad..."
            />
          </label>

          {hayFiltrosActivos && (
            <button
              type="button"
              className="pets-page__reset-btn"
              onClick={limpiarFiltros}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={15} />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Filtros rápidos en pills / selects */}
        <div className="pets-page__filters">
          <div className="pets-page__filter-group">
            <span className="pets-page__filter-label">
              <Filter size={14} /> Especie:
            </span>
            <div className="pets-page__chips">
              <button
                type="button"
                className={`pets-page__chip ${especieSeleccionada === 'todos' ? 'active' : ''}`}
                onClick={() => setEspecieSeleccionada('todos')}
              >
                Todas
              </button>
              <button
                type="button"
                className={`pets-page__chip ${especieSeleccionada === 'perro' ? 'active' : ''}`}
                onClick={() => setEspecieSeleccionada('perro')}
              >
                🐶 Perros
              </button>
              <button
                type="button"
                className={`pets-page__chip ${especieSeleccionada === 'gato' ? 'active' : ''}`}
                onClick={() => setEspecieSeleccionada('gato')}
              >
                🐱 Gatos
              </button>
            </div>
          </div>

          <div className="pets-page__dropdowns">
            <div className="pets-page__select-wrapper">
              <label htmlFor="tamano-select" className="sr-only">Tamaño</label>
              <select
                id="tamano-select"
                value={tamanoSeleccionado}
                onChange={(e) => setTamanoSeleccionado(e.target.value as TipoTamanoAnimal | 'todos')}
              >
                <option value="todos">Todos los tamaños</option>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div className="pets-page__select-wrapper">
              <label htmlFor="sexo-select" className="sr-only">Sexo</label>
              <select
                id="sexo-select"
                value={sexoSeleccionado}
                onChange={(e) => setSexoSeleccionado(e.target.value as TipoSexoAnimal | 'todos')}
              >
                <option value="todos">Todos los sexos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div className="pets-page__select-wrapper">
              <label htmlFor="estado-select" className="sr-only">Estado</label>
              <select
                id="estado-select"
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value as EstadoAnimal | 'todos')}
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Disponibles</option>
                <option value="en_proceso">En proceso</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pets-page__meta-bar">
          <span className="pets-page__count">
            Mostrando <strong>{animalesFiltrados.length}</strong> de {animalesDeEjemplo.length} mascotas
          </span>
        </div>
      </section>

      {/* Grid de resultados */}
      {animalesFiltrados.length > 0 ? (
        <div className="pets-page__grid">
          {animalesFiltrados.map((animal) => (
            <PetCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="pets-page__empty">
          <SlidersHorizontal size={40} strokeWidth={1.5} />
          <h3>No encontramos mascotas con esos criterios</h3>
          <p>Probá modificando las opciones de búsqueda o limpiá los filtros activos.</p>
          <button type="button" className="pets-page__empty-reset" onClick={limpiarFiltros}>
            Ver todas las mascotas
          </button>
        </div>
      )}
    </div>
  )
}
