const logSplunk = jest.fn()
const logKpiEvent = jest.fn()

export const useSplunk = () => ({
  logSplunk,
  logKpiEvent,
})
