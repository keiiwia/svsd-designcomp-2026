import { useMemo, useState, type PointerEvent as RPE } from 'react'
import clsx from 'clsx'
import { useStore } from '../store'
import { useDrag } from '../canvas/drag'
import { Avatar, Icon } from '../components/ui'
import { users } from '../data/seed'
import type { Stance, Thought } from '../types'
import { fmtTime } from '../lib/geometry'

const stanceLabel: Record<string, string> = {
  'built on it': 'builds on it',
  disagrees: 'disagrees',
  wonders: 'wonders',
  agrees: 'agrees',
}

function Bubble({ t, reply, replyTo }: { t: Thought; reply?: boolean; replyTo?: Thought }) {
  const u = users[t.authorId]
  const setDrag = useDrag((s) => s.set)
  const updateThought = useStore((s) => s.updateThought)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const mine = t.authorId === 'you'
  const onPointerDown = (e: RPE) => {
    if (e.button !== 0) return
    e.preventDefault()
    setDrag({ kind: 'thought', thoughtId: t.id, client: { x: e.clientX, y: e.clientY }, overCanvas: false })
  }
  const relation = t.stance ? stanceLabel[t.stance] ?? t.stance : reply ? 'replies' : undefined
  return (
    <div className={clsx('flex flex-col gap-1', reply && 'ml-5')}>
      {reply && relation && (
        <p className="text-[10px] text-ink-4 flex items-center gap-1 pl-1">↳ {relation}{replyTo && <span className="text-ink-4"> to {users[replyTo.authorId].name}</span>}</p>
      )}
      <div
        onPointerDown={editing ? undefined : onPointerDown}
        title={editing ? undefined : 'Drag this thought onto the canvas'}
        className={clsx('group/bubble relative rounded-[12px] px-3.5 py-2.5 flex flex-col gap-1.5 select-none', !editing && 'cursor-grab active:cursor-grabbing', t.onCanvas && 'opacity-60')}
        style={{ background: u.noteBg }}
      >
        {editing ? (
          <textarea
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => { if (val.trim()) updateThought(t.id, val.trim()); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (val.trim()) updateThought(t.id, val.trim()); setEditing(false) } if (e.key === 'Escape') { setVal(t.text); setEditing(false) } }}
            onPointerDown={(e) => e.stopPropagation()}
            rows={2}
            className="text-[12.5px] leading-[17px] text-ink bg-white/60 rounded-[8px] px-2 py-1 outline-none w-full resize-none"
          />
        ) : (
          <p className="text-[12.5px] leading-[17px] text-ink">{t.text}</p>
        )}
        {mine && !editing && (
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setVal(t.text); setEditing(true) }} title="Edit"
            className="absolute right-1.5 top-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-ink-2 opacity-0 group-hover/bubble:opacity-100 hover:bg-white">
            <Icon name="noteEdit" size={13} />
          </button>
        )}
        <p className="flex items-center gap-1.5 text-[10px] text-ink-3">
          <Avatar userId={t.authorId} size={13} ring={false} />
          <span className="text-ink-2">{t.authorId === 'you' ? 'You' : u.name}</span>
          {!reply && relation && <span>· {relation}{t.stance === 'disagrees' && t.authorId !== 'you' ? '' : ''}</span>}
          {t.t !== undefined && <span className="font-mono">· {fmtTime(t.t)}</span>}
          {t.onCanvas && <span className="ml-auto text-ink-4">on the canvas</span>}
        </p>
      </div>
    </div>
  )
}

/** A step's thoughts as a conversation: bubbles in each person's colour, with how each reply relates. */
export function Conversation({ stepId, compact }: { stepId: string; compact?: boolean }) {
  const all = useStore((s) => s.thoughts)
  const saves = useStore((s) => s.saves)
  const steps = useStore((s) => s.steps)
  const trails = useStore((s) => s.trails)
  const addThought = useStore((s) => s.addThought)
  const branchFromStep = useStore((s) => s.branchFromStep)
  const setBranchState = useStore((s) => s.setBranchState)
  const setDrag = useDrag((s) => s.set)
  const [stance, setStance] = useState<Stance | undefined>()
  const [val, setVal] = useState('')

  const thoughts = useMemo(() => Object.values(all).filter((t) => t.stepId === stepId && t.stance !== 'linked your skirt'), [all, stepId])
  const roots = thoughts.filter((t) => !t.parentId)
  const step = steps[stepId]
  const trail = step ? trails[step.trailId] : undefined
  const owner = trail ? users[trail.ownerId] : users.you
  const save = step ? saves[step.saveId] : undefined
  const disagreement = thoughts.some((t) => t.stance === 'disagrees')

  const onThreadDown = (e: RPE) => {
    if (e.button !== 0 || roots.length === 0) return
    e.preventDefault()
    setDrag({ kind: 'thread', stepId, client: { x: e.clientX, y: e.clientY }, overCanvas: false })
  }

  return (
    <div className="flex flex-col gap-3">
      <div onPointerDown={onThreadDown} title="Drag the whole conversation onto the canvas"
        className={clsx('flex items-center gap-2 text-[12px] text-ink-2 rounded-[8px] -mx-1 px-1 py-1', roots.length > 0 && 'cursor-grab active:cursor-grabbing hover:bg-paper')}>
        <Icon name="grip" size={12} className="text-ink-4" />
        <span className="font-medium text-ink">{compact ? 'Thoughts here' : 'A conversation about this ' + (save?.medium === 'video' || save?.medium === 'film' ? 'clip' : 'reference')}</span>
        <span className="text-ink-3">· {thoughts.length}</span>
      </div>

      {roots.length === 0 && <p className="text-[12px] text-ink-3">No thoughts yet.</p>}

      <div className="flex flex-col gap-3">
        {roots.map((t) => (
          <div key={t.id} className="flex flex-col gap-2">
            <Bubble t={t} />
            {thoughts.filter((r) => r.parentId === t.id).map((r) => <Bubble key={r.id} t={r} reply replyTo={t} />)}
          </div>
        ))}
      </div>

      <form
        className="flex flex-col gap-2 pt-1"
        onSubmit={(e) => { e.preventDefault(); if (!val.trim()) return; addThought(stepId, val.trim(), undefined, stance); setVal(''); setStance(undefined) }}
      >
        <div className="flex gap-1.5">
          {(['agrees', 'disagrees', 'wonders'] as Stance[]).map((st) => (
            <button type="button" key={st} onClick={() => setStance(stance === st ? undefined : st)}
              className={clsx('px-2.5 py-1 rounded-full text-[11px] border transition-colors', stance === st ? 'bg-ink text-white border-ink' : 'border-line text-ink-2 hover:bg-paper')}>
              {st === 'agrees' ? 'I agree' : st === 'disagrees' ? 'I disagree' : 'I wonder'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border border-line rounded-full pl-3 pr-1 py-1">
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={`Reply to ${owner.name === 'You' ? 'yourself' : owner.name}…`} className="flex-1 bg-transparent outline-none text-[12.5px] min-w-0" />
          <button type="submit" className="bg-ink text-white rounded-full px-3 py-1.5 text-[11px] font-medium">Add</button>
        </div>
      </form>

      {disagreement && step && (
        <button
          onClick={() => { if (trail && trail.ownerId !== 'you') setBranchState(trail.id, 'expanded'); branchFromStep(stepId) }}
          className="text-left text-[11px] text-ink-3 hover:text-ink flex items-center gap-1"
        >
          This disagreement could be its own trail <span className="text-blue">· Branch it →</span>
        </button>
      )}
    </div>
  )
}
