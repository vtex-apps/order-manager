import { TaskQueue, TASK_CANCELLED_MSG } from '../TaskQueue'

const createScheduledTask = (task: () => any, time: number) => () => new Promise(resolve => {
  setTimeout(() => resolve(task()), time)
})

describe('TaskQueue', () => {
  it('should execute a task', async () => {
    const queue = new TaskQueue()
    const result = await queue.push(createScheduledTask(() => 42, 50))

    expect(result).toEqual(42)
  })

  it('should execute tasks in order', async () => {
    const queue = new TaskQueue()
    const results: string[] = []

    await Promise.all([
      queue.push(createScheduledTask(() => results.push('1'), 100)),
      queue.push(createScheduledTask(() => results.push('2'), 50)),
      queue.push(async () => results.push('3'))
    ])

    expect(results).toEqual(['1', '2', '3'])
  })

  it('should not execute a task if a newer one with same id was enqueued', async () => {
    const queue = new TaskQueue()
    const results: string[] = []

    const task1 = queue.push(createScheduledTask(() => results.push('1'), 100), 'foo')
    const task2 = queue.push(createScheduledTask(() => results.push('2'), 25), 'bar')
    const task3 = queue.push(createScheduledTask(() => results.push('3'), 25), 'baz')
    const task4 = queue.push(createScheduledTask(() => results.push('4'), 25), 'bar')

    expect(task2).rejects.toEqual(TASK_CANCELLED_MSG)

    await Promise.all([task1, task3, task4])

    expect(results).toEqual(['1', '3', '4'])
  })
})
