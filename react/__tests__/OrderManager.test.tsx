import React, { FunctionComponent, useEffect } from 'react'
import { render } from '@vtex/test-tools/react'

import { OrderManagerProvider, useOrderManager } from '../OrderManager'

const createScheduledTask = (task: () => any, time: number) => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(task()), time)
  })

describe('OrderManager', () => {
  it('should throw when useOrderManager is called outside a OrderManagerProvider', () => {
    const oldConsoleError = console.error
    console.error = () => {}

    const Component: FunctionComponent = () => {
      console.error = () => {}
      useOrderManager()
      return <div>foo</div>
    }

    expect(() => render(<Component />)).toThrow(
      'useOrderManager must be used within a OrderManagerProvider'
    )

    console.error = oldConsoleError
  })

  it('should run tasks in order', async () => {
    const results: string[] = []
    const tasks: PromiseLike<any>[] = []

    const InnerComponent: FunctionComponent = () => {
      const { enqueue } = useOrderManager()
      useEffect(() => {
        tasks.push(enqueue(createScheduledTask(() => results.push('1'), 10)))
        tasks.push(enqueue(createScheduledTask(() => results.push('2'), 5)))
        tasks.push(enqueue(createScheduledTask(() => results.push('3'), 5)))
      }, [])
      return <div>foo</div>
    }

    const OuterComponent: FunctionComponent = () => (
      <OrderManagerProvider>
        <InnerComponent />
      </OrderManagerProvider>
    )

    render(<OuterComponent />)

    await Promise.all(tasks)
    expect(results).toEqual(['1', '2', '3'])
  })
})
