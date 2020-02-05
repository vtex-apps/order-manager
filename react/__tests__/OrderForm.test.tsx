import React, { FunctionComponent, useEffect, useCallback } from 'react'
import { fireEvent, render, wait, act } from '@vtex/test-tools/react'
import { Item } from 'vtex.checkout-graphql'

import { mockOrderForm } from '../__mocks__/mockOrderForm'
import OrderForm from '../__mocks__/vtex.checkout-resources/QueryOrderForm'
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

  it('should be possible to update order form with a update function', async () => {
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
})
