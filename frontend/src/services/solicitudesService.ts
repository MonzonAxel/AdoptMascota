import { clienteApi } from '@/services/api'
import type {
  DatosCrearObservacion,
  DatosCrearSolicitud,
  DatosCambioEstado,
  EstadoSolicitud,
  FiltrosSolicitudes,
  ObservacionSolicitud,
  PaginaSolicitudes,
  SolicitudAdopcion,
} from '@/types/solicitud'

export const solicitudesService = {
  async listar(filtros: FiltrosSolicitudes = {}) {
    const { data } = await clienteApi.get<PaginaSolicitudes>('/solicitudes', {
      params: filtros,
    })
    return data
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<SolicitudAdopcion>(`/solicitudes/${id}`)
    return data
  },

  async crear(datos: DatosCrearSolicitud) {
    const { data } = await clienteApi.post<{ id: number; estado: EstadoSolicitud }>('/solicitudes', datos)
    return data
  },

  async actualizarEstado(id: number, datos: DatosCambioEstado) {
    const { data } = await clienteApi.put<SolicitudAdopcion>(
      `/solicitudes/${id}/estado`,
      datos,
    )
    return data
  },

  async agregarObservacion(id: number, datos: DatosCrearObservacion) {
    const { data } = await clienteApi.post<ObservacionSolicitud>(
      `/solicitudes/${id}/observaciones`,
      datos,
    )
    return data
  },
}