import { LogIn, Search } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Brand } from '@/components/Brand/Brand'

import './PublicLayout.css'

export function PublicLayout() {
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
            <NavLink className="public-layout__login" to="/login">
              <LogIn size={16} aria-hidden="true" />
              Acceso admin
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="public-layout__main">
        <Outlet />
      </main>

      <footer className="public-layout__footer">
        <div className="page-container public-layout__footer-content">
          <span>Adoptá</span>
          <span>Plataforma de adopcion responsable</span>
        </div>
      </footer>
    </div>
  )
}
