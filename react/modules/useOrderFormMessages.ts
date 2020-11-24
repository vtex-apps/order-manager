import { ToastContext } from 'vtex.styleguide'
import { OrderForm, Message } from 'vtex.checkout-graphql'
import { useState, useContext, useEffect, Dispatch } from 'react'
import { useMutation } from 'react-apollo'
// @ts-expect-error: no typings yet
import { MutationClearOrderFormMessages } from 'vtex.checkout-resources'

import { useOrderQueue, useQueueStatus } from '../OrderQueue'
import { QueueStatus, TASK_CANCELLED_CODE } from '../constants'

type OrderFormUpdate =
  | Partial<OrderForm>
  | ((prevOrderForm: OrderForm) => Partial<OrderForm>)

const useOrderFormMessages = (
  orderForm: OrderForm,
  setOrderForm: Dispatch<OrderFormUpdate>
) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { showToast, toastState } = useContext(ToastContext)
  const [clearOrderFormMessages] = useMutation<{
    clearOrderFormMessages: OrderForm
  }>(MutationClearOrderFormMessages)
  const { enqueue, listen } = useOrderQueue()
  const queueStatusRef = useQueueStatus(listen)

  useEffect(() => {
    if (toastState.isToastVisible || !messages.length) {
      return
    }

    showToast(messages[0].text!)
    setMessages(queue => queue.slice(1))
  }, [showToast, toastState.isToastVisible, messages])

  useEffect(() => {
    if (!orderForm.messages?.generalMessages.length) {
      return
    }

    setMessages(prevMessages =>
      prevMessages.concat(orderForm.messages.generalMessages as Message[])
    )

    setOrderForm(prevOrderForm => {
      return {
        ...prevOrderForm,
        messages: {
          ...prevOrderForm.messages,
          generalMessages: [],
        },
      }
    })

    const enqueuePromise = enqueue(async () => {
      const { data } = await clearOrderFormMessages({
        variables: { orderFormId: orderForm.id },
      })

      return data!.clearOrderFormMessages
    })

    enqueuePromise.then(
      updatedOrderForm => {
        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(updatedOrderForm)
        }
      },
      err => {
        if (err.code === TASK_CANCELLED_CODE) {
          return
        }

        throw err
      }
    )
  }, [
    clearOrderFormMessages,
    enqueue,
    orderForm.id,
    orderForm.messages,
    queueStatusRef,
    setOrderForm,
  ])
}

export default useOrderFormMessages
