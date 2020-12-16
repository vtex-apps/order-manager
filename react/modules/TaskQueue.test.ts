import { TaskQueue } from './TaskQueue'
import { QueueStatus, TASK_CANCELLED_CODE } from '../constants'

const createScheduledTask = (task: () => any, time: number) => () =>
  new Promise((resolve) => {
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

    await expect(task2).rejects.toEqual(
      expect.objectContaining({
        code: TASK_CANCELLED_CODE,
      })
    )

    await Promise.all([task1, task3, task4])

    expect(results).toEqual(['1', '3', '4'])
  })

  it('should not cancel a running task if a newer one with same id is pushed to the queue', async () => {
    const queue = new TaskQueue()
    const tasks: Array<PromiseLike<any>> = []

    const innerTask = createScheduledTask(() => 'bar', 5)

    const outerTask = async () => {
      tasks.push(queue.enqueue(innerTask, 'someId'))
      await createScheduledTask(() => {}, 10)()

      return 'foo'
    }

    tasks.push(queue.enqueue(outerTask, 'someId'))

    expect(await tasks[0]).toEqual('foo')
    expect(await tasks[1]).toEqual('bar')
  })

  it('should emit a Fulfilled event only when the queue becomes empty', async () => {
    const queue = new TaskQueue()
    const mockFulfilledCb = jest.fn()

    queue.listen(QueueStatus.FULFILLED, mockFulfilledCb)

    const task1 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task2 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task3 = queue.enqueue(createScheduledTask(() => {}, 5))

    expect(mockFulfilledCb).toHaveBeenCalledTimes(0)
    await task1
    expect(mockFulfilledCb).toHaveBeenCalledTimes(0)
    await task2
    expect(mockFulfilledCb).toHaveBeenCalledTimes(0)
    await task3
    expect(mockFulfilledCb).toHaveBeenCalledTimes(1)
  })

  it('should emit a Pending event only when the queue is free and receives a task', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()

    queue.listen(QueueStatus.PENDING, mockPendingCb)

    expect(mockPendingCb).toHaveBeenCalledTimes(0)
    const task1 = queue.enqueue(createScheduledTask(() => {}, 5))

    expect(mockPendingCb).toHaveBeenCalledTimes(1)
    const task2 = queue.enqueue(createScheduledTask(() => {}, 5))
    const task3 = queue.enqueue(createScheduledTask(() => {}, 5))

    expect(mockPendingCb).toHaveBeenCalledTimes(1)

    await Promise.all([task1, task2, task3])

    expect(mockPendingCb).toHaveBeenCalledTimes(1)
    queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb).toHaveBeenCalledTimes(2)
    queue.enqueue(createScheduledTask(() => {}, 5))
    expect(mockPendingCb).toHaveBeenCalledTimes(2)
  })

  it('should not call listener callback after unlisten is called', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()
    const unlisten = queue.listen(QueueStatus.PENDING, mockPendingCb)

    const task = queue.enqueue(async () => {})

    expect(mockPendingCb).toHaveBeenCalledTimes(1)
    await task

    unlisten()
    queue.enqueue(async () => {})
    expect(mockPendingCb).toHaveBeenCalledTimes(1)
  })

  it('should remove a single listener callback when unlisten is called', async () => {
    const queue = new TaskQueue()
    const mockPendingCb = jest.fn()

    queue.listen(QueueStatus.PENDING, mockPendingCb)
    const unlisten = queue.listen(QueueStatus.PENDING, mockPendingCb)

    queue.listen(QueueStatus.PENDING, mockPendingCb)

    const task = queue.enqueue(async () => {})

    expect(mockPendingCb).toHaveBeenCalledTimes(3)
    await task

    unlisten()
    queue.enqueue(async () => {})
    expect(mockPendingCb).toHaveBeenCalledTimes(5)
  })

  it('should return correct values when isWaiting is called', async () => {
    const queue = new TaskQueue()

    queue.enqueue(createScheduledTask(() => {}, 20))
    const secondTaskEnds = new Promise<void>((resolve) => {
      queue
        .enqueue(
          createScheduledTask(() => {}, 5),
          'TaskID'
        )
        .then(resolve)
    })

    expect(queue.isWaiting('TaskID')).toEqual(true)
    await secondTaskEnds
    expect(queue.isWaiting('TaskID')).toEqual(false)
  })

  it('should pass correct index value when task is cancelled', async () => {
    jest.useFakeTimers()

    const queue = new TaskQueue()

    const tasks = []

    tasks.push(
      queue.enqueue(
        createScheduledTask(() => 'task 1', 1000),
        'myTaskId'
      )
    )

    // Run immediates to add the task above to the
    // head of the queue
    jest.runAllImmediates()

    tasks.push(
      queue.enqueue(
        createScheduledTask(() => 'task 2', 500),
        'myTaskId'
      )
    )

    // The task above shouldn't cancel the first task, because
    // it is the head of the queue (and we can't cancel an in-progress
    // task)
    jest.advanceTimersByTime(1000)

    expect(await tasks[0]).toEqual('task 1')

    // Run scheduler function
    jest.runAllImmediates()
    // Run timer to completion for the second task
    jest.advanceTimersByTime(500)

    expect(await tasks[1]).toBe('task 2')

    jest.runAllTimers()

    // Push task without id, it shouldn't be "cancealable"
    tasks.push(queue.enqueue(createScheduledTask(() => 'task 3', 500)))

    // Run immediates so the task above is in the head of the queue
    jest.runAllImmediates()

    tasks.push(
      queue.enqueue(
        createScheduledTask(() => 'task 4', 500),
        'myTaskId'
      )
    )

    tasks.push(
      queue.enqueue(
        createScheduledTask(() => 'task 5', 500),
        'myTaskId'
      )
    )

    // Run the first task in the head to completion
    jest.advanceTimersByTime(500)

    // Run immediates so the next task is moved to the head
    jest.runAllImmediates()

    expect(await tasks[2]).toBe('task 3')

    await expect(tasks[3]).rejects.toEqual(
      expect.objectContaining({
        code: TASK_CANCELLED_CODE,
        index: 1,
      })
    )

    jest.runAllImmediates()

    jest.advanceTimersByTime(500)

    expect(await tasks[4]).toBe('task 5')
  })
})
