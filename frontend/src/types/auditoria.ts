export type TipoAccionHistorial = 'insert' | 'update' | 'delete'

export interface RegistroHistorialCambio {
  id: number
  nombreTabla: string
  registroId: number
  usuarioId: number
  accion: TipoAccionHistorial
  campo: string | null
  valorAnterior: string | null
  valorActual: string | null
  creadoEn: string
}

export interface FiltrosHistorialCambios {
  nombreTabla?: string
  registroId?: number
  usuarioId?: number
  accion?: TipoAccionHistorial
  desde?: string
  hasta?: string
}