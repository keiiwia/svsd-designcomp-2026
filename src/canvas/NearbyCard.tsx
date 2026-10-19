import { useState } from 'react'
import { motion } from 'motion/react'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import { users } from '../data/seed'
import type { Save, Step, Trail } from '../types'
import type { Pt } from '../lib/geometry'
import { useMotion } from '../lib/motion'

const COMPACT_W = 170, OPEN_W = 240

/**
 * A reference from someone else's trail, sitting near yours. It grows from its left edge on hover:
 * the top part never moves, the image and the Link button unfold beneath it.
 */
export function NearbyCard({ step, save, trail, pos, order = 0, quick, fromStepId }: {
  step: Step; save: Save; trail: Trail; pos: Pt; order?: number; quick?: boolean; fromStepId?: string | null
}) {
  const [hover, setHover] = useState(false)
  const mo = useMotion()
  const openDetail = useStore((s) => s.openDetail)
  const makeConnectionFrom = useStore((s) => s.makeConnectionFrom)
  const nThoughts = useStore((s) => Object.values(s.thoughts).filter((t) => t.stepId === step.id).length)
  const fromOwn = useStore((s) => (fromStepId ? s.trails[s.steps[fromStepId]?.trailId ?? '']?.ownerId === 'you' : false))
  const u = users[trail.ownerId]

  const connect = () => {
    makeConnectionFrom(step.id, pos)
    if (fromStepId && fromOwn) {
      // the suggestion came from one of your cards: go straight to writing the because
      const from = fromStepId
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const st = useStore.getState()
        st.suggestFrom(null)
        st.startDraft(from, step.id)
      }))
    } else useStore.getState().suggestFrom(null)
  }

  const grow = { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.8 }
  const unfold = { duration: 0.22, ease: [0.25, 0.8, 0.25, 1] as const }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: quick ? 0.28 : 0.4, delay: (quick ? 0.05 : mo.nearbyDelay) + order * (quick ? 0.06 : mo.nearbyStagger), ease: 'easeOut' }}
      className="absolute"
      style={{ left: pos.x, top: pos.y, zIndex: hover ? 50 : 14 }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={false}
        animate={{ width: hover ? OPEN_W : COMPACT_W, borderColor: hover ? '#e6e2db' : u.noteBg }}
        transition={{ width: grow, borderColor: unfold }}
        className="bg-white rounded-[12px] px-3 py-2.5 flex flex-col gap-1.5 border-[1.4px] text-left overflow-hidden"
        style={{ transformOrigin: 'left top', boxShadow: hover ? '0 10px 24px rgba(31,26,20,0.1)' : '0 2px 6px rgba(31,26,20,0.06)', transition: 'box-shadow 0.22s' }}
      >
        <button onClick={(e) => { e.stopPropagation(); openDetail(step.id) }} className="text-left flex flex-col gap-1.5 w-full" title="Open to look closer">
          <span className="inline-flex items-center w-fit rounded-full border border-line bg-white px-2 py-[3px] text-[10px] font-medium leading-[12px] text-ink-2 opacity-70">{save.mediumLabel}</span>
          <span className="text-[12px] leading-[16px] text-ink">“{save.thought}”</span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3"><Avatar userId={trail.ownerId} size={13} ring={false} /> {u.name}’s trail</span>
        </button>

        {/* unfolds beneath on hover; the part above never moves */}
        <motion.div initial={false} animate={{ height: hover ? 'auto' : 0, opacity: hover ? 1 : 0 }} transition={unfold} style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-2.5 pt-1.5">
            {save.thumb && (
              <button onClick={(e) => { e.stopPropagation(); openDetail(step.id) }} className="w-full h-[110px] rounded-[8px] overflow-hidden">
                <img src={save.thumb} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform" />
              </button>
            )}
            {nThoughts > 0 && <span className="flex items-center gap-1.5 text-[10px] text-ink-3"><Icon name="lock" size={10} /> {nThoughts} thoughts here</span>}
            <button onClick={(e) => { e.stopPropagation(); connect() }}
              className="w-fit flex items-center gap-1.5 bg-ink text-white rounded-full px-3 py-1.5 text-[11px] font-medium hover:bg-black whitespace-nowrap">
              <Icon name="connect" size={11} /> Link
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
