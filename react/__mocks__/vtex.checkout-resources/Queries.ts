import gql from 'graphql-tag'

export const orderForm = gql`
  query MockQuery {
    orderForm {
      items
    }
  }
`
