import React, { createContext, ReactNode, useContext, useState, useMemo } from 'react'
import { QueueEvent, TaskQueue } from './modules/TaskQueue'

interface Context {
  enqueue: (task: () => Promise<any>, id?: string) => PromiseLike<void>
  listen: (event: QueueEvent, callback: () => any) => void
}

interface OrderManagerProviderProps {
  children: ReactNode
}

const OrderManagerContext = createContext<Context | undefined>(undefined)

export const OrderManagerProvider = ({
  children,
}: OrderManagerProviderProps) => {
  const [queue] = useState(() => new TaskQueue())
  const value = useMemo(() => ({
    enqueue: queue.enqueue.bind(queue),
    listen: queue.listen.bind(queue),
  }), [queue])

  return (
    <OrderManagerContext.Provider value={value}>
      {children}
    </OrderManagerContext.Provider>
  )
}

export const useOrderManager = () => {
  const context = useContext(OrderManagerContext)
  if (context === undefined) {
    throw new Error(
      'useOrderManager must be used within a OrderManagerProvider'
    )
  }

  return context
}
