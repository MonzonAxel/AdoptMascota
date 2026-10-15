import { useState } from 'react'

import type { AdminDialogConfig, AdminDialogTone } from '@/components/AdminDialog/AdminDialog'

export function useAdminDialog() {
  const [dialog, setDialog] = useState<AdminDialogConfig | null>(null)

  function showSuccess(title: string, message: string) {
    setDialog({ variant: 'success', title, message })
  }

  function showError(title: string, error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message : fallback
    setDialog({ variant: 'error', title, message })
  }

  function showConfirmation(
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmLabel = 'Confirmar',
    confirmTone: AdminDialogTone = 'warning',
  ) {
    setDialog({ variant: 'confirm', title, message, onConfirm, confirmLabel, confirmTone })
  }

  function closeDialog() {
    setDialog(null)
  }

  return { dialog, showSuccess, showError, showConfirmation, closeDialog }
}
