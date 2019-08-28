import React, { FunctionComponent, useEffect } from 'react'
import { render } from '@vtex/test-tools/react'

import { OrderQueueProvider, useOrderQueue } from '../OrderQueue'

const createScheduledTask = (task: () => any, time: number) => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(task()), time)
  })

describe('OrderQueue', () => {
  it('should throw when useOrderQueue is called outside a OrderQueueProvider', () => {
    const oldConsoleError = console.error
    console.error = () => {}

    const Component: FunctionComponent = () => {
      useOrderQueue()
      return <div>foo</div>
    }

    expect(() => render(<Component />)).toThrow(
      'useOrderQueue must be used within a OrderQueueProvider'
    )

    console.error = oldConsoleError
  })

  it('should run tasks in order', async () => {
    const results: string[] = []
    const tasks: PromiseLike<any>[] = []

    const InnerComponent: FunctionComponent = () => {
      const { enqueue } = useOrderQueue()
      useEffect(() => {
        tasks.push(enqueue(createScheduledTask(() => results.push('1'), 10)))
        tasks.push(enqueue(createScheduledTask(() => results.push('2'), 5)))
        tasks.push(enqueue(createScheduledTask(() => results.push('3'), 5)))
      }, [])
      return <div>foo</div>
    }

    const OuterComponent: FunctionComponent = () => (
      <OrderQueueProvider>
        <InnerComponent />
      </OrderQueueProvider>
    )

    render(<OuterComponent />)

    await Promise.all(tasks)
    expect(results).toEqual(['1', '2', '3'])
  })
})
