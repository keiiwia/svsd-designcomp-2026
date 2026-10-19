import { AnimatePresence, motion } from 'motion/react'

const rows: [string, string][] = [
  ['V', 'Select and move'],
  ['H', 'Hand (pan)'],
  ['Space', 'Hold to pan'],
  ['T', 'Thought'],
  ['A', 'Add menu'],
  ['P', 'Pin the selected reference'],
  ['F', 'Zoom to fit / back'],
  ['\\', 'Hide or show the side panel'],
  ['⌘ Z', 'Undo'],
  ['⌘ ⇧ Z', 'Redo'],
  ['⌫', 'Remove the selected reference'],
  ['Esc', 'Close, cancel, deselect'],
  ['1 – 9, 0', 'Demo scenes'],
  ['⇧ R', 'Reset the demo'],
  ['?', 'This sheet'],
]

export function Shortcuts({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-panel
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.16 }}
          className="absolute left-6 bottom-[40px] bg-white border border-line rounded-[16px] p-4 w-[260px]"
          style={{ zIndex: 97, boxShadow: '0 10px 14px rgba(38,33,26,0.08), 0 1px 1px rgba(38,33,26,0.05)' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-ink">Shortcuts</span>
            <button onClick={onClose} className="text-[11px] text-ink-3 hover:text-ink">close</button>
          </div>
          <ul className="flex flex-col gap-1">
            {rows.map(([k, l]) => (
              <li key={k} className="flex items-center justify-between text-[12px]">
                <span className="text-ink-2">{l}</span>
                <kbd className="font-mono text-[11px] text-ink bg-paper border border-line rounded-[5px] px-1.5 py-0.5">{k}</kbd>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
