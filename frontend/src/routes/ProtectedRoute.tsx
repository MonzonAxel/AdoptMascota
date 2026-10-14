import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import type { RolUsuario } from '@/types/usuario'

type ProtectedRouteProps = {
  roles?: RolUsuario[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, usuario } = useAuth()
  const location = useLocation()

  if (isLoading) return <p role="status">Validando sesión...</p>

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && (!usuario || !roles.includes(usuario.rol))) {
    return <Navigate to="/admin/mascotas" replace />
  }

  return <Outlet />
}
