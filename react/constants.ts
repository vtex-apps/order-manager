export enum QueueStatus {
  PENDING = 'Pending',
  FULFILLED = 'Fulfilled',
}

// keep default value as -1 to indicate this order form
// is the initial value (not yet synchonized with server).
export const UNSYNC_ORDER_FORM_VALUE = -1
