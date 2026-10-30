import { CheckCircle2, Heart, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button/Button'
import type { Animal } from '@/types/animal'
import { solicitudesService } from '@/services/solicitudesService'
import { formatearEspecie } from '@/utils/formateadoresAnimal'

import './AdoptionModal.css'

const esquemaSolicitud = z.object({
  nombreApellido: z.string().trim().min(3, 'Ingresá tu nombre y apellido completo.').max(100),
  correoElectronico: z.string().trim().email('Ingresá un correo electrónico válido.').max(150).toLowerCase(),
  dni: z.string().trim().regex(/^\d{7,8}$/, 'Ingresá un DNI válido de 7 u 8 dígitos.'),
  telefonoCelular: z
    .string().trim().min(6, 'Ingresá un número de teléfono válido.').max(30)
    .regex(/^[0-9+\s\-()]+$/, 'El teléfono contiene caracteres inválidos.'),
  telefonoFijo: z.string().trim().max(30).transform((valor) => valor || null)
    .refine((valor) => valor === null || /^[0-9+\s\-()]{6,30}$/.test(valor), 'Ingresá un teléfono fijo válido o dejalo vacío.'),
  edad: z.string().trim().regex(/^\d+$/, 'Ingresá tu edad en años.').transform(Number)
    .refine((edad) => edad >= 18 && edad <= 100, 'Debés tener entre 18 y 100 años para solicitar una adopción.'),
  ocupacion: z.string().trim().min(2, 'Ingresá tu ocupación.').max(150),
  localidadBarrio: z.string().trim().min(2, 'Ingresá tu localidad o barrio.').max(150),
  direccion: z.string().trim().min(2, 'Ingresá tu dirección.').max(150),
  vivienda: z.enum(['casa', 'departamento', 'ph', 'otro']),
  tipoTenencia: z.enum(['propietario', 'inquilino']),
  permiteAnimales: z.string().transform((valor) => valor === 'si' ? true : valor === 'no' ? false : null),
  detalleVivienda: z.string().trim().min(2, 'Describí brevemente la vivienda.').max(2000),
  personasHogar: z.string().trim().min(2, 'Indicá cuántas personas viven en el hogar y sus edades.').max(2000),
  hayNinosHogar: z.string().trim().min(2, 'Indicá si hay niños en el hogar.').max(2000),
  otrosAnimalesHogar: z.string().trim().min(2, 'Indicanos si convivís con otros animales.').max(2000),
  frecuenciaPaseo: z.string().trim().min(2, 'Indicá la frecuencia de paseo.').max(255),
  cuidadorVacaciones: z.string().trim().min(2, 'Indicá quién cuidará a la mascota durante tus vacaciones.').max(2000),
}).superRefine((datos, contexto) => {
  if (datos.tipoTenencia === 'inquilino' && datos.permiteAnimales === null) {
    contexto.addIssue({ code: 'custom', path: ['permiteAnimales'], message: 'Indicá si el propietario permite animales.' })
  }
})

export type DatosSolicitudFormulario = z.input<typeof esquemaSolicitud>
type SolicitudValidada = z.output<typeof esquemaSolicitud>

type AdoptionModalProps = {
  animal: Animal
  isOpen: boolean
  onClose: () => void
}

export function AdoptionModal({ animal, isOpen, onClose }: AdoptionModalProps) {
  const navigate = useNavigate()
  const [enviadoExitosamente, setEnviadoExitosamente] = useState(false)
  const [numeroSolicitud, setNumeroSolicitud] = useState<number | null>(null)
  const [mensajeError, setMensajeError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitudFormulario, unknown, SolicitudValidada>({
    resolver: zodResolver(esquemaSolicitud),
    defaultValues: {
      nombreApellido: '',
      correoElectronico: '',
      dni: '',
      telefonoCelular: '',
      telefonoFijo: '',
      edad: '25',
      ocupacion: '',
      localidadBarrio: '',
      direccion: '',
      vivienda: 'casa',
      tipoTenencia: 'propietario',
      permiteAnimales: '',
      detalleVivienda: '',
      personasHogar: '',
      hayNinosHogar: '',
      otrosAnimalesHogar: '',
      frecuenciaPaseo: '',
      cuidadorVacaciones: '',
    },
  })
  const tipoTenencia = useWatch({ control, name: 'tipoTenencia' })

  if (!isOpen) return null

  function handleCerrar() {
    const redirigirAlListado = enviadoExitosamente
    reset()
    setEnviadoExitosamente(false)
    setNumeroSolicitud(null)
    setMensajeError('')
    onClose()
    if (redirigirAlListado) {
      navigate('/mascotas', { replace: true, state: { solicitudEnviada: true } })
    }
  }

  async function onSubmit(data: SolicitudValidada) {
    setMensajeError('')
    try {
      const solicitud = await solicitudesService.crear({
        animal_id: animal.id,
        nombre_apellido: data.nombreApellido,
        email: data.correoElectronico,
        dni: data.dni,
        edad: data.edad,
        telefono_celular: data.telefonoCelular,
        telefono_fijo: data.telefonoFijo,
        ocupacion: data.ocupacion,
        localidad_barrio: data.localidadBarrio,
        direccion: data.direccion,
        vivienda: data.vivienda,
        tipo_tenencia: data.tipoTenencia,
        permite_animales: data.tipoTenencia === 'inquilino' ? data.permiteAnimales : null,
        detalle_vivienda: data.detalleVivienda,
        personas_hogar: data.personasHogar,
        hay_ninos_hogar: data.hayNinosHogar,
        otros_animales_hogar: data.otrosAnimalesHogar,
        frecuencia_paseo: data.frecuenciaPaseo,
        cuidador_vacaciones: data.cuidadorVacaciones,
      })
      setNumeroSolicitud(solicitud.id)
      setEnviadoExitosamente(true)
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.')
    }
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
              Recibimos tu postulación para <strong>{animal.nombre}</strong>.
            </p>
            <p className="adoption-modal__success-info">
              El equipo del refugio revisará tus datos y se comunicará a tu WhatsApp para coordinar
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
              {Object.keys(errors).length > 0 ? (
                <p className="adoption-modal__error" role="alert">Revisá los campos marcados antes de enviar.</p>
              ) : null}
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

              <div className="adoption-modal__field">
                <label htmlFor="dni">DNI *</label>
                <input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  placeholder="Ej. 12345678"
                  {...register('dni')}
                  aria-invalid={Boolean(errors.dni)}
                />
                {errors.dni ? <span className="adoption-modal__error">{errors.dni.message}</span> : null}
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
                  <label htmlFor="direccion">Dirección *</label>
                  <input id="direccion" autoComplete="street-address" {...register('direccion')} aria-invalid={Boolean(errors.direccion)} />
                  {errors.direccion ? <span className="adoption-modal__error">{errors.direccion.message}</span> : null}
                </div>
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="ocupacion">Ocupación *</label>
                  <input id="ocupacion" autoComplete="organization-title" {...register('ocupacion')} aria-invalid={Boolean(errors.ocupacion)} />
                  {errors.ocupacion ? <span className="adoption-modal__error">{errors.ocupacion.message}</span> : null}
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="telefonoFijo">Teléfono fijo (opcional)</label>
                  <input id="telefonoFijo" type="tel" {...register('telefonoFijo')} aria-invalid={Boolean(errors.telefonoFijo)} />
                  {errors.telefonoFijo ? <span className="adoption-modal__error">{errors.telefonoFijo.message}</span> : null}
                </div>
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="vivienda">Tipo de vivienda *</label>
                  <select id="vivienda" {...register('vivienda')}>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="ph">PH</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="adoption-modal__field">
                  <label htmlFor="tipoTenencia">Régimen de vivienda *</label>
                  <select id="tipoTenencia" {...register('tipoTenencia')}>
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                  </select>
                </div>
              </div>

              {tipoTenencia === 'inquilino' ? (
                <div className="adoption-modal__field">
                  <label htmlFor="permiteAnimales">¿El contrato permite animales? *</label>
                  <select id="permiteAnimales" {...register('permiteAnimales')} aria-invalid={Boolean(errors.permiteAnimales)}>
                    <option value="">Seleccionar</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                  {errors.permiteAnimales ? <span className="adoption-modal__error">{errors.permiteAnimales.message}</span> : null}
                </div>
              ) : null}

              <div className="adoption-modal__row">
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
                <div className="adoption-modal__field">
                  <label htmlFor="personasHogar">Personas que viven en el hogar *</label>
                  <input id="personasHogar" {...register('personasHogar')} aria-invalid={Boolean(errors.personasHogar)} />
                  {errors.personasHogar ? <span className="adoption-modal__error">{errors.personasHogar.message}</span> : null}
                </div>
              </div>

              <div className="adoption-modal__field">
                <label htmlFor="detalleVivienda">Describí la vivienda y el espacio disponible *</label>
                <textarea
                  id="detalleVivienda"
                  rows={3}
                  {...register('detalleVivienda')}
                  aria-invalid={Boolean(errors.detalleVivienda)}
                />
                {errors.detalleVivienda ? <span className="adoption-modal__error">{errors.detalleVivienda.message}</span> : null}
              </div>

              <div className="adoption-modal__row">
                <div className="adoption-modal__field">
                  <label htmlFor="hayNinosHogar">¿Hay niños en el hogar? *</label>
                  <input id="hayNinosHogar" {...register('hayNinosHogar')} aria-invalid={Boolean(errors.hayNinosHogar)} />
                  {errors.hayNinosHogar ? <span className="adoption-modal__error">{errors.hayNinosHogar.message}</span> : null}
                </div>
                <div className="adoption-modal__field">
                  <label htmlFor="frecuenciaPaseo">Frecuencia de paseo *</label>
                  <input id="frecuenciaPaseo" {...register('frecuenciaPaseo')} aria-invalid={Boolean(errors.frecuenciaPaseo)} />
                  {errors.frecuenciaPaseo ? <span className="adoption-modal__error">{errors.frecuenciaPaseo.message}</span> : null}
                </div>
              </div>

              <div className="adoption-modal__field">
                <label htmlFor="cuidadorVacaciones">¿Quién cuidará a la mascota durante tus vacaciones? *</label>
                <textarea
                  id="cuidadorVacaciones"
                  rows={2}
                  {...register('cuidadorVacaciones')}
                  aria-invalid={Boolean(errors.cuidadorVacaciones)}
                />
                {errors.cuidadorVacaciones ? <span className="adoption-modal__error">{errors.cuidadorVacaciones.message}</span> : null}
              </div>

              {mensajeError ? <p className="adoption-modal__error" role="alert">{mensajeError}</p> : null}

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
