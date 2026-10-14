import { clienteApi } from '@/services/api'
import type {
  DatosActualizarUsuario,
  DatosCrearUsuario,
  Usuario,
} from '@/types/usuario'

interface UsuarioApi {
  id: number
  email: string
  rol: Usuario['rol']
  nombre: string | null
  apellido: string | null
  creado: string
}

const mapearUsuario = (origen: UsuarioApi): Usuario => ({
  id: origen.id,
  correoElectronico: origen.email,
  rol: origen.rol,
  perfil: {
    id: origen.id,
    usuarioId: origen.id,
    nombre: origen.nombre ?? '',
    apellido: origen.apellido ?? '',
    creadoEn: origen.creado,
    actualizadoEn: null,
  },
  creadoEn: origen.creado,
  actualizadoEn: null,
  eliminadoEn: null,
})

const aDatosApi = (datos: DatosCrearUsuario | DatosActualizarUsuario) => ({
  ...(datos.correoElectronico !== undefined && { email: datos.correoElectronico }),
  ...(datos.contrasena && { password: datos.contrasena }),
  ...(datos.rol !== undefined && { rol: datos.rol }),
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.apellido !== undefined && { apellido: datos.apellido }),
})

export const usuariosService = {
  async listar() {
    const { data } = await clienteApi.get<UsuarioApi[]>('/usuarios')
    return data.map(mapearUsuario)
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<UsuarioApi>(`/usuarios/${id}`)
    return mapearUsuario(data)
  },

  async crear(datos: DatosCrearUsuario) {
    const { data } = await clienteApi.post<UsuarioApi>('/usuarios', aDatosApi(datos))
    return mapearUsuario(data)
  },

  async actualizar(id: number, datos: DatosActualizarUsuario) {
    const { data } = await clienteApi.put<UsuarioApi>(`/usuarios/${id}`, aDatosApi(datos))
    return mapearUsuario(data)
  },

  async darDeBaja(id: number) {
    await clienteApi.delete(`/usuarios/${id}`)
  },
}