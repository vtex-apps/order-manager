import gql from 'graphql-tag'

const clearOrderFormMessages = gql`
  mutation MockClearOrderFormMessages($orderFormId: ID!) {
    clearOrderFormMessages(orderFormId: $orderFormId) {
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

export default clearOrderFormMessages
