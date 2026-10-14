import { z } from 'zod'

const archivoImagenSchema = z
  .custom<File>(
    (valor): valor is File => typeof File !== 'undefined' && valor instanceof File,
    'Selecciona un archivo válido.',
  )
  .refine(
    (archivo) => ['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type),
    'El archivo debe ser JPG, PNG o WEBP.',
  )
  .refine((archivo) => archivo.size <= 5 * 1024 * 1024, 'Cada imagen debe pesar hasta 5 MB.')

const edadAnimalSchema = z
  .string()
  .trim()
  .refine((valor) => valor === '' || /^\d+$/.test(valor), 'Ingresa la edad en años completos.')
  .transform((valor) => (valor === '' ? null : Number(valor)))
  .refine((edad) => edad === null || (edad >= 0 && edad <= 40), 'La edad debe estar entre 0 y 40 años.')

export const esquemaAnimal = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  especie: z
    .string()
    .min(1, 'Selecciona una especie.')
    .pipe(z.enum(['perro', 'gato'])),
  sexo: z.string().min(1, 'Selecciona el sexo.').pipe(z.enum(['macho', 'hembra'])),
  raza: z
    .string()
    .trim()
    .max(100, 'La raza no puede superar los 100 caracteres.')
    .transform((valor) => valor || null),
  edad: edadAnimalSchema,
  color: z
    .string()
    .min(1, 'Selecciona un color.')
    .pipe(z.enum([
      'negro', 'blanco', 'marron', 'gris', 'naranja', 'crema', 'dorado',
      'atigrado', 'manchado', 'tricolor', 'otro',
    ])),
  tamano: z
    .string()
    .min(1, 'Selecciona un tamaño.')
    .pipe(z.enum(['pequeno', 'mediano', 'grande'])),
  estado: z.enum(['disponible', 'en_proceso', 'adoptado']).optional(),
  vacunado: z.boolean(),
  esterilizado: z.boolean(),
  comportamiento: z
    .string()
    .trim()
    .max(2000, 'La descripción no puede superar los 2000 caracteres.')
    .transform((valor) => valor || null),
  fotos: z.array(archivoImagenSchema).max(6, 'Puedes seleccionar hasta 6 imágenes.'),
})

export type DatosFormularioAnimal = z.input<typeof esquemaAnimal>
export type AnimalValidado = z.output<typeof esquemaAnimal>