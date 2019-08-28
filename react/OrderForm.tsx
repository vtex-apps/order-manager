import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import { branch, renderComponent } from 'recompose'
import { compose, graphql } from 'react-apollo'

import OrderFormQuery from './graphql/orderForm.graphql'

interface Context {
  loading: boolean
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: OrderForm) => void
}

interface OrderFormProviderProps {
  children: ReactNode
  OrderFormQuery: any
}

const OrderFormContext = createContext<Context | undefined>(undefined)

const LoadingState: FunctionComponent = ({ children }: any) => {
  const value = useMemo(
    () => ({
      loading: true,
      orderForm: undefined,
      setOrderForm: () => {},
    }),
    []
  )

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  )
}

export const OrderFormProvider = compose(
  graphql(OrderFormQuery, { name: 'OrderFormQuery', options: { ssr: false } }),
  branch(
    ({ OrderFormQuery }: any) => !!OrderFormQuery.loading,
    renderComponent(LoadingState)
  )
)(({ children, OrderFormQuery }: OrderFormProviderProps) => {
  const [orderForm, setOrderForm] = useState(OrderFormQuery.orderForm)

  const value = useMemo(
    () => ({
      loading: false,
      orderForm,
      setOrderForm,
    }),
    [orderForm]
  )

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  )
})

export const useOrderForm = () => {
  const context = useContext(OrderFormContext)
  if (context === undefined) {
    throw new Error('useOrderForm must be used within a OrderFormProvider')
  }

  return context
}

export default { OrderFormProvider, useOrderForm }
