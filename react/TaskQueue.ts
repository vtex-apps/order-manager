import { CancellablePromiseLike, SequentialTaskQueue } from 'sequential-task-queue'

export const TASK_CANCELLED_MSG = 'A more recent task with same id has been pushed to the queue.'

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

  constructor() {
    this.queue = new SequentialTaskQueue()
    this.taskIdMap = {}
    this.listeners = {} as any
    this.isEmpty = true

    this.queue.on('drained', () => {
      this.isEmpty = true
      this.emit('Fulfilled')
    })
  }

  push(task: () => Promise<any>, id?: string) {
    if (this.isEmpty) {
      this.isEmpty = false;
      this.emit('Pending')
    }

    if (id && this.taskIdMap[id]) {
      this.taskIdMap[id].promise.cancel(TASK_CANCELLED_MSG)
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

  on(event: QueueEvent, cb: () => any) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(cb)
  }

  private emit(event: QueueEvent) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb())
    }
  }
}
