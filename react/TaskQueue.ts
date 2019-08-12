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

  constructor() {
    this.queue = new SequentialTaskQueue()
    this.taskIdMap = {}
  }

  push(task: () => Promise<any>, id?: string) {
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
}
