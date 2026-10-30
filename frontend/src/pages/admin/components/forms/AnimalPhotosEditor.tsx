import { ImagePlus, RotateCcw, Star, Trash2, X } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { Button } from '@/components/Button/Button'
import type { Animal } from '@/types/animal'

type SeleccionFotoPrincipal =
  | { tipo: 'existente'; id: number }
  | { tipo: 'nueva'; indice: number }
  | null

type AnimalPhotosEditorProps = {
  animal?: Animal
  fotos: File[]
  previsualizaciones: string[]
  seleccionFotoPrincipal: SeleccionFotoPrincipal
  fotosAEliminar: number[]
  errores: string[]
  isSubmitting: boolean
  onSeleccionarFotos: (event: ChangeEvent<HTMLInputElement>) => void
  onQuitarFoto: (indice: number) => void
  onAlternarEliminacion: (fotoId: number) => void
  onSeleccionarFotoPrincipal: (seleccion: SeleccionFotoPrincipal) => void
}

export type { SeleccionFotoPrincipal }

export function AnimalPhotosEditor({
  animal,
  fotos,
  previsualizaciones,
  seleccionFotoPrincipal,
  fotosAEliminar,
  errores,
  isSubmitting,
  onSeleccionarFotos,
  onQuitarFoto,
  onAlternarEliminacion,
  onSeleccionarFotoPrincipal,
}: AnimalPhotosEditorProps) {
  const fotosExistentesActivas = animal?.fotos.filter((foto) => !fotosAEliminar.includes(foto.id)) ?? []
  const fotoPrincipalExistenteActual = fotosExistentesActivas.find((foto) => foto.esPrincipal)
    ?? fotosExistentesActivas[0]
  const indicePrincipalAlGuardar = seleccionFotoPrincipal?.tipo === 'nueva'
    ? seleccionFotoPrincipal.indice
    : !fotosExistentesActivas.length && previsualizaciones.length
      ? 0
      : null

  return (
    <div className="admin-form__field animal-form__photos">
      <label>Foto(s)</label>
      <label className="animal-form__upload">
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isSubmitting}
          onChange={onSeleccionarFotos}
          aria-label="Subir fotos del animal"
        />
        <ImagePlus size={25} aria-hidden="true" />
        <span>Subir imágenes</span>
        <small>JPG, PNG o WEBP · hasta 6 fotos en total · máximo 5 MB por foto</small>
      </label>

      {previsualizaciones.length > 0 ? (
        <div className="animal-form__previews">
          {previsualizaciones.map((url, indice) => {
            const foto = fotos[indice]

            return (
              <div className="animal-form__preview" key={url}>
                <img src={url} alt={`Vista previa: ${foto.name}`} />
                {indicePrincipalAlGuardar === indice ? (
                  <span className="animal-form__primary-badge">
                    {animal?.fotos.length ? 'Principal al guardar' : 'Principal'}
                  </span>
                ) : null}
                <Button
                  className="animal-form__primary-photo"
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={indicePrincipalAlGuardar === indice
                    ? `${foto.name} será la foto principal al guardar`
                    : `Marcar ${foto.name} como foto principal`}
                  aria-pressed={indicePrincipalAlGuardar === indice}
                  title={indicePrincipalAlGuardar === indice
                    ? 'Foto principal al guardar'
                    : 'Marcar como foto principal'}
                  disabled={isSubmitting}
                  onClick={() => onSeleccionarFotoPrincipal({ tipo: 'nueva', indice })}
                >
                  <Star
                    size={15}
                    fill={indicePrincipalAlGuardar === indice ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  className="animal-form__remove-photo"
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${foto.name}`}
                  disabled={isSubmitting}
                  onClick={() => onQuitarFoto(indice)}
                >
                  <X size={15} aria-hidden="true" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : null}

      {seleccionFotoPrincipal ? (
        <small className="animal-form__primary-note" aria-live="polite">
          La selección se aplicará al guardar los cambios.
        </small>
      ) : null}

      {animal?.fotos.length ? (
        <div className="animal-form__previews" aria-label="Fotos actuales">
          {animal.fotos.map((foto) => {
            const pendienteEliminacion = fotosAEliminar.includes(foto.id)
            const esPrincipalActual = foto.id === fotoPrincipalExistenteActual?.id
            const esPrincipalAlGuardar = seleccionFotoPrincipal?.tipo === 'existente'
              ? seleccionFotoPrincipal.id === foto.id
              : seleccionFotoPrincipal === null && esPrincipalActual
            const etiquetaPrincipal = seleccionFotoPrincipal?.tipo === 'existente'
              && seleccionFotoPrincipal.id === foto.id
              ? 'Principal al guardar'
              : seleccionFotoPrincipal?.tipo === 'nueva' && esPrincipalActual
                ? 'Actual'
                : seleccionFotoPrincipal === null && esPrincipalActual
                  ? 'Principal'
                  : null

            return (
              <div
                className={`animal-form__preview${pendienteEliminacion ? ' animal-form__preview--pending-removal' : ''}`}
                key={foto.id}
              >
                <img src={foto.url} alt={`Foto actual de ${animal.nombre}`} />
                {pendienteEliminacion ? (
                  <span className="animal-form__pending-removal-label">Se quitará al guardar</span>
                ) : etiquetaPrincipal ? (
                  <span className="animal-form__primary-badge">{etiquetaPrincipal}</span>
                ) : null}
                <Button
                  className="animal-form__primary-photo"
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={esPrincipalAlGuardar
                    ? `Foto ${foto.id} será la principal al guardar`
                    : `Marcar foto ${foto.id} como principal al guardar`}
                  aria-pressed={esPrincipalAlGuardar}
                  title={esPrincipalAlGuardar ? 'Foto principal al guardar' : 'Marcar como foto principal'}
                  disabled={isSubmitting || pendienteEliminacion}
                  onClick={() => onSeleccionarFotoPrincipal({ tipo: 'existente', id: foto.id })}
                >
                  <Star size={15} fill={esPrincipalAlGuardar ? 'currentColor' : 'none'} aria-hidden="true" />
                </Button>
                <Button
                  className="animal-form__remove-photo"
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={pendienteEliminacion
                    ? `Conservar foto ${foto.id}`
                    : `Quitar foto ${foto.id} al guardar`}
                  title={pendienteEliminacion ? 'Deshacer' : 'Quitar al guardar'}
                  disabled={isSubmitting}
                  onClick={() => onAlternarEliminacion(foto.id)}
                >
                  {pendienteEliminacion
                    ? <RotateCcw size={15} aria-hidden="true" />
                    : <Trash2 size={15} aria-hidden="true" />}
                </Button>
              </div>
            )
          })}
        </div>
      ) : null}

      {errores.map((error, indice) => (
        <span className="admin-form__error" role="alert" key={indice}>
          {error}
        </span>
      ))}
    </div>
  )
}