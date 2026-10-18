import { useEffect, useLayoutEffect, useRef, type PointerEvent as RPE } from 'react'
import { motion } from 'motion/react'
import { useStore, useSizes } from '../store'
import { useDrag } from './drag'
import { Avatar } from '../components/ui'
import { users } from '../data/seed'
import type { Thought, Trail } from '../types'
import { spring, useMotion } from '../lib/motion'

export function NoteCard({ note, trail }: { note: Thought; trail: Trail }) {
  const ref = useRef<HTMLDivElement>(null)
  const ta = useRef<HTMLTextAreaElement>(null)
  const setSize = useSizes((s) => s.setSize)
  const setDrag = useDrag((s) => s.set)
  const tool = useStore((s) => s.ui.tool)
  const editing = useStore((s) => s.editingNoteId === note.id)
  const setEditingNote = useStore((s) => s.setEditingNote)
  const updateNote = useStore((s) => s.updateNote)
  const deleteNote = useStore((s) => s.deleteNote)
  const fanOutStack = useStore((s) => s.fanOutStack)
  const stackSize = useStore((s) => (note.stackId ? Object.values(s.thoughts).filter((t) => t.stackId === note.stackId).length : 0))
  const stackTop = useStore((s) => (note.stackId ? Object.values(s.thoughts).filter((t) => t.stackId === note.stackId).slice(-1)[0]?.id === note.id : false))
  const mo = useMotion()
  const u = users[note.authorId]
  const pos = { x: trail.origin.x + note.onCanvas!.x, y: trail.origin.y + note.onCanvas!.y }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setSize(note.id, { w: el.offsetWidth, h: el.offsetHeight })
  }, [note.id, note.text, editing, setSize])

  useEffect(() => {
    if (!editing) return
    const el = ta.current
    if (!el) return
    el.focus()
    el.style.height = '0px'
    el.style.height = Math.max(30, el.scrollHeight) + 'px'
  }, [editing, note.text])

  const finish = () => {
    if (!note.text.trim()) deleteNote(note.id)
    else setEditingNote(null)
  }

  const onPointerDown = (e: RPE) => {
    if (e.button !== 0 || tool === 'hand' || editing) return
    e.stopPropagation()
    const r = ref.current!.getBoundingClientRect()
    setDrag({ kind: 'note', noteId: note.id, offset: { x: e.clientX - r.left, y: e.clientY - r.top }, moved: false })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring(mo.cardDrop)}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); if (note.authorId === 'you') setEditingNote(note.id) }}
      className="absolute rounded-[10px] px-3.5 py-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
      style={{ left: pos.x, top: pos.y, width: 150, background: u.noteBg, zIndex: editing ? 35 : note.pulled ? 9 : 5, outline: editing ? '1.5px solid rgba(74,98,196,0.5)' : 'none', boxShadow: note.pulled ? '0 6px 16px rgba(31,26,20,0.08)' : undefined }}
    >
      {note.stackId && stackTop && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); fanOutStack(note.stackId!) }}
          className="absolute -top-3 -right-2 flex items-center gap-1 bg-ink text-white rounded-full pl-2 pr-2.5 py-1 text-[10px] font-medium shadow-card whitespace-nowrap"
          style={{ zIndex: 6 }}
        >
          {stackSize} thoughts · pop open
        </button>
      )}
      {note.stackId && !stackTop && <span className="absolute inset-0 rounded-[10px] bg-black/5" />}
      {!note.stackId && (
        <button
          data-port
          title="Pull a line to a reference"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); setDrag({ kind: 'connect', fromStepId: note.id, client: { x: e.clientX, y: e.clientY }, hoverStepId: null }) }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair opacity-0 hover:opacity-100 [div:hover>&]:opacity-100"
          style={{ zIndex: 7 }}
        >
          <span className="block w-[12px] h-[12px] rounded-full bg-white border-[1.5px] border-blue" />
        </button>
      )}
      {editing ? (
        <textarea
          ref={ta}
          value={note.text}
          placeholder="What did you just think?"
          onChange={(e) => updateNote(note.id, e.target.value)}
          onBlur={finish}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finish() }
            if (e.key === 'Escape') { e.preventDefault(); if (!note.text.trim()) deleteNote(note.id); else setEditingNote(null) }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full bg-transparent outline-none text-[11.5px] leading-[15px] text-ink placeholder:text-ink-3/70"
          rows={1}
        />
      ) : (
        <p className="text-[11.5px] leading-[15px] text-ink whitespace-pre-wrap">{note.text}</p>
      )}
      <p className="flex items-center gap-1.5 text-[10px] text-ink-3">
        <Avatar userId={note.authorId} size={12} ring={false} />
        <span className="text-ink-2">{u.name}</span>
        {note.stance && <span>{note.stance}</span>}
        {note.pulled && !note.stackId && <span className="ml-auto text-ink-4">from the clip</span>}
      </p>
    </motion.div>
  )
}
