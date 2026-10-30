import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button/Button'
import type { Animal, DatosCrearAnimal } from '@/types/animal'
import { esquemaAnimal, type AnimalValidado, type DatosFormularioAnimal } from '@/schemas/animalSchema'

import { AnimalFormFields } from './AnimalFormFields'
import { AnimalPhotosEditor, type SeleccionFotoPrincipal } from './AnimalPhotosEditor'

import './AnimalForm.css'
import './adminForms.css'

type AnimalFormProps = {
  animal?: Animal
  onGuardar: (
    datos: DatosCrearAnimal,
    fotos: File[],
    fotoPrincipalId: number | null,
    indiceFotoPrincipal: number | null,
    fotosAEliminar: number[],
  ) => Promise<void>
  onCancelar: () => void
}

export function AnimalForm({ animal, onGuardar, onCancelar }: AnimalFormProps) {
  const [previsualizaciones, setPrevisualizaciones] = useState<string[]>([])
  const [seleccionFotoPrincipal, setSeleccionFotoPrincipal] = useState<SeleccionFotoPrincipal>(null)
  const [fotosAEliminar, setFotosAEliminar] = useState<number[]>([])
  const urlsPrevisualizacion = useRef<string[]>([])
  const {
    getValues,
    register,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioAnimal, unknown, AnimalValidado>({
    resolver: zodResolver(esquemaAnimal),
    defaultValues: {
      nombre: animal?.nombre ?? '',
      especie: animal?.especie ?? '',
      sexo: animal?.sexo ?? '',
      raza: animal?.raza ?? '',
      edad: animal?.edad?.toString() ?? '',
      color: animal?.color ?? '',
      tamano: animal?.tamano ?? '',
      estado: animal?.estado ?? 'disponible',
      vacunado: animal?.vacunado ?? false,
      esterilizado: animal?.esterilizado ?? false,
      comportamiento: animal?.comportamiento ?? '',
      fotos: [],
    },
  })

  useEffect(() => {
    return () => urlsPrevisualizacion.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function seleccionarFotos(event: ChangeEvent<HTMLInputElement>) {
    const cantidadFotosActuales = animal?.fotos.length ?? 0
    const limite = Math.max(
      0,
      6 - cantidadFotosActuales + fotosAEliminar.length - getValues('fotos').length,
    )
    const seleccionadas = Array.from(event.currentTarget.files ?? []).slice(0, limite)

    if (event.currentTarget.files && event.currentTarget.files.length > limite) {
      setError('fotos', { message: 'Una mascota puede tener hasta 6 fotos.' })
    }

    const nuevasPrevisualizaciones = seleccionadas.map((foto) => URL.createObjectURL(foto))
    urlsPrevisualizacion.current.push(...nuevasPrevisualizaciones)
    setPrevisualizaciones((actuales) => [...actuales, ...nuevasPrevisualizaciones])
    setValue('fotos', [...getValues('fotos'), ...seleccionadas], {
      shouldDirty: true,
      shouldValidate: true,
    })
    event.currentTarget.value = ''
  }

  function quitarFoto(indiceAEliminar: number) {
    const urlAEliminar = previsualizaciones[indiceAEliminar]
    if (urlAEliminar) {
      URL.revokeObjectURL(urlAEliminar)
      urlsPrevisualizacion.current = urlsPrevisualizacion.current.filter(
        (url) => url !== urlAEliminar,
      )
      setPrevisualizaciones((actuales) =>
        actuales.flatMap((url, indice) => (indice === indiceAEliminar ? [] : [url])),
      )
    }

    setValue(
      'fotos',
      getValues('fotos').flatMap((foto, indice) => (indice === indiceAEliminar ? [] : [foto])),
      { shouldDirty: true, shouldValidate: true },
    )
    setSeleccionFotoPrincipal((actual) => {
      if (actual?.tipo !== 'nueva' || actual.indice < indiceAEliminar) return actual
      return actual.indice === indiceAEliminar
        ? null
        : { ...actual, indice: actual.indice - 1 }
    })
  }

  function alternarEliminacionFoto(fotoId: number) {
    setFotosAEliminar((actuales) => actuales.includes(fotoId)
      ? actuales.filter((id) => id !== fotoId)
      : [...actuales, fotoId])
    setSeleccionFotoPrincipal((actual) =>
      actual?.tipo === 'existente' && actual.id === fotoId ? null : actual,
    )
  }

  async function guardarAnimal(datos: AnimalValidado) {
    const { estado, fotos: fotosSeleccionadas, ...datosAnimal } = datos
    const fotosExistentesActivas = animal?.fotos.filter((foto) => !fotosAEliminar.includes(foto.id)) ?? []
    const fotoPrincipalId = seleccionFotoPrincipal?.tipo === 'existente'
      ? seleccionFotoPrincipal.id
      : null
    const indiceFotoPrincipal = seleccionFotoPrincipal?.tipo === 'nueva'
      ? seleccionFotoPrincipal.indice
      : !fotosExistentesActivas.length && fotosSeleccionadas.length
        ? 0
        : null

    await onGuardar(
      animal ? { ...datosAnimal, estado } : datosAnimal,
      fotosSeleccionadas,
      fotoPrincipalId,
      indiceFotoPrincipal,
      fotosAEliminar,
    )
  }

  const erroresFotos = [errors.fotos?.message, errors.fotos?.root?.message]
    .filter((mensaje): mensaje is string => Boolean(mensaje))

  return (
    <form
      id="animal-form"
      className="admin-form admin-form--modal animal-form"
      onSubmit={handleSubmit(guardarAnimal)}
      noValidate
      aria-labelledby="animal-form-title"
    >
      <p id="animal-form-title" className="admin-form__title">
        {animal ? `Editar ${animal.nombre}` : 'Formulario de carga del animal'}
      </p>

      <div className="admin-form__grid animal-form__grid">
        <AnimalPhotosEditor
          animal={animal}
          fotos={getValues('fotos')}
          previsualizaciones={previsualizaciones}
          seleccionFotoPrincipal={seleccionFotoPrincipal}
          fotosAEliminar={fotosAEliminar}
          errores={erroresFotos}
          isSubmitting={isSubmitting}
          onSeleccionarFotos={seleccionarFotos}
          onQuitarFoto={quitarFoto}
          onAlternarEliminacion={alternarEliminacionFoto}
          onSeleccionarFotoPrincipal={setSeleccionFotoPrincipal}
        />
        <AnimalFormFields animal={animal} register={register} errors={errors} />
      </div>

      <div className="admin-form__actions">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}