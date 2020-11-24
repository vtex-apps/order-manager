import * as React from 'react'

export const ToastContext = React.createContext({
  showToast: jest.fn(),
  toastState: { isToastVisible: false },
})
