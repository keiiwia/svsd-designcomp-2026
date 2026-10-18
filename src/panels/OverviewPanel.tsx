import { useMemo, useState, type PointerEvent as RPE } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useVisible } from '../canvas/useVisible'
import { useCanvasApi } from '../canvas/CanvasContext'
import { useDrag } from '../canvas/drag'
import { Avatar, Icon } from '../components/ui'
import { users, OWN_TRAIL } from '../data/seed'
import { stepRect } from '../lib/geometry'
import { useSizes } from '../store'

const MAP_W = 312, MAP_H = 150

function Minimap() {
  const vis = useVisible()
  const camera = useStore((s) => s.camera)
  const steps = useStore((s) => s.steps)
  const trails = useStore((s) => s.trails)
  const saves = useStore((s) => s.saves)
  const sizes = useSizes((s) => s.sizes)

  const box = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const f of vis.frames) {
      minX = Math.min(minX, f.rect.x); minY = Math.min(minY, f.rect.y)
      maxX = Math.max(maxX, f.rect.x + f.rect.w); maxY = Math.max(maxY, f.rect.y + f.rect.h)
    }
    // include the viewport so the rectangle never falls off the map
    const vx = -camera.x / camera.scale, vy = -camera.y / camera.scale
    const vw = window.innerWidth / camera.scale, vh = window.innerHeight / camera.scale
    minX = Math.min(minX, vx); minY = Math.min(minY, vy); maxX = Math.max(maxX, vx + vw); maxY = Math.max(maxY, vy + vh)
    const pad = 80
    minX -= pad; minY -= pad; maxX += pad; maxY += pad
    const k = Math.min(MAP_W / (maxX - minX), MAP_H / (maxY - minY))
    const ox = (MAP_W - (maxX - minX) * k) / 2, oy = (MAP_H - (maxY - minY) * k) / 2
    return { minX, minY, k, ox, oy, vx, vy, vw, vh }
  }, [vis.frames, camera])

  const tx = (x: number) => box.ox + (x - box.minX) * box.k
  const ty = (y: number) => box.oy + (y - box.minY) * box.k

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left - box.ox) / box.k + box.minX
    const y = (e.clientY - r.top - box.oy) / box.k + box.minY
    useCanvasApi.getState().api?.centerOn({ x, y })
  }

  return (
    <svg width={MAP_W} height={MAP_H} className="rounded-[10px] bg-paper border border-line cursor-crosshair" onClick={onClick}>
      {vis.frames.map((f) => (
        <rect key={f.trail.id} x={tx(f.rect.x)} y={ty(f.rect.y)} width={f.rect.w * box.k} height={f.rect.h * box.k} rx={4}
          fill={f.state === 'own' ? '#eae8e4' : 'white'} stroke={f.state === 'own' ? 'none' : '#ddd9d2'} strokeDasharray={f.state === 'expanded' ? undefined : '2 2'} />
      ))}
      {vis.visibleConnections.map((c) => {
        const a = steps[c.fromStepId], b = steps[c.toStepId]
        if (!a || !b) return null
        const ra = stepRect(a, trails[a.trailId], saves[a.saveId], sizes), rb = stepRect(b, trails[b.trailId], saves[b.saveId], sizes)
        const cross = a.trailId !== b.trailId
        return <line key={c.id} x1={tx(ra.x + ra.w / 2)} y1={ty(ra.y + ra.h / 2)} x2={tx(rb.x + rb.w / 2)} y2={ty(rb.y + rb.h / 2)} stroke={cross ? '#4a62c4' : '#c9c5be'} strokeWidth={1} />
      })}
      {vis.visibleSteps.map((st) => {
        const r = stepRect(st, trails[st.trailId], saves[st.saveId], sizes)
        return <circle key={st.id} cx={tx(r.x + r.w / 2)} cy={ty(r.y + r.h / 2)} r={3} fill={users[trails[st.trailId].ownerId].color} stroke="white" strokeWidth={1} />
      })}
      <rect x={tx(box.vx)} y={ty(box.vy)} width={box.vw * box.k} height={box.vh * box.k} fill="rgba(74,98,196,0.05)" stroke="#4a62c4" strokeWidth={1} strokeDasharray="3 3" rx={3} />
    </svg>
  )
}

