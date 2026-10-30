import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/Button/Button'

import './AdminPagination.css'

type AdminPaginationProps = {
  pagina: number
  totalPaginas: number
  cargando: boolean
  onCambiarPagina: (pagina: number) => void
}

export function AdminPagination({
  pagina,
  totalPaginas,
  cargando,
  onCambiarPagina,
}: AdminPaginationProps) {
  return (
    <nav className="admin-pagination" aria-label="Paginación">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={pagina <= 1 || cargando}
        onClick={() => onCambiarPagina(pagina - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Button>
      <span aria-live="polite">Página {pagina} de {totalPaginas}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Página siguiente"
        disabled={pagina >= totalPaginas || cargando}
        onClick={() => onCambiarPagina(pagina + 1)}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  )
}