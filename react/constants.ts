import { OrderForm } from 'vtex.checkout-graphql'

export enum QueueStatus {
  PENDING = 'Pending',
  FULFILLED = 'Fulfilled',
}

// keep default value as -1 to indicate this order form
// is the initial value (not yet synchonized with server).
export const UNSYNC_ORDER_FORM_VALUE = -1

export const DEFAULT_ORDER_FORM: OrderForm = {
  id: 'default-order-form',
  items: [],
  value: UNSYNC_ORDER_FORM_VALUE,
  totalizers: [],
  marketingData: {},
  canEditData: false,
  paymentData: {
    installmentOptions: [],
    paymentSystems: [],
  },
  messages: {
    couponMessages: [],
    generalMessages: [],
  },
  shipping: {},
}
