import { Item, OrderForm } from 'vtex.checkout-graphql'

const dummyItem = (id: string): Item => ({
  additionalInfo: {
    brandName: '',
  },
  id: id,
  detailUrl: '',
  imageUrls: null,
  listPrice: 0,
  measurementUnit: '',
  name: '',
  price: 0,
  productId: '',
  quantity: 0,
  sellingPrice: 0,
  skuName: '',
  skuSpecifications: [],
  uniqueId: id,
  availability: 'available',
})

export const emptyOrderForm = {
  id: '',
  items: [],
  shipping: {
    countries: [],
    deliveryOptions: [],
    selectedAddress: {
      addressId: '',
      addressType: null,
      city: '',
      complement: '',
      country: '',
      neighborhood: '',
      number: '',
      postalCode: '',
      receiverName: '',
      reference: '',
      state: '',
      street: '',
      geoCoordinates: [],
    },
  },
  marketingData: {
    coupon: '',
  },
  messages: {
    couponMessages: [],
    generalMessages: [],
  },
  totalizers: [{ id: '', value: 0, name: '' }],
  value: 0,
}

export const dummyOrderForm: OrderForm = {
  ...emptyOrderForm,
  items: [dummyItem('id1'), dummyItem('id2')],
}
