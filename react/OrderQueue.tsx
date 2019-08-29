import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

import { QueueEvent, TaskQueue } from './modules/TaskQueue'

interface Context {
  enqueue: (task: () => Promise<any>, id?: string) => PromiseLike<void>
  listen: (event: QueueEvent, callback: () => any) => () => void
}

interface OrderQueueProviderProps {
  children: ReactNode
}

const OrderQueueContext = createContext<Context | undefined>(undefined)

export const OrderQueueProvider: FC<OrderQueueProviderProps> = ({
  children,
}) => {
  const [queue] = useState(() => new TaskQueue())

  const value = useMemo(
    () => ({
      enqueue: queue.enqueue.bind(queue),
      listen: queue.listen.bind(queue),
    }),
    [queue]
  )

  return (
    <OrderQueueContext.Provider value={value}>
      {children}
    </OrderQueueContext.Provider>
  )
}

export const useOrderQueue = () => {
  const context = useContext(OrderQueueContext)
  if (context === undefined) {
    throw new Error('useOrderQueue must be used within a OrderQueueProvider')
  }

  return context
}

export default { OrderQueueProvider, useOrderQueue }
