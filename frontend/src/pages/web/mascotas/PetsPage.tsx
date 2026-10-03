import { Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'

import { PetCard } from '@/components/PetCard/PetCard'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { formatearEspecie } from '@/utils/formateadoresAnimal'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './PetsPage.css'

export function PetsPage() {
  const [busqueda, setBusqueda] = useState('')
  const busquedaDiferida = useDeferredValue(busqueda)
  const busquedaNormalizada = busquedaDiferida.trim().toLowerCase()
  const animalesFiltrados = animalesDeEjemplo.filter((animal) => {
    if (!busquedaNormalizada) {
      return true
    }

    return `${animal.nombre} ${formatearEspecie(animal.especie)} ${animal.raza ?? ''} ${animal.comportamiento ?? ''}`
      .toLowerCase()
      .includes(busquedaNormalizada)
  })

  return (
    <div className="page-container pets-page">
      <PageHeader
        kicker="Galeria"
        title="Mascotas esperando conocerte."
        description="Filtra por nombre, especie o ubicacion para encontrar un perfil que conecte con vos."
      />
      <div className="pets-page__toolbar">
        <label className="pets-page__search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Buscar mascotas</span>
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, especie o ciudad"
          />
        </label>
        <span className="pets-page__count">{animalesFiltrados.length} perfiles</span>
      </div>
      {animalesFiltrados.length > 0 ? (
        <div className="pets-page__grid">
          {animalesFiltrados.map((animal) => (
            <PetCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="pets-page__empty">
          <p>No encontramos mascotas con ese criterio.</p>
        </div>
      )}
    </div>
  )
}
