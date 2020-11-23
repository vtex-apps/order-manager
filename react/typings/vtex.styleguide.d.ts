import React from 'react'

declare module 'vtex.styleguide' {
  export const ToastContext: React.Context<{
    showToast: (message: string) => void
    toastState: { isToastVisible: boolean }
  }>
}
