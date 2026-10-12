import { CheckCircle2, Heart, Loader2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button/Button'
import type { Animal } from '@/types/animal'
import { formatearEspecie } from '@/utils/formateadoresAnimal'

import './AdoptionModal.css'

const esquemaSolicitud = z.object({
  nombreApellido: z.string().min(3, 'Ingresá tu nombre y apellido completo.'),
  correoElectronico: z.string().email('Ingresá un correo electrónico válido.'),
  telefonoCelular: z
    .string()
    .min(7, 'Ingresá un número de teléfono o celular válido.')
    .regex(/^[0-9+\s\-()]+$/, 'El teléfono contiene caracteres inválidos.'),
  edad: z.string().refine((val) => {
    const num = Number(val)
    return !Number.isNaN(num) && num >= 18 && num <= 100
  }, 'Debés tener al menos 18 años para solicitar una adopción.'),
  localidadBarrio: z.string().min(2, 'Ingresá tu localidad o barrio.'),
  vivienda: z.string().min(1, 'Seleccioná el tipo de vivienda.'),
  tipoTenencia: z.string().min(1, 'Seleccioná el tipo de tenencia.'),
  otrosAnimalesHogar: z.string().min(2, 'Indicanos si convivís con otros animales.'),
  motivoAdopcion: z
    .string()
    .min(15, 'Contanos con un poco más de detalle por qué querés adoptar (mínimo 15 caracteres).'),
})

export type DatosSolicitudFormulario = z.infer<typeof esquemaSolicitud>

type AdoptionModalProps = {
  animal: Animal
  isOpen: boolean
  onClose: () => void
}

export function AdoptionModal({ animal, isOpen, onClose }: AdoptionModalProps) {
  const [enviadoExitosamente, setEnviadoExitosamente] = useState(false)
  const [numeroSolicitud, setNumeroSolicitud] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitudFormulario>({
    resolver: zodResolver(esquemaSolicitud),
    defaultValues: {
      nombreApellido: '',
      correoElectronico: '',
      telefonoCelular: '',
      edad: '25',
      localidadBarrio: '',
      vivienda: 'casa',
      tipoTenencia: 'propietario',
      otrosAnimalesHogar: 'No tengo otras mascotas',
      motivoAdopcion: '',
    },
  })

  if (!isOpen) return null

  function handleCerrar() {
    reset()
    setEnviadoExitosamente(false)
    onClose()
  }

  async function onSubmit(data: DatosSolicitudFormulario) {
    // Simula envío a API o persistencia en localStorage
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const solicitudesGuardadas = JSON.parse(
        localStorage.getItem('solicitudes_adopcion') || '[]',
      )
      const nuevoId = Date.now()
      solicitudesGuardadas.push({
        id: nuevoId,
        animalId: animal.id,
        animalNombre: animal.nombre,
        fecha: new Date().toISOString(),
        ...data,
      })
      localStorage.setItem('solicitudes_adopcion', JSON.stringify(solicitudesGuardadas))
      setNumeroSolicitud(nuevoId)
    } catch {
      setNumeroSolicitud(Math.floor(1000 + Math.random() * 9000))
    }

    setEnviadoExitosamente(true)
  }

  return (
    <div className="adoption-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="adoption-modal">
        <button
          className="adoption-modal__close"
          type="button"
          onClick={handleCerrar}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {enviadoExitosamente ? (
          <div className="adoption-modal__success">
            <div className="adoption-modal__success-icon">
              <CheckCircle2 size={64} strokeWidth={1.8} />
            </div>
            <h2 id="modal-title" className="adoption-modal__success-title">
              ¡Solicitud enviada con éxito!
            </h2>
            <p className="adoption-modal__success-desc">
              Gracias por tu compromiso con la adopción responsable. Recibimos tu postulación
              para <strong>{animal.nombre}</strong>.
            </p>
            <div className="adoption-modal__success-ticket">
              <Sparkles size={18} />
              <span>
                Comprobante N°: <strong>#{numeroSolicitud}</strong>
              </span>
            </div>
            <p className="adoption-modal__success-info">
              El equipo del refugio revisará tus datos y se comunicará a la brevedad para coordinar
              los próximos pasos y el encuentro.
            </p>
            <Button size="lg" type="button" onClick={handleCerrar}>
              Aceptar y volver
            </Button>
          </div>
        ) : (
          <div className="adoption-modal__content">
            <header className="adoption-modal__header">
              <div className="adoption-modal__badge">
                <Heart size={14} fill="currentColor" />
                <span>Adopción responsable de {formatearEspecie(animal.especie)}</span>
              </div>
              <h2 id="modal-title" className="adoption-modal__title">
                Solicitud para {animal.nombre}
              </h2>
              <p className="adoption-modal__intro">
                Completá el siguiente formulario para que nuestro equipo pueda conocerte y evaluar la
                compatibilidad con {animal.nombre}.
              </p>
            </header>

            <form className="adoption-modal__form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="nombreApellido">Nombre y Apellido *</label>
                  <input
                    id="nombreApellido"
                    type="text"
                    placeholder="Ej. Laura Gómez"
                    {...register('nombreApellido')}
                    aria-invalid={Boolean(errors.nombreApellido)}
                  />
                  {errors.nombreApellido && (
                    <span className="adoption-modal__error">{errors.nombreApellido.message}</span>
                  )}
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="correoElectronico">Correo Electrónico *</label>
                  <input
                    id="correoElectronico"
                    type="email"
                    placeholder="laura@ejemplo.com"
                    {...register('correoElectronico')}
                    aria-invalid={Boolean(errors.correoElectronico)}
                  />
                  {errors.correoElectronico && (
                    <span className="adoption-modal__error">
                      {errors.correoElectronico.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="telefonoCelular">Teléfono / WhatsApp *</label>
                  <input
                    id="telefonoCelular"
                    type="tel"
                    placeholder="Ej. 11 4567 8901"
                    {...register('telefonoCelular')}
                    aria-invalid={Boolean(errors.telefonoCelular)}
                  />
                  {errors.telefonoCelular && (
                    <span className="adoption-modal__error">
                      {errors.telefonoCelular.message}
                    </span>
                  )}
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="edad">Edad *</label>
                  <input
                    id="edad"
                    type="number"
                    min={18}
                    max={100}
                    {...register('edad')}
                    aria-invalid={Boolean(errors.edad)}
                  />
                  {errors.edad && (
                    <span className="adoption-modal__error">{errors.edad.message}</span>
                  )}
                </div>
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="localidadBarrio">Ciudad / Barrio *</label>
                  <input
                    id="localidadBarrio"
                    type="text"
                    placeholder="Ej. Palermo, CABA"
                    {...register('localidadBarrio')}
                    aria-invalid={Boolean(errors.localidadBarrio)}
                  />
                  {errors.localidadBarrio && (
                    <span className="adoption-modal__error">
                      {errors.localidadBarrio.message}
                    </span>
                  )}
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="vivienda">Tipo de vivienda *</label>
                  <select id="vivienda" {...register('vivienda')}>
                    <option value="casa">Casa con patio / jardín</option>
                    <option value="depto">Departamento</option>
                    <option value="otro">Casa sin patio / Quinta</option>
                  </select>
                </div>
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="tipoTenencia">Régimen de vivienda *</label>
                  <select id="tipoTenencia" {...register('tipoTenencia')}>
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino (Permite mascotas)</option>
                  </select>
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="otrosAnimalesHogar">¿Otras mascotas en casa? *</label>
                  <input
                    id="otrosAnimalesHogar"
                    type="text"
                    placeholder="Ej. 1 perro castrado, o Ninguna"
                    {...register('otrosAnimalesHogar')}
                    aria-invalid={Boolean(errors.otrosAnimalesHogar)}
                  />
                  {errors.otrosAnimalesHogar && (
                    <span className="adoption-modal__error">
                      {errors.otrosAnimalesHogar.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="adoption-modal__field">
                <label htmlFor="motivoAdopcion">¿Por qué querés adoptar a {animal.nombre}? *</label>
                <textarea
                  id="motivoAdopcion"
                  rows={3}
                  placeholder="Contanos tu rutina, quiénes viven en el hogar y cómo se preparan para recibirlo/a..."
                  {...register('motivoAdopcion')}
                  aria-invalid={Boolean(errors.motivoAdopcion)}
                />
                {errors.motivoAdopcion && (
                  <span className="adoption-modal__error">{errors.motivoAdopcion.message}</span>
                )}
              </div>

              <div className="adoption-modal__actions">
                <Button variant="outline" type="button" onClick={handleCerrar} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="adoption-modal__spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud de Adopción'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
