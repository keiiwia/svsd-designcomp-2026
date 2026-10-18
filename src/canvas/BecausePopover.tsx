import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import type { Pt } from '../lib/geometry'
import { OWN_TRAIL } from '../data/seed'
import { spring, useMotion } from '../lib/motion'

export function BecausePopover({ pos }: { pos: Pt }) {
  const draft = useStore((s) => s.draft)!
  const update = useStore((s) => s.updateDraft)
  const commit = useStore((s) => s.commitDraft)
  const cancel = useStore((s) => s.cancelDraft)
  const toggleAtt = useStore((s) => s.toggleDraftAttachment)
  const saves = useStore((s) => s.saves)
  const steps = useStore((s) => s.steps)
  const placed = useStore((s) => s.placed)
  const [menu, setMenu] = useState(false)
  const mo = useMotion()
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ta.current?.focus() }, [])
  useEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = Math.max(60, el.scrollHeight) + 'px'
  }, [draft.text])

  // the "from" end can be a thought bubble pulled onto the canvas
  const from = steps[draft.fromStepId], to = steps[draft.toStepId]
  const excluded = new Set([from?.saveId, to?.saveId].filter(Boolean) as string[])
  const inTrail = Object.values(steps).filter((s) => s.trailId === OWN_TRAIL && !excluded.has(s.saveId)).map((s) => saves[s.saveId])
  const unplaced = Object.values(saves).filter((s) => s.ownerId === 'you' && !placed.includes(s.id) && !excluded.has(s.id))
  const canLink = draft.text.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring(mo.because)}
      className="absolute w-[400px] rounded-[20px] bg-blue text-white px-5 py-[18px] flex flex-col gap-3.5 shadow-because"
      style={{ left: pos.x, top: pos.y, zIndex: 60 }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      data-panel
    >
      <div className="flex items-center gap-2">
        <Avatar userId="you" size={22} />
        <span className="text-[14px] font-medium text-white/80">Because</span>
      </div>
      <textarea
        ref={ta}
        value={draft.text}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canLink) commit() }
          if (e.key === 'Escape') cancel()
        }}
        placeholder="What connects these?"
        className="w-full bg-transparent outline-none text-[21px] leading-[30px] tracking-[-0.17px] text-white placeholder:text-white/40"
        rows={2}
      />
      {draft.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {draft.attachments.map((id) => {
            const s = saves[id]
            return (
              <span key={id} className="inline-flex items-center gap-1.5 bg-white/15 rounded-full pl-1 pr-2 py-1 text-[11px]">
                {s.thumb ? <img src={s.thumb} alt="" className="w-[18px] h-[18px] rounded-full object-cover" /> : <Icon name="text" size={12} />}
                {s.title}
                <button onClick={() => toggleAtt(id)} className="text-white/70 hover:text-white ml-0.5">×</button>
              </span>
            )
          })}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <p className="text-[12px] text-white/70">Only you can see this until you share your trail.</p>
        <div className="flex items-center justify-between relative">
          <div className="flex gap-1.5">
            <button onClick={() => setMenu((m) => !m)} className="w-[34px] h-[34px] rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" title="Add a picture, a link or a step">
              <Icon name="plus" size={16} />
            </button>
            <button className="w-[34px] h-[34px] rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" title="Say it instead">
              <Icon name="mic" size={16} />
            </button>
          </div>
          <button
            onClick={() => canLink && commit()}
            className={`flex items-center gap-2 rounded-full pl-4 pr-[18px] py-2.5 text-[13px] font-semibold transition-colors ${canLink ? 'bg-white text-blue' : 'bg-white/30 text-white/60 cursor-not-allowed'}`}
          >
            <Icon name="connect" size={14} /> Link
          </button>

          {menu && (
            <div className="absolute left-0 top-[42px] w-[220px] bg-white text-ink rounded-[12px] shadow-card-lift border border-line py-1.5 text-[12px]" style={{ zIndex: 70 }}>
              <button className="w-full text-left px-3 py-1.5 hover:bg-paper flex items-center gap-2" onClick={() => setMenu(false)}>
                <span className="w-4 text-center">▣</span> Add a picture
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-paper flex items-center gap-2" onClick={() => setMenu(false)}>
                <span className="w-4 text-center">⌁</span> Paste a link
              </button>
              {inTrail.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-1 text-[10px] text-ink-3">From this trail</p>
                  {inTrail.map((s) => (
                    <button key={s.id} className="w-full text-left px-3 py-1.5 hover:bg-paper flex items-center gap-2" onClick={() => { toggleAtt(s.id); setMenu(false) }}>
                      {s.thumb ? <img src={s.thumb} alt="" className="w-4 h-4 rounded object-cover" /> : <Icon name="text" size={12} className="text-ink-3" />}
                      {s.title}
                    </button>
                  ))}
                </>
              )}
              {unplaced.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-1 text-[10px] text-ink-3">From your saves</p>
                  {unplaced.map((s) => (
                    <button key={s.id} className="w-full text-left px-3 py-1.5 hover:bg-paper flex items-center gap-2" onClick={() => { toggleAtt(s.id); setMenu(false) }}>
                      {s.thumb ? <img src={s.thumb} alt="" className="w-4 h-4 rounded object-cover" /> : <Icon name="text" size={12} className="text-ink-3" />}
                      “{s.thought}”
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
