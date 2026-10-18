import { create } from 'zustand'
import type { Pt } from '../lib/geometry'

export type DragKind =
  | { kind: 'none' }
  | { kind: 'save'; saveId: string; client: Pt; overCanvas: boolean }
  | { kind: 'connect'; fromStepId: string; client: Pt; hoverStepId: string | null }
  | { kind: 'step'; stepId: string; offset: Pt; moved: boolean }
  | { kind: 'note'; noteId: string; offset: Pt; moved: boolean }
  | { kind: 'pan'; start: Pt; camStart: Pt }

interface DragState { drag: DragKind; set: (d: DragKind) => void }
export const useDrag = create<DragState>((set) => ({ drag: { kind: 'none' }, set: (drag) => set({ drag }) }))

/** Find the step card under a client point, if any. */
export function stepAtClient(x: number, y: number, excludeId?: string): { id: string; rect: DOMRect } | null {
  const els = document.elementsFromPoint(x, y)
  for (const el of els) {
    const card = (el as HTMLElement).closest?.('[data-step-id]') as HTMLElement | null
    if (card) {
      const id = card.dataset.stepId!
      if (id === excludeId) continue
      if (card.dataset.connectable === 'false') continue
      return { id, rect: card.getBoundingClientRect() }
    }
  }
  return null
}

export function isOverCanvas(x: number, y: number): boolean {
  const el = document.elementFromPoint(x, y) as HTMLElement | null
  return !!el?.closest('[data-canvas]') && !el.closest('[data-panel]')
}
