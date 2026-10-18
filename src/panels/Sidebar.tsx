import { useMemo, useState, type PointerEvent as RPE } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { useDrag } from '../canvas/drag'
import { Avatar, Icon } from '../components/ui'
import { users, whoBranched, KEIIWIA_TRAIL } from '../data/seed'
import type { Save, Thought } from '../types'
import { fmtTime } from '../lib/geometry'
import { OverviewPanel } from './OverviewPanel'
import { SelectionPanel } from './SelectionPanel'
import { OWN_TRAIL } from '../data/seed'

function Shell({ children, title, onClose, width = 360 }: { children: React.ReactNode; title?: React.ReactNode; onClose?: () => void; width?: number }) {
  return (
    <motion.div
      data-panel
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.18 }}
      className="absolute right-6 top-6 bg-white border border-line rounded-[18px] shadow-[0px_6px_16px_0px_rgba(31,26,20,0.05)] p-6 flex flex-col gap-5 max-h-[calc(100%-140px)] overflow-y-auto"
      style={{ width, zIndex: 80 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {(title || onClose) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">{title}</div>
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-ink-2 hover:bg-paper shrink-0"><Icon name="close" size={11} /></button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}

export function Sidebar() {
  const mode = useStore((s) => s.ui.sidebar)
  const selected = useStore((s) => s.ui.selectedStepId)
  const ownCount = useStore((s) => Object.values(s.steps).filter((st) => st.trailId === OWN_TRAIL).length)
  const unplaced = useStore((s) => Object.values(s.saves).filter((sv) => sv.ownerId === 'you' && !s.placed.includes(sv.id)).length)
  const walking = useStore((s) => !!s.ui.walk)
  const selectedValid = useStore((s) => (selected ? !!s.steps[selected] : false))
  if (walking) return null
  // explicit actions (a fresh link, branching from a step) keep their panel; otherwise the sidebar follows what you select
  const explicit = mode.kind === 'connection' || mode.kind === 'branchFrom'
  if (!explicit && selected && selectedValid) {
    return (
      <AnimatePresence mode="wait">
        <SelectionPanel key={`sel-${selected}`} stepId={selected} />
      </AnimatePresence>
    )
  }
  const defaultPanel = ownCount < 2 && unplaced > 0 ? <SavesPanel key="saves" /> : <OverviewPanel key="overview" />
  return (
    <AnimatePresence mode="wait">
      {mode.kind === 'saves' && defaultPanel}
      {mode.kind === 'connection' && <ConnectionPanel key={mode.connectionId} connectionId={mode.connectionId} />}
      {mode.kind === 'branch' && <BranchPanel key={`b-${mode.trailId}`} trailId={mode.trailId} />}
      {mode.kind === 'branchFrom' && <BranchFromPanel key={`bf-${mode.stepId}`} stepId={mode.stepId} />}
    </AnimatePresence>
  )
}

function SaveRow({ save, onPointerDown, dim, action }: { save: Save; onPointerDown?: (e: RPE) => void; dim?: boolean; action?: React.ReactNode }) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={clsx('flex gap-3 items-start p-2 rounded-[12px] w-full text-left', onPointerDown && 'cursor-grab active:cursor-grabbing hover:bg-paper', dim && 'opacity-50 bg-paper')}
    >
      {save.thumb ? (
        <img src={save.thumb} alt="" className="w-14 h-14 rounded-[10px] object-cover shrink-0" draggable={false} />
      ) : (
        <span className="w-14 h-14 rounded-[10px] bg-white border border-line flex items-center justify-center text-ink-2 shrink-0"><Icon name="text" size={18} /></span>
      )}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-[13px] leading-[18px] text-ink">“{save.thought}”</p>
        <p className="text-[11px] text-ink-3">{save.mediumLabel}{save.day ? ` · ${save.day}` : ''}</p>
        {action}
      </div>
    </div>
  )
}

function SavesPanel() {
  const saves = useStore((s) => s.saves)
  const placed = useStore((s) => s.placed)
  const setDrag = useDrag((s) => s.set)
  const list = Object.values(saves).filter((s) => s.ownerId === 'you' && !placed.includes(s.id))
  return (
    <Shell title={<><span className="w-8 h-8 rounded-[9px] bg-paper flex items-center justify-center text-ink-2"><Icon name="phone" size={15} /></span><span className="text-[15px] font-semibold">From your phone</span></>}>
      {list.length === 0 ? (
        <p className="text-[13px] text-ink-3 px-2">Nothing waiting. Save something on your phone and it lands here.</p>
      ) : (
        <div className="flex flex-col gap-2 -mt-1">
          {list.map((s) => (
            <SaveRow key={s.id} save={s} onPointerDown={(e) => { if (e.button === 0) { e.preventDefault(); setDrag({ kind: 'save', saveId: s.id, client: { x: e.clientX, y: e.clientY }, overCanvas: false }) } }} />
          ))}
        </div>
      )}
    </Shell>
  )
}

function ThoughtItem({ t, depth = 0 }: { t: Thought; depth?: number }) {
  const u = users[t.authorId]
  return (
    <div className={clsx('flex flex-col gap-1', depth > 0 && 'ml-3 pl-3 border-l border-line')}>
      <p className="flex items-center gap-1.5 text-[12px]">
        <Avatar userId={t.authorId} size={16} ring={false} />
        <span className="font-medium text-ink">{u.name}</span>
        {t.stance && <span className="text-ink-3">{t.stance}</span>}
        {t.t !== undefined && <span className="text-[10px] font-mono bg-paper rounded px-1 text-ink-2">{fmtTime(t.t)}</span>}
      </p>
      <p className="text-[13px] leading-[18px] text-ink">{t.text}</p>
      <button className="text-[11px] text-ink-3 text-left hover:text-ink w-fit">Reply</button>
    </div>
  )
}

export function ThoughtThread({ stepId, excludeYou }: { stepId: string; excludeYou?: boolean }) {
  const all = useStore((s) => s.thoughts)
  const thoughts = useMemo(() => Object.values(all).filter((t) => t.stepId === stepId), [all, stepId])
  // your because is already shown above the thread; your other thoughts belong in it
  const roots = thoughts.filter((t) => !t.parentId && !(excludeYou && t.authorId === 'you' && t.stance === 'linked your skirt'))
  return (
    <div className="flex flex-col gap-4">
      {roots.map((t) => (
        <div key={t.id} className="flex flex-col gap-3">
          <ThoughtItem t={t} />
          {thoughts.filter((r) => r.parentId === t.id).map((r) => <ThoughtItem key={r.id} t={r} depth={1} />)}
        </div>
      ))}
    </div>
  )
}

function ConnectionPanel({ connectionId }: { connectionId: string }) {
  const conn = useStore((s) => s.connections[connectionId])
  const steps = useStore((s) => s.steps)
  const saves = useStore((s) => s.saves)
  const thoughts = useStore((s) => s.thoughts)
  const setSidebar = useStore((s) => s.setSidebar)
  const addThought = useStore((s) => s.addThought)
  const [val, setVal] = useState('')
  if (!conn) return null
  const fromThought = thoughts[conn.fromStepId]
  const fromStep = steps[conn.fromStepId] ?? steps[fromThought?.stepId ?? '']
  const from = fromStep ? saves[fromStep.saveId] : undefined
  const to = saves[steps[conn.toStepId].saveId]
  const short = (t: string) => t.replace(/^(Embroidered|Painted|Folded)\s/, '').replace(/,.*$/, '')
  return (
    <Shell
      onClose={() => setSidebar({ kind: 'saves' })}
      title={
        <>
          <span className="flex items-center gap-1">
            {fromThought ? <Avatar userId={fromThought.authorId} size={22} /> : from?.thumb && <img src={from.thumb} alt="" className="w-7 h-7 rounded-[6px] object-cover" />}
            <span className="text-ink-4 text-[12px]">→</span>
            {to.thumb && <img src={to.thumb} alt="" className="w-7 h-7 rounded-[6px] object-cover" />}
          </span>
          <span className="text-[12px] text-ink-2 capitalize">{fromThought ? `${users[fromThought.authorId].name}’s thought` : short(from?.title ?? '')} → {short(to.title)}</span>
        </>
      }
    >
      <div className="rounded-[12px] px-3.5 py-3 flex flex-col gap-2" style={{ background: users.you.noteBg }}>
        <p className="text-[13px] leading-[18px] text-ink">Because {conn.because.charAt(0).toLowerCase() + conn.because.slice(1)}</p>
        {conn.attachments.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {conn.attachments.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 bg-white/70 rounded-full pl-0.5 pr-2 py-0.5 text-[11px]">
                {saves[id].thumb && <img src={saves[id].thumb} alt="" className="w-4 h-4 rounded-full object-cover" />}{saves[id].title}
              </span>
            ))}
          </div>
        )}
        <p className="flex items-center gap-1.5 text-[10px] text-ink-3"><Avatar userId="you" size={12} ring={false} /> You</p>
      </div>
      <form className="flex items-center gap-2 border border-line rounded-full px-3 py-2" onSubmit={(e) => { e.preventDefault(); if (val.trim()) { addThought(conn.toStepId, val.trim()); setVal('') } }}>
        <Icon name="thought" size={13} className="text-ink-3" />
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a thought…" className="flex-1 bg-transparent outline-none text-[13px]" />
      </form>
      <ThoughtThread stepId={fromThought ? fromThought.stepId : conn.toStepId} excludeYou />
    </Shell>
  )
}

