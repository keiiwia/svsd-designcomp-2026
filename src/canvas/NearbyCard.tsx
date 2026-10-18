import { useState } from 'react'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useStore } from '../store'
import { Avatar, Icon, KindDot } from '../components/ui'
import { users } from '../data/seed'
import type { Save, Step, Trail } from '../types'
import type { Pt } from '../lib/geometry'
import { spring, useMotion } from '../lib/motion'

export function NearbyCard({ step, save, trail, pos, order = 0 }: { step: Step; save: Save; trail: Trail; pos: Pt; order?: number }) {
  const [hover, setHover] = useState(false)
  const mo = useMotion()
  const openDetail = useStore((s) => s.openDetail)
  const makeConnectionFrom = useStore((s) => s.makeConnectionFrom)
  const nThoughts = useStore((s) => Object.values(s.thoughts).filter((t) => t.stepId === step.id).length)
  const u = users[trail.ownerId]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: mo.nearbyDelay + order * mo.nearbyStagger, ease: 'easeOut' }}
      className="absolute"
      style={{ left: pos.x, top: pos.y, zIndex: hover ? 50 : 14 }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!hover ? (
        <button
          onClick={(e) => { e.stopPropagation(); openDetail(step.id) }}
          className="w-[170px] text-left bg-white/95 rounded-[12px] px-3 py-2.5 flex flex-col gap-1.5 shadow-card border-[1.4px]"
          style={{ borderColor: u.noteBg }}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-ink-2"><KindDot userId={trail.ownerId} /> {save.mediumLabel}</span>
          <span className="text-[12px] leading-[16px] text-ink line-clamp-2">“{save.thought}”</span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3"><Avatar userId={trail.ownerId} size={13} ring={false} /> {u.name}’s trail</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring(mo.cardDrop)}
          className={clsx('w-[240px] bg-white rounded-[14px] p-3 flex flex-col gap-2.5 shadow-card-lift border border-line -translate-x-8 -translate-y-3')}
          style={{ transformOrigin: 'top left' }}
        >
          <p className="text-[12px] leading-[16px] text-ink">“{save.thought}”</p>
          {save.thumb && (
            <div className="w-full h-[110px] rounded-[8px] overflow-hidden"><img src={save.thumb} alt="" className="w-full h-full object-cover" /></div>
          )}
          <div className="flex flex-col gap-1 text-[10px] text-ink-3">
            <span className="flex items-center gap-1.5"><KindDot userId={trail.ownerId} /> {save.mediumLabel}</span>
            <span className="flex items-center gap-1.5"><Avatar userId={trail.ownerId} size={12} ring={false} /> {u.name}’s trail</span>
            {nThoughts > 0 && <span className="flex items-center gap-1.5"><Icon name="lock" size={10} /> {nThoughts} thoughts here</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); makeConnectionFrom(step.id) }}
              className="flex items-center gap-1.5 bg-ink text-white rounded-full px-3 py-1.5 text-[11px] font-medium hover:bg-black whitespace-nowrap">
              <Icon name="connect" size={11} /> Make a connection
            </button>
            <button onClick={(e) => { e.stopPropagation(); openDetail(step.id) }} className="text-[11px] text-ink-2 px-2 hover:text-ink">Open</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
