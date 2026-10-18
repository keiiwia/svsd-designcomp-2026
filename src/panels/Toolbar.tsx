import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../store'
import { Icon, type IconName } from '../components/ui'
import type { Tool } from '../types'

/* ---------- tooltip ---------- */

function Tip({ label, shortcut, show }: { label: string; shortcut?: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }} transition={{ duration: 0.12 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] flex items-center gap-2 bg-ink text-white rounded-[6px] px-2 py-[5px] text-[12px] font-medium leading-4 whitespace-nowrap pointer-events-none"
        >
          {label}
          {shortcut && <span className="text-ink-4">{shortcut}</span>}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/* ---------- tool button ---------- */

function ToolButton({ icon, label, shortcut, active, open, hasMenu, onClick, children, quiet }: {
  icon: IconName; label: string; shortcut?: string; active?: boolean; open?: boolean; hasMenu?: boolean; onClick: () => void; children?: ReactNode; quiet?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <div className="relative" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <button
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={clsx(
          'flex items-center gap-0.5 p-[9px] rounded-[10px] transition-colors',
          active ? 'bg-ink text-white' : open ? 'bg-frame text-ink' : hover ? 'bg-paper text-ink' : 'text-ink',
        )}
      >
        <Icon name={icon} size={20} />
        {hasMenu && <Icon name="caret" size={12} className={active ? 'text-white/80' : 'text-ink-2'} />}
      </button>
      <Tip label={label} shortcut={shortcut} show={hover && !open && !quiet} />
      {children}
    </div>
  )
}

/* ---------- menu ---------- */

function Menu({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey) }
  }, [onClose])
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.14 }}
      className="absolute left-0 bottom-[calc(100%+10px)] bg-white border border-line rounded-[16px] p-1.5 flex flex-col gap-0.5"
      style={{ boxShadow: '0 10px 14px rgba(38,33,26,0.08), 0 1px 1px rgba(38,33,26,0.05)', zIndex: 90 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  )
}

function MenuItem({ icon, label, onClick, active }: { icon: IconName; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={clsx('flex items-center gap-2.5 h-9 px-2.5 rounded-[10px] w-[176px] text-[13px] font-medium text-ink text-left hover:bg-paper', active && 'bg-paper')}>
      <Icon name={icon} size={20} className="text-ink-2" /> {label}
    </button>
  )
}

/* ---------- layer toggle ---------- */

