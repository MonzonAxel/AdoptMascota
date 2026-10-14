import { createContext, useEffect, useState, type PropsWithChildren } from 'react'

import { authService, type UsuarioAutenticado } from '@/services/authService'
import { tokenStorage } from '@/services/api'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  usuario: UsuarioAutenticado | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokenStorage.get()))
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()))
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)

  useEffect(() => {
    if (!tokenStorage.get()) return
    let activo = true

    authService.obtenerActual()
      .then((usuarioActual) => {
        if (activo) setUsuario(usuarioActual)
      })
      .catch(() => {
        tokenStorage.clear()
        if (activo) setIsAuthenticated(false)
      })
      .finally(() => {
        if (activo) setIsLoading(false)
      })

    return () => {
      activo = false
    }
  }, [])

  async function signIn(email: string, password: string) {
    const usuarioAutenticado = await authService.iniciar(email, password)
    setUsuario(usuarioAutenticado)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  async function signOut() {
    try {
      await authService.cerrar()
    } finally {
      setUsuario(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, usuario, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
