import { debug } from 'console'

import type { FunctionComponent } from 'react'
import React, { useEffect, useCallback } from 'react'
import { fireEvent, render, act, flushPromises } from '@vtex/test-tools/react'
import type { Item } from 'vtex.checkout-graphql'
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

  // eslint-disable-next-line jest/expect-expect
  /*
   */
  it.only('should refresh outdated data on entering checkout', async () => {
    const mockedUseRuntime = jest
      .spyOn(renderRuntime, 'useRuntime')
      .mockImplementation(() => ({ page: 'product' }))

    const Component: FunctionComponent = () => {
      const { orderForm } = useOrderForm()

      const { value } = orderForm.paymentData.installmentOptions[0] ?? {
        value: null,
      }

      console.log({ value })

      return <div>{orderForm.paymentData?.installmentOptions?.[0]?.value}</div>
    }

    const { queryByText, rerender, debug } = render(
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

    expect(queryByText('100')).toBeInTheDocument()

    mockedUseRuntime.mockImplementation(() => ({ page: 'checkout' }))
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

    debug()

    // expect(installmentValue).toBe('200')
    expect(queryByText('200')).toBeInTheDocument()
  })

  it('should be possible to update order form with an update function', async () => {
    const Component: FunctionComponent = () => {
      const { setOrderForm, orderForm } = useOrderForm()

      const updateValue = useCallback(() => {
        setOrderForm((prevOrderForm) => ({
          ...prevOrderForm,
          value: prevOrderForm.value + 10,
        }))
      }, [setOrderForm])

      return (
        <div>
          <span>{orderForm.value}</span>
          <button onClick={updateValue}>update</button>
        </div>
      )
    }

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    act(() => jest.runAllTimers())

    await act(async () => {
      await new Promise((resolve) => resolve())
    })

    expect(getByText(`${mockOrderForm.value}`)).toBeTruthy()

    const button = getByText('update')

    fireEvent.click(button)

    expect(getByText(`${mockOrderForm.value + 10}`)).toBeTruthy()
  })

  it('should update order form to correct value', async () => {
    const Component: FunctionComponent = () => {
      const { orderForm, setOrderForm } = useOrderForm()

      useEffect(() => {
        if (orderForm.value !== mockOrderForm.value) {
          return
        }

        setOrderForm((prevOrderForm) => {
          return {
            ...prevOrderForm,
            value: prevOrderForm.value + 20,
          }
        })
      }, [orderForm.value, setOrderForm])

      return <span>{orderForm.value}</span>
    }

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    act(() => jest.runAllTimers())

    await act(async () => {
      await flushPromises()
    })

    expect(getByText(`${mockOrderForm.value + 20}`)).toBeTruthy()
  })

  it('should correctly load the order form', async () => {
    const Component: FunctionComponent = () => {
      const { orderForm } = useOrderForm()

      return (
        <div>
          {orderForm.items.map((item: Item) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )
    }

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    act(() => jest.runAllTimers())

    await act(async () => {
      await flushPromises()
    })

    expect(getByText(mockOrderForm.items[0].name)).toBeTruthy()
    expect(getByText(mockOrderForm.items[1].name)).toBeTruthy()
    expect(getByText(mockOrderForm.items[2].name)).toBeTruthy()
  })

  it('should correctly update the order form', async () => {
    const Component: FunctionComponent = () => {
      const { orderForm, setOrderForm } = useOrderForm()

      const handleClick = () => {
        const newItem = orderForm && {
          ...orderForm.items[1],
          id: '10231',
          name: 'Mirai zura!',
        }

        setOrderForm({ items: [newItem] })
      }

      return (
        <div>
          <div>
            {orderForm?.items.map((item: Item) => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
          <button onClick={handleClick}>update</button>
        </div>
      )
    }

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    const button = getByText('update')

    fireEvent.click(button)

    expect(getByText('Mirai zura!')).toBeTruthy()
  })

  describe('heuristics', () => {
    it('should replace local order form if their ids differ', async () => {
      localStorage.setItem('orderform', JSON.stringify(mockOrderForm))

      const orderFormMockQuery = {
        request: {
          query: OrderForm,
          variables: { refreshOutdatedData: false },
        },
        result: {
          data: {
            orderForm: {
              id: 'new-order-form',
              items: [],
              canEditData: false,
              clientProfileData: null,
              value: 0,
            },
          },
        },
      }

      const Component: FunctionComponent = () => {
        const { orderForm } = useOrderForm()

        return (
          <ul>
            {orderForm.items?.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )
      }

      // we're testing the side effect, so we won't need
      // to query the document
      render(
        <OrderQueueProvider>
          <OrderFormProvider>
            <Component />
          </OrderFormProvider>
        </OrderQueueProvider>,
        { graphql: { mocks: [orderFormMockQuery] } }
      )

      act(() => {
        jest.runAllTimers()
      })

      await act(async () => {
        await flushPromises()
      })

      expect(JSON.parse(localStorage.getItem('orderform')!).id).toBe(
        'new-order-form'
      )
    })

    it("should replace local order form when 'canEditData' differ", async () => {
      localStorage.setItem('orderform', JSON.stringify(mockOrderForm))

      const orderFormMockQuery = {
        request: {
          query: OrderForm,
          variables: { refreshOutdatedData: false },
        },
        result: {
          data: {
            orderForm: {
              id: mockOrderForm.id,
              canEditData: true,
              clientProfileData: {
                email: 'user@vtex.com',
                firstName: 'User',
                lastName: 'Name',
              },
              items: [],
              value: 0,
            },
          },
        },
      }

      const Component: FunctionComponent = () => {
        const { orderForm } = useOrderForm()

        return (
          <ul>
            {orderForm.items?.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )
      }

      // we're testing the side effect, so we won't need
      // to query the document
      render(
        <OrderQueueProvider>
          <OrderFormProvider>
            <Component />
          </OrderFormProvider>
        </OrderQueueProvider>,
        { graphql: { mocks: [orderFormMockQuery] } }
      )

      act(() => {
        jest.runAllTimers()
      })

      await act(async () => {
        await flushPromises()
      })

      const localOrderForm = JSON.parse(localStorage.getItem('orderform')!)

      expect(localOrderForm.clientProfileData.email).toBe('user@vtex.com')
    })
  })
})
