import { PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'

import './Brand.css'

export function Brand() {
  return (
    <Link className="brand" to="/inicio" aria-label="AdoptMascota, inicio">
      <span className="brand__mark" aria-hidden="true">
        <PawPrint size={20} strokeWidth={2.5} />
      </span>
      <span className="brand__name">
        Adopt<span>Mascota</span>
      </span>
    </Link>
  )
}