function LayerToggle({ icon, label, state, onClick }: { icon: IconName; label: string; state: 'on' | 'off' | 'locked'; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const tip = state === 'locked' ? `${label} · link two references first` : state === 'on' ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
  return (
    <div className="relative" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <button
        aria-label={label}
        aria-pressed={state === 'on'}
        onClick={onClick}
        className={clsx('relative w-[30px] h-[30px] rounded-[6px] flex items-center justify-center transition-colors',
          state === 'on' ? 'bg-white text-blue shadow-[0_1px_1px_rgba(38,33,26,0.08)]' : 'text-ink-4 hover:text-ink-3')}
      >
        <Icon name={icon} size={20} />
        {state === 'off' && <Icon name="slash" size={17} className="absolute left-[6px] top-[6px] text-ink-4" />}
        {state === 'locked' && (
          <span className="absolute left-[18px] top-[18px] w-[14px] h-[14px] rounded-full bg-white flex items-center justify-center">
            <Icon name="lockSmall" size={10} className="text-ink-3" />
          </span>
        )}
      </button>
      <Tip label={tip} show={hover} />
    </div>
  )
}

/* ---------- the toolbar ---------- */

export function Toolbar() {
  const tool = useStore((s) => s.ui.tool)
  const setTool = useStore((s) => s.setTool)
  const layers = useStore((s) => s.ui.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const nearbyVisible = useStore((s) => s.nearbyVisible)
  const selected = useStore((s) => s.ui.selectedStepId)
  const pinned = useStore((s) => (s.ui.selectedStepId ? !!s.pinned[s.ui.selectedStepId] : false))
  const togglePin = useStore((s) => s.togglePin)
  const addLink = useStore((s) => s.addLink)
  const placeNextSave = useStore((s) => s.placeNextSave)
  const [menu, setMenu] = useState<null | 'select' | 'add'>(null)
  const [linkMode, setLinkMode] = useState(false)
  const [url, setUrl] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  // the A key opens the Add menu
  useEffect(() => {
    const h = () => setMenu((m) => (m === 'add' ? null : 'add'))
    window.addEventListener('trails:toggle-add-menu', h)
    return () => window.removeEventListener('trails:toggle-add-menu', h)
  }, [])

  const say = (msg: string) => { setFlash(msg); window.setTimeout(() => setFlash(null), 1600) }
  const closeMenu = () => { setMenu(null); setLinkMode(false); setUrl('') }
  const pointerTool: Tool = tool === 'hand' ? 'hand' : 'select'

  return (
    <div data-panel className="absolute left-1/2 -translate-x-1/2 bottom-[40px]" style={{ zIndex: 96 }}>
      <div
        className="relative bg-white border border-line rounded-[18px] px-3 py-2.5 flex items-center gap-1.5"
        style={{ boxShadow: '0 10px 14px rgba(38,33,26,0.08), 0 1px 1px rgba(38,33,26,0.05)' }}
      >
        {/* Select ▾ */}
        <ToolButton icon={pointerTool === 'hand' ? 'move' : 'cursor'} label={pointerTool === 'hand' ? 'Hand' : 'Select'} shortcut={pointerTool === 'hand' ? 'H' : 'V'}
          active={tool === 'select' || tool === 'hand'} open={menu === 'select'} hasMenu
          onClick={() => { if (menu === 'select') closeMenu(); else { setTool(pointerTool); setMenu('select') } }}>
          <AnimatePresence>
            {menu === 'select' && (
              <Menu onClose={closeMenu}>
                <MenuItem icon="cursor" label="Select" active={tool === 'select'} onClick={() => { setTool('select'); closeMenu() }} />
                <MenuItem icon="move" label="Hand" active={tool === 'hand'} onClick={() => { setTool('hand'); closeMenu() }} />
              </Menu>
            )}
          </AnimatePresence>
        </ToolButton>

        {/* Thought */}
        <ToolButton icon="note" label="Thought" shortcut="T" active={tool === 'thought'} onClick={() => { setTool(tool === 'thought' ? 'select' : 'thought'); closeMenu() }} />

        {/* Add ▾ */}
        <ToolButton icon="add" label="Add" shortcut="A" open={menu === 'add'} hasMenu onClick={() => (menu === 'add' ? closeMenu() : setMenu('add'))}>
          <AnimatePresence>
            {menu === 'add' && (
              <Menu onClose={closeMenu}>
                {linkMode ? (
                  <form
                    className="flex items-center gap-2 h-9 px-2.5 w-[220px]"
                    onSubmit={(e) => { e.preventDefault(); if (url.trim()) { addLink(url.trim()); closeMenu() } }}
                  >
                    <Icon name="link" size={18} className="text-ink-2 shrink-0" />
                    <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a link…" className="flex-1 min-w-0 bg-transparent outline-none text-[13px]" />
                    <button type="submit" className="text-[12px] font-medium text-blue">Add</button>
                  </form>
                ) : (
                  <>
                    <MenuItem icon="link" label="Add link" onClick={() => setLinkMode(true)} />
                    <MenuItem icon="image" label="Add image" onClick={() => { const ok = placeNextSave(); closeMenu(); if (!ok) say('Nothing waiting on your phone') }} />
                    <MenuItem icon="noteMenu" label="Add note" onClick={() => { setTool('thought'); closeMenu() }} />
                  </>
                )}
              </Menu>
            )}
          </AnimatePresence>
        </ToolButton>

        {/* Pin */}
        <ToolButton icon="pin" label={pinned ? 'Unpin' : 'Pin'} shortcut="P" active={pinned} quiet={!!flash}
          onClick={() => { closeMenu(); if (selected) togglePin(selected); else say('Select a reference to pin') }} />

        <span className="w-px h-6 bg-line-strong mx-2" />

        {/* Layers */}
        <div className="flex items-center gap-1 bg-paper rounded-[10px] p-1">
          <LayerToggle icon="layerReference" label="Reference" state={layers.reference ? 'on' : 'off'} onClick={() => toggleLayer('reference')} />
          <LayerToggle icon="layerYours" label="Yours" state={layers.yours ? 'on' : 'off'} onClick={() => toggleLayer('yours')} />
          <LayerToggle icon="layerEveryone" label="Everyone" state={!nearbyVisible ? 'locked' : layers.everyone ? 'on' : 'off'}
            onClick={() => { if (nearbyVisible) toggleLayer('everyone') }} />
        </div>

        <AnimatePresence>
          {flash && (
            <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] bg-ink text-white rounded-[6px] px-2 py-[5px] text-[12px] font-medium whitespace-nowrap pointer-events-none">
              {flash}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
