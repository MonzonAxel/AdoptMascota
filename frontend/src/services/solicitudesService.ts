import { clienteApi } from '@/services/api'
import type {
  DatosCrearObservacion,
  DatosCrearSolicitud,
  EstadoSolicitud,
  FiltrosSolicitudes,
  ObservacionSolicitud,
  ResumenSolicitudAdopcion,
  SolicitudAdopcion,
} from '@/types/solicitud'

export const solicitudesService = {
  async listar(filtros: FiltrosSolicitudes = {}) {
    const { data } = await clienteApi.get<ResumenSolicitudAdopcion[]>('/solicitudes-adopcion', {
      params: filtros,
    })
    return data
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<SolicitudAdopcion>(`/solicitudes-adopcion/${id}`)
    return data
  },

  async crear(datos: DatosCrearSolicitud) {
    const { data } = await clienteApi.post<SolicitudAdopcion>('/solicitudes-adopcion', datos)
    return data
  },

  async actualizarEstado(id: number, estado: EstadoSolicitud) {
    const { data } = await clienteApi.patch<SolicitudAdopcion>(
      `/solicitudes-adopcion/${id}/estado`,
      { estado },
    )
    return data
  },

  async listarObservaciones(id: number) {
    const { data } = await clienteApi.get<ObservacionSolicitud[]>(
      `/solicitudes-adopcion/${id}/observaciones`,
    )
    return data
  },

  async agregarObservacion(id: number, datos: DatosCrearObservacion) {
    const { data } = await clienteApi.post<ObservacionSolicitud>(
      `/solicitudes-adopcion/${id}/observaciones`,
      datos,
    )
    return data
  },
}