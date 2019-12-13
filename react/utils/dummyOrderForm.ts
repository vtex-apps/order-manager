const dummyItem = (id: string) => ({
  additionalInfo: {
    brandName: '',
  },
  id: id,
  detailUrl: '',
  imageUrl: '',
  listPrice: 0,
  measurementUnit: '',
  name: '',
  price: 0,
  productId: '',
  quantity: 0,
  sellingPrice: 0,
  skuName: '',
  skuSpecifications: [],
  availability: 'available',
})

export const dummyOrderForm = {
  items: [dummyItem('1'), dummyItem('2')],
  shipping: {
    countries: [],
    deliveryOptions: [
      { id: '', price: 0, estimate: '', isSelected: false },
      { id: '', price: 0, estimate: '', isSelected: false },
      { id: '', price: 0, estimate: '', isSelected: false },
    ],
    selectedAddress: {
      addressId: '',
      addressType: '',
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
  totalizers: [{ id: '', value: 0, name: '' }],
  value: 0,
}

export const emptyOrderForm = {
  items: [],
  shipping: {
    countries: [],
    deliveryOptions: [],
    selectedAddress: {
      addressId: '',
      addressType: '',
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
  totalizers: [{ id: '', value: 0, name: '' }],
  value: 0,
}
