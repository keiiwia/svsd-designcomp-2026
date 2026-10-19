import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useStore, useSizes } from '../store'
import { Avatar } from '../components/ui'
import { users, DISPLAY_NAME } from '../data/seed'
import { anchorPoint, edgePoint, stepRect, type Pt, type Rect } from '../lib/geometry'
import type { Connection, Thought } from '../types'
import { useDrag, stepAtClient } from './drag'
import { spring, useMotion } from '../lib/motion'

/** A because chip: one click opens it for rewriting (it turns blue as you hover). Enter saves, Escape cancels. */
function BecauseChip({ id, because, blue, authorId, pos, delay, toStepId, offset, onHot }: { id: string; because: string; blue?: boolean; authorId: string; pos: Pt; delay: number; toStepId: string; offset?: Pt; onHot: (id: string | null) => void }) {
  const update = useStore((s) => s.updateConnection)
  const moveLabel = useStore((s) => s.moveConnectionLabel)
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number; moved: boolean } | null>(null)
  const onChipPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (editing || e.button !== 0) return
    const scale = useStore.getState().camera.scale
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset?.x ?? 0, oy: offset?.y ?? 0, moved: false }
    const move = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = (ev.clientX - d.startX) / scale, dy = (ev.clientY - d.startY) / scale
      if (!d.moved && Math.hypot(dx, dy) < 4) return
      d.moved = true
      moveLabel(id, { x: d.ox + dx, y: d.oy + dy })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      // a click that never moved falls through to onClick (edit / select)
      window.setTimeout(() => { dragRef.current = null }, 0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const selectStep = useStore((s) => s.selectStep)
  const mine = authorId === 'you'
  const mo = useMotion()
  const [selected, setSelected] = useState(false)
  const [hover, setHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(because)
  const ref = useRef<HTMLTextAreaElement>(null)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => { if (editing) { setVal(because); setTimeout(() => { ref.current?.focus(); ref.current?.select() }, 0) } }, [editing, because])
  // click anywhere else clears the selection
  useEffect(() => {
    if (!selected) return
    const away = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setSelected(false); setEditing(false) } }
    window.addEventListener('pointerdown', away, true)
    return () => window.removeEventListener('pointerdown', away, true)
  }, [selected])
  const commit = () => { const t = val.trim(); if (t) update(id, t); setEditing(false); setSelected(false) }
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()
  const active = selected || editing || hover
  useEffect(() => { onHot(active ? id : null) }, [active, id, onHot])
  return (
    <motion.div
      ref={box}
      // no layout animation here: it re-measures on every pan and makes chips trail the camera
      initial={{ opacity: editing ? 1 : 0, scale: editing ? 0.6 : 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={editing ? spring(mo.because) : { opacity: { delay, duration: 0.25 }, scale: { delay, duration: 0.25 } }}
      key={editing ? 'edit' : 'chip'}
      className={editing
        ? 'absolute flex flex-col gap-2.5 bg-blue text-white rounded-[16px] px-4 py-3.5 shadow-because cursor-text overflow-hidden'
        : active
          ? 'absolute flex items-center gap-1.5 bg-blue text-white rounded-[6px] pl-1 pr-2 py-1 text-[11px] font-medium shadow-card cursor-pointer overflow-hidden'
          : 'absolute flex items-center gap-1.5 bg-white border border-line rounded-[6px] pl-1 pr-2 py-1 text-[11px] font-medium text-ink-2 shadow-card cursor-pointer leading-[14px] overflow-hidden'}
      data-mine={mine}
      data-chip-drag
      style={{ left: pos.x + (offset?.x ?? 0), top: pos.y + (offset?.y ?? 0), zIndex: active ? 60 : 15, width: editing ? 320 : 'max-content', maxWidth: editing ? 320 : blue || active ? 260 : 150, x: '-50%', y: '-50%',
        boxShadow: selected && !editing ? '0 0 0 3px rgba(74,98,196,0.25), 0 6px 16px rgba(31,26,20,0.08)' : undefined }}
      title={editing ? undefined : mine ? `${because} · click to rewrite` : `${users[authorId].name}’s words · click the step to branch from it`}
      onPointerDown={onChipPointerDown}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={(e) => { stop(e); if (editing || dragRef.current?.moved) return; if (!mine) { selectStep(toStepId); return } setSelected(true); setEditing(true) }}
    >
      {!editing && (blue || active) && <Avatar userId={authorId} size={14} />}
      {!editing && !blue && !active && <span className="w-0" />}
      {editing ? (
        <motion.div initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} transition={spring(mo.because)} style={{ transformOrigin: 'center' }} className="flex flex-col gap-2.5">
          <span className="flex items-center gap-2 text-[12px] font-medium text-white/80"><Avatar userId={authorId} size={18} /> {authorId === 'you' ? DISPLAY_NAME : users[authorId].name}</span>
          <textarea
            ref={ref}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() } if (e.key === 'Escape') { e.preventDefault(); setEditing(false); setSelected(false) } }}
            onPointerDown={stop}
            rows={3}
            className="bg-transparent outline-none text-white w-full resize-none text-[17px] leading-[24px] tracking-[-0.1px]"
          />
          <span className="flex items-center justify-between text-[11px] text-white/60"><span>Enter to save, Esc to cancel</span><button onPointerDown={stop} onClick={(e) => { stop(e); commit() }} className="bg-white text-blue rounded-full px-3 py-1 text-[11px] font-semibold">Save</button></span>
        </motion.div>
      ) : (
        <span className={blue || active ? 'truncate block max-w-[230px]' : 'line-clamp-3'}>{because}</span>
      )}
    </motion.div>
  )
}

