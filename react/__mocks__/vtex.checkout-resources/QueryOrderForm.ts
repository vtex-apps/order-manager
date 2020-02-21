import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery {
    orderForm {
      id
      items
      value
    }
  }
`

export default orderForm
