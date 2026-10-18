import { motion } from 'framer-motion'
import { useStore, useSizes } from '../store'
import { Avatar } from '../components/ui'
import { anchorPoint, edgePoint, stepRect, type Pt, type Rect } from '../lib/geometry'
import type { Connection } from '../types'
import { useDrag } from './drag'

function cubic(a: Pt, c1: Pt, c2: Pt, b: Pt, t: number): Pt {
  const mt = 1 - t
  return {
    x: mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x,
    y: mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y,
  }
}

export function EdgesLayer({
  connections, nearby, ownFrame, popoverTop, toCanvas,
}: {
  connections: Connection[]
  nearby: { id: string; pos: Pt; w: number; h: number }[]
  ownFrame: Rect
  popoverTop: Pt | null
  toCanvas: (p: Pt) => Pt
}) {
  const steps = useStore((s) => s.steps)
  const trails = useStore((s) => s.trails)
  const saves = useStore((s) => s.saves)
  const draft = useStore((s) => s.draft)
  const sizes = useSizes((s) => s.sizes)
  const drag = useDrag((s) => s.drag)

  const rectOf = (stepId: string) => {
    const st = steps[stepId]
    return stepRect(st, trails[st.trailId], saves[st.saveId], sizes)
  }

  const lines: React.ReactNode[] = []
  const chips: React.ReactNode[] = []

  // faint threads from nearby cards to your frame
  const frameMid = { x: ownFrame.x + ownFrame.w, y: ownFrame.y + ownFrame.h / 2 }
  for (const n of nearby) {
    const c = { x: n.pos.x + n.w / 2, y: n.pos.y + n.h / 2 }
    const mx = (c.x + frameMid.x) / 2
    lines.push(
      <path key={`thread-${n.id}`} d={`M ${c.x} ${c.y} C ${mx} ${c.y}, ${mx} ${frameMid.y}, ${frameMid.x} ${frameMid.y}`}
        stroke="#d9d5ce" strokeWidth={1} fill="none" />,
    )
  }

  for (const c of connections) {
    const a = rectOf(c.fromStepId), b = rectOf(c.toStepId)
    const cross = steps[c.fromStepId].trailId !== steps[c.toStepId].trailId
    const end = anchorPoint(b, c.anchor)
    const bTarget = c.anchor ? end : edgePoint(b, { x: a.x + a.w / 2, y: a.y + a.h / 2 })
    const start = edgePoint(a, bTarget)

    if (!cross) {
      const mid = { x: (start.x + bTarget.x) / 2, y: (start.y + bTarget.y) / 2 }
      lines.push(
        <g key={c.id}>
          <motion.line x1={start.x} y1={start.y} x2={bTarget.x} y2={bTarget.y} stroke="#c9c5be" strokeWidth={1}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }} />
          <circle cx={start.x} cy={start.y} r={3} fill="white" stroke="#aba59c" />
          {c.anchor ? (
            <circle cx={bTarget.x} cy={bTarget.y} r={6} fill="rgba(255,255,255,0.7)" stroke="#aba59c" strokeWidth={1.2} />
          ) : (
            <circle cx={bTarget.x} cy={bTarget.y} r={3} fill="white" stroke="#aba59c" />
          )}
        </g>,
      )
      chips.push(
        <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.25 }}
          className="absolute bg-white border border-line rounded-[6px] px-2 py-1 text-[11px] font-medium text-ink-2 shadow-card max-w-[150px] line-clamp-3 leading-[14px]"
          style={{ left: mid.x, top: mid.y, zIndex: 15, width: 'max-content', x: '-50%', y: '-50%' }} title={c.because}>
          {c.because}
        </motion.div>,
      )
    } else {
      // blue curve from the bottom of yours to the spot on theirs
      const s = { x: a.x + a.w / 2, y: a.y + a.h }
      const e = bTarget
      const c1 = { x: s.x, y: s.y + Math.abs(e.y - s.y) * 0.5 }
      const c2 = { x: e.x, y: e.y - Math.abs(e.y - s.y) * 0.5 }
      const mid = cubic(s, c1, c2, e, 0.5)
      lines.push(
        <g key={c.id}>
          <motion.path d={`M ${s.x} ${s.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${e.x} ${e.y}`} stroke="#4a62c4" strokeWidth={1.5} fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeInOut' }} />
          <circle cx={s.x} cy={s.y} r={3} fill="white" stroke="#4a62c4" />
          <circle cx={e.x} cy={e.y} r={7} fill="rgba(255,255,255,0.75)" stroke="#4a62c4" strokeWidth={1.4} />
        </g>,
      )
      chips.push(
        <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, duration: 0.25 }}
          className="absolute flex items-center gap-1.5 bg-blue text-white rounded-[6px] pl-1 pr-2 py-1 text-[11px] font-medium shadow-card whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis"
          style={{ left: mid.x, top: mid.y, zIndex: 15, width: 'max-content', x: '-50%', y: '-50%' }} title={c.because}>
          <Avatar userId={c.authorId} size={14} /> <span className="truncate">{c.because}</span>
        </motion.div>,
      )
    }
  }

  // draft: focus line + elbow down to the popover
  if (draft && popoverTop) {
    const a = rectOf(draft.fromStepId), b = rectOf(draft.toStepId)
    const end = anchorPoint(b, draft.anchor)
    const start = edgePoint(a, end)
    const cross = steps[draft.fromStepId].trailId !== steps[draft.toStepId].trailId
    const s = cross ? { x: a.x + a.w / 2, y: a.y + a.h } : start
    const d = cross
      ? `M ${s.x} ${s.y} C ${s.x} ${(s.y + end.y) / 2}, ${end.x} ${(s.y + end.y) / 2}, ${end.x} ${end.y}`
      : `M ${s.x} ${s.y} L ${end.x} ${end.y}`
    lines.push(
      <g key="draft">
        <path d={d} stroke="#4a62c4" strokeWidth={1.5} fill="none" />
        <circle cx={s.x} cy={s.y} r={3} fill="white" stroke="#4a62c4" />
        <circle cx={end.x} cy={end.y} r={7} fill="rgba(255,255,255,0.75)" stroke="#4a62c4" strokeWidth={1.4} />
        <path d={`M ${end.x} ${end.y} C ${end.x} ${(end.y + popoverTop.y) / 2}, ${popoverTop.x} ${(end.y + popoverTop.y) / 2}, ${popoverTop.x} ${popoverTop.y}`}
          stroke="#4a62c4" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
      </g>,
    )
  }

  // live connect drag
  if (drag.kind === 'connect') {
    const a = rectOf(drag.fromStepId)
    const p = toCanvas(drag.client)
    const start = edgePoint(a, p)
    lines.push(
      <g key="live">
        <line x1={start.x} y1={start.y} x2={p.x} y2={p.y} stroke="#4a62c4" strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={start.x} cy={start.y} r={3} fill="white" stroke="#4a62c4" />
        <circle cx={p.x} cy={p.y} r={7} fill="rgba(255,255,255,0.75)" stroke="#4a62c4" strokeWidth={1.4} />
      </g>,
    )
  }

  return (
    <>
      <svg className="absolute left-0 top-0 overflow-visible pointer-events-none" width={1} height={1} style={{ zIndex: 12 }}>
        {lines}
      </svg>
      {chips}
    </>
  )
}
