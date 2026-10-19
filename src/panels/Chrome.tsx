import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { Icon } from '../components/ui'
import { OWN_TRAIL } from '../data/seed'

export function FilePanel() {
  const title = useStore((s) => s.trails[OWN_TRAIL].title)
  const renameTrail = useStore((s) => s.renameTrail)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) { setVal(title); setTimeout(() => inputRef.current?.select(), 0) } }, [editing, title])

  const commit = () => { renameTrail(OWN_TRAIL, val.trim() || 'Untitled trail'); setEditing(false) }

  return (
    <div data-panel className="absolute left-6 top-6 bg-white rounded-[14px] shadow-panel flex items-center gap-3 pl-3 pr-4 py-2.5" style={{ zIndex: 80 }}
      onPointerDown={(e) => e.stopPropagation()}>
      <span className="w-7 h-7 rounded-[8px] bg-ink text-white font-bold text-[14px] flex items-center justify-center">T</span>
      {editing ? (
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="text-[14px] font-semibold text-ink leading-[18px] bg-transparent outline-none min-w-[160px] w-[22ch]"
          placeholder="Name this trail"
        />
      ) : (
        <button onClick={() => setEditing(true)} title="Rename this trail" className="group flex items-center gap-2 text-left">
          <span className="text-[14px] font-semibold text-ink leading-[18px] whitespace-nowrap">{title}</span>
          <Icon name="noteEdit" size={12} className="text-ink-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  )
}

export function SearchBar() {
  return (
    <div data-panel className="absolute left-1/2 -translate-x-1/2 top-[26px] bg-white border border-line rounded-full flex items-center gap-2.5 pl-3.5 pr-4 py-2 shadow-[0px_1px_3px_0px_rgba(31,26,20,0.05)]" style={{ zIndex: 80 }}>
      <Icon name="search" size={15} className="text-ink-4" />
      <input placeholder="Looking for something specific?" className="bg-transparent outline-none text-[13px] w-[220px] text-ink placeholder:text-ink-4" />
    </div>
  )
}
