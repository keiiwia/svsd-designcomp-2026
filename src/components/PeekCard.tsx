import { motion } from 'framer-motion'
import { Icon } from './ui'
import { useStore } from '../store'
import { users, KEIIWIA_BECAUSE } from '../data/seed'
import type { Step } from '../types'

/** The "because first" preview of someone else's step: their reason, then the reference, then a way in. */
export function PeekCard({ step, onConnect, onWalk, className }: { step: Step; onConnect: () => void; onWalk?: () => void; className?: string }) {
  const save = useStore((s) => s.saves[step.saveId])
  const trail = useStore((s) => s.trails[step.trailId])
  const conn = useStore((s) => Object.values(s.connections).find((c) => c.toStepId === step.id && c.authorId === trail.ownerId))
  const nThoughts = useStore((s) => Object.values(s.thoughts).filter((t) => t.stepId === step.id && !t.onCanvas).length)
  const owner = users[trail.ownerId]
  const because = step.id === 'k2' ? KEIIWIA_BECAUSE : conn?.because
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.16 }}
      className={`w-[210px] bg-white rounded-[12px] shadow-card-lift border border-line p-3 flex flex-col gap-2 text-left ${className ?? ''}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {because ? (
        <>
          <p className="text-[10px] text-blue">because</p>
          <p className="text-[12px] leading-[16px] text-ink">“{because}”</p>
        </>
      ) : (
        <p className="text-[10px] text-ink-3">where {owner.name}’s trail starts</p>
      )}
      <p className="text-[11px] text-ink-2 bg-paper rounded-[8px] p-2 leading-[15px]"><span className="font-medium text-ink">{save.title}</span> · {save.thought}</p>
      <p className="text-[10px] text-ink-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: owner.color }} /> {owner.name}’s trail · step {step.index}
        {nThoughts > 0 && <span className="ml-auto flex items-center gap-1"><Icon name="thought" size={10} /> {nThoughts}</span>}
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={onConnect} className="flex items-center gap-1.5 bg-ink text-white rounded-full px-2.5 py-1.5 text-[11px] font-medium hover:bg-black whitespace-nowrap"><Icon name="connect" size={11} /> Make a connection</button>
        {onWalk && <button onClick={onWalk} className="text-[11px] text-ink-2 hover:text-ink px-1.5 whitespace-nowrap">Walk</button>}
      </div>
    </motion.div>
  )
}
