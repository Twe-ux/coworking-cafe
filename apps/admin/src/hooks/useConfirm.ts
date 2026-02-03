import { useState } from "react"

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    setConfig(options)
    setIsOpen(true)

    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }

  const handleConfirm = () => {
    resolver?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolver?.(false)
    setIsOpen(false)
  }

  return {
    confirm,
    isOpen,
    config,
    handleConfirm,
    handleCancel,
    setIsOpen,
  }
}
