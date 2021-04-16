export const useSSR = () => false

export const useRuntime = jest.fn((page = '') => ({
  rootPath: '',
  page,
}))
