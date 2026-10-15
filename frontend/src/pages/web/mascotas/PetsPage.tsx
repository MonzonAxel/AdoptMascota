import { ChevronLeft, ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'

import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PetCard } from '@/components/PetCard/PetCard'
import { animalesService } from '@/services/animalesService'
import type { ColorAnimal, TipoEspecieAnimal, TipoSexoAnimal, TipoTamanoAnimal } from '@/types/animal'
import { formatearColor, formatearEspecie } from '@/utils/formateadoresAnimal'

import './PetsPage.css'

export function PetsPage() {
  const [busqueda, setBusqueda] = useState('')
  const [especieSeleccionada, setEspecieSeleccionada] = useState<TipoEspecieAnimal | 'todos'>('todos')
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState<TipoTamanoAnimal | 'todos'>('todos')
  const [sexoSeleccionado, setSexoSeleccionado] = useState<TipoSexoAnimal | 'todos'>('todos')
  const [colorSeleccionado, setColorSeleccionado] = useState<ColorAnimal | 'todos'>('todos')
  const [pagina, setPagina] = useState(1)
  const busquedaDiferida = useDeferredValue(busqueda.trim().toLowerCase())
  const opcionesQuery = useQuery({
    queryKey: ['mascotas-filtros'],
    queryFn: () => animalesService.obtenerOpcionesFiltros(),
  })
  const mascotasQuery = useQuery({
    queryKey: ['mascotas-publicas', especieSeleccionada, tamanoSeleccionado, colorSeleccionado, pagina],
    queryFn: () => animalesService.listarPublicos({
      especie: especieSeleccionada === 'todos' ? undefined : especieSeleccionada,
      tamano: tamanoSeleccionado === 'todos' ? undefined : tamanoSeleccionado,
      color: colorSeleccionado === 'todos' ? undefined : colorSeleccionado,
      page: pagina,
      limit: 50,
    }),
  })
  const animales = mascotasQuery.data?.items ?? []
  const animalesFiltrados = animales.filter((animal) => {
    const texto = `${animal.nombre} ${animal.especie} ${animal.raza ?? ''} ${animal.color} ${animal.sexo}`.toLowerCase()
    return (!busquedaDiferida || texto.includes(busquedaDiferida)) &&
      (sexoSeleccionado === 'todos' || animal.sexo === sexoSeleccionado)
  })
  const hayFiltrosActivos = Boolean(busqueda) || especieSeleccionada !== 'todos' ||
    tamanoSeleccionado !== 'todos' || sexoSeleccionado !== 'todos' || colorSeleccionado !== 'todos'

  function limpiarFiltros() {
    setBusqueda('')
    setEspecieSeleccionada('todos')
    setTamanoSeleccionado('todos')
    setSexoSeleccionado('todos')
    setColorSeleccionado('todos')
    setPagina(1)
  }

  return (
    <div className="page-container pets-page">
      <PageHeader
        kicker="Galería de adopción"
        title="Mascotas esperando conocerte."
        description="Explorá los perfiles y utilizá los filtros para encontrar al compañero ideal para tu hogar."
      />
      <section className="pets-page__toolbar" aria-label="Filtros de búsqueda">
        <div className="pets-page__search-row">
          <label className="pets-page__search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar mascotas</span>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, raza o color..."
            />
          </label>
          {hayFiltrosActivos ? (
            <button type="button" className="pets-page__reset-btn" onClick={limpiarFiltros}>
              <RotateCcw size={15} aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          ) : null}
        </div>
        <div className="pets-page__filters">
          <div className="pets-page__filter-group">
            <span className="pets-page__filter-label"><Filter size={14} aria-hidden="true" /> Especie:</span>
            <div className="pets-page__chips">
              <button
                type="button"
                className={`pets-page__chip ${especieSeleccionada === 'todos' ? 'active' : ''}`}
                onClick={() => { setEspecieSeleccionada('todos'); setPagina(1) }}
              >Todas</button>
              {(opcionesQuery.data?.especies ?? ['perro', 'gato']).map((especie) => (
                <button
                  type="button"
                  key={especie}
                  className={`pets-page__chip ${especieSeleccionada === especie ? 'active' : ''}`}
                  onClick={() => { setEspecieSeleccionada(especie as TipoEspecieAnimal); setPagina(1) }}
                >{formatearEspecie(especie as TipoEspecieAnimal)}</button>
              ))}
            </div>
          </div>
          <div className="pets-page__dropdowns">
            <div className="pets-page__select-wrapper">
              <label htmlFor="tamano-select" className="sr-only">Tamaño</label>
              <select
                id="tamano-select"
                value={tamanoSeleccionado}
                onChange={(evento) => { setTamanoSeleccionado(evento.target.value as TipoTamanoAnimal | 'todos'); setPagina(1) }}
              >
                <option value="todos">Todos los tamaños</option>
                {(opcionesQuery.data?.tamanos ?? ['pequeno', 'mediano', 'grande']).map((tamano) => (
                  <option key={tamano} value={tamano}>{tamano}</option>
                ))}
              </select>
            </div>
            <div className="pets-page__select-wrapper">
              <label htmlFor="sexo-select" className="sr-only">Sexo</label>
              <select
                id="sexo-select"
                value={sexoSeleccionado}
                onChange={(evento) => setSexoSeleccionado(evento.target.value as TipoSexoAnimal | 'todos')}
              >
                <option value="todos">Todos los sexos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
            <div className="pets-page__select-wrapper">
              <label htmlFor="color-select" className="sr-only">Color</label>
              <select
                id="color-select"
                value={colorSeleccionado}
                onChange={(evento) => { setColorSeleccionado(evento.target.value as ColorAnimal | 'todos'); setPagina(1) }}
              >
                <option value="todos">Todos los colores</option>
                {(opcionesQuery.data?.colores ?? []).map((color) => (
                  <option key={color} value={color}>{formatearColor(color as ColorAnimal)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="pets-page__meta-bar">
          <span className="pets-page__count">
            <strong>{animalesFiltrados.length}</strong> de {mascotasQuery.data?.total ?? 0} mascotas disponibles en esta página
          </span>
        </div>
      </section>
      {mascotasQuery.isLoading ? <p role="status">Cargando mascotas...</p> : null}
      {mascotasQuery.isError ? <p role="alert">{mascotasQuery.error.message}</p> : null}
      {opcionesQuery.isError ? <p role="alert">No se pudieron cargar las opciones de filtros.</p> : null}
      {animalesFiltrados.length > 0 ? (
        <div className="pets-page__grid">
          {animalesFiltrados.map((animal) => <PetCard key={animal.id} animal={animal} />)}
        </div>
      ) : !mascotasQuery.isLoading ? (
        <div className="pets-page__empty">
          <SlidersHorizontal size={40} strokeWidth={1.5} />
          <h3>No encontramos mascotas con esos criterios</h3>
          <p>Probá modificando las opciones de búsqueda o limpiá los filtros activos.</p>
          <button type="button" className="pets-page__empty-reset" onClick={limpiarFiltros}>
            Ver todas las mascotas
          </button>
        </div>
      ) : null}
      <nav className="pets-page__pagination" aria-label="Paginación de mascotas">
        <button
          type="button"
          disabled={pagina <= 1 || mascotasQuery.isFetching}
          onClick={() => setPagina((actual) => actual - 1)}
        >
          <ChevronLeft size={17} aria-hidden="true" />
          <span>Anterior</span>
        </button>
        <span className="pets-page__pagination-status" aria-live="polite" aria-atomic="true">
          Página <strong>{mascotasQuery.data?.page ?? pagina}</strong> de{' '}
          <strong>{mascotasQuery.data?.totalPages ?? 1}</strong>
        </span>
        <button
          type="button"
          disabled={pagina >= (mascotasQuery.data?.totalPages ?? 1) || mascotasQuery.isFetching}
          onClick={() => setPagina((actual) => actual + 1)}
        >
          <span>Siguiente</span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}