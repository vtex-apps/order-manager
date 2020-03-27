import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery {
    orderForm {
      id
      items
      canEditData
      clientProfileData {
        email
        firstName
        lastName
      }
      value
    }
  }
`

export default orderForm
