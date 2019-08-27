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
import { QueueEvent, TaskQueue } from './modules/TaskQueue'

interface Context {
  enqueue: (task: () => Promise<any>, id?: string) => PromiseLike<void>
  listen: (event: QueueEvent, callback: () => any) => () => void
  loading: boolean
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: OrderForm) => void
}

interface OrderManagerProviderProps {
  children: ReactNode
  OrderFormQuery: any
}

const OrderManagerContext = createContext<Context | undefined>(undefined)

const LoadingState: FunctionComponent = ({ children }: any) => {
  const value = useMemo(
    () => ({
      enqueue: async () => {},
      listen: () => () => {},
      loading: true,
      orderForm: undefined,
      setOrderForm: () => {},
    }),
    []
  )

  return (
    <OrderManagerContext.Provider value={value}>
      {children}
    </OrderManagerContext.Provider>
  )
}

export const OrderManagerProvider = compose(
  graphql(OrderFormQuery, { name: 'OrderFormQuery', options: { ssr: false } }),
  branch(
    ({ OrderFormQuery }: any) => !!OrderFormQuery.loading,
    renderComponent(LoadingState)
  )
)(({ children, OrderFormQuery }: OrderManagerProviderProps) => {
  const [queue] = useState(() => new TaskQueue())
  const [orderForm, setOrderForm] = useState(OrderFormQuery.orderForm)

  const value = useMemo(
    () => ({
      enqueue: queue.enqueue.bind(queue),
      listen: queue.listen.bind(queue),
      loading: false,
      orderForm,
      setOrderForm,
    }),
    [queue, orderForm]
  )

  return (
    <OrderManagerContext.Provider value={value}>
      {children}
    </OrderManagerContext.Provider>
  )
})

export const useOrderManager = () => {
  const context = useContext(OrderManagerContext)
  if (context === undefined) {
    throw new Error(
      'useOrderManager must be used within a OrderManagerProvider'
    )
  }

  return context
}

export default { OrderManagerProvider, useOrderManager }
