import { clienteApi } from '@/services/api'
import type {
  Animal,
  ColorAnimal,
  DatosActualizarAnimal,
  DatosCrearAnimal,
  EstadoAnimal,
  FiltrosAnimales,
  FiltrosPublicosAnimales,
  FotoAnimal,
  TipoEspecieAnimal,
  TipoSexoAnimal,
  TipoTamanoAnimal,
} from '@/types/animal'

interface FotoApi {
  id: number
  url: string
  es_principal: boolean
  orden: number
}

interface AnimalApi {
  id: number
  nombre: string
  especie: TipoEspecieAnimal
  raza: string | null
  sexo: TipoSexoAnimal
  tamano: TipoTamanoAnimal
  edad: number | null
  color: ColorAnimal
  comportamiento: string | null
  vacunado?: boolean
  esterilizado?: boolean
  estado: EstadoAnimal
  fecha_ingreso?: string
  creado_por?: number | null
  actualizado_por?: number | null
  foto_principal?: string | null
  fotos?: FotoApi[]
}

interface PaginaApi {
  items: AnimalApi[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginaAnimales {
  items: Animal[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OpcionesFiltrosMascotas {
  especies: string[]
  tamanos: string[]
  colores: string[]
  razas: string[]
}

const mapearAnimal = (origen: AnimalApi): Animal => {
  const fotos: FotoAnimal[] = (origen.fotos ?? []).map((foto: FotoApi) => ({
    id: foto.id,
    animalId: origen.id,
    url: foto.url,
    esPrincipal: Boolean(foto.es_principal),
    orden: foto.orden,
    creadoEn: '',
    actualizadoEn: null,
  }))

  if (fotos.length === 0 && origen.foto_principal) {
    fotos.push({
      id: 0,
      animalId: origen.id,
      url: origen.foto_principal,
      esPrincipal: true,
      orden: 0,
      creadoEn: '',
      actualizadoEn: null,
    })
  }

  return {
    id: origen.id,
    nombre: origen.nombre,
    especie: origen.especie,
    raza: origen.raza ?? null,
    sexo: origen.sexo,
    tamano: origen.tamano,
    edad: origen.edad ?? null,
    color: origen.color,
    comportamiento: origen.comportamiento ?? null,
    vacunado: Boolean(origen.vacunado),
    esterilizado: Boolean(origen.esterilizado),
    estado: origen.estado,
    fechaIngreso: origen.fecha_ingreso ?? '',
    creadoPor: origen.creado_por ?? null,
    actualizadoPor: origen.actualizado_por ?? null,
    creadoEn: origen.fecha_ingreso ?? '',
    actualizadoEn: null,
    eliminadoEn: null,
    fotos,
  }
}

const datosAFormData = (
  datos: DatosCrearAnimal,
  fotos: File[],
  indiceFotoPrincipal: number | null,
) => {
  const formData = new FormData()
  const campos: Record<string, unknown> = {
    nombre: datos.nombre,
    especie: datos.especie,
    raza: datos.raza,
    sexo: datos.sexo,
    tamano: datos.tamano,
    edad: datos.edad,
    color: datos.color,
    comportamiento: datos.comportamiento,
    vacunado: datos.vacunado,
    esterilizado: datos.esterilizado,
    estado: datos.estado,
    fecha_ingreso: datos.fechaIngreso,
  }

  Object.entries(campos).forEach(([campo, valor]) => {
    if (valor !== undefined && valor !== null) formData.append(campo, String(valor))
  })
  fotos.forEach((foto) => formData.append('fotos', foto))
  if (indiceFotoPrincipal !== null) {
    formData.append('foto_principal_index', String(indiceFotoPrincipal))
  }
  return formData
}

const datosAApi = (datos: DatosActualizarAnimal) => ({
  ...(datos.nombre !== undefined && { nombre: datos.nombre }),
  ...(datos.especie !== undefined && { especie: datos.especie }),
  ...(datos.raza !== undefined && { raza: datos.raza }),
  ...(datos.sexo !== undefined && { sexo: datos.sexo }),
  ...(datos.tamano !== undefined && { tamano: datos.tamano }),
  ...(datos.edad !== undefined && { edad: datos.edad }),
  ...(datos.color !== undefined && { color: datos.color }),
  ...(datos.comportamiento !== undefined && { comportamiento: datos.comportamiento }),
  ...(datos.vacunado !== undefined && { vacunado: datos.vacunado }),
  ...(datos.esterilizado !== undefined && { esterilizado: datos.esterilizado }),
  ...(datos.estado !== undefined && { estado: datos.estado }),
  ...(datos.fechaIngreso !== undefined && { fecha_ingreso: datos.fechaIngreso }),
})

const mapearPagina = (origen: PaginaApi): PaginaAnimales => ({
  ...origen,
  items: origen.items.map(mapearAnimal),
})

export const animalesService = {
  async listarPublicos(filtros: FiltrosPublicosAnimales = {}) {
    const { data } = await clienteApi.get<PaginaApi>('/mascotas', {
      params: {
        especie: filtros.especie,
        tamano: filtros.tamano,
        color: filtros.color,
        raza: filtros.raza,
        edad_min: filtros.edad_min,
        edad_max: filtros.edad_max,
        page: filtros.page ?? 1,
        limit: filtros.limit ?? 50,
      },
    })
    return mapearPagina(data)
  },

  async listar(filtros: FiltrosAnimales = {}) {
    const { data } = await clienteApi.get<PaginaApi>('/mascotas', { params: filtros })
    return mapearPagina(data)
  },

  async obtenerPorId(id: number) {
    const { data } = await clienteApi.get<AnimalApi>(`/mascotas/${id}`)
    return mapearAnimal(data)
  },

  async crear(
    datos: DatosCrearAnimal,
    fotos: File[] = [],
    indiceFotoPrincipal: number | null = null,
  ) {
    const { data } = await clienteApi.post<AnimalApi>(
      '/mascotas',
      datosAFormData(datos, fotos, indiceFotoPrincipal),
    )
    return mapearAnimal(data)
  },

  async actualizar(id: number, datos: DatosActualizarAnimal) {
    const { data } = await clienteApi.put<AnimalApi>(`/mascotas/${id}`, datosAApi(datos))
    return mapearAnimal(data)
  },

  async darDeBaja(id: number) {
    await clienteApi.delete(`/mascotas/${id}`)
  },

  async obtenerOpcionesFiltros() {
    const { data } = await clienteApi.get<OpcionesFiltrosMascotas>('/mascotas/filtros')
    return data
  },

  async agregarFotos(id: number, fotos: File[], indiceFotoPrincipal: number | null = null) {
    const formData = new FormData()
    fotos.forEach((foto) => formData.append('fotos', foto))
    if (indiceFotoPrincipal !== null) {
      formData.append('foto_principal_index', String(indiceFotoPrincipal))
    }
    const { data } = await clienteApi.post<AnimalApi>(`/mascotas/${id}/fotos`, formData)
    return mapearAnimal(data)
  },

  async establecerFotoPrincipal(id: number, fotoId: number) {
    const { data } = await clienteApi.patch<AnimalApi>(
      `/mascotas/${id}/fotos/${fotoId}/principal`,
    )
    return mapearAnimal(data)
  },

  async eliminarFoto(id: number, fotoId: number) {
    const { data } = await clienteApi.delete<AnimalApi>(`/mascotas/${id}/fotos/${fotoId}`)
    return mapearAnimal(data)
  },
}