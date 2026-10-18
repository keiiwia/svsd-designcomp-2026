import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { Avatar, AvatarStack, Icon } from '../components/ui'
import { users, KEIIWIA_BECAUSE, OWN_TRAIL } from '../data/seed'
import { fmtTime } from '../lib/geometry'
import { ThoughtThread } from '../panels/Sidebar'
import { PeekCard } from '../components/PeekCard'
import type { Step } from '../types'


interface StripCtx {
  steps: Record<string, Step>
  saves: Record<string, import('../types').Save>
  connections: Record<string, import('../types').Connection>
  owner: import('../types').User
  peek: string | null
  openDetail: (id: string | null) => void
  onEnter: (id: string) => void
  onLeave: () => void
  onClick: (s: Step) => void
  onConnect: (id: string) => void
  onWalk: (s: Step) => void
}

function Crumb({ s, current, ctx }: { s: Step; current?: boolean; ctx: StripCtx }) {
  return (
    <button
      onClick={() => (current ? null : ctx.openDetail(s.id))}
      className={clsx('px-3 py-2.5 rounded-[12px] text-[12px] font-medium whitespace-nowrap', current ? 'bg-white border-[1.25px] border-ink text-ink' : 'bg-paper text-ink-2 hover:bg-frame')}
    >
      {ctx.saves[s.saveId].title}
    </button>
  )
}

