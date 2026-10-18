import { createContext, useContext } from 'react'
import { create } from 'zustand'
import type { Pt } from '../lib/geometry'

export interface CanvasApi {
  toCanvas: (client: Pt) => Pt
  fitAll: () => void
  focusOwn: () => void
  centerOn: (pt: Pt) => void
}
export const CanvasCtx = createContext<CanvasApi | null>(null)
export const useCanvas = () => {
  const c = useContext(CanvasCtx)
  if (!c) throw new Error('CanvasCtx missing')
  return c
}

/** The canvas publishes its API here so chrome outside the canvas tree can call it. */
export const useCanvasApi = create<{ api: CanvasApi | null; set: (api: CanvasApi) => void }>((set) => ({
  api: null,
  set: (api) => set({ api }),
}))
