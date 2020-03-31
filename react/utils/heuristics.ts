import { OrderForm } from 'vtex.checkout-graphql'

import { UNSYNC_ORDER_FORM_VALUE, DEFAULT_ORDER_FORM } from '../constants'

const orderFormOptimizationEnabled =
  window.__RUNTIME__.settings?.['vtex.store']?.enableOrderFormOptimization ??
  false

/**
 * Heuristic function to determine whether or not the local
 * order form (stored in localStorage) should be replaced by
 * the remote order form.
 */
export const shouldUpdateOrderForm = (
  localOrderForm: OrderForm,
  remoteOrderForm: OrderForm
): boolean => {
  return (
    localOrderForm.value === UNSYNC_ORDER_FORM_VALUE ||
    localOrderForm.canEditData !== remoteOrderForm.canEditData ||
    (orderFormOptimizationEnabled &&
      localOrderForm.id !== remoteOrderForm.id &&
      localOrderForm.id !== DEFAULT_ORDER_FORM.id)
  )
}
