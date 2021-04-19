import type { RenderContext } from 'vtex.render-runtime'

declare global {
  interface Window {
    __RUNTIME__: RenderContext & { settings?: Record<string, any> }
  }
}
