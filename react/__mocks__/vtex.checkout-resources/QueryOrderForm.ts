import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery {
    orderForm {
      items
    }
  }
`

export default orderForm
