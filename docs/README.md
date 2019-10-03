# Order Manager

> Centralizes the requests queue to the Checkout API and manages order form data.

## Usage

```tsx
import { OrderQueueProvider, useOrderQueue, useQueueStatus } from 'vtex.order-manager/OrderQueue'
import { OrderFormProvider, useOrderForm } from 'vtex.order-manager/OrderForm'

const MainComponent: FunctionComponent = () => (
  <OrderQueueProvider>
    <OrderFormProvider>
      <MyComponent />
    </OrderFormProvider>
  </OrderQueueProvider>
)

const MyComponent: FunctionComponent = () => {
  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()
  const queueStatusRef = useQueueStatus(listen)
  
  //...
}
```

## `OrderQueue` API

### `useOrderQueue(): OrderQueueContext`

Exposes the API to interact with the order queue. See the items below for more details.

### `enqueue(task: () => Promise, id?: string): Promise`

> Returned by `useOrderQueue()`

Add a task to the queue of requests to the Checkout API. `task` will be called when it's the first in the queue.

The optional param `id` can be used to duplicate requests. Example:

```ts
const taskA = () => console.log("Task A ran");
enqueue(taskA, "coupon");

// Task A did not run yet and another task with id `coupon` is added to the queue
const taskB = () => console.log("Task B ran");
enqueue(taskB, "coupon");

// Log: 'Task B ran'
// Order Manager will only run taskB and discard taskA.
```

The point of this feature is to avoid making requests that are stale.

Returns a promise that resolves when the task is completed.

#### Use cases

1. If the user submits a coupon code, the task is scheduled, then changes and type another coupon code, we can avoid making the first request since the second will superseed it.

### `listen(event: QueueStatus, callback: Function): UnsubcribeFunction`

> Returned by `useOrderQueue()`

Once this function is called, the `callback` function will be called whenever the specified `event` is emitted until the returned function is called.

An event is emitted whenever the queue changes its status (see [QueueStatus](#QueueStatus)). For instance, if the queue changes from `QueueStatus.FULFILLED` to `QueueStatus.PENDING`, a `QueueStatus.PENDING` event is emitted.

Returns a function to unsubscribe the callback from the specified event.

#### Use cases

1. Makes it possible to add loaders or disable the Checkout button when there are tasks to resolve.

### `QueueStatus`

An enum that represents the queue states. The possible values are:

- `QueueStatus.PENDING`: There is a task running and there might be other tasks enqueued.
- `QueueStatus.FULFILLED`: The queue is empty and no task is being run.

### `useQueueStatus(listen: ListenFunction): React.MutableRefObject<QueueEvent>`

A helper hook that takes the `listen` function returned by `useOrderQueue` and returns a `ref` object whose `.current` property is a string equal to `Pending` or `Fulfilled` indicating the current queue status.

#### Use cases

1. Makes it possible to perform actions conditioned on the queue status.

#### Example

```ts
const { QueueStatus, useOrderQueue, useQueueStatus } from 'vtex.order-manager/OrderQueue'

const Component: FunctionComponent = () => {
  const { listen } = useOrderQueue()
  const queueStatusRef = useQueueStatus(listen)

  const handleClick = () => {
    if (queueStatusRef.current === QueueStatus.PENDING) {
      console.log('An action was performed while the queue was busy.')
    }
  }
  
  // ...
}
```

#### Notes

- Keep in mind that mutating the `ref` object does not trigger a re-render of the React component. If you want to display content depending on the queue status, consider using states controlled by queue events instead.

## `OrderForm` API

### `useOrderForm(): OrderFormContext`

Exposes the API to interact with the order form. See the items below for more details.

### `loading: boolean`

> Returned by `useOrderForm()`

This flag is set to `true` only when `OrderManager` is loading the order form during render. In order to know whether a task is ongoing, use `listen` instead.

#### Use cases

1. Make it possible to render a loading state when loading a page.

### `orderForm: OrderForm`

> Returned by `useOrderForm()`

Contains data from the order form. Do not modify this directly, use `setOrderForm` instead.

### `setOrderForm: (newOrderForm: Partial<OrderForm>) => void`

> Returned by `useOrderForm()`

Updates the order form stored in `OrderManager`. This should be called after each mutation to ensure that client data does not get out of sync with server data and that other `OrderManager` consumers can react to this update.