import { clienteApi } from '@/services/api'
import type { RolUsuario } from '@/types/usuario'

export interface UsuarioAutenticado {
  id: number
  email: string
  nombre: string | null
  apellido: string | null
  rol: RolUsuario
}

interface RespuestaSesion {
  expira_en: string
  usuario: UsuarioAutenticado
}

export const authService = {
  async iniciar(email: string, password: string) {
    const { data } = await clienteApi.post<RespuestaSesion>('/auth/login', { email, password })
    return data.usuario
  },

  async obtenerActual() {
    const { data } = await clienteApi.get<UsuarioAutenticado>('/usuarios/me')
    return data
  },

  async cerrar() {
    await clienteApi.post('/auth/logout')
  },
}