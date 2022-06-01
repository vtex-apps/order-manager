import { useContext, useMemo, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import OrderFormQuery from 'vtex.checkout-resources/QueryOrderForm'
import { MutationClearOrderFormMessages } from 'vtex.checkout-resources'
import type { OrderForm, QueryOrderFormArgs } from 'vtex.checkout-graphql'
import { useRuntime } from 'vtex.render-runtime'
import { ToastContext } from 'vtex.styleguide'
import {
  createOrderFormProvider,
  DEFAULT_ORDER_FORM,
  useOrderForm,
} from '@vtex/order-manager'
import type { OrderFormUpdate } from '@vtex/order-manager/types/typings'
import { useSplunk } from 'vtex.checkout-splunk'

import { useOrderQueue, useQueueStatus, QueueStatus } from './OrderQueue'

function useLogger() {
  const { logSplunk } = useSplunk()

  const log = useCallback(
    ({ type, level, event, workflowType, workflowInstance }) => {
      logSplunk({ type, level, event, workflowType, workflowInstance })
    },
    [logSplunk]
  )

  return { log }
}

const CHECKOUT = 'checkout'

function useClearOrderFormMessages() {
  const [mutate] = useMutation<{
    clearOrderFormMessages: OrderForm
  }>(MutationClearOrderFormMessages)

  return useCallback(
    async (input) => {
      const { data } = await mutate({ variables: input })

      return { data: data?.clearOrderFormMessages }
    },
    [mutate]
  )
}

const useGetOrderForm = ({
  setOrderForm,
}: {
  setOrderForm: (update: OrderFormUpdate<OrderForm>) => void
}) => {
  const { page, query } = useRuntime()

  const shouldRefreshOutdatedData = page.includes(CHECKOUT)

  const variablesRef = useRef({
    refreshOutdatedData: shouldRefreshOutdatedData,
    orderFormId: query?.['orderFormId']
  })

  const { data, loading, error, refetch } = useQuery<
    {
      orderForm: OrderForm
    },
    QueryOrderFormArgs
  >(OrderFormQuery, {
    ssr: false,
    fetchPolicy: 'no-cache',
    variables: variablesRef.current,
  })

  const { enqueue } = useOrderQueue()
  const queueStatusRef = useQueueStatus()

  useEffect(() => {
    if (shouldRefreshOutdatedData) {
      enqueue(() =>
        refetch({ refreshOutdatedData: true }).then(
          ({ data: refreshedData }) => refreshedData.orderForm
        )
      ).then((updatedOrderForm) => {
        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(updatedOrderForm)
        }
      })
    }
  }, [
    enqueue,
    refetch,
    shouldRefreshOutdatedData,
    setOrderForm,
    queueStatusRef,
  ])

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
    }),
    [data, loading, error]
  )

  return value
}

const useToast = () => {
  return useContext(ToastContext)
}

const { OrderFormProvider } = createOrderFormProvider<OrderForm>({
  defaultOrderForm: DEFAULT_ORDER_FORM,
  useGetOrderForm,
  useClearOrderFormMessages,
  useToast,
  useLogger,
})

export { OrderFormProvider, useOrderForm }
export default { OrderFormProvider, useOrderForm }
