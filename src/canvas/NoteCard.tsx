import { useLayoutEffect, useRef, type PointerEvent as RPE } from 'react'
import { useStore, useSizes } from '../store'
import { useDrag } from './drag'
import { Avatar } from '../components/ui'
import { users } from '../data/seed'
import type { Thought, Trail } from '../types'

export function NoteCard({ note, trail }: { note: Thought; trail: Trail }) {
  const ref = useRef<HTMLDivElement>(null)
  const setSize = useSizes((s) => s.setSize)
  const setDrag = useDrag((s) => s.set)
  const tool = useStore((s) => s.ui.tool)
  const u = users[note.authorId]
  const pos = { x: trail.origin.x + note.onCanvas!.x, y: trail.origin.y + note.onCanvas!.y }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setSize(note.id, { w: el.offsetWidth, h: el.offsetHeight })
  }, [note.id, note.text, setSize])

  const onPointerDown = (e: RPE) => {
    if (e.button !== 0 || tool === 'move') return
    e.stopPropagation()
    const r = ref.current!.getBoundingClientRect()
    setDrag({ kind: 'note', noteId: note.id, offset: { x: e.clientX - r.left, y: e.clientY - r.top }, moved: false })
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className="absolute rounded-[10px] px-3.5 py-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
      style={{ left: pos.x, top: pos.y, width: 150, background: u.noteBg, zIndex: 5 }}
    >
      <p className="text-[11.5px] leading-[15px] text-ink">{note.text}</p>
      <p className="flex items-center gap-1.5 text-[10px] text-ink-3">
        <Avatar userId={note.authorId} size={12} ring={false} />
        <span className="text-ink-2">{u.name}</span>
        {note.stance && <span>{note.stance}</span>}
      </p>
    </div>
  )
}
