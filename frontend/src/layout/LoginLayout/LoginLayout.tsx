import { ArrowLeft } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Brand } from '@/components/Brand/Brand'

import './LoginLayout.css'

export function LoginLayout() {
  return (
    <div className="login-layout">
      <header className="login-layout__header">
        <div className="page-container login-layout__header-content">
          <Brand />
          <Link className="login-layout__back-link" to="/inicio">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al sitio público
          </Link>
        </div>
      </header>
      <main className="login-layout__main">
        <Outlet />
      </main>
    </div>
  )
}