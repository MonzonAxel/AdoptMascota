import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginLayout } from '@/layout/LoginLayout/LoginLayout'
import { PrivateLayout } from '@/layout/PrivateLayout/PrivateLayout'
import { PublicLayout } from '@/layout/PublicLayout/PublicLayout'
import { AdminPetsPage } from '@/pages/admin/mascotas/AdminPetsPage'
import { AdminRequestsPage } from '@/pages/admin/solicitudes/AdminRequestsPage'
import { AdminUsersPage } from '@/pages/admin/usuarios/AdminUsersPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { HomePage } from '@/pages/web/inicio/HomePage'
import { PetDetailPage } from '@/pages/web/mascotas/PetDetailPage'
import { PetsPage } from '@/pages/web/mascotas/PetsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/mascotas" element={<PetsPage />} />
        <Route path="/mascotas/:id" element={<PetDetailPage />} />
      </Route>

      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/mascotas" replace />} />
          <Route path="/admin/mascotas" element={<AdminPetsPage />} />
          <Route path="/admin/solicitudes" element={<AdminRequestsPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
