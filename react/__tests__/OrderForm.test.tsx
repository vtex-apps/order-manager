import type { FunctionComponent } from 'react'
import React from 'react'
import { render, act } from '@vtex/test-tools/react'
import OrderForm from 'vtex.checkout-resources/QueryOrderForm'
import * as renderRuntime from 'vtex.render-runtime'

import {
  mockOrderForm,
  refreshedMockOrderForm,
} from '../__fixtures__/orderForm'
import { OrderFormProvider, useOrderForm } from '../OrderForm'
import { OrderQueueProvider } from '../OrderQueue'

const mockQuery = {
  request: {
    query: OrderForm,
    variables: { refreshOutdatedData: false },
  },
  result: {
    data: {
      orderForm: mockOrderForm,
    },
  },
}

const refreshedMockQuery = {
  request: {
    query: OrderForm,
    variables: { refreshOutdatedData: true },
  },
  result: {
    data: {
      orderForm: refreshedMockOrderForm,
    },
  },
}

describe('OrderForm', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should refresh outdated data on entering checkout', async () => {
    const mockedUseRuntime = jest
      .spyOn(renderRuntime, 'useRuntime')
      .mockImplementation(
        // @ts-expect-error: we do not want to mock the whole
        // runtime object, only the page
        () => ({ page: 'product' })
      )

    const Component: FunctionComponent = () => {
      const { orderForm } = useOrderForm()

      return (
        <div>
          Installment: {orderForm.paymentData?.installmentOptions?.[0]?.value}
        </div>
      )
    }

    const { queryByText, rerender } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockQuery, refreshedMockQuery] } }
    )

    act(() => jest.runAllTimers())

    await act(async () => {
      await new Promise<void>((resolve) => resolve())
    })

    const installmentParagraph = queryByText(/installment: /i)

    expect(installmentParagraph).toHaveTextContent(/installment: 100/i)

    mockedUseRuntime.mockImplementation(
      // @ts-expect-error: same as above
      () => ({ page: 'checkout' })
    )

    rerender(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>
    )

    act(() => jest.runAllTimers())

    await act(async () => {
      await new Promise<void>((resolve) => resolve())
    })

    expect(installmentParagraph).toHaveTextContent(/installment: 200/i)

    mockedUseRuntime.mockImplementation(
      jest.requireMock('vtex.render-runtime').mockedRuntimeHook
    )
  })
})
