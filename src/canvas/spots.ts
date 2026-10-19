import { create } from 'zustand'
import type { Pt } from '../lib/geometry'

// where the suggestion cards currently sit, so a link started from the detail view can land on the same spot
export const useSpots = create<{ spots: Record<string, Pt>; set: (spots: Record<string, Pt>) => void }>((set) => ({
  spots: {},
  set: (spots) => set({ spots }),
}))
