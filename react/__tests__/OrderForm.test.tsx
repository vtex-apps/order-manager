import React, { FunctionComponent } from 'react'
import { fireEvent, render } from '@vtex/test-tools/react'

import { mockOrderForm } from '../__mocks__/mockOrderForm'
import { orderForm as OrderForm } from '../__mocks__/vtex.checkout-resources/Queries'
import { OrderFormProvider, useOrderForm } from '../OrderForm'

describe('OrderForm', () => {
  it('should throw when useOrderForm is called outside a OrderFormProvider', () => {
    const oldConsoleError = console.error
    console.error = () => {}

    const Component: FunctionComponent = () => {
      useOrderForm()
      return <div>foo</div>
    }

    expect(() => render(<Component />)).toThrow(
      'useOrderForm must be used within a OrderFormProvider'
    )

    console.error = oldConsoleError
  })

  it('should set loading=true when fetching the order form', () => {
    const Component: FunctionComponent = () => {
      const { loading } = useOrderForm()
      return <div>{loading ? 'Loading' : 'Not loading'}</div>
    }

    const { getByText } = render(
      <OrderFormProvider>
        <Component />
      </OrderFormProvider>
    )

    expect(getByText('Loading')).toBeTruthy()
  })

  it('should correctly load the order form', async () => {
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

    const Component: FunctionComponent = () => {
      const { loading, orderForm } = useOrderForm()
      if (loading) {
        return <div>Loading</div>
      }
      return (
        <div>
          {orderForm &&
            orderForm.items.map((item: Item) => (
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

    await new Promise(resolve => setTimeout(() => resolve())) // waits for query
    expect(getByText(mockOrderForm.items[0].name)).toBeTruthy()
    expect(getByText(mockOrderForm.items[1].name)).toBeTruthy()
    expect(getByText(mockOrderForm.items[2].name)).toBeTruthy()
  })

  it('should correctly update the order form', async () => {
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

    const Component: FunctionComponent = () => {
      const { loading, orderForm, setOrderForm } = useOrderForm()
      if (loading || !orderForm) {
        return <div>Loading</div>
      }
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
            {orderForm &&
              orderForm.items.map((item: Item) => (
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

    await new Promise(resolve => setTimeout(() => resolve())) // waits for query
    const button = getByText('update')
    fireEvent.click(button)
    expect(getByText('Mirai zura!')).toBeTruthy()
  })
})
