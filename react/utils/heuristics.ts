import { OrderForm } from 'vtex.checkout-graphql'

/**
 * Heuristic function to determine whether or not the local
 * order form (stored in localStorage) should be replaced by
 * the remote order form.
 *
 * This should only cover edge cases, as the default cases (like
 * when there is no local order form yet) are handled by the
 * calling function.
 */
export const shouldUpdateOrderForm = (
  localOrderForm: OrderForm,
  remoteOrderForm: OrderForm
): boolean => {
  return localOrderForm.canEditData !== remoteOrderForm.canEditData
}
