import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button/Button'
import type { DatosCrearAnimal } from '@/types/animal'
import { esquemaAnimal, type AnimalValidado, type DatosFormularioAnimal } from '@/schemas/animalSchema'

import '../forms/adminForms.css'
import './AnimalForm.css'

type AnimalFormProps = {
  onGuardar: (datos: DatosCrearAnimal, fotos: File[]) => void
  onCancelar: () => void
}

export function AnimalForm({ onGuardar, onCancelar }: AnimalFormProps) {
  const [previsualizaciones, setPrevisualizaciones] = useState<string[]>([])
  const urlsPrevisualizacion = useRef<string[]>([])
  const {
    getValues,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioAnimal, unknown, AnimalValidado>({
    resolver: zodResolver(esquemaAnimal),
    defaultValues: {
      nombre: '',
      especie: '',
      sexo: '',
      raza: '',
      edad: '',
      color: '',
      tamano: '',
      vacunado: false,
      esterilizado: false,
      comportamiento: '',
      fotos: [],
    },
  })

  useEffect(() => {
    return () => urlsPrevisualizacion.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function seleccionarFotos(event: React.ChangeEvent<HTMLInputElement>) {
    const seleccionadas = Array.from(event.currentTarget.files ?? [])
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
  }

  function guardarAnimal(datos: AnimalValidado) {
    const { fotos: fotosSeleccionadas, ...datosAnimal } = datos
    onGuardar(datosAnimal, fotosSeleccionadas)
  }

  return (
    <form
      id="animal-form"
      className="admin-form animal-form"
      onSubmit={handleSubmit(guardarAnimal)}
      noValidate
      aria-labelledby="animal-form-title"
    >
      <p id="animal-form-title" className="admin-form__title">
        Formulario de carga del animal
      </p>

      <div className="admin-form__grid animal-form__grid">
        <div className="admin-form__field animal-form__photos">
          <label>Foto(s)</label>
          <label className="animal-form__upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={seleccionarFotos}
              aria-label="Subir fotos del animal"
            />
            <ImagePlus size={25} aria-hidden="true" />
            <span>Subir imágenes</span>
            <small>Hasta 5 imágenes, 5 MB cada una</small>
          </label>
          {previsualizaciones.length > 0 ? (
            <div className="animal-form__previews">
              {previsualizaciones.map((url, indice) => {
                const foto = getValues('fotos')[indice]

                return (
                  <div className="animal-form__preview" key={url}>
                    <img src={url} alt={`Vista previa: ${foto.name}`} />
                    <Button
                      className="animal-form__remove-photo"
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Quitar ${foto.name}`}
                      onClick={() => quitarFoto(indice)}
                    >
                      <X size={15} aria-hidden="true" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : null}
          {errors.fotos ? (
            <span className="admin-form__error" role="alert">
              {errors.fotos.message}
            </span>
          ) : null}
          {errors.fotos?.root?.message ? (
            <span className="admin-form__error" role="alert">
              {errors.fotos.root.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field animal-form__name">
          <label htmlFor="animal-nombre">Nombre</label>
          <input
            id="animal-nombre"
            {...register('nombre')}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby={errors.nombre ? 'animal-nombre-error' : undefined}
          />
          {errors.nombre ? (
            <span id="animal-nombre-error" className="admin-form__error" role="alert">
              {errors.nombre.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-especie">Tipo / especie</label>
          <select
            id="animal-especie"
            {...register('especie')}
            aria-invalid={Boolean(errors.especie)}
            aria-describedby={errors.especie ? 'animal-especie-error' : undefined}
          >
            <option value="">Seleccionar especie</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
          {errors.especie ? (
            <span id="animal-especie-error" className="admin-form__error" role="alert">
              {errors.especie.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-sexo">Sexo</label>
          <select
            id="animal-sexo"
            {...register('sexo')}
            aria-invalid={Boolean(errors.sexo)}
            aria-describedby={errors.sexo ? 'animal-sexo-error' : undefined}
          >
            <option value="">Seleccionar sexo</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
          {errors.sexo ? (
            <span id="animal-sexo-error" className="admin-form__error" role="alert">
              {errors.sexo.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-raza">Raza</label>
          <input id="animal-raza" {...register('raza')} aria-invalid={Boolean(errors.raza)} />
          {errors.raza ? (
            <span className="admin-form__error" role="alert">
              {errors.raza.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-edad">Edad (años)</label>
          <input
            id="animal-edad"
            type="number"
            min="0"
            max="100"
            step="1"
            {...register('edad')}
            aria-invalid={Boolean(errors.edad)}
            aria-describedby={errors.edad ? 'animal-edad-error' : undefined}
          />
          {errors.edad ? (
            <span id="animal-edad-error" className="admin-form__error" role="alert">
              {errors.edad.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-color">Color</label>
          <select
            id="animal-color"
            {...register('color')}
            aria-invalid={Boolean(errors.color)}
            aria-describedby={errors.color ? 'animal-color-error' : undefined}
          >
            <option value="">Seleccionar color</option>
            <option value="marron">Marrón</option>
            <option value="blanco">Blanco</option>
            <option value="negro">Negro</option>
            <option value="beige">Beige</option>
            <option value="multicolor">Multicolor</option>
          </select>
          {errors.color ? (
            <span id="animal-color-error" className="admin-form__error" role="alert">
              {errors.color.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field">
          <label htmlFor="animal-tamano">Tamaño</label>
          <select
            id="animal-tamano"
            {...register('tamano')}
            aria-invalid={Boolean(errors.tamano)}
            aria-describedby={errors.tamano ? 'animal-tamano-error' : undefined}
          >
            <option value="">Seleccionar tamaño</option>
            <option value="pequeno">Pequeño</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
          </select>
          {errors.tamano ? (
            <span id="animal-tamano-error" className="admin-form__error" role="alert">
              {errors.tamano.message}
            </span>
          ) : null}
        </div>

        <div className="admin-form__field animal-form__health">
          <label>Salud</label>
          <div className="admin-form__checkboxes">
            <label className="admin-form__checkbox">
              <input type="checkbox" {...register('vacunado')} />
              Vacunado
            </label>
            <label className="admin-form__checkbox">
              <input type="checkbox" {...register('esterilizado')} />
              Esterilizado
            </label>
          </div>
        </div>

        <div className="admin-form__field animal-form__behavior">
          <label htmlFor="animal-comportamiento">Descripción / comportamiento</label>
          <textarea
            id="animal-comportamiento"
            rows={3}
            {...register('comportamiento')}
            aria-invalid={Boolean(errors.comportamiento)}
            aria-describedby={errors.comportamiento ? 'animal-comportamiento-error' : undefined}
          />
          {errors.comportamiento ? (
            <span id="animal-comportamiento-error" className="admin-form__error" role="alert">
              {errors.comportamiento.message}
            </span>
          ) : null}
        </div>
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