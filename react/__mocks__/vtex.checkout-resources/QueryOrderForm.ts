import gql from 'graphql-tag'

const orderForm = gql`
  query MockQuery($refreshOutdatedData: Boolean) {
    orderForm(refreshOutdatedData: $refreshOutdatedData) {
      id
      items
      canEditData
      paymentData {
        installmentOptions {
          value
        }
      }
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