export function OverviewPanel() {
  const trail = useStore((s) => s.trails[OWN_TRAIL])
  const steps = useStore((s) => s.steps)
  const saves = useStore((s) => s.saves)
  const placed = useStore((s) => s.placed)
  const connections = useStore((s) => s.connections)
  const trails = useStore((s) => s.trails)
  const branchState = useStore((s) => s.branchState)
  const note = useStore((s) => s.trailNotes[OWN_TRAIL])
  const updateTrailNote = useStore((s) => s.updateTrailNote)
  const toggleNoteItem = useStore((s) => s.toggleNoteItem)
  const addNoteItem = useStore((s) => s.addNoteItem)
  const openDetail = useStore((s) => s.openDetail)
  const setDrag = useDrag((s) => s.set)
  const [newItem, setNewItem] = useState('')
  const [notesOpen, setNotesOpen] = useState(true)

  const own = useMemo(() => Object.values(steps).filter((s) => s.trailId === OWN_TRAIL).sort((a, b) => a.index - b.index), [steps])
  const unplaced = Object.values(saves).filter((s) => s.ownerId === 'you' && !placed.includes(s.id))
  const collaborators = useMemo(() => {
    const ids = new Set<string>(['you'])
    for (const c of Object.values(connections)) {
      if (c.authorId !== 'you') continue
      const other = steps[c.toStepId]?.trailId
      if (other && other !== OWN_TRAIL) ids.add(trails[other].ownerId)
    }
    return Array.from(ids)
  }, [connections, steps, trails])
  const trailsOnMap = Object.values(trails).filter((t) => t.ownerId === 'you' ? Object.values(steps).some((s) => s.trailId === t.id) : (branchState[t.id] && branchState[t.id] !== 'hidden'))
  const legend = Array.from(new Set(trailsOnMap.map((t) => t.ownerId)))

  return (
    <motion.div
      data-panel
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.18 }}
      className="absolute right-6 top-6 bg-white border border-line rounded-[18px] shadow-[0px_6px_16px_0px_rgba(31,26,20,0.05)] p-5 flex flex-col gap-5 max-h-[calc(100%-140px)] overflow-y-auto"
      style={{ width: 360, zIndex: 80 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-ink-3">
          <span>Your trail</span>
          <span className="tracking-widest">···</span>
        </div>
        <h2 className="text-[18px] font-semibold text-ink leading-tight">{trail.title}</h2>
        <p className="flex items-center gap-2 text-[11px] text-ink-3">
          <span className="inline-flex">{collaborators.map((id, i) => <Avatar key={id} userId={id} size={16} className={i > 0 ? '-ml-1' : ''} />)}</span>
          {own.length} reference{own.length === 1 ? '' : 's'}{Object.values(connections).filter((c) => c.authorId === 'you').length > 0 && ` · ${Object.values(connections).filter((c) => c.authorId === 'you').length} because${Object.values(connections).filter((c) => c.authorId === 'you').length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* map */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-2 font-medium">Map <span className="text-ink-3 font-normal">· {trailsOnMap.length} trail{trailsOnMap.length === 1 ? '' : 's'}</span></span>
          <button onClick={() => { useCanvasApi.getState().api?.fitAll(); useStore.getState().setOverview(true) }} className="text-ink-3 hover:text-ink" title="Zoom out">⤢</button>
        </div>
        <Minimap />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-3">
          {legend.map((id) => (
            <span key={id} className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: users[id].color }} /> {id === 'you' ? 'Yours' : users[id].name}</span>
          ))}
        </div>
      </div>

      {/* notes */}
      <div className="flex flex-col gap-2.5 border-t border-line pt-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-2 font-medium">Notes <span className="text-ink-3 font-normal">· Edited today</span></span>
          <button onClick={() => setNotesOpen((o) => !o)} className="text-ink-3 hover:text-ink flex items-center gap-1"><Icon name="source" size={10} /> {notesOpen ? 'Close' : 'Open'}</button>
        </div>
        {notesOpen && trail.title === 'Untitled trail' && (
          <p className="text-[12px] text-ink-3 leading-[17px]">Name the trail and the notes open up. Write what these have in common once you see it.</p>
        )}
        {notesOpen && trail.title !== 'Untitled trail' && (
          <>
            <input value={note?.title ?? ''} onChange={(e) => updateTrailNote(OWN_TRAIL, { title: e.target.value })} placeholder="A title for what you’re noticing"
              className="text-[14px] font-semibold text-ink bg-transparent outline-none" />
            <textarea value={note?.body ?? ''} onChange={(e) => updateTrailNote(OWN_TRAIL, { body: e.target.value })} rows={3} placeholder="What do these have in common so far?"
              className="text-[12.5px] leading-[18px] text-ink-2 bg-transparent outline-none w-full" />
            {own.length > 0 && (
              <button onClick={() => openDetail(own[0].id)} className="flex items-center gap-2 text-[11px] text-ink-2 bg-paper rounded-[8px] px-2 py-1.5 w-fit hover:bg-frame">
                <span className="inline-flex">{own.slice(0, 3).map((st, i) => saves[st.saveId].thumb ? <img key={st.id} src={saves[st.saveId].thumb} alt="" className={clsx('w-5 h-5 rounded object-cover border border-white', i > 0 && '-ml-1.5')} /> : null)}</span>
                Rabbit hole · {own.length} step{own.length === 1 ? '' : 's'}
              </button>
            )}
            <ul className="flex flex-col gap-1.5">
              {(note?.items ?? []).map((it) => (
                <li key={it.id} className="flex items-start gap-2 text-[12px] leading-[16px]">
                  <button onClick={() => toggleNoteItem(OWN_TRAIL, it.id)} className={clsx('mt-[2px] w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center', it.done ? 'bg-ink border-ink text-white' : 'border-ink-4')}>
                    {it.done && <span className="text-[9px] leading-none">✓</span>}
                  </button>
                  <span className={clsx(it.done ? 'line-through text-ink-4' : 'text-ink')}>{it.text}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); if (newItem.trim()) { addNoteItem(OWN_TRAIL, newItem.trim()); setNewItem('') } }}>
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="+ add a question to chase" className="text-[12px] text-ink-2 bg-transparent outline-none w-full" />
            </form>
          </>
        )}
      </div>

      {/* phone saves still waiting */}
      {unplaced.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <p className="flex items-center gap-2 text-[11px] text-ink-2 font-medium"><Icon name="phone" size={11} /> From your phone <span className="text-ink-3 font-normal">· {unplaced.length}</span></p>
          {unplaced.map((s) => (
            <div key={s.id}
              onPointerDown={(e: RPE) => { if (e.button === 0) { e.preventDefault(); setDrag({ kind: 'save', saveId: s.id, client: { x: e.clientX, y: e.clientY }, overCanvas: false }) } }}
              className="flex gap-2.5 items-center p-1.5 rounded-[10px] cursor-grab active:cursor-grabbing hover:bg-paper">
              {s.thumb ? <img src={s.thumb} alt="" className="w-9 h-9 rounded-[8px] object-cover" draggable={false} /> : <span className="w-9 h-9 rounded-[8px] border border-line flex items-center justify-center text-ink-2"><Icon name="text" size={13} /></span>}
              <span className="text-[12px] text-ink leading-[16px] line-clamp-2">“{s.thought}”</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
