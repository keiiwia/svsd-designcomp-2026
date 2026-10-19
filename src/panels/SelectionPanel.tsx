import { motion } from 'motion/react'
import { useMotion } from '../lib/motion'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import { users, KEIIWIA_BECAUSE } from '../data/seed'
import { Conversation } from './Conversation'

/** Follows what you select: the reference, whose step it is, and the conversation around it. */
export function SelectionPanel({ stepId }: { stepId: string }) {
  // the panel can still be fading out after its step was removed, so every lookup is guarded
  const step = useStore((s) => s.steps[stepId])
  const save = useStore((s) => (step ? s.saves[step.saveId] : undefined))
  const trail = useStore((s) => (step ? s.trails[step.trailId] : undefined))
  const conn = useStore((s) => (step && trail ? Object.values(s.connections).find((c) => c.toStepId === stepId && c.authorId === trail.ownerId && s.steps[c.fromStepId]?.trailId === step.trailId) : undefined))
  const openDetail = useStore((s) => s.openDetail)
  const selectStep = useStore((s) => s.selectStep)
  if (!step || !save || !trail) return null
  const own = trail.ownerId === 'you'
  const owner = users[trail.ownerId]
  const because = stepId === 'k2' ? KEIIWIA_BECAUSE : conn?.because

  return (
    <motion.div
      data-panel
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      transition={{ duration: useMotion.getState().panelFade }}
      className="absolute right-6 top-6 bg-white border border-line rounded-[18px] shadow-[0px_6px_16px_0px_rgba(31,26,20,0.05)] p-5 flex flex-col gap-4 bottom-[40px] overflow-y-auto"
      style={{ width: 360, zIndex: 80 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        {save.thumb ? (
          <img src={save.thumb} alt="" className="w-full h-[150px] rounded-[12px] object-cover" />
        ) : (
          <div className="w-full h-[110px] rounded-[12px] bg-paper border border-line flex items-center px-5 font-serif italic text-[18px] text-ink-2">“{save.thought}”</div>
        )}
        <button onClick={() => selectStep(null)} className="absolute right-4 top-4 w-7 h-7 rounded-full bg-white/90 border border-line flex items-center justify-center text-ink-2 hover:bg-paper"><Icon name="close" size={10} /></button>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-ink">{save.title}</p>
        <p className="text-[11px] text-ink-3 flex items-center gap-1.5">
          <Avatar userId={trail.ownerId} size={13} ring={false} />
          {own ? 'your' : `${owner.name}’s`} step {step.index} · {save.mediumLabel.toLowerCase()}{save.duration ? ` · ${save.duration}` : save.day ? ` · ${save.day}` : ''}
        </p>
        <p className="text-[12.5px] text-ink-2 leading-[18px] pt-1">“{save.thought}”</p>
        {save.previous && save.previous.length > 0 && (
          <div className="flex flex-col gap-1 pt-1">
            <p className="text-[10px] text-ink-3">Previous thoughts</p>
            {save.previous.map((pv, i) => <p key={i} className="text-[12px] leading-[16px] text-ink-3 font-serif italic">“{pv.thought}”</p>)}
          </div>
        )}
        {because && !own && (
          <p className="text-[12px] text-ink leading-[17px] bg-paper rounded-[10px] px-3 py-2 mt-1"><span className="text-blue text-[10px] block">{owner.name} on why this came next</span>{because}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => openDetail(stepId)} className="flex items-center gap-1.5 border border-line rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-2 hover:bg-paper"><Icon name="source" size={11} /> Open</button>
      </div>
      <div className="border-t border-line pt-4">
        <Conversation stepId={stepId} compact />
      </div>
    </motion.div>
  )
}
