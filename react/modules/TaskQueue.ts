import {
  CancellablePromiseLike,
  SequentialTaskQueue,
} from 'sequential-task-queue'

export const TASK_CANCELLED_CODE = 'TASK_CANCELLED'
export const TASK_CANCELLED_MSG =
  'A more recent task with same id has been pushed to the queue.'

export type QueueEvent = 'Pending' | 'Fulfilled'

interface EnqueuedTask {
  task: () => Promise<any>
  promise: CancellablePromiseLike<any>
}

export class TaskQueue {
  private queue: SequentialTaskQueue
  private taskIdMap: Record<string, EnqueuedTask>
  private listeners: Record<QueueEvent, (() => any)[]>
  private isEmpty: boolean

  public constructor() {
    this.queue = new SequentialTaskQueue()
    this.taskIdMap = {}
    this.listeners = {} as any
    this.isEmpty = true

    this.queue.on('drained', () => {
      this.isEmpty = true
      this.emit('Fulfilled')
    })
  }

  public enqueue(task: () => Promise<any>, id?: string) {
    if (this.isEmpty) {
      this.isEmpty = false
      this.emit('Pending')
    }

    if (id && this.taskIdMap[id]) {
      this.taskIdMap[id].promise.cancel({
        code: TASK_CANCELLED_CODE,
        message: TASK_CANCELLED_MSG,
      })
    }

    const promise = this.queue.push(task)

    if (id) {
      this.taskIdMap[id] = {
        task,
        promise,
      }
    }

    return promise
  }

  public listen(event: QueueEvent, cb: () => any) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(cb)

    const unlisten = () => {
      const index = this.listeners[event].indexOf(cb)
      if (index !== -1) {
        this.listeners[event].splice(index, 1)
      }
    }

    return unlisten
  }

  private emit(event: QueueEvent) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb())
    }
  }
}
