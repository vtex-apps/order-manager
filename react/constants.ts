import { OrderForm } from 'vtex.checkout-graphql'

export enum QueueStatus {
  PENDING = 'Pending',
  FULFILLED = 'Fulfilled',
}

export const TASK_CANCELLED_CODE = 'TASK_CANCELLED'

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
  loggedIn: false,
  paymentData: {
    isValid: false,
    installmentOptions: [],
    paymentSystems: [],
    payments: [],
    availableAccounts: [],
  },
  messages: {
    couponMessages: [],
    generalMessages: [],
  },
  shipping: {
    isValid: false,
    deliveryOptions: [],
    pickupOptions: [],
  },
}

export default {
  QueueStatus,
  TASK_CANCELLED_CODE,
}
