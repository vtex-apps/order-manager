import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useState,
  FC,
} from 'react'
import { ApolloError, useQuery } from 'react-apollo'

import { orderForm as OrderFormQuery } from 'vtex.checkout-resources/Queries'

import { dummyOrderForm, emptyOrderForm } from './utils/dummyOrderForm'
import { logSplunk } from './utils/logger'

interface Context {
  loading: boolean
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: Partial<OrderForm>) => void
  error: ApolloError | undefined
}

const OrderFormContext = createContext<Context | undefined>(undefined)

export const OrderFormProvider: FC = ({ children }) => {
  const { loading: loadingQuery, data, error } = useQuery<{
    orderForm: OrderForm
  }>(OrderFormQuery, {
    ssr: false,
    fetchPolicy: 'network-only',
  })

  const [orderForm, setOrderForm] = useReducer(
    (orderForm: OrderForm, newOrderForm: Partial<OrderForm>) => ({
      ...orderForm,
      ...newOrderForm,
    }),
    dummyOrderForm
  )

  const [loading, setLoading] = useState(true)

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

    if (loadingQuery) {
      return
    }

    setLoading(false)
    data && setOrderForm(data.orderForm)
  }, [data, error, loadingQuery])

  const value = useMemo(
    () => ({
      error,
      loading,
      orderForm: error ? emptyOrderForm : orderForm,
      setOrderForm,
    }),
    [error, loading, orderForm]
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
