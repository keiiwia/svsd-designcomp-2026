import { useLayoutEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useStore, useSizes } from '../store'
import { useDrag } from './drag'
import { Icon } from '../components/ui'
import { PeekCard } from '../components/PeekCard'
import { spring, useMotion } from '../lib/motion'
import type { Save, Step, Trail } from '../types'
import { stepAbs } from '../lib/geometry'

export function CardBody({ save, compact }: { save: Save; compact?: boolean }) {
  const hasImage = !!save.thumb
  return (
    <>
      {hasImage && (
        <div className="relative w-full overflow-hidden" style={{ height: save.imageHeight ?? 150 }}>
          <img src={save.thumb} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
          {(save.medium === 'video' || save.medium === 'film') && (
            <span className="absolute left-2 bottom-2 w-[22px] h-[22px] rounded-full bg-black/45 flex items-center justify-center text-white">
              <Icon name="play" size={10} />
            </span>
          )}
        </div>
      )}
      <div className={clsx('flex flex-col gap-1.5 w-full', compact ? 'px-3 pt-2.5 pb-3' : 'px-4 pt-3.5 pb-4')}>
        <p className="text-[12px] font-semibold text-ink leading-snug">{save.title}</p>
        <p className="text-[11px] text-ink-2 leading-[16px]">{save.thought}</p>
      </div>
    </>
  )
}

export function StepCard({ step, trail, save, ghost, stacked, foreign, expanded, order = 0 }: {
  step: Step; trail: Trail; save: Save; ghost?: boolean; stacked?: boolean; foreign?: boolean; expanded?: boolean; order?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const setSize = useSizes((s) => s.setSize)
  const selected = useStore((s) => s.ui.selectedStepId === step.id)
  const draft = useStore((s) => s.draft)
  const hint = useStore((s) => s.ui.connectHintStepId === step.id)
  const anyHint = useStore((s) => s.ui.connectHintStepId !== null)
  const pinned = useStore((s) => !!s.pinned[step.id])
  const tool = useStore((s) => s.ui.tool)
  const selectStep = useStore((s) => s.selectStep)
  const openDetail = useStore((s) => s.openDetail)
  const drag = useDrag((s) => s.drag)
  const setDrag = useDrag((s) => s.set)

  const inDraft = !!draft && (draft.fromStepId === step.id || draft.toStepId === step.id)
  const connectHover = drag.kind === 'connect' && drag.hoverStepId === step.id
  const own = trail.ownerId === 'you'
  const pos = stepAbs(step, trail)
  const width = save.cardWidth ?? 184

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(step.id, { w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setSize(step.id, { w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [step.id, setSize])

  const onPointerDown = (e: RPE) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (tool === 'hand') return
    if (!own && !ghost) {
      // other people's cards: click opens detail (handled on click)
      return
    }
    if (ghost) return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    setDrag({ kind: 'step', stepId: step.id, offset: { x: e.clientX - r.left, y: e.clientY - r.top }, moved: false })
    selectStep(step.id)
  }

  const onPortDown = (e: RPE) => {
    e.stopPropagation()
    e.preventDefault()
    setDrag({ kind: 'connect', fromStepId: step.id, client: { x: e.clientX, y: e.clientY }, hoverStepId: null })
  }

  const branchFromStep = useStore((s) => s.branchFromStep)
  const addNote = useStore((s) => s.addNote)
  const makeConnectionFrom = useStore((s) => s.makeConnectionFrom)
  const [peek, setPeekLocal] = useState(false)
  const mo = useMotion()
  const peekTimer = useRef<number | null>(null)
  const canPeek = !own && expanded && !selected
  const onEnter = () => { if (!canPeek) return; peekTimer.current = window.setTimeout(() => setPeekLocal(true), 320) }
  const onLeave = () => { if (peekTimer.current) window.clearTimeout(peekTimer.current); setPeekLocal(false) }
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (drag.kind === 'step' && drag.moved) return
    if (!own) {
      setPeekLocal(false)
      if (expanded) selectStep(selected ? null : step.id)
      else openDetail(step.id)
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring(mo.cardDrop), delay: order * mo.cardStagger }}
      data-step-id={step.id}
      data-connectable={ghost || own || foreign ? 'true' : 'false'}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={clsx(
        'absolute group flex flex-col bg-white overflow-visible rounded-[13px] border transition-shadow',
        inDraft || connectHover ? 'border-blue border-2 shadow-focus' : selected ? 'border-blue border-[1.5px] shadow-card' : 'border-line shadow-card',
        own && tool !== 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        ghost && 'opacity-90',
      )}
      style={{ left: pos.x, top: pos.y, width, zIndex: inDraft ? 30 : selected ? 20 : 10 }}
    >
      {stacked && (
        <>
          <div className="absolute inset-x-2 -bottom-2 h-3 rounded-b-[13px] bg-white border border-line -z-10" />
          <div className="absolute inset-x-4 -bottom-4 h-3 rounded-b-[13px] bg-white border border-line -z-20" />
        </>
      )}
      <div className="overflow-hidden rounded-[12px] flex flex-col">
        <CardBody save={save} />
      </div>
      {pinned && (
        <span className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center shadow-card" style={{ zIndex: 41 }} title="Pinned">
          <Icon name="pin" size={13} />
        </span>
      )}
      {foreign && (
        <span className="absolute left-2 top-2 flex gap-1">
          <span className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[9px] font-semibold text-keiiwia border border-white shadow-sm">K</span>
        </span>
      )}
      <AnimatePresence>
        {peek && canPeek && (
          <PeekCard step={step} className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-[45]"
            onConnect={() => { setPeekLocal(false); makeConnectionFrom(step.id) }} />
        )}
      </AnimatePresence>
      {selected && !own && expanded && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] flex items-center gap-1 bg-white border border-line rounded-[12px] shadow-card-lift p-1 whitespace-nowrap" style={{ zIndex: 45 }}
          onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); addNote(trail.id, { x: step.pos.x, y: step.pos.y + 150 }, ''); selectStep(null) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-[12px] font-medium text-ink-2 hover:bg-paper"><Icon name="thought" size={12} /> Add a thought</button>
          <button onClick={(e) => { e.stopPropagation(); branchFromStep(step.id) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-[12px] font-medium text-ink bg-frame"><Icon name="branch" size={12} /> Branch from here</button>
        </div>
      )}
      {hint && (
        <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 text-[11px] text-blue whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full border border-blue/30">
          draw from one of yours to here
        </span>
      )}
      {own && !ghost && (
        <>
          {(['right', 'bottom'] as const).map((side) => (
            <button
              key={side}
              data-port
              onPointerDown={onPortDown}
              title="Pull a line to another reference"
              className={clsx(
                'absolute flex items-center justify-center w-6 h-6 cursor-crosshair group/port',
                side === 'right' ? 'top-1/2 -right-3 -translate-y-1/2' : '-bottom-3 left-1/2 -translate-x-1/2',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                (selected || inDraft || anyHint) && 'opacity-100',
              )}
              style={{ zIndex: 40 }}
            >
              <span className={clsx('block w-[14px] h-[14px] rounded-full bg-white border-[1.5px] border-blue transition-transform group-hover/port:scale-125', anyHint && 'animate-pulse')} />
            </button>
          ))}
        </>
      )}
    </motion.div>
  )
}