function StepMini({ s, current, who, ctx }: { s: Step; current?: boolean; who: string; ctx: StripCtx }) {
  const sv = ctx.saves[s.saveId]
  const conn = Object.values(ctx.connections).find((c) => c.toStepId === s.id && c.authorId === who && ctx.steps[c.fromStepId]?.trailId === s.trailId)
  const foreign = s.trailId !== OWN_TRAIL
  return (
    <div className="flex items-center gap-2">
      {conn && (
        <span className="text-[10px] leading-[13px] text-ink-2 bg-white border border-line rounded-[6px] px-1.5 py-1 max-w-[86px] line-clamp-2">{conn.because}</span>
      )}
      <div className="relative" onMouseEnter={() => !current && foreign && ctx.onEnter(s.id)} onMouseLeave={ctx.onLeave}>
        <button
          onClick={() => !current && ctx.onClick(s)}
          className={clsx('flex flex-col rounded-[10px] overflow-hidden border text-left w-[78px]', current ? 'border-blue border-[1.5px] shadow-focus' : 'border-line bg-white hover:border-ink-4')}
        >
          {sv.thumb && <img src={sv.thumb} alt="" className="w-full h-[46px] object-cover" />}
          <span className="px-1.5 py-1 text-[10px] font-medium text-ink leading-tight">{sv.title}</span>
        </button>
        <AnimatePresence>
          {ctx.peek === s.id && (
            <PeekCard step={s} onConnect={() => ctx.onConnect(s.id)} onWalk={() => ctx.onWalk(s)} className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-[5]" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function parseDuration(d?: string) {
  if (!d) return 130
  const [m, s] = d.split(':').map(Number)
  return m * 60 + s
}

export function DetailModal() {
  const stepId = useStore((s) => s.ui.detailStepId)
  return <AnimatePresence>{stepId && <Detail key={stepId} stepId={stepId} />}</AnimatePresence>
}

function Detail({ stepId }: { stepId: string }) {
  const step = useStore((s) => s.steps[stepId])
  const save = useStore((s) => s.saves[step.saveId])
  const trail = useStore((s) => s.trails[step.trailId])
  const allSteps = useStore((s) => s.steps)
  const allThoughts = useStore((s) => s.thoughts)
  const trailSteps = useMemo(() => Object.values(allSteps).filter((st) => st.trailId === step.trailId).sort((a, b) => a.index - b.index), [allSteps, step.trailId])
  const ownSteps = useMemo(() => Object.values(allSteps).filter((st) => st.trailId === OWN_TRAIL).sort((a, b) => a.index - b.index), [allSteps])
  const saves = useStore((s) => s.saves)
  const connections = useStore((s) => s.connections)
  const unlocked = useStore((s) => !!s.unlocked[step.trailId] || trail.ownerId === 'you')
  const thoughts = useMemo(() => Object.values(allThoughts).filter((t) => t.stepId === stepId), [allThoughts, stepId])
  const close = useStore((s) => s.openDetail)
  const makeConnectionFrom = useStore((s) => s.makeConnectionFrom)
  const openDetail = useStore((s) => s.openDetail)
  const addThought = useStore((s) => s.addThought)
  const peek = useStore((s) => s.ui.peekStepId)
  const setPeek = useStore((s) => s.setPeek)
  const startWalk = useStore((s) => s.startWalk)
  const [val, setVal] = useState('')
  const [playing, setPlaying] = useState(true)
  const owner = users[trail.ownerId]
  const isVideo = save.medium === 'video' || save.medium === 'film'
  const duration = parseDuration(save.duration)
  // playhead: starts at her anchor (0:41) and runs while "playing"
  const [t, setT] = useState(41)
  const now = Math.round(t)
  useEffect(() => {
    if (!playing || !isVideo) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const ts = performance.now()
      const dt = (ts - last) / 1000; last = ts
      setT((v) => (v + dt > duration ? 0 : v + dt))
    }, 125)
    return () => window.clearInterval(id)
  }, [playing, isVideo, duration])
  const scrubTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setT(Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration)))
  }
  const pinnedPeek = useRef(false)
  const hoverTimer = useRef<number | null>(null)
  const peekEnter = (id: string) => {
    if (pinnedPeek.current) return
    hoverTimer.current = window.setTimeout(() => setPeek(id), 220)
  }
  const peekLeave = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    if (!pinnedPeek.current) setPeek(null)
  }
  const linkedToOwn = Object.values(connections).some((c) => c.authorId === 'you' && (c.toStepId === stepId || c.fromStepId === stepId))
  const incoming = Object.values(connections).find((c) => c.toStepId === stepId && c.authorId === trail.ownerId && allSteps[c.fromStepId]?.trailId === step.trailId)
  const because = stepId === 'k2' ? KEIIWIA_BECAUSE : incoming?.because ?? save.thought
  const thoughtAuthors = Array.from(new Set(thoughts.map((t) => t.authorId)))
  const timedThoughts = thoughts.filter((t) => t.t !== undefined && !t.parentId && t.stance !== 'linked your skirt')
  const her = owner.name === 'keiiwia' ? 'her' : 'their'

  const ctx: StripCtx = {
    steps: allSteps, saves, connections, owner, peek, openDetail,
    onEnter: peekEnter, onLeave: peekLeave,
    onClick: (st) => {
      if (st.trailId === OWN_TRAIL) { openDetail(st.id); return }
      pinnedPeek.current = !(pinnedPeek.current && peek === st.id)
      setPeek(pinnedPeek.current ? st.id : null)
    },
    onConnect: (id) => { pinnedPeek.current = false; setPeek(null); makeConnectionFrom(id) },
    onWalk: (st) => { pinnedPeek.current = false; startWalk(st.trailId, st.index) },
  }

  return (
    <motion.div className="absolute inset-0" style={{ zIndex: 90 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-panel>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => close(null)} onPointerDown={(e) => e.stopPropagation()} />
      <motion.div
        initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className="absolute left-[52px] right-[52px] top-[52px] bottom-[52px] bg-white rounded-[28px] shadow-modal overflow-hidden flex"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* media column */}
        <div className="flex-1 min-w-0 p-8 flex flex-col gap-5 overflow-y-auto">
          <div className="relative w-full rounded-[18px] overflow-hidden bg-paper" style={{ aspectRatio: isVideo ? '16 / 9' : undefined, maxHeight: 440 }}>
            {save.video ? (
              <video src={save.video} poster={save.thumb} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : save.thumb ? (
              <img src={save.thumb} alt="" className="w-full h-full object-cover"
                style={{ maxHeight: 440, animation: isVideo ? 'kenburns 40s ease-in-out infinite alternate' : undefined, animationPlayState: playing ? 'running' : 'paused' }} />
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-ink-3 font-serif italic text-[26px] px-10 text-center">“{save.thought}”</div>
            )}
            {/* anchored thoughts on the frame */}
            {unlocked && isVideo && timedThoughts.filter((th) => th.t! <= t && t - th.t! < 7).slice(-1).map((t) => (
              <div key={t.id} className="absolute left-[12%] top-[40%] flex items-start gap-2">
                <div className="bg-white/95 rounded-[10px] px-3 py-2 shadow-card max-w-[240px]">
                  <p className="text-[10px] text-ink-3">{users[t.authorId].name}{t.stance ? ` · ${t.stance}` : ''}</p>
                  <p className="text-[12px] text-ink leading-[16px]">{t.text}</p>
                </div>
                <AvatarStack ids={[t.authorId, ...thoughts.filter((r) => r.parentId === t.id).map((r) => r.authorId)]} size={20} />
              </div>
            ))}
          </div>

          {isVideo && (
            <div className="flex items-center gap-4">
              <button onClick={() => setPlaying((p) => !p)} className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center">
                {playing ? <Icon name="pause" size={14} /> : <Icon name="play" size={12} />}
              </button>
              <div className="flex flex-col gap-2 w-[520px] max-w-full">
                <div className="relative h-[34px] cursor-pointer" onClick={scrubTo}>
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-line rounded" />
                  <div className="absolute left-0 top-1/2 h-[2px] bg-ink rounded" style={{ width: `${(t / duration) * 100}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ink" style={{ left: `calc(${(t / duration) * 100}% - 6px)` }} />
                  {timedThoughts.map((t) => (
                    <span key={t.id} className="absolute top-1/2 -translate-y-[14px] -translate-x-1/2" style={{ left: `${(t.t! / duration) * 100}%` }} title={t.text}>
                      {unlocked ? <Avatar userId={t.authorId} size={14} /> : <span className="block w-1.5 h-1.5 rounded-full bg-ink-4" />}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-ink-3"><span>{fmtTime(now)}</span><span>{save.duration}</span></div>
              </div>
              <button className="flex items-center gap-2 border border-line rounded-full pl-3.5 pr-4 py-2.5 text-[13px] font-medium text-ink-2"><Icon name="muted" size={14} /> Unmute</button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">{save.title} <Icon name="source" size={13} className="text-ink-3" /></p>
            <p className="text-[13px] text-ink-3">{trail.ownerId === 'you' ? `Your trail · ${trail.title}` : `From ${owner.name}’s trail · ${trail.title}`}</p>
          </div>

          {/* step strips */}
          {!unlocked ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              {trailSteps.slice(0, 3).map((s, i) => (
                <span key={s.id} className="flex items-center gap-2.5">
                  {i > 0 && <span className="text-ink-4 text-[13px]">→</span>}
                  <Crumb s={s} current={s.id === stepId} ctx={ctx} />
                </span>
              ))}
              {trailSteps.length > 3 && (
                <span className="flex items-center gap-2.5"><span className="text-ink-4 text-[13px]">→</span>
                  <span className="px-3 py-2.5 rounded-[12px] text-[12px] font-medium text-ink-2 border border-dashed border-ink-4">{trailSteps.length - 3} more</span></span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {trail.ownerId !== 'you' && ownSteps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-ink-2"><Avatar userId="you" size={14} ring={false} /> Your trail</p>
                  <div className="flex items-center gap-3">
                    {ownSteps.map((s) => <StepMini key={s.id} s={s} who="you" ctx={ctx} />)}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-[11px] text-ink-2"><Avatar userId={trail.ownerId} size={14} ring={false} /> {owner.name}’s trail <span className="text-ink-3">{trail.title}</span></p>
                <div className="flex items-center gap-3 flex-wrap">
                  {trail.branchedFrom && (
                    <span className="text-[10px] text-ink-3 flex items-center gap-1 max-w-[90px] leading-tight"><Avatar userId={trail.branchedFrom.ownerId} size={12} ring={false} /> started from {users[trail.branchedFrom.ownerId].name}’s {trail.branchedFrom.trailTitle}</span>
                  )}
                  {trailSteps.map((s) => <StepMini key={s.id} s={s} current={s.id === stepId} who={trail.ownerId} ctx={ctx} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* because column */}
        <div className="w-[480px] shrink-0 border-l border-line px-10 py-9 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[14px]"><Avatar userId={trail.ownerId} size={24} /> <span className="font-medium">{trail.ownerId === 'you' ? 'You' : owner.name}</span> <span className="text-ink-3">because</span></p>
            <button onClick={() => close(null)} className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-2 hover:bg-paper"><Icon name="close" size={13} /></button>
          </div>
          <p className="text-[24px] leading-[33px] tracking-[-0.24px] text-ink">{because}</p>
          {trail.ownerId !== 'you' && !linkedToOwn && (
            <button onClick={() => makeConnectionFrom(stepId)} className="w-fit flex items-center gap-2 bg-ink text-white rounded-full pl-[18px] pr-5 py-3 text-[14px] font-medium hover:bg-black">
              <Icon name="connect" size={14} /> Make a connection
            </button>
          )}
          {trail.ownerId !== 'you' && linkedToOwn && (
            <p className="text-[12px] text-ink-3 flex items-center gap-1.5"><Icon name="connect" size={12} /> Linked to your trail</p>
          )}
          <div className="h-px bg-line" />

          {!unlocked ? (
            <div className="bg-paper rounded-[16px] px-[18px] pt-4 pb-[18px] flex flex-col gap-3.5">
              <p className="flex items-center gap-2.5 text-[14px] font-medium text-ink-2">
                <Icon name="lock" size={14} /> <AvatarStack ids={thoughtAuthors.slice(0, 4)} /> {thoughts.length} thoughts here
              </p>
              {thoughts.slice(0, 3).map((t, i) => (
                <div key={t.id} className="bg-white rounded-[12px] px-3.5 py-3 flex flex-col gap-[7px] blur-[1.5px] select-none">
                  <span className="h-[9px] rounded bg-line-strong" style={{ width: [340, 260, 300][i % 3] }} />
                  <span className="h-[9px] rounded bg-line-strong" style={{ width: [187, 143, 165][i % 3] }} />
                </div>
              ))}
              <p className="text-[12px] text-ink-3">Make a connection to {her} step and the thoughts open up.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-2 text-[13px] text-ink-2"><Icon name="thought" size={13} /> Thoughts here</p>
              <form className="border border-line rounded-[10px] px-3 py-2.5" onSubmit={(e) => { e.preventDefault(); if (val.trim()) { addThought(stepId, val.trim(), isVideo ? now : undefined); setVal('') } }}>
                <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={isVideo ? `Add a thought at ${fmtTime(now)}…` : 'Add a thought…'} className="w-full bg-transparent outline-none text-[13px]" />
              </form>
              <ThoughtThread stepId={stepId} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
