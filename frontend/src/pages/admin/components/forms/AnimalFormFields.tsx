import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { Animal } from '@/types/animal'
import type { DatosFormularioAnimal } from '@/schemas/animalSchema'

type AnimalFormFieldsProps = {
  animal?: Animal
  register: UseFormRegister<DatosFormularioAnimal>
  errors: FieldErrors<DatosFormularioAnimal>
}

export function AnimalFormFields({ animal, register, errors }: AnimalFormFieldsProps) {
  return (
    <>
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
          <option value="negro">Negro</option>
          <option value="blanco">Blanco</option>
          <option value="marron">Marrón</option>
          <option value="gris">Gris</option>
          <option value="naranja">Naranja</option>
          <option value="crema">Crema</option>
          <option value="dorado">Dorado</option>
          <option value="atigrado">Atigrado</option>
          <option value="manchado">Manchado</option>
          <option value="tricolor">Tricolor</option>
          <option value="otro">Otro</option>
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

      {animal ? (
        <div className="admin-form__field">
          <label htmlFor="animal-estado">Estado</label>
          <select id="animal-estado" {...register('estado')}>
            <option value="disponible">Disponible</option>
            <option value="en_proceso">En proceso</option>
            <option value="adoptado">Adoptado</option>
          </select>
        </div>
      ) : null}

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
    </>
  )
}