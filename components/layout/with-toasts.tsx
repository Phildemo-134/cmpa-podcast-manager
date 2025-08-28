'use client'

import { ToastProvider } from '@/components/ui'

interface WithToastsProps {
  children: React.ReactNode
}

export function WithToasts({ children }: WithToastsProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
