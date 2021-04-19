export const useSSR = () => false

export const mockedRuntimeHook = (page = '') => ({
  rootPath: '',
  page,
})

export const useRuntime = jest.fn(mockedRuntimeHook)
