import axios from 'axios'
import { createContext, useCallback, useEffect, useState, type PropsWithChildren } from 'react'

import { authService, type UsuarioAutenticado } from '@/services/authService'
import { AUTH_SESSION_EXPIRED_EVENT } from '@/services/api'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  sessionError: string | null
  usuario: UsuarioAutenticado | null
  retrySession: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const esNoAutorizado = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)

  const retrySession = useCallback(async (mostrarCarga = true) => {
    if (mostrarCarga) {
      setIsLoading(true)
      setSessionError(null)
    }
    try {
      const usuarioActual = await authService.obtenerActual()
      setUsuario(usuarioActual)
      setIsAuthenticated(true)
    } catch (error) {
      if (esNoAutorizado(error)) {
        setUsuario(null)
        setIsAuthenticated(false)
      } else {
        setSessionError('No se pudo validar la sesión. Comprueba tu conexión e inténtalo de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let activo = true
    const cerrarSesionLocal = () => {
      setUsuario(null)
      setIsAuthenticated(false)
      setSessionError(null)
      setIsLoading(false)
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, cerrarSesionLocal)
    authService.obtenerActual()
      .then((usuarioActual) => {
        if (!activo) return
        setUsuario(usuarioActual)
        setIsAuthenticated(true)
      })
      .catch((error: unknown) => {
        if (!activo) return
        if (esNoAutorizado(error)) {
          setUsuario(null)
          setIsAuthenticated(false)
        } else {
          setSessionError('No se pudo validar la sesión. Comprueba tu conexión e inténtalo de nuevo.')
        }
      })
      .finally(() => {
        if (activo) setIsLoading(false)
      })

    return () => {
      activo = false
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, cerrarSesionLocal)
    }
  }, [])

  async function signIn(email: string, password: string) {
    setIsLoading(true)
    setSessionError(null)
    try {
      const usuarioAutenticado = await authService.iniciar(email, password)
      setUsuario(usuarioAutenticado)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    try {
      await authService.cerrar()
    } catch (error) {
      if (!esNoAutorizado(error)) throw error
    }

    setUsuario(null)
    setIsAuthenticated(false)
    setSessionError(null)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      sessionError,
      usuario,
      retrySession,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
