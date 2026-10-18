import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import type { Rect } from '../lib/geometry'
import type { Trail } from '../types'
import { users } from '../data/seed'

export function TrailFrame({ trail, rect, state, stepCount }: {
  trail: Trail; rect: Rect; state: 'own' | 'ghost' | 'collapsed' | 'expanded'; stepCount: number
}) {
  const editing = useStore((s) => s.ui.editingTitle && s.ui.selectedStepId === null && trail.ownerId === 'you')
  const setEditingTitle = useStore((s) => s.setEditingTitle)
  const renameTrail = useStore((s) => s.renameTrail)
  const setBranchState = useStore((s) => s.setBranchState)
  const setSidebar = useStore((s) => s.setSidebar)
  const tool = useStore((s) => s.ui.tool)
  const addNote = useStore((s) => s.addNote)
  const [val, setVal] = useState(trail.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const own = trail.ownerId === 'you'
  const owner = users[trail.ownerId]

  useEffect(() => { if (editing) { setVal(trail.title); setTimeout(() => inputRef.current?.select(), 0) } }, [editing, trail.title])

  const commit = () => { renameTrail(trail.id, val.trim() || 'Untitled trail'); setEditingTitle(false) }

  const dashed = state === 'ghost' || state === 'collapsed'

  const onFrameClick = (e: React.MouseEvent) => {
    if (tool !== 'thought' || !own) return
    e.stopPropagation()
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const scale = r.width / rect.w
    const x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale
    addNote(trail.id, { x: rect.x + x - trail.origin.x - 75, y: rect.y + y - trail.origin.y - 20 }, '')
    useStore.getState().setTool('select')
  }

  return (
    <motion.div
      initial={own ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'absolute rounded-[26px]',
        dashed ? 'border-[1.4px] border-dashed border-ink-4/70 bg-paper/40' : 'bg-frame',
        state === 'ghost' && 'opacity-80',
      )}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: 1 }}
      onClick={onFrameClick}
      data-frame={trail.id}
    >
      {/* label */}
      <div className="absolute left-[19px] top-[13px] flex items-center gap-2 font-mono text-[12px] text-ink-2 whitespace-nowrap" style={{ zIndex: 2 }}>
        <Avatar userId={trail.ownerId} size={15} />
        {editing ? (
          <input
            ref={inputRef}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditingTitle(false) }}
            onPointerDown={(e) => e.stopPropagation()}
            className="font-mono text-[12px] text-ink bg-white rounded-md px-1.5 py-0.5 outline outline-2 outline-you/70"
            style={{ width: Math.max(120, val.length * 7.5 + 20) }}
          />
        ) : (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (own) { useStore.getState().selectStep(null); setEditingTitle(true) } else if (state === 'expanded') setSidebar({ kind: 'branch', trailId: trail.id }) }}
            className={clsx('font-mono text-[12px] rounded px-1 -mx-1', own ? 'hover:bg-white/60 text-ink-2' : 'text-ink-2')}
            title={own ? 'Rename trail' : undefined}
          >
            {trail.title}
            {!own && <span className="text-ink-4"> · {owner.name}’s branch</span>}
          </button>
        )}
        {own && <Icon name="grip" size={13} className="text-ink-4" />}
      </div>

      {/* expanded controls */}
      {state === 'expanded' && (
        <div className="absolute right-4 top-3 flex gap-2" style={{ zIndex: 2 }}>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); useStore.getState().startWalk(trail.id, 1) }}
            className="flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-2 hover:bg-paper">
            <Icon name="walk" size={12} /> Walk {owner.name === 'keiiwia' ? 'her' : 'their'} trail
          </button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setBranchState(trail.id, 'collapsed'); setSidebar({ kind: 'saves' }) }}
            className="flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-2 hover:bg-paper">
            <span className="text-[13px] leading-none">⤡</span> Collapse
          </button>
        </div>
      )}

      {/* collapsed / ghost: step count + add button, right of the card */}
      {dashed && (
        <div className="absolute flex flex-col gap-2 items-start whitespace-nowrap" style={{ left: 290, top: 64, zIndex: 2, width: 'max-content' }}>
          <p className="font-mono text-[11px] text-ink-3">{stepCount} steps in {owner.name === 'keiiwia' ? 'her' : 'their'} trail</p>
          <button
            disabled={state === 'ghost'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setBranchState(trail.id, 'expanded'); setSidebar({ kind: 'branch', trailId: trail.id }) }}
            title={state === 'ghost' ? 'Link one of yours to her step first' : undefined}
            className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
              state === 'ghost'
                ? 'bg-paper text-ink-4 border border-line hover:bg-frame hover:text-ink-2 hover:border-ink-4/60 cursor-not-allowed'
                : 'bg-ink text-white hover:bg-black hover:shadow-card')}
          >
            <Icon name="plus" size={11} /> Add {owner.name}’s branch
          </button>
        </div>
      )}

      {/* empty state */}
      {own && stepCount === 0 && (
        <div className="absolute left-5 right-5 top-[44px] bottom-5 rounded-[12px] border-[1.4px] border-dashed border-ink-4/60 flex flex-col items-center justify-center gap-2 text-ink-4 px-4 text-center">
          <span className="text-[22px] font-light leading-none">+</span>
          <span className="text-[11px] leading-[15px]">Drag and drop references from your phone</span>
        </div>
      )}
    </motion.div>
  )
}
