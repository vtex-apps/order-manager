// @ts-expect-error: We don't want to mock everything on __RUNTIME__
window.__RUNTIME__ = {
  account: 'checkoutio',
  workspace: 'master',
  settings: {
    'vtex.store': { enableOrderFormOptimization: true },
  },
}
