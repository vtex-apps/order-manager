import type { CancellablePromiseLike } from './SequentialTaskQueue'
import { SequentialTaskQueue } from './SequentialTaskQueue'
import { QueueStatus, TASK_CANCELLED_CODE } from '../constants'

interface EnqueuedTask {
  task: () => Promise<any>
  promise: CancellablePromiseLike<any>
}

export class TaskQueue {
  private queue: SequentialTaskQueue
  private taskIdMap: Record<string, EnqueuedTask>
  private listeners: Record<QueueStatus, Array<() => any>>
  private isEmpty: boolean

  constructor() {
    this.queue = new SequentialTaskQueue()
    this.taskIdMap = {}
    this.listeners = {} as any
    this.isEmpty = true

    this.queue.on('drained', () => {
      this.isEmpty = true
      this.emit(QueueStatus.FULFILLED)
    })
  }

  public isWaiting(id: string) {
    return !!this.taskIdMap[id]
  }

  public enqueue(task: () => Promise<any>, id?: string) {
    if (this.isEmpty) {
      this.isEmpty = false
      this.emit(QueueStatus.PENDING)
    }

    if (id && this.taskIdMap[id]) {
      this.taskIdMap[id].promise.cancel()
    }

    const wrappedTask = () => {
      return new Promise((resolve, reject) => {
        const handleOnline = async () => {
          try {
            const result = await task()

            if (id && this.taskIdMap[id]) {
              delete this.taskIdMap[id]
            }

            resolve(result)
          } catch (err) {
            // we might have gone offline when this request was in-flight
            // so we need to wait to be online again and replay this request
            if (!navigator.onLine) {
              return
            }

            if (id && this.taskIdMap[id]) {
              delete this.taskIdMap[id]
            }

            reject(err)
          }

          window.removeEventListener('online', handleOnline)
        }

        window.addEventListener('online', handleOnline)

        if (navigator.onLine) {
          handleOnline()
        }
      })
    }

    const promise = this.queue.push(wrappedTask)
    const cancelPromise = promise.cancel

    promise.cancel = () =>
      cancelPromise({
        code: TASK_CANCELLED_CODE,
        index: this.queue.indexOf(wrappedTask),
      })

    if (id) {
      this.taskIdMap[id] = {
        task,
        promise,
      }
    }

    return promise
  }

  public listen(event: QueueStatus, cb: () => any) {
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

  private emit(event: QueueStatus) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb())
    }
  }
}
