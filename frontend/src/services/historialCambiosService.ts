import { clienteApi } from '@/services/api'
import type { FiltrosHistorialCambios, RegistroHistorialCambio } from '@/types/auditoria'

export const historialCambiosService = {
  async listar(filtros: FiltrosHistorialCambios = {}) {
    const { data } = await clienteApi.get<RegistroHistorialCambio[]>('/historial-cambios', {
      params: filtros,
    })
    return data
  },
}