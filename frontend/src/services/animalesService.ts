import { clienteApi } from '@/services/api'
import type {
  Animal,
  DatosActualizarAnimal,
  DatosActualizarFotoAnimal,
  DatosCrearAnimal,
  DatosCrearFotoAnimal,
  FiltrosAnimales,
  FiltrosPublicosAnimales,
  FotoAnimal,
} from '@/types/animal'

export const animalesService = {
  async listarPublicos(filtros: FiltrosPublicosAnimales = {}) {
    const { data } = await clienteApi.get<Animal[]>('/animales', {
      params: { ...filtros, estado: 'disponible' },
    })
    return data
  },

  async listar(filtros: FiltrosAnimales = {}) {
    const { data } = await clienteApi.get<Animal[]>('/animales', { params: filtros })
    return data
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<Animal>(`/animales/${id}`)
    return data
  },

  async crear(datos: DatosCrearAnimal) {
    const { data } = await clienteApi.post<Animal>('/animales', datos)
    return data
  },

  async actualizar(id: number, datos: DatosActualizarAnimal) {
    const { data } = await clienteApi.patch<Animal>(`/animales/${id}`, datos)
    return data
  },

  async darDeBaja(id: number) {
    await clienteApi.delete(`/animales/${id}`)
  },

  async agregarFoto(id: number, datos: DatosCrearFotoAnimal) {
    const { data } = await clienteApi.post<FotoAnimal>(`/animales/${id}/fotos`, datos)
    return data
  },

  async actualizarFoto(id: number, fotoId: number, datos: DatosActualizarFotoAnimal) {
    const { data } = await clienteApi.patch<FotoAnimal>(
      `/animales/${id}/fotos/${fotoId}`,
      datos,
    )
    return data
  },

  async eliminarFoto(id: number, fotoId: number) {
    await clienteApi.delete(`/animales/${id}/fotos/${fotoId}`)
  },
}