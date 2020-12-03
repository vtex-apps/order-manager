import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  FC,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import OrderFormQuery from 'vtex.checkout-resources/QueryOrderForm'
import { ApolloError } from 'apollo-client'
import { OrderForm } from 'vtex.checkout-graphql'
import { useSplunk } from 'vtex.checkout-splunk'

import { shouldUpdateOrderForm } from './utils/heuristics'
import {
  UNSYNC_ORDER_FORM_VALUE,
  DEFAULT_ORDER_FORM,
  QueueStatus,
} from './constants'
import { useOrderQueue, useQueueStatus } from './OrderQueue'
import useOrderFormMessages from './modules/useOrderFormMessages'

type OrderFormUpdate =
  | Partial<OrderForm>
  | ((prevOrderForm: OrderForm) => Partial<OrderForm>)

interface Context {
  loading: boolean
  orderForm: OrderForm
  setOrderForm: (nextValue: OrderFormUpdate) => void
  error: ApolloError | undefined
}

const noop = () => {}

const OrderFormContext = createContext<Context>({
  orderForm: DEFAULT_ORDER_FORM,
  setOrderForm: noop,
  error: undefined,
  loading: false,
})

const reducer = (
  prevOrderForm: OrderForm,
  updateOrderForm: OrderFormUpdate
) => {
  if (typeof updateOrderForm === 'function') {
    return {
      ...prevOrderForm,
      ...updateOrderForm({
        ...prevOrderForm,
        value:
          prevOrderForm.value === UNSYNC_ORDER_FORM_VALUE
            ? 0
            : prevOrderForm.value,
      }),
    }
  }

  return {
    ...prevOrderForm,
    ...updateOrderForm,
  }
}

const saveLocalOrderForm = (orderForm: OrderForm) => {
  localStorage.setItem('orderform', JSON.stringify(orderForm))
}

const getLocalOrderForm = (): OrderForm | null => {
  return typeof document === 'undefined'
    ? null
    : JSON.parse(localStorage.getItem('orderform') ?? 'null')
}

export const OrderFormProvider: FC = ({ children }) => {
  const { logSplunk } = useSplunk()
  const { loading, data, error } = useQuery<{
    orderForm: OrderForm
  }>(OrderFormQuery, {
    ssr: false,
    fetchPolicy: 'no-cache',
  })

  const shouldUseLocalOrderForm =
    typeof document !== 'undefined' && !navigator.onLine

  const [orderForm, setOrderForm] = useReducer(
    reducer,
    (shouldUseLocalOrderForm ? getLocalOrderForm() : DEFAULT_ORDER_FORM) ??
      DEFAULT_ORDER_FORM
  )

  // use a different variable to store the loading state because if some
  // component uses the `loading` from the Apollo query they won't be perfectly
  // synchronized with our `orderForm` state and could cause some anomalies.
  const [orderFormLoading, setOrderFormLoading] = useState(
    !shouldUseLocalOrderForm
  )

  const { listen } = useOrderQueue()
  const queueStatusRef = useQueueStatus(listen)

  useEffect(() => {
    if (error) {
      logSplunk({
        level: 'Important',
        type: 'Error',
        workflowType: 'OrderManager',
        workflowInstance: 'orderform-query',
        event: {
          message: error.message,
        },
      })
      console.error(error.message)
    }

    if (loading || error || !data) {
      return
    }

    const localOrderForm = getLocalOrderForm()

    if (localOrderForm != null) {
      if (
        !shouldUpdateOrderForm(localOrderForm, data.orderForm) ||
        // if the queue is fulfilled, we will use the remote order form
        // regardless of the local status.
        //
        // if the queue is pending the remote order form isn't important because
        // it is expected that when the last task in the queue is finalized, the
        // component will call `setOrderForm` with the most up-to-date value.
        queueStatusRef.current !== QueueStatus.FULFILLED
      ) {
        setOrderFormLoading(false)
        setOrderForm(prevOrderForm => {
          if (prevOrderForm.id !== DEFAULT_ORDER_FORM.id) {
            return prevOrderForm
          }

          return localOrderForm
        })
        return
      }
    }

    setOrderForm(data.orderForm)
    setOrderFormLoading(false)
  }, [data, error, loading, logSplunk, queueStatusRef])

  useEffect(() => {
    saveLocalOrderForm(orderForm)
  }, [orderForm])

  useOrderFormMessages(orderForm, setOrderForm)

  const value = useMemo<Context>(
    () => ({
      error,
      orderForm: {
        ...orderForm,
        value:
          orderForm.value === UNSYNC_ORDER_FORM_VALUE ? 0 : orderForm.value,
        messages: {
          ...orderForm.messages,
          generalMessages: [],
        },
      },
      setOrderForm,
      loading: orderFormLoading,
    }),
    [error, orderForm, orderFormLoading]
  )

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  )
}

export const useOrderForm = () => {
  const context = useContext(OrderFormContext)
  if (context === undefined) {
    throw new Error('useOrderForm must be used within a OrderFormProvider')
  }

  return context
}

export default { OrderFormProvider, useOrderForm }
