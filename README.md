# Order Manager

> Centralizes the requests queue to the Checkout API and manages order form data.

## Usage

```tsx
import { OrderManagerProvider, useOrderManager } from 'vtex.order-manager/OrderManager'

const MainComponent: FunctionComponent = () => (
  <OrderManagerProvider>
    <MyComponent />
  </OrderManagerProvider>
)

const MyComponent: FunctionComponent = () => {
  const { enqueue, listen } = useOrderManager()
  //...
}
```

## API

### `enqueue(task: () => Promise, id?: string): Promise`

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

### `listen(event: QueueEvent, callback: Function): UnsubcribeFunction`

Listen to events of the queue. The possible events are:

`type QueueEvent = Pending | Fulfilled`

- **Pending:** Has tasks in the queue
- **Fulfilled:** Has no tasks in the queue

Returns a function to unsubscribe callback from events.

#### Use cases

1. Make it possible to add loaders or disable the Checkout button when there are tasks to resolve.

### `loading: boolean`

This flag is set to `true` only when `OrderManager` is loading the order form during render. In order to know whether a task is ongoing, use `listen` instead.

#### Use cases

1. Make it possible to render a loading state when loading a page.

### `orderForm: OrderForm`

Contains data from the order form. Do not modify this directly, use `setOrderForm` instead.

### `setOrderForm: (newOrderForm: OrderForm) => void`

Updates the order form stored in `OrderManager`. This should be called after each mutation to ensure that client data does not get out of sync with server data and that other `OrderManager` consumers can react to this update.

## Internal spec

### `private queue = Promise[]`

Array of requests to be satisfied.
