import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  FC,
} from 'react'
import { useQuery } from 'react-apollo'
import OrderFormQuery from 'vtex.checkout-resources/QueryOrderForm'
import { ApolloError } from 'apollo-client'
import { OrderForm } from 'vtex.checkout-graphql'

import { logSplunk } from './utils/logger'

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

// keep default value as -1 to indicate this order form
// is the initial value (not yet synchonized with server).
const UNSYNC_ORDER_FORM_VALUE = -1

const DEFAULT_ORDER_FORM: OrderForm = {
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
  const { loading, data, error } = useQuery<{
    orderForm: OrderForm
  }>(OrderFormQuery, {
    ssr: false,
  })

  const [orderForm, setOrderForm] = useReducer(
    reducer,
    getLocalOrderForm() ?? DEFAULT_ORDER_FORM
  )

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

    const localOrderFormString = localStorage.getItem('orderform')

    if (localOrderFormString != null) {
      const localOrderForm = JSON.parse(localOrderFormString) as OrderForm

      if (
        localOrderForm.value !== UNSYNC_ORDER_FORM_VALUE &&
        (!data ||
          data.orderForm.id === localOrderForm.id ||
          localOrderForm.id === DEFAULT_ORDER_FORM.id)
      ) {
        return
      }
    }

    if (loading || error || !data) {
      return
    }

    setOrderForm(data.orderForm)
  }, [data, error, loading])

  useEffect(() => {
    saveLocalOrderForm(orderForm)
  }, [orderForm])

  const value = useMemo<Context>(
    () => ({
      error,
      orderForm: {
        ...orderForm,
        value:
          orderForm.value === UNSYNC_ORDER_FORM_VALUE ? 0 : orderForm.value,
      },
      setOrderForm,
      loading: false,
    }),
    [error, orderForm]
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
