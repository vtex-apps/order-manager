import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  FC,
} from 'react'
import { useQuery } from 'react-apollo'

import { orderForm as OrderFormQuery } from 'vtex.checkout-resources/Queries'

import { dummyOrderForm } from './utils/dummyOrderForm'

interface Context {
  loading: boolean
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: Partial<OrderForm>) => void
}

const OrderFormContext = createContext<Context | undefined>(undefined)

export const OrderFormProvider: FC = ({ children }) => {
  const { loading, data } = useQuery<{ orderForm: OrderForm }>(OrderFormQuery, {
    ssr: false,
  })

  const [orderForm, setOrderForm] = useReducer(
    (orderForm: OrderForm, newOrderForm: Partial<OrderForm>) => ({
      ...orderForm,
      ...newOrderForm,
    }),
    dummyOrderForm
  )

  useEffect(() => {
    if (loading) {
      return
    }
    data && setOrderForm(data.orderForm)
  }, [data, loading])

  const value = useMemo(
    () => ({
      loading,
      orderForm,
      setOrderForm,
    }),
    [loading, orderForm]
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
