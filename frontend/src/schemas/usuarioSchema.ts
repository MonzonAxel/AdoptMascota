import { z } from 'zod'

export const esquemaUsuario = z
  .object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
    apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres.').max(100),
    correoElectronico: z.string().trim().email('Ingresa un correo electrónico válido.').max(150),
    rol: z
      .string()
      .min(1, 'Selecciona un rol.')
      .pipe(z.enum(['admin', 'administrativo'])),
    contrasena: z
      .string()
      .refine((valor) => valor === '' || valor.length >= 8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(72, 'La contraseña no puede superar los 72 caracteres.'),
    repetirContrasena: z.string(),
  })
  .superRefine((datos, contexto) => {
    if (datos.contrasena && datos.contrasena !== datos.repetirContrasena) {
      contexto.addIssue({
        code: 'custom',
        message: 'Las contraseñas no coinciden.',
        path: ['repetirContrasena'],
      })
    }
  })

export type DatosFormularioUsuario = z.input<typeof esquemaUsuario>
export type UsuarioValidado = z.output<typeof esquemaUsuario>