import { Pencil, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { AnimalForm } from '@/components/AnimalForm/AnimalForm'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { Button } from '@/components/Button/Button'
import type { Animal, DatosCrearAnimal, FotoAnimal } from '@/types/animal'
import {
  formatearEdad,
  formatearEspecie,
  formatearEstadoAnimal,
  formatearTamano,
} from '@/utils/formateadoresAnimal'
import { animalesDeEjemplo } from '@/utils/datosAnimales'

import './AdminPetsPage.css'

export function AdminPetsPage() {
  const [animales, setAnimales] = useState(animalesDeEjemplo)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  function guardarAnimal(datos: DatosCrearAnimal, archivos: File[]) {
    const fechaActual = new Date().toISOString()
    const urlsFotos = archivos.map((archivo) => URL.createObjectURL(archivo))

    setAnimales((animalesActuales) => {
      const id = Math.max(0, ...animalesActuales.map((animal) => animal.id)) + 1
      const fotos: FotoAnimal[] = urlsFotos.map((url, indice) => ({
        id: indice + 1,
        animalId: id,
        url,
        esPrincipal: indice === 0,
        orden: indice,
        creadoEn: fechaActual,
        actualizadoEn: null,
      }))
      const nuevoAnimal: Animal = {
        id,
        nombre: datos.nombre,
        especie: datos.especie,
        raza: datos.raza ?? null,
        sexo: datos.sexo,
        tamano: datos.tamano,
        edad: datos.edad ?? null,
        color: datos.color,
        comportamiento: datos.comportamiento ?? null,
        vacunado: datos.vacunado ?? false,
        esterilizado: datos.esterilizado ?? false,
        estado: 'disponible',
        fechaIngreso: fechaActual,
        creadoPor: null,
        actualizadoPor: null,
        creadoEn: fechaActual,
        actualizadoEn: null,
        eliminadoEn: null,
        fotos,
      }

      return [nuevoAnimal, ...animalesActuales]
    })
    setMostrarFormulario(false)
  }

  return (
    <div className="admin-page admin-pets-page">
      <div className="admin-page__heading-row">
        <PageHeader
          kicker="Administracion"
          title="Mascotas"
          description="Consulta los perfiles cargados y prepara nuevas publicaciones."
        />
        <Button
          type="button"
          aria-expanded={mostrarFormulario}
          aria-controls="animal-form"
          onClick={() => setMostrarFormulario((visible) => !visible)}
        >
          {mostrarFormulario ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {mostrarFormulario ? 'Cerrar formulario' : 'Nueva mascota'}
        </Button>
      </div>
      {mostrarFormulario ? (
        <AnimalForm
          onGuardar={guardarAnimal}
          onCancelar={() => setMostrarFormulario(false)}
        />
      ) : null}
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
            {animales.map((animal) => (
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
