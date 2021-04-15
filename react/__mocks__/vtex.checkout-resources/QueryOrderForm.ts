import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery($refreshOutdatedData: Boolean) {
    orderForm(refreshOutdatedData: $refreshOutdatedData) {
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
