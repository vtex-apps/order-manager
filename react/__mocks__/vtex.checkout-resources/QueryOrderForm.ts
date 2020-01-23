import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery {
    orderForm {
      items
      value
    }
  }
`

export default orderForm
