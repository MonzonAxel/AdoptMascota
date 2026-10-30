type PageHeaderProps = {
  kicker: string
  title: string
  description: string
}

import './PageHeader.css'

export function PageHeader({ kicker, title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="page-kicker">{kicker}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </header>
  )
}
