import { ClipboardList, LayoutDashboard, LogOut, PawPrint, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { Brand } from '@/components/Brand/Brand'
import { Button } from '@/components/Button/Button'
import { useAuth } from '@/hooks/useAuth'

import './PrivateLayout.css'

const adminLinks = [
  { to: '/admin/mascotas', label: 'Mascotas', icon: PawPrint },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

export function PrivateLayout() {
  const { signOut, usuario } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="private-layout">
      <aside className="private-layout__sidebar">
        <Brand />
        <div className="private-layout__section-label">Administracion</div>
        <nav className="private-layout__nav" aria-label="Navegacion administrativa">
          {adminLinks.filter(({ to }) => to !== '/admin/usuarios' || usuario?.rol === 'admin').map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `private-layout__link${
                  isActive || (to === '/admin/solicitudes' && pathname.startsWith('/solicitud/'))
                    ? ' active'
                    : ''
                }`
              }
              key={to}
              to={to}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="private-layout__sidebar-footer">
          <Button className="private-layout__logout" variant="ghost" onClick={() => { void signOut() }}>
            <LogOut size={17} aria-hidden="true" />
            Cerrar sesion
          </Button>
        </div>
      </aside>
      <main className="private-layout__main">
        <header className="private-layout__topbar">
          <span className="private-layout__eyebrow">Panel de gestion</span>
          <span className="private-layout__user">
            {usuario?.nombre ?? 'Usuario'} · {usuario?.rol === 'admin' ? 'Administrador' : 'Administrativo'}
          </span>
        </header>
        <div className="private-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
