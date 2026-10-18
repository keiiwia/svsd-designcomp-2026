import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type PointerEvent as RPE } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { useStore, useSizes } from '../store'
import { useDrag, isOverCanvas, stepAtClient } from './drag'
import { CanvasCtx, useCanvasApi, type CanvasApi } from './CanvasContext'
import { useVisible } from './useVisible'
import { StepCard, CardBody } from './StepCard'
import { NoteCard } from './NoteCard'
import { TrailFrame } from './TrailFrame'
import { NearbyCard } from './NearbyCard'
import { EdgesLayer } from './EdgesLayer'
import { BecausePopover } from './BecausePopover'
import { anchorPoint, estimateSize, stepRect, type Pt } from '../lib/geometry'
import { nearbyLayout, users, WELCOME } from '../data/seed'

const DESIGN = { w: 1440, h: 1024 }

export function Canvas() {
  const ref = useRef<HTMLDivElement>(null)
  const camera = useStore((s) => s.camera)
  const setCamera = useStore((s) => s.setCamera)
  const tool = useStore((s) => s.ui.tool)
  const draft = useStore((s) => s.draft)
  const steps = useStore((s) => s.steps)
  const trails = useStore((s) => s.trails)
  const saves = useStore((s) => s.saves)
  const layers = useStore((s) => s.ui.layers)
  const nearbyVisible = useStore((s) => s.nearbyVisible)
  const branchState = useStore((s) => s.branchState)
  const thoughtsAll = useStore((s) => s.thoughts)
  const sizes = useSizes((s) => s.sizes)
  const drag = useDrag((s) => s.drag)
  const setDrag = useDrag((s) => s.set)
  const vis = useVisible()

  const toCanvas = useCallback((p: Pt): Pt => {
    const r = ref.current!.getBoundingClientRect()
    const c = useStore.getState().camera
    return { x: (p.x - r.left - c.x) / c.scale, y: (p.y - r.top - c.y) / c.scale }
  }, [])

  // centre the design-sized canvas once the container has a real size
  const centered = useRef(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const tryCenter = () => {
      if (centered.current) return
      const r = el.getBoundingClientRect()
      if (r.width < 10 || r.height < 10) return
      centered.current = true
      setCamera({ x: Math.max(0, Math.round((r.width - DESIGN.w) / 2)), y: Math.max(0, Math.round((r.height - DESIGN.h) / 2)), scale: 1 })
    }
    tryCenter()
    const ro = new ResizeObserver(tryCenter)
    ro.observe(el)
    return () => ro.disconnect()
  }, [setCamera])

  const animateTo = useCallback((target: { x: number; y: number; scale: number }) => {
    const from = useStore.getState().camera
    animate(0, 1, {
      duration: 0.55, ease: [0.3, 0.7, 0.2, 1],
      onUpdate: (k) => setCamera({ x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k, scale: from.scale + (target.scale - from.scale) * k }),
    })
  }, [setCamera])

  const fitRects = useCallback((rects: { x: number; y: number; w: number; h: number }[], maxScale = 1) => {
    const el = ref.current
    if (!el || rects.length === 0) return
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const r of rects) {
      minX = Math.min(minX, r.x); minY = Math.min(minY, r.y)
      maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h)
    }
    const pad = 120
    const r = el.getBoundingClientRect()
    const availW = r.width - 420, availH = r.height - 160
    const scale = Math.min(maxScale, availW / (maxX - minX + pad * 2), availH / (maxY - minY + pad * 2))
    animateTo({
      x: Math.round((availW - (maxX - minX) * scale) / 2 - minX * scale + 24),
      y: Math.round((availH - (maxY - minY) * scale) / 2 - minY * scale + 90),
      scale,
    })
  }, [animateTo])

  const fitAll = useCallback(() => fitRects(vis.frames.map((f) => f.rect)), [vis.frames, fitRects])
  const focusOwn = useCallback(() => fitRects([vis.ownFrame.rect], 1), [vis.ownFrame.rect, fitRects])

  const centerOn = useCallback((pt: Pt) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const c = useStore.getState().camera
    animateTo({ x: Math.round(r.width / 2 - pt.x * c.scale), y: Math.round(r.height / 2 - pt.y * c.scale), scale: c.scale })
  }, [animateTo])

  const api = useMemo<CanvasApi>(() => ({ toCanvas, fitAll, focusOwn, centerOn }), [toCanvas, fitAll, focusOwn, centerOn])
  const publish = useCanvasApi((s) => s.set)
  useEffect(() => { publish(api) }, [api, publish])

  // ---- global pointer handling for drags
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = useDrag.getState().drag
      const st = useStore.getState()
      if (d.kind === 'none') return
      if (d.kind === 'pan') {
        setCamera({ ...st.camera, x: d.camStart.x + (e.clientX - d.start.x), y: d.camStart.y + (e.clientY - d.start.y) })
      } else if (d.kind === 'step') {
        const p = toCanvas({ x: e.clientX - d.offset.x, y: e.clientY - d.offset.y })
        const step = st.steps[d.stepId]
        const trail = st.trails[step.trailId]
        st.moveStep(d.stepId, { x: p.x - trail.origin.x, y: p.y - trail.origin.y })
        if (!d.moved) setDrag({ ...d, moved: true })
      } else if (d.kind === 'note') {
        const p = toCanvas({ x: e.clientX - d.offset.x, y: e.clientY - d.offset.y })
        const note = st.thoughts[d.noteId]
        const trail = st.trails[st.steps[note.stepId]?.trailId ?? 't-you']
        st.moveNote(d.noteId, { x: p.x - trail.origin.x, y: p.y - trail.origin.y })
        if (!d.moved) setDrag({ ...d, moved: true })
      } else if (d.kind === 'save' || d.kind === 'thought' || d.kind === 'thread') {
        setDrag({ ...d, client: { x: e.clientX, y: e.clientY }, overCanvas: isOverCanvas(e.clientX, e.clientY) })
      } else if (d.kind === 'connect') {
        const hit = stepAtClient(e.clientX, e.clientY, d.fromStepId)
        setDrag({ ...d, client: { x: e.clientX, y: e.clientY }, hoverStepId: hit?.id ?? null })
      }
    }
    const up = (e: PointerEvent) => {
      const d = useDrag.getState().drag
      const st = useStore.getState()
      if (d.kind === 'save') {
        if (isOverCanvas(e.clientX, e.clientY)) {
          const p = toCanvas({ x: e.clientX, y: e.clientY })
          const size = estimateSize(st.saves[d.saveId])
          st.placeSave(d.saveId, { x: p.x - size.w / 2, y: p.y - 40 })
        }
      } else if (d.kind === 'thought') {
        if (isOverCanvas(e.clientX, e.clientY)) {
          const p = toCanvas({ x: e.clientX, y: e.clientY })
          st.placeThought(d.thoughtId, { x: p.x - 75, y: p.y - 20 })
        }
      } else if (d.kind === 'thread') {
        if (isOverCanvas(e.clientX, e.clientY)) {
          const p = toCanvas({ x: e.clientX, y: e.clientY })
          st.placeThread(d.stepId, { x: p.x - 75, y: p.y - 20 })
        }
      } else if (d.kind === 'connect') {
        const hit = stepAtClient(e.clientX, e.clientY, d.fromStepId)
        if (hit) {
          const anchor = { x: (e.clientX - hit.rect.left) / hit.rect.width, y: (e.clientY - hit.rect.top) / hit.rect.height }
          st.startDraft(d.fromStepId, hit.id, anchor)
        }
      }
      if (d.kind !== 'none') setDrag({ kind: 'none' })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [toCanvas, setCamera, setDrag])

  const onBgPointerDown = (e: RPE) => {
    if (e.button !== 0) return
    if (useStore.getState().ui.overview) useStore.getState().setOverview(false)
    setDrag({ kind: 'pan', start: { x: e.clientX, y: e.clientY }, camStart: { x: camera.x, y: camera.y } })
    const st = useStore.getState()
    st.selectStep(null)
    if (st.ui.editingTitle) st.setEditingTitle(false)
    if (st.ui.sidebar.kind === 'branchFrom') st.setSidebar({ kind: 'saves' })
  }

  // Wheel handling lives on a native, non-passive listener: React's onWheel is passive,
  // so it cannot stop the browser from zooming the whole page on a trackpad pinch.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      // panels (sidebar, modal, toolbar) scroll on their own; the canvas owns everything else
      if ((e.target as HTMLElement | null)?.closest?.('[data-panel]') && !e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const c = useStore.getState().camera
      if (useStore.getState().ui.overview) useStore.getState().setOverview(false)
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect()
        const px = e.clientX - r.left, py = e.clientY - r.top
        // trackpad pinches arrive as many small deltas; a mouse wheel notch is ~100, so cap each step
        const factor = Math.min(1.4, Math.max(0.7, Math.exp(-e.deltaY * 0.01)))
        const scale = Math.min(2.5, Math.max(0.25, c.scale * factor))
        const k = scale / c.scale
        setCamera({ x: px - (px - c.x) * k, y: py - (py - c.y) * k, scale })
      } else {
        setCamera({ ...c, x: c.x - e.deltaX, y: c.y - e.deltaY })
      }
    }
    // the canvas fills the window, so listen on the window: a pinch that starts over a panel
    // must not zoom the page either
    window.addEventListener('wheel', onWheel, { passive: false })
    // Safari reports trackpad pinches as gesture events as well
    const swallow = (e: Event) => e.preventDefault()
    window.addEventListener('gesturestart', swallow, { passive: false })
    window.addEventListener('gesturechange', swallow, { passive: false })
    window.addEventListener('gestureend', swallow, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('gesturestart', swallow)
      window.removeEventListener('gesturechange', swallow)
      window.removeEventListener('gestureend', swallow)
    }
  }, [setCamera])

  // ---- derived layout
  const ownFrame = vis.ownFrame.rect
  const ownCount = vis.ownFrame.steps.length

  const nearby = useMemo(() => {
    if (!nearbyVisible || !layers.everyone) return []
    if (Object.values(branchState).some((b) => b && b !== 'hidden')) return []
    const out: { id: string; pos: Pt; w: number; h: number }[] = []
    for (const [stepId, lay] of Object.entries(nearbyLayout)) {
      const step = steps[stepId]
      if (!step) continue
      const bs = branchState[step.trailId]
      if (bs && bs !== 'hidden') continue // already on the canvas
      const w = 170, h = 96
      let x = ownFrame.x + ownFrame.w + lay.dx, y = ownFrame.y + lay.dy
      if (lay.anchor === 'bottom') { x = ownFrame.x + lay.dx; y = ownFrame.y + ownFrame.h + lay.dy }
      out.push({ id: stepId, pos: { x, y }, w, h })
    }
    return out
  }, [nearbyVisible, layers.everyone, steps, branchState, ownFrame])

  const popover = useMemo(() => {
    if (!draft || !ref.current) return null
    const to = steps[draft.toStepId]
    const r = stepRect(to, trails[to.trailId], saves[to.saveId], sizes)
    const a = anchorPoint(r, draft.anchor)
    const PW = 400, PH = 230, GAP = 56
    const vr = ref.current.getBoundingClientRect()
    const tl = toCanvas({ x: vr.left + 24, y: vr.top + 100 })
    const br = toCanvas({ x: vr.left + vr.width - 400, y: vr.top + vr.height - 110 })
    const fits = (x: number, y: number) => x >= tl.x && y >= tl.y && x + PW <= br.x && y + PH <= br.y
    const candidates: { x: number; y: number; attach: Pt }[] = [
      { x: a.x - 200, y: r.y + r.h + GAP, attach: { x: a.x, y: r.y + r.h + GAP } },
      { x: r.x + r.w + GAP, y: a.y - 40, attach: { x: r.x + r.w + GAP, y: a.y } },
      { x: r.x - PW - GAP, y: a.y - 40, attach: { x: r.x - GAP, y: a.y } },
      { x: a.x - 200, y: r.y - PH - GAP, attach: { x: a.x, y: r.y - GAP } },
    ]
    for (const c of candidates) if (fits(c.x, c.y)) return c
    // fall back: clamp the first into view
    const c = candidates[0]
    const x = Math.min(Math.max(c.x, tl.x), br.x - PW), y = Math.min(Math.max(c.y, tl.y), br.y - PH)
    return { x, y, attach: { x: x + 200, y } }
  }, [draft, steps, trails, saves, sizes, toCanvas])

  const cursor = drag.kind === 'pan' ? 'grabbing' : tool === 'move' ? 'grab' : tool === 'thought' ? 'copy' : 'default'

  return (
    <CanvasCtx.Provider value={api}>
      <div
        ref={ref}
        data-canvas
        className="absolute inset-0 dot-grid overflow-hidden"
        style={{ cursor }}
        onPointerDown={onBgPointerDown}
      >
        <div
          className="absolute left-0 top-0"
          style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`, transformOrigin: '0 0', width: 0, height: 0 }}
        >
          {/* welcome */}
          <AnimatePresence>
            {ownCount === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }}
                className="absolute font-serif italic font-semibold text-ink-2 text-[33px] leading-[1.25] whitespace-nowrap pointer-events-none"
                style={{ left: ownFrame.x - 30, top: ownFrame.y - 120 }}
              >
                {WELCOME.map((l) => <p key={l}>{l}</p>)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* frames */}
          {vis.frames.map((f) => (
            <TrailFrame key={f.trail.id} trail={f.trail} rect={f.rect} state={f.state}
              stepCount={f.state === 'own' ? f.steps.length : Object.values(steps).filter((s) => s.trailId === f.trail.id).length} />
          ))}

          {/* notes */}
          {vis.notes.map((n) => {
            const st = steps[n.stepId]
            if (!st) return null
            if (!layers.yours && n.authorId === 'you') return null
            if (!layers.everyone && n.authorId !== 'you') return null
            return <NoteCard key={n.id} note={n} trail={trails[st.trailId]} />
          })}

          {/* cards */}
          {layers.reference && vis.frames.map((f) =>
            f.steps.map((st, i) => (
              <StepCard key={st.id} step={st} trail={f.trail} save={saves[st.saveId]} order={f.state === 'expanded' ? i : 0}
                ghost={f.state === 'ghost'} stacked={f.state === 'collapsed' || f.state === 'ghost'} foreign={f.state !== 'own'} expanded={f.state === 'expanded'} />
            )),
          )}

          {/* nearby references from everyone */}
          {nearby.map((n, i) => {
            const st = steps[n.id]
            return <NearbyCard key={n.id} step={st} save={saves[st.saveId]} trail={trails[st.trailId]} pos={n.pos} order={i} />
          })}

          <EdgesLayer connections={layers.reference ? vis.visibleConnections : []} nearby={nearby} ownFrame={ownFrame} layers={layers}
            notes={vis.notes} visibleStepIds={new Set(vis.visibleSteps.map((st) => st.id))}
            popoverTop={popover ? popover.attach : null} toCanvas={toCanvas} />

          {draft && popover && <BecausePopover pos={popover} />}
        </div>

        {(drag.kind === 'thought' || drag.kind === 'thread') && (
          <div className="fixed pointer-events-none" style={{ left: drag.client.x - 75, top: drag.client.y - 20, zIndex: 100, transform: `scale(${camera.scale}) rotate(-2deg)`, transformOrigin: '75px 20px' }}>
            {drag.kind === 'thought' ? (
              <div className={`w-[150px] rounded-[10px] px-3.5 py-3 text-[11.5px] leading-[15px] text-ink shadow-card-lift ${drag.overCanvas ? 'ring-2 ring-blue/60' : 'opacity-80'}`} style={{ background: users[thoughtsAll[drag.thoughtId]?.authorId ?? 'you'].noteBg }}>
                {thoughtsAll[drag.thoughtId]?.text}
              </div>
            ) : (
              <div className="relative w-[150px]">
                <div className="absolute inset-x-2 top-2 h-full rounded-[10px] bg-white border border-line" />
                <div className="absolute inset-x-1 top-1 h-full rounded-[10px] bg-white border border-line" />
                <div className={`relative rounded-[10px] px-3.5 py-3 text-[11.5px] text-ink bg-white border border-line shadow-card-lift ${drag.overCanvas ? 'ring-2 ring-blue/60' : 'opacity-80'}`}>
                  A conversation · {Object.values(thoughtsAll).filter((t) => t.stepId === drag.stepId && !t.parentId).length} thoughts
                </div>
              </div>
            )}
          </div>
        )}

        {/* save drag ghost, in screen space */}
        {drag.kind === 'save' && (
          <div className="fixed pointer-events-none" style={{ left: drag.client.x - 92, top: drag.client.y - 40, zIndex: 100, transform: `scale(${camera.scale}) rotate(3deg)`, transformOrigin: '92px 40px' }}>
            <div className={`w-[184px] bg-white rounded-[13px] overflow-hidden flex flex-col border shadow-card-lift ${drag.overCanvas ? 'border-blue' : 'border-line opacity-80'}`}>
              <CardBody save={saves[drag.saveId]} />
            </div>
          </div>
        )}
      </div>
    </CanvasCtx.Provider>
  )
}
