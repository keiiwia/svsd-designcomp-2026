import type { Save, Size, Step, Thought, Trail } from '../types'

export interface Rect { x: number; y: number; w: number; h: number }
export interface Pt { x: number; y: number }

export const CARD_W = 184
export const TEXT_BLOCK_H = 72
export const NOTE_W = 150
export const NOTE_H = 72

export function estimateSize(save: Save): Size {
  const w = save.cardWidth ?? CARD_W
  if (!save.thumb) return { w, h: 76 }
  return { w, h: (save.imageHeight ?? 150) + TEXT_BLOCK_H }
}

export function stepAbs(step: Step, trail: Trail): Pt {
  return { x: trail.origin.x + step.pos.x, y: trail.origin.y + step.pos.y }
}

export function stepRect(step: Step, trail: Trail, save: Save, sizes: Record<string, Size>): Rect {
  const p = stepAbs(step, trail)
  const s = sizes[step.id] ?? estimateSize(save)
  return { x: p.x, y: p.y, w: s.w, h: s.h }
}

// generous enough that ports, pin badges and floating toolbars stay inside the frame
export const FRAME_PAD = { left: 40, top: 56, right: 40, bottom: 40 }
export const EMPTY_FRAME: Size = { w: 200, h: 240 }

export function frameRect(
  trail: Trail,
  steps: Step[],
  saves: Record<string, Save>,
  notes: Thought[],
  sizes: Record<string, Size>,
  minWidth = 0,
): Rect {
  if (steps.length === 0) {
    return { x: trail.origin.x, y: trail.origin.y, w: EMPTY_FRAME.w, h: EMPTY_FRAME.h }
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const st of steps) {
    const r = stepRect(st, trail, saves[st.saveId], sizes)
    minX = Math.min(minX, r.x); minY = Math.min(minY, r.y)
    maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h)
  }
  for (const n of notes) {
    if (!n.onCanvas) continue
    const x = trail.origin.x + n.onCanvas.x, y = trail.origin.y + n.onCanvas.y
    const s = sizes[n.id] ?? { w: NOTE_W, h: NOTE_H }
    minX = Math.min(minX, x); minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + s.w); maxY = Math.max(maxY, y + s.h)
  }
  const x = minX - FRAME_PAD.left
  const y = minY - FRAME_PAD.top
  const w = Math.max(maxX + FRAME_PAD.right - x, minWidth)
  const h = maxY + FRAME_PAD.bottom - y
  return { x, y, w, h }
}

/**
 * The narrowest a frame can be and still show its heading in one line:
 * avatar + title (+ "· name's branch") + grip, a gap, then the Collapse / Add / Expand button.
 */
export function headerMinWidth(title: string, suffix: string, button: string): number {
  const mono = 6.6      // Inter medium at 12px (the heading used to be mono)
  const sans = 6.3      // Inter medium at 11px
  const label = 19 + 15 + 8 + (title.length + suffix.length) * mono + 8 + 20
  const btn = button ? button.length * sans + 24 + 14 : 0
  return Math.ceil(label + 28 + btn + 16)
}

export function center(r: Rect): Pt { return { x: r.x + r.w / 2, y: r.y + r.h / 2 } }

/** Point on the boundary of r closest to the direction of target. */
export function edgePoint(r: Rect, target: Pt): Pt {
  const c = center(r)
  const dx = target.x - c.x, dy = target.y - c.y
  if (Math.abs(dx) * r.h >= Math.abs(dy) * r.w) {
    return { x: dx > 0 ? r.x + r.w : r.x, y: c.y }
  }
  return { x: c.x, y: dy > 0 ? r.y + r.h : r.y }
}

export function anchorPoint(r: Rect, anchor?: { x: number; y: number }): Pt {
  if (!anchor) return center(r)
  return { x: r.x + anchor.x * r.w, y: r.y + anchor.y * r.h }
}

export function fmtTime(t: number): string {
  const m = Math.floor(t / 60), s = Math.round(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
