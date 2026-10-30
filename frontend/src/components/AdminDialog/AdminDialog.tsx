import { CircleAlert, CircleCheck, CircleHelp, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/Button/Button'

import './AdminDialog.css'

export type AdminDialogVariant = 'form' | 'success' | 'error' | 'warning' | 'confirm'
export type AdminDialogTone = 'success' | 'warning' | 'error'

export interface AdminDialogConfig {
  variant: AdminDialogVariant
  title: string
  message?: string
  confirmLabel?: string
  confirmTone?: AdminDialogTone
  cancelLabel?: string
  closeOnBackdrop?: boolean
  onConfirm?: () => void | Promise<void>
}

type AdminDialogProps = AdminDialogConfig & {
  open: boolean
  onClose: () => void
  children?: ReactNode
  size?: 'medium' | 'wide'
}

const iconos = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  confirm: CircleHelp,
}

export function AdminDialog({
  open,
  variant,
  title,
  message,
  confirmLabel,
  confirmTone = 'warning',
  cancelLabel = 'Cancelar',
  closeOnBackdrop,
  onConfirm,
  onClose,
  children,
  size = 'medium',
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const confirmRef = useRef(onConfirm)
  const isConfirmingRef = useRef(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmationError, setConfirmationError] = useState('')

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    confirmRef.current = onConfirm
  }, [onConfirm])

  useEffect(() => {
    isConfirmingRef.current = isConfirming
  }, [isConfirming])

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = window.requestAnimationFrame(() => {
      const initialFocus = dialogRef.current?.querySelector<HTMLElement>(
        '[data-dialog-autofocus], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not([data-dialog-close])',
      )
      ;(initialFocus ?? dialogRef.current)?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirmingRef.current) {
        closeRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ))
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const Icon = variant === 'form' ? null : iconos[variant]
  const isFeedback = variant !== 'form'
  const isConfirmation = Boolean(onConfirm)

  async function confirmar() {
    if (!confirmRef.current) return
    setConfirmationError('')
    setIsConfirming(true)
    try {
      await confirmRef.current()
    } catch (error) {
      setConfirmationError(error instanceof Error ? error.message : 'No se pudo completar la acción.')
    } finally {
      setIsConfirming(false)
    }
  }

  function cerrarDesdeFondo(event: MouseEvent<HTMLDivElement>) {
    const permitirCierre = closeOnBackdrop ?? variant === 'form'
    if (event.target === event.currentTarget && permitirCierre && !isConfirming) onClose()
  }

  return createPortal(
    <div className="admin-dialog-backdrop" onMouseDown={cerrarDesdeFondo}>
      <div
        ref={dialogRef}
        className={[
          'admin-dialog',
          `admin-dialog--${size}`,
          `admin-dialog--${variant}`,
          variant === 'confirm' ? `admin-dialog--action-${confirmTone}` : '',
        ].filter(Boolean).join(' ')}
        role={variant === 'error' || isConfirmation ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        aria-describedby={message ? 'admin-dialog-message' : undefined}
        tabIndex={-1}
      >
        <header className={`admin-dialog__header${isFeedback ? ' admin-dialog__header--feedback' : ''}`}>
          {Icon ? <span className="admin-dialog__icon"><Icon size={28} aria-hidden="true" /></span> : null}
          <div className="admin-dialog__heading">
            <h2 id="admin-dialog-title" className="admin-dialog__title">{title}</h2>
            {message ? <p id="admin-dialog-message" className="admin-dialog__message">{message}</p> : null}
            {confirmationError ? <p className="admin-dialog__inline-error" role="alert">{confirmationError}</p> : null}
          </div>
          <button
            type="button"
            className="admin-dialog__close"
            aria-label="Cerrar diálogo"
            data-dialog-close
            disabled={isConfirming}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {children ? <div className="admin-dialog__content">{children}</div> : null}

        {isFeedback && !children ? (
          <footer className="admin-dialog__actions">
            {isConfirmation ? (
              <>
                <Button type="button" variant="outline" disabled={isConfirming} onClick={onClose}>
                  {cancelLabel}
                </Button>
                <Button
                  type="button"
                  className="admin-dialog__action-button"
                  disabled={isConfirming}
                  onClick={confirmar}
                >
                  {isConfirming ? <LoaderCircle className="admin-dialog__spinner" size={16} aria-hidden="true" /> : null}
                  {isConfirming ? 'Procesando...' : confirmLabel ?? 'Confirmar'}
                </Button>
              </>
            ) : (
              <Button type="button" className="admin-dialog__action-button" data-dialog-autofocus onClick={onClose}>
                {confirmLabel ?? 'Entendido'}
              </Button>
            )}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}