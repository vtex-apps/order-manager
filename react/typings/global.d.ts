import { RenderContext } from 'vtex.render-runtime'

declare global {
  // eslint-disable-next-line no-redeclare
  const __RUNTIME__: RenderContext
}
