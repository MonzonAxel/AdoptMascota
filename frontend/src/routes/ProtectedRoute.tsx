import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@/components/Button/Button'
import { useAuth } from '@/hooks/useAuth'
import type { RolUsuario } from '@/types/usuario'

type ProtectedRouteProps = {
  roles?: RolUsuario[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, sessionError, usuario, retrySession } = useAuth()
  const location = useLocation()

  if (isLoading) return <p role="status">Validando sesión...</p>

  if (sessionError) {
    return (
      <div role="status">
        <p>{sessionError}</p>
        <Button variant="outline" onClick={() => { void retrySession() }}>Reintentar</Button>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && (!usuario || !roles.includes(usuario.rol))) {
    return <Navigate to="/admin/mascotas" replace />
  }

  return <Outlet />
}