function BranchPanel({ trailId }: { trailId: string }) {
  const trail = useStore((s) => s.trails[trailId])
  const setSidebar = useStore((s) => s.setSidebar)
  const owner = users[trail.ownerId]
  return (
    <Shell onClose={() => setSidebar({ kind: 'saves' })} title={<><Avatar userId={trail.ownerId} size={22} /><span className="text-[14px] font-medium">{owner.name}’s branch</span></>}>
      <div className="flex flex-col gap-3">
        <h2 className="text-[22px] text-ink leading-tight">{trail.title}</h2>
        {trail.description && <p className="text-[14px] leading-[21px] text-ink-2">{trail.description}</p>}
        {trail.branchedFrom && (
          <p className="flex items-center gap-2 bg-paper rounded-[10px] px-3 py-2.5 text-[12px] text-ink-2">
            <Avatar userId={trail.branchedFrom.ownerId} size={18} ring={false} />
            Branched from {users[trail.branchedFrom.ownerId].name}’s “{trail.branchedFrom.trailTitle}” at step {trail.branchedFrom.stepIndex}
          </p>
        )}
      </div>
      {trailId === KEIIWIA_TRAIL && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-ink">Who branched off it</p>
          {whoBranched.map((w) => (
            <div key={w.trailTitle} className="flex items-center gap-3 border border-line rounded-[12px] px-3.5 py-3">
              <Avatar userId={w.ownerId} size={22} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink leading-tight">{w.trailTitle}</p>
                <p className="text-[11px] text-ink-3">{users[w.ownerId].name} · from step {w.fromStep}</p>
              </div>
              {w.onCanvas ? <span className="text-[11px] text-ink-3">on your canvas</span> : (
                <button className="flex items-center gap-1 border border-line rounded-full px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-paper"><Icon name="plus" size={11} /> Add</button>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  )
}

function BranchFromPanel({ stepId }: { stepId: string }) {
  const step = useStore((s) => s.steps[stepId])
  const save = useStore((s) => s.saves[step.saveId])
  const trail = useStore((s) => s.trails[step.trailId])
  const saves = useStore((s) => s.saves)
  const placed = useStore((s) => s.placed)
  const setSidebar = useStore((s) => s.setSidebar)
  const connectSaveToStep = useStore((s) => s.connectSaveToStep)
  const [q, setQ] = useState('')
  const owner = users[trail.ownerId]
  const list = Object.values(saves).filter((s) => s.ownerId === 'you' && !placed.includes(s.id) && (!q || s.thought.toLowerCase().includes(q.toLowerCase())))
  return (
    <Shell onClose={() => setSidebar({ kind: 'saves' })} title={<><Icon name="branch" size={15} className="text-ink" /><span className="text-[15px] font-semibold">Branch from {owner.name}’s step {step.index}</span></>}>
      <div className="rounded-[12px] px-3.5 py-3" style={{ background: owner.noteBg }}>
        <p className="text-[13px] font-semibold text-ink">{save.title}</p>
        <p className="text-[12px] text-ink-2 leading-[17px]">{save.thought}</p>
      </div>
      <p className="text-[13px] font-medium text-ink -mb-2">From your saves</p>
      <div className="flex flex-col gap-1">
        {list.map((s, i) => (
          <SaveRow key={s.id} save={s} dim={false}
            action={i === 0 || list.length === 1 ? (
              <button onClick={() => connectSaveToStep(s.id, stepId)} className="mt-1 w-fit flex items-center gap-1.5 bg-ink text-white rounded-full px-3 py-1.5 text-[12px] font-medium hover:bg-black"><Icon name="connect" size={12} /> Connect</button>
            ) : undefined} />
        ))}
        {list.length === 0 && <p className="text-[13px] text-ink-3 px-2">All your saves are already on a trail.</p>}
      </div>
      <label className="flex items-center gap-2 border border-line rounded-[10px] px-3 py-2.5">
        <Icon name="search" size={14} className="text-ink-4" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your saves" className="flex-1 bg-transparent outline-none text-[13px]" />
      </label>
    </Shell>
  )
}