function cubic(a: Pt, c1: Pt, c2: Pt, b: Pt, t: number): Pt {
  const mt = 1 - t
  return {
    x: mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x,
    y: mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y,
  }
}

export function EdgesLayer({
  connections, nearby, ownFrame, popoverTop, toCanvas, layers, notes, visibleStepIds,
}: {
  connections: Connection[]
  nearby: { id: string; pos: Pt; w: number; h: number }[]
  ownFrame: Rect
  popoverTop: Pt | null
  toCanvas: (p: Pt) => Pt
  layers: { reference: boolean; yours: boolean; everyone: boolean }
  notes: Thought[]
  visibleStepIds: Set<string>
}) {
  const steps = useStore((s) => s.steps)
  const trails = useStore((s) => s.trails)
  const saves = useStore((s) => s.saves)
  const draft = useStore((s) => s.draft)
  const sizes = useSizes((s) => s.sizes)
  const drag = useDrag((s) => s.drag)

  const thoughts = useStore((s) => s.thoughts)
  const mo = useMotion()
  const [hot, setHot] = useState<string | null>(null)
  const moveEnd = useStore((s) => s.moveConnectionEnd)
  // an end of a connection being dragged to a new spot
  const [endDrag, setEndDrag] = useState<{ id: string; end: 'from' | 'to'; client: Pt } | null>(null)
  const startEndDrag = (e: React.PointerEvent, id: string, end: 'from' | 'to') => {
    e.stopPropagation(); e.preventDefault()
    const move = (ev: PointerEvent) => setEndDrag({ id, end, client: { x: ev.clientX, y: ev.clientY } })
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setEndDrag(null)
      const hit = stepAtClient(ev.clientX, ev.clientY)
      if (hit) moveEnd(id, end, hit.id, { x: (ev.clientX - hit.rect.left) / hit.rect.width, y: (ev.clientY - hit.rect.top) / hit.rect.height })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    setEndDrag({ id, end, client: { x: e.clientX, y: e.clientY } })
  }
  const handle = ({ id, end, x, y, r, stroke, mine }: { id: string; end: 'from' | 'to'; x: number; y: number; r: number; stroke: string; mine: boolean }) => (
    <circle key={`${id}-${end}`} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.85)" stroke={stroke} strokeWidth={1.4}
      style={{ pointerEvents: mine ? 'auto' : 'none', cursor: 'grab' }}
      onPointerDown={mine ? (e) => startEndDrag(e, id, end) : undefined}
      onPointerEnter={() => setHot(id)} onPointerLeave={() => setHot(null)}>
      {mine && <title>Drag to move this end</title>}
    </circle>
  )
  const rectOf = (id: string) => {
    const st = steps[id]
    if (st) return stepRect(st, trails[st.trailId], saves[st.saveId], sizes)
    const th = thoughts[id]
    const trail = trails[steps[th.stepId]?.trailId ?? 't-you']
    const sz = sizes[id] ?? { w: 150, h: 72 }
    return { x: trail.origin.x + (th.onCanvas?.x ?? 0), y: trail.origin.y + (th.onCanvas?.y ?? 0), w: sz.w, h: sz.h }
  }
  const trailOf = (id: string) => steps[id]?.trailId ?? steps[thoughts[id]?.stepId ?? '']?.trailId

  const lines: React.ReactNode[] = []
  const marks: React.ReactNode[] = []
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

  // a pulled thought stays tied to the clip it came from
  for (const n of notes) {
    if (!n.pulled || !visibleStepIds.has(n.stepId)) continue
    const a = rectOf(n.id), b = rectOf(n.stepId)
    const p = edgePoint(a, { x: b.x + b.w / 2, y: b.y + b.h / 2 })
    const q = edgePoint(b, { x: a.x + a.w / 2, y: a.y + a.h / 2 })
    lines.push(<line key={`tether-${n.id}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#c9c5be" strokeWidth={1} strokeDasharray="3 4" />)
  }

  for (const c of connections) {
    const showChip = c.authorId === 'you' ? layers.yours : layers.everyone
    const a = rectOf(c.fromStepId), b = rectOf(c.toStepId)
    const cross = trailOf(c.fromStepId) !== trailOf(c.toStepId)
    const end = anchorPoint(b, c.anchor)
    const bTarget = c.anchor ? end : edgePoint(b, { x: a.x + a.w / 2, y: a.y + a.h / 2 })
    const start = c.fromAnchor ? anchorPoint(a, c.fromAnchor) : edgePoint(a, bTarget)
    const mine = c.authorId === 'you'
    // while an end is being dragged, that end follows the cursor
    const dragging = endDrag?.id === c.id ? endDrag : null
    const liveStart = dragging?.end === 'from' ? toCanvas(dragging.client) : start
    const liveEnd = dragging?.end === 'to' ? toCanvas(dragging.client) : bTarget

    if (!cross) {
      const mid = { x: (start.x + bTarget.x) / 2, y: (start.y + bTarget.y) / 2 }
      lines.push(
        <motion.line key={c.id} x1={liveStart.x} y1={liveStart.y} x2={liveEnd.x} y2={liveEnd.y} stroke={hot === c.id || dragging ? '#4a62c4' : '#c9c5be'} strokeWidth={hot === c.id || dragging ? 1.5 : 1}
          strokeDasharray={dragging ? '4 4' : undefined}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: mo.edgeDraw, ease: 'easeInOut' }} />,
      )
      marks.push(
        <g key={c.id}>
          {handle({ id: c.id, end: 'from', x: liveStart.x, y: liveStart.y, r: hot === c.id ? 6 : 4, stroke: hot === c.id || dragging ? '#4a62c4' : '#aba59c', mine })}
          {handle({ id: c.id, end: 'to', x: liveEnd.x, y: liveEnd.y, r: c.anchor || hot === c.id ? 6.5 : 4, stroke: hot === c.id || dragging ? '#4a62c4' : '#aba59c', mine })}
        </g>,
      )
      if (showChip) chips.push(<BecauseChip key={c.id} id={c.id} because={c.because} authorId={c.authorId} pos={mid} delay={mo.chipDelay} toStepId={c.toStepId} offset={c.labelOffset} onHot={setHot} />)
      if (showChip && c.labelOffset && Math.hypot(c.labelOffset.x, c.labelOffset.y) > 24) lines.push(<line key={`lead-${c.id}`} x1={mid.x} y1={mid.y} x2={mid.x + c.labelOffset.x} y2={mid.y + c.labelOffset.y} stroke="#c9c5be" strokeWidth={1} strokeDasharray="2 3" />)
    } else {
      // blue curve from the bottom of yours to the spot on theirs
      const s = dragging?.end === 'from' ? liveStart : c.fromAnchor ? anchorPoint(a, c.fromAnchor) : { x: a.x + a.w / 2, y: a.y + a.h }
      const e = liveEnd
      const c1 = { x: s.x, y: s.y + Math.abs(e.y - s.y) * 0.5 }
      const c2 = { x: e.x, y: e.y - Math.abs(e.y - s.y) * 0.5 }
      const mid = cubic(s, c1, c2, e, 0.5)
      lines.push(
        <motion.path key={c.id} d={`M ${s.x} ${s.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${e.x} ${e.y}`} stroke={hot === c.id || dragging ? '#4a62c4' : '#c9c5be'} strokeWidth={hot === c.id || dragging ? 1.5 : 1} fill="none" strokeDasharray={dragging ? '4 4' : undefined}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: mo.crossDraw, ease: 'easeInOut' }} />,
      )
      marks.push(
        <g key={c.id}>
          {handle({ id: c.id, end: 'from', x: s.x, y: s.y, r: hot === c.id ? 6 : 4, stroke: hot === c.id || dragging ? '#4a62c4' : '#aba59c', mine })}
          {handle({ id: c.id, end: 'to', x: e.x, y: e.y, r: 7, stroke: hot === c.id || dragging ? '#4a62c4' : '#aba59c', mine })}
        </g>,
      )
      if (showChip) chips.push(<BecauseChip key={c.id} id={c.id} because={c.because} authorId={c.authorId} pos={mid} blue delay={mo.chipDelay + 0.15} toStepId={c.toStepId} offset={c.labelOffset} onHot={setHot} />)
      if (showChip && c.labelOffset && Math.hypot(c.labelOffset.x, c.labelOffset.y) > 24) lines.push(<line key={`lead-${c.id}`} x1={mid.x} y1={mid.y} x2={mid.x + c.labelOffset.x} y2={mid.y + c.labelOffset.y} stroke="#c9c5be" strokeWidth={1} strokeDasharray="2 3" />)
    }
  }

  // draft: focus line + elbow down to the popover
  if (draft && popoverTop) {
    const a = rectOf(draft.fromStepId), b = rectOf(draft.toStepId)
    const end = anchorPoint(b, draft.anchor)
    const start = edgePoint(a, end)
    const cross = trailOf(draft.fromStepId) !== trailOf(draft.toStepId)
    const s = cross ? { x: a.x + a.w / 2, y: a.y + a.h } : start
    const d = cross
      ? `M ${s.x} ${s.y} C ${s.x} ${(s.y + end.y) / 2}, ${end.x} ${(s.y + end.y) / 2}, ${end.x} ${end.y}`
      : `M ${s.x} ${s.y} L ${end.x} ${end.y}`
    lines.push(
      <g key="draft">
        <path d={d} stroke="#4a62c4" strokeWidth={1.5} fill="none" />
        <path d={`M ${end.x} ${end.y} C ${end.x} ${(end.y + popoverTop.y) / 2}, ${popoverTop.x} ${(end.y + popoverTop.y) / 2}, ${popoverTop.x} ${popoverTop.y}`}
          stroke="#4a62c4" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
      </g>,
    )
    marks.push(
      <g key="draft">
        <circle cx={s.x} cy={s.y} r={3} fill="white" stroke="#4a62c4" />
        <circle cx={end.x} cy={end.y} r={7} fill="rgba(255,255,255,0.75)" stroke="#4a62c4" strokeWidth={1.4} />
      </g>,
    )
  }

  // live connect drag
  if (drag.kind === 'connect') {
    const a = rectOf(drag.fromStepId)
    const p = toCanvas(drag.client)
    const start = edgePoint(a, p)
    // the live line rides on top: it should follow the cursor over whatever it crosses
    marks.push(
      <g key="live">
        <line x1={start.x} y1={start.y} x2={p.x} y2={p.y} stroke="#4a62c4" strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={start.x} cy={start.y} r={3} fill="white" stroke="#4a62c4" />
        <circle cx={p.x} cy={p.y} r={7} fill="rgba(255,255,255,0.75)" stroke="#4a62c4" strokeWidth={1.4} />
      </g>,
    )
  }

  return (
    <>
      {/* connectors run beneath the cards; only their small end marks sit on top */}
      <svg className="absolute left-0 top-0 overflow-visible pointer-events-none" width={1} height={1} style={{ zIndex: 3 }}>
        {lines}
      </svg>
      <svg className="absolute left-0 top-0 overflow-visible" width={1} height={1} style={{ zIndex: 12, pointerEvents: 'none' }}>
        {marks}
      </svg>
      {chips}
    </>
  )
}
