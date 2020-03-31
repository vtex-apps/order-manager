import React, { FunctionComponent, useEffect, useCallback } from 'react'
import { fireEvent, render, wait } from '@vtex/test-tools/react'
import { Item } from 'vtex.checkout-graphql'
import OrderForm from 'vtex.checkout-resources/QueryOrderForm'

import { mockOrderForm } from '../__fixtures__/orderForm'
import { OrderFormProvider, useOrderForm } from '../OrderForm'

const mockQuery = {
  request: {
    query: OrderForm,
  },
  result: {
    data: {
      orderForm: mockOrderForm,
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

  it('should be possible to update order form with an update function', async () => {
    const Component: FunctionComponent = () => {
      const { setOrderForm, orderForm } = useOrderForm()

      const updateValue = useCallback(() => {
        setOrderForm(prevOrderForm => ({
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
      <OrderFormProvider>
        <Component />
      </OrderFormProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    await wait(() => jest.runAllTimers())

    expect(getByText(`${mockOrderForm.value}`)).toBeTruthy()

    const button = getByText('update')
    fireEvent.click(button)

    await wait(() => jest.runAllTimers())

    expect(getByText(`${mockOrderForm.value + 10}`)).toBeTruthy()
  })

  it('should update order form to correct value', async () => {
    const Component: FunctionComponent = () => {
      const { orderForm, setOrderForm } = useOrderForm()

      useEffect(() => {
        if (orderForm.value !== mockOrderForm.value) {
          return
        }

        setOrderForm(prevOrderForm => {
          return {
            ...prevOrderForm,
            value: prevOrderForm.value + 20,
          }
        })
      }, [orderForm.value, setOrderForm])

      return <span>{orderForm.value}</span>
    }

    const { getByText } = render(
      <OrderFormProvider>
        <Component />
      </OrderFormProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    await wait(() => jest.runAllTimers())

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
      <OrderFormProvider>
        <Component />
      </OrderFormProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    await wait(() => jest.runAllTimers())

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
      <OrderFormProvider>
        <Component />
      </OrderFormProvider>,
      { graphql: { mocks: [mockQuery] } }
    )

    await wait(() => {
      jest.runAllTimers()
      const button = getByText('update')
      fireEvent.click(button)
    })
    expect(getByText('Mirai zura!')).toBeTruthy()
  })

  describe('heuristics', () => {
    it('should replace local order form if their ids differ', async () => {
      localStorage.setItem('orderform', JSON.stringify(mockOrderForm))

      const orderFormMockQuery = {
        request: {
          query: OrderForm,
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
            {orderForm.items?.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )
      }

      // we're testing the side effect, so we won't need
      // to query the document
      render(
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>,
        { graphql: { mocks: [orderFormMockQuery] } }
      )

      await wait(() => jest.runAllTimers())

      expect(JSON.parse(localStorage.getItem('orderform')!).id).toBe(
        'new-order-form'
      )
    })

    it("should replace local order form when 'canEditData' differ", async () => {
      localStorage.setItem('orderform', JSON.stringify(mockOrderForm))

      const orderFormMockQuery = {
        request: {
          query: OrderForm,
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
            {orderForm.items?.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )
      }

      // we're testing the side effect, so we won't need
      // to query the document
      render(
        <OrderFormProvider>
          <Component />
        </OrderFormProvider>,
        { graphql: { mocks: [orderFormMockQuery] } }
      )

      await wait(() => jest.runAllTimers())

      const localOrderForm = JSON.parse(localStorage.getItem('orderform')!)

      expect(localOrderForm.clientProfileData.email).toBe('user@vtex.com')
    })
  })
})
