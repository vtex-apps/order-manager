import React, { createContext, ReactNode, useContext } from 'react'
import { QueueEvent, TaskQueue } from './TaskQueue'

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
  const queue = new TaskQueue()

  return (
    <OrderManagerContext.Provider
      value={{ enqueue: queue.push.bind(queue), listen: queue.on.bind(queue) }}
    >
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
