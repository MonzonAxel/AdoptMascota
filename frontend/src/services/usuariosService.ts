import { clienteApi } from '@/services/api'
import type {
  DatosActualizarUsuario,
  DatosCrearUsuario,
  FiltrosUsuarios,
  Usuario,
} from '@/types/usuario'

export const usuariosService = {
  async listar(filtros: FiltrosUsuarios = {}) {
    const { data } = await clienteApi.get<Usuario[]>('/usuarios', { params: filtros })
    return data
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<Usuario>(`/usuarios/${id}`)
    return data
  },

  async crear(datos: DatosCrearUsuario) {
    const { data } = await clienteApi.post<Usuario>('/usuarios', datos)
    return data
  },

  async actualizar(id: number, datos: DatosActualizarUsuario) {
    const { data } = await clienteApi.patch<Usuario>(`/usuarios/${id}`, datos)
    return data
  },

  async darDeBaja(id: number) {
    await clienteApi.delete(`/usuarios/${id}`)
  },
}