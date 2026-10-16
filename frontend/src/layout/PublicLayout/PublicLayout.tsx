import { LogIn, Search } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Brand } from '@/components/Brand/Brand'
import { useAuth } from '@/hooks/useAuth'

import './PublicLayout.css'

export function PublicLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="public-layout">
      <header className="public-layout__header">
        <div className="page-container public-layout__bar">
          <Brand />
          <nav className="public-layout__nav" aria-label="Navegacion principal">
            <NavLink className="public-layout__link" to="/inicio">
              Inicio
            </NavLink>
            <NavLink className="public-layout__link" to="/mascotas">
              <Search size={16} aria-hidden="true" />
              Mascotas
            </NavLink>
            <NavLink className="public-layout__login" to={isAuthenticated ? '/admin' : '/login'}>
              <LogIn size={16} aria-hidden="true" />
              {isAuthenticated ? 'Panel admin' : 'Acceso admin'}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="public-layout__main">
        <Outlet />
      </main>

      <footer className="public-layout__footer">
        <div className="page-container public-layout__footer-content">
          <span>AdoptMascota</span>
          <span>Plataforma de adopción responsable</span>
        </div>
      </footer>
    </div>
  )
}
