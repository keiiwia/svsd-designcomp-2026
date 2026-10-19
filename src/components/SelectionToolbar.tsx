import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../store'
import { Icon, type IconName } from './ui'
import { Tip } from '../panels/Toolbar'
import { users } from '../data/seed'
import type { Step, Trail } from '../types'

function MiniButton({ icon, label, onClick, disabled, size = 22 }: { icon: IconName; label: string; onClick: () => void; disabled?: boolean; size?: number }) {
  const [hover, setHover] = useState(false)
  return (
    <div className="relative" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <button
        aria-label={label}
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        className={clsx('w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white transition-colors', disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/12')}
      >
        <Icon name={icon} size={size} />
      </button>
      <Tip label={label} show={hover} />
    </div>
  )
}

/**
 * The FigJam-style pill above a selected reference: edit the idea, branch from it
 * (pick from candidate next ideas), or open it.
 */
export function SelectionToolbar({ step, trail }: { step: Step; trail: Trail }) {
  const own = trail.ownerId === 'you'
  const openIdea = useStore((s) => s.openIdea)
  const openDetail = useStore((s) => s.openDetail)
  const addNote = useStore((s) => s.addNote)
  const selectStep = useStore((s) => s.selectStep)
  const connectSaveToStep = useStore((s) => s.connectSaveToStep)
  const saves = useStore((s) => s.saves)
  const placed = useStore((s) => s.placed)
  const save = saves[step.saveId]
  const [branch, setBranch] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!branch) return
    const away = (e: PointerEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setBranch(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setBranch(false) }
    window.addEventListener('pointerdown', away, true)
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('pointerdown', away, true); window.removeEventListener('keydown', key) }
  }, [branch])

  const candidates = Object.values(saves).filter((s) => s.ownerId === 'you' && !placed.includes(s.id))
  const owner = users[trail.ownerId]

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)]" style={{ zIndex: 45 }} onPointerDown={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.16 }}
        className="flex items-center gap-1 rounded-[16px] px-2 py-[7px] border border-line"
        style={{ background: '#1e1e1e', boxShadow: '0 10px 28px rgba(43,36,26,0.1)' }}
      >
        {own ? (
          <MiniButton icon="noteEdit" label="Edit the idea" onClick={() => openIdea({ mode: 'edit', saveId: step.saveId })} />
        ) : (
          <MiniButton icon="noteEdit" label="Add a thought" onClick={() => { addNote(trail.id, { x: step.pos.x, y: step.pos.y + 150 }, ''); selectStep(null) }} />
        )}
        <MiniButton icon="branchMini" label="Branch from here" size={19} onClick={() => setBranch((b) => !b)} />
        <MiniButton icon="expand" label="Open" onClick={() => openDetail(step.id)} />
      </motion.div>

      <AnimatePresence>
        {branch && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}
            className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] w-[260px] bg-white border border-line rounded-[16px] p-1.5 flex flex-col gap-0.5"
            style={{ boxShadow: '0 10px 14px rgba(38,33,26,0.08), 0 1px 1px rgba(38,33,26,0.05)', zIndex: 46 }}
          >
            <p className="px-2.5 pt-1.5 pb-1 text-[11px] text-ink-3">
              What could come after <span className="text-ink font-medium">{save.title}</span>{own ? '' : ` on ${owner.name}’s trail`}?
            </p>
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={(e) => { e.stopPropagation(); setBranch(false); connectSaveToStep(c.id, step.id) }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] hover:bg-paper text-left"
              >
                {c.thumb ? <img src={c.thumb} alt="" className="w-8 h-8 rounded-[7px] object-cover shrink-0" /> : <span className="w-8 h-8 rounded-[7px] bg-paper border border-line flex items-center justify-center text-ink-2 shrink-0"><Icon name="text" size={13} /></span>}
                <span className="min-w-0">
                  <span className="block text-[12px] text-ink leading-[16px] line-clamp-2">“{c.thought}”</span>
                  <span className="block text-[10px] text-ink-3">{c.mediumLabel} · from your phone</span>
                </span>
              </button>
            ))}
            {candidates.length === 0 && <p className="px-2.5 py-2 text-[12px] text-ink-3">Nothing waiting on your phone.</p>}
            <div className="h-px bg-line my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); setBranch(false); openIdea({ mode: 'create', fromStepId: step.id }) }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] hover:bg-paper text-left text-[12px] font-medium text-ink"
            >
              <span className="w-8 h-8 rounded-[7px] bg-ink text-white flex items-center justify-center shrink-0"><Icon name="noteEdit" size={16} /></span>
              Write a new idea as the next step
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
