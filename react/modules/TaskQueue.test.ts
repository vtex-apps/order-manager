import { TaskQueue, TASK_CANCELLED_MSG } from './TaskQueue'

const createScheduledTask = (task: () => any, time: number) => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(task()), time)
  })

describe('TaskQueue', () => {
  it('should execute a task', async () => {
    const queue = new TaskQueue()
    const result = await queue.enqueue(createScheduledTask(() => 42, 10))

    expect(result).toEqual(42)
  })

  it('should execute tasks in order', async () => {
    const queue = new TaskQueue()
    const results: string[] = []

    await Promise.all([
      queue.enqueue(createScheduledTask(() => results.push('1'), 20)),
      queue.enqueue(createScheduledTask(() => results.push('2'), 10)),
      queue.enqueue(async () => results.push('3')),
    ])

    expect(results).toEqual(['1', '2', '3'])
  })

  it('should not execute a task if a newer one with same id was enqueued', async () => {
    const queue = new TaskQueue()
    const results: string[] = []

    const task1 = queue.enqueue(
      createScheduledTask(() => results.push('1'), 20),
      'foo'
    )
    const task2 = queue.enqueue(
      createScheduledTask(() => results.push('2'), 5),
      'bar'
    )
    const task3 = queue.enqueue(
      createScheduledTask(() => results.push('3'), 5),
      'baz'
    )
    const task4 = queue.enqueue(
      createScheduledTask(() => results.push('4'), 5),
      'bar'
    )

    expect(task2).rejects.toEqual(TASK_CANCELLED_MSG)

    await Promise.all([task1, task3, task4])

    expect(results).toEqual(['1', '3', '4'])
  })

  it('should emit a Fulfilled event only when the queue becomes empty', async () => {
    const queue = new TaskQueue()
    const mockFulfilledCb = jest.fn()
    queue.listen('Fulfilled', mockFulfilledCb)

    const task1 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task2 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task3 = queue.enqueue(createScheduledTask(() => {}, 5))

    expect(mockFulfilledCb.mock.calls.length).toBe(0)
    await task1
    expect(mockFulfilledCb.mock.calls.length).toBe(0)
    await task2
    expect(mockFulfilledCb.mock.calls.length).toBe(0)
    await task3
    expect(mockFulfilledCb.mock.calls.length).toBe(1)
  })

  it('should emit a Pending event only when the queue is free and receives a task', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()
    queue.listen('Pending', mockPendingCb)

    expect(mockPendingCb.mock.calls.length).toBe(0)
    const task1 = queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb.mock.calls.length).toBe(1)
    const task2 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task3 = queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb.mock.calls.length).toBe(1)

    await Promise.all([task1, task2, task3])

    expect(mockPendingCb.mock.calls.length).toBe(1)
    queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb.mock.calls.length).toBe(2)
    queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb.mock.calls.length).toBe(2)
  })

  it('should not call listener callback after unlisten is called', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()
    const unlisten = queue.listen('Pending', mockPendingCb)

    const task = queue.enqueue(async () => {})
    expect(mockPendingCb.mock.calls.length).toBe(1)
    await task

    unlisten()
    queue.enqueue(async () => {})
    expect(mockPendingCb.mock.calls.length).toBe(1)
  })

  it('should remove a single listener callback when unlisten is called', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()
    queue.listen('Pending', mockPendingCb)
    const unlisten = queue.listen('Pending', mockPendingCb)
    queue.listen('Pending', mockPendingCb)

    const task = queue.enqueue(async () => {})
    expect(mockPendingCb.mock.calls.length).toBe(3)
    await task

    unlisten()
    queue.enqueue(async () => {})
    expect(mockPendingCb.mock.calls.length).toBe(5)
  })
})
