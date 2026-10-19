import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import { spring, useMotion } from '../lib/motion'

/** Edit the idea behind a reference, or write a brand-new one as the next step of a trail. */
type IdeaState = NonNullable<ReturnType<typeof useStore.getState>['ui']['idea']>

export function IdeaModal() {
  const idea = useStore((s) => s.ui.idea)
  return <AnimatePresence>{idea && <Idea key={idea.mode === 'edit' ? idea.saveId : `new-${idea.fromStepId}`} snapshot={idea} />}</AnimatePresence>
}

function Idea({ snapshot }: { snapshot: IdeaState }) {
  // while the modal fades out the store value is already null; keep the last state
  const idea = useStore((s) => s.ui.idea) ?? snapshot
  const saves = useStore((s) => s.saves)
  const steps = useStore((s) => s.steps)
  const updateSave = useStore((s) => s.updateSave)
  const addIdea = useStore((s) => s.addIdea)
  const connectSaveToStep = useStore((s) => s.connectSaveToStep)
  const openIdea = useStore((s) => s.openIdea)
  const mo = useMotion()
  const editing = idea.mode === 'edit' ? saves[idea.saveId] : null
  const fromSave = idea.mode === 'create' ? saves[steps[idea.fromStepId]?.saveId ?? ''] : null
  const [title, setTitle] = useState(editing?.title ?? '')
  const [thought, setThought] = useState(editing?.thought ?? '')
  const [url, setUrl] = useState(editing?.url ?? '')
  const close = () => openIdea(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const save = () => {
    if (idea.mode === 'edit') {
      updateSave(idea.saveId, { title: title.trim() || editing!.title, thought: thought.trim(), ...(editing?.url !== undefined ? { url: url.trim() } : {}) })
      close()
    } else {
      if (!thought.trim() && !title.trim()) return
      const id = addIdea(title.trim(), thought.trim())
      close()
      connectSaveToStep(id, idea.fromStepId)
    }
  }

  return (
    <motion.div className="absolute inset-0" style={{ zIndex: 92 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-panel onPointerDown={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={close} />
      <motion.div
        initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }}
        transition={spring(mo.modalOpen)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[calc(100%-80px)] bg-white rounded-[24px] shadow-modal flex overflow-hidden"
      >
        {editing?.thumb && (
          <div className="w-[240px] shrink-0 bg-paper">
            <img src={editing.thumb} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[13px] text-ink-2">
              <Avatar userId="you" size={20} />
              {idea.mode === 'edit' ? 'Your idea' : <>Next after <span className="text-ink font-medium">{fromSave?.title}</span></>}
            </p>
            <button onClick={close} className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-2 hover:bg-paper"><Icon name="close" size={12} /></button>
          </div>
          <input
            autoFocus={idea.mode === 'create'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a name"
            className="text-[20px] font-semibold text-ink bg-transparent outline-none placeholder:text-ink-4"
          />
          <textarea
            autoFocus={idea.mode === 'edit'}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder={idea.mode === 'edit' ? 'What did you think when you saved this?' : 'What is the idea? Write as much as you need.'}
            rows={6}
            className="font-serif italic text-[22px] leading-[1.35] text-ink bg-transparent outline-none placeholder:text-ink-4 placeholder:not-italic placeholder:font-sans placeholder:text-[15px]"
          />
          {editing?.url !== undefined && (
            <label className="flex items-center gap-2 border border-line rounded-[10px] px-3 py-2 text-[13px]">
              <Icon name="link" size={14} className="text-ink-3" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="flex-1 bg-transparent outline-none" />
            </label>
          )}
          {editing?.previous && editing.previous.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-line pt-3">
              <p className="text-[11px] text-ink-3">Previous thoughts</p>
              {editing.previous.map((pv, i) => (
                <p key={i} className="text-[13px] leading-[18px] text-ink-2 font-serif italic">“{pv.thought}”</p>
              ))}
            </div>
          )}
          <div className="flex items-center justify-end pt-2">
            <div className="flex items-center gap-2">
              <button onClick={close} className="text-[13px] text-ink-2 px-3 py-2 hover:text-ink">Cancel</button>
              <button onClick={save} className="bg-ink text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-black">
                {idea.mode === 'edit' ? 'Save' : 'Add as next step'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
