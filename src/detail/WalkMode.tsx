import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { Avatar, Icon } from '../components/ui'
import { users, KEIIWIA_BECAUSE, OWN_TRAIL } from '../data/seed'

/**
 * Walk mode: you read a trail one "because" at a time. Words come first; the
 * reference only appears when you turn the page.
 */
export function WalkMode() {
  const walk = useStore((s) => s.ui.walk)
  return <AnimatePresence>{walk && <Walk key={walk.trailId} />}</AnimatePresence>
}

function Walk() {
  const walk = useStore((s) => s.ui.walk)!
  const trail = useStore((s) => s.trails[walk.trailId])
  const allSteps = useStore((s) => s.steps)
  const saves = useStore((s) => s.saves)
  const connections = useStore((s) => s.connections)
  const next = useStore((s) => s.walkNext)
  const prev = useStore((s) => s.walkPrev)
  const end = useStore((s) => s.endWalk)
  const branchFromStep = useStore((s) => s.branchFromStep)
  const makeConnectionFrom = useStore((s) => s.makeConnectionFrom)
  const setBranchState = useStore((s) => s.setBranchState)

  const steps = useMemo(() => Object.values(allSteps).filter((st) => st.trailId === walk.trailId).sort((a, b) => a.index - b.index), [allSteps, walk.trailId])
  const owner = users[trail.ownerId]
  const own = trail.ownerId === 'you'
  const atEnd = walk.index > steps.length
  const step = atEnd ? steps[steps.length - 1] : steps[walk.index - 1]
  const save = step ? saves[step.saveId] : null
  const conn = step ? Object.values(connections).find((c) => c.toStepId === step.id) : undefined
  const because = step?.id === 'k2' ? KEIIWIA_BECAUSE : conn?.because
  const becauseAuthor = conn ? users[conn.authorId] : owner
  const whose = own ? 'Your trail' : `${owner.name}’s trail`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const leaveTo = (fn: () => void) => { end(); fn() }
  const pageKey = `${walk.index}-${walk.phase}-${atEnd}`

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ zIndex: 95, background: 'rgba(245,244,242,0.97)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-panel
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* header */}
      <div className="flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-3 text-[13px] text-ink-2">
          <Avatar userId={trail.ownerId} size={24} />
          <span className="font-medium text-ink">{whose}</span>
          <span className="text-ink-4">·</span>
          <span className="font-mono">{trail.title}</span>
          {trail.branchedFrom && <span className="text-ink-4">· branched from {users[trail.branchedFrom.ownerId].name}’s “{trail.branchedFrom.trailTitle}”</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {steps.map((st) => (
              <span key={st.id} className="h-1.5 rounded-full transition-all" style={{ width: st.index === walk.index ? 22 : 8, background: st.index <= walk.index ? owner.color : '#ddd9d2' }} />
            ))}
          </div>
          <span className="text-[12px] text-ink-3 font-mono">{atEnd ? 'end' : `${walk.index} / ${steps.length}`}</span>
          <button onClick={end} className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-2 hover:bg-white"><Icon name="close" size={13} /></button>
        </div>
      </div>

      {/* page */}
      <div className="flex-1 flex items-center justify-center px-10" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, x: 60, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -60, rotateY: 10 }}
            transition={{ duration: 0.42, ease: [0.3, 0.7, 0.2, 1] }}
            className="w-full max-w-[760px] flex flex-col items-start gap-7"
            style={{ transformOrigin: 'left center' }}
          >
            {atEnd ? (
              <>
                <p className="font-mono text-[12px] text-ink-3">end of the trail</p>
                <p className="font-serif italic font-semibold text-[40px] leading-[1.15] text-ink">
                  {own ? 'That’s as far as you’ve gone.' : `That’s as far as ${owner.name} has gone.`}
                </p>
                <p className="text-[16px] text-ink-2 max-w-[520px]">A trail ends where the next because hasn’t been written yet. Continue it with one of your saves, and the loop starts again.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => leaveTo(() => { if (!own) setBranchState(trail.id, 'expanded'); branchFromStep(step.id) })} className="flex items-center gap-2 bg-ink text-white rounded-full pl-[18px] pr-5 py-3 text-[14px] font-medium hover:bg-black">
                    <Icon name="branch" size={14} /> Branch from here
                  </button>
                  <button onClick={prev} className="text-[13px] text-ink-2 hover:text-ink px-2">← Back a step</button>
                  <button onClick={end} className="text-[13px] text-ink-2 hover:text-ink px-2">Back to the canvas</button>
                </div>
              </>
            ) : walk.phase === 'because' && step ? (
              <>
                <p className="flex items-center gap-2 font-mono text-[12px] text-blue"><Avatar userId={becauseAuthor.id} size={18} ring={false} /> {becauseAuthor.name === 'You' ? 'you wrote' : becauseAuthor.name} because</p>
                <p className="font-serif italic font-semibold text-[44px] leading-[1.15] text-ink max-w-[720px]">{because ?? save?.thought}</p>
                <div className="flex items-center gap-4 pt-2">
                  <button onClick={next} className="flex items-center gap-2 bg-ink text-white rounded-full pl-[18px] pr-5 py-3 text-[14px] font-medium hover:bg-black">
                    Turn the page <span className="text-white/70">→</span>
                  </button>
                  <span className="text-[12px] text-ink-4">or press →</span>
                </div>
              </>
            ) : step && save ? (
              <>
                <p className="font-mono text-[12px] text-ink-3">{walk.index === 1 ? (trail.branchedFrom ? `picked up from ${users[trail.branchedFrom.ownerId].name}’s step ${trail.branchedFrom.stepIndex}` : 'where it starts') : `step ${walk.index}`}</p>
                <div className="flex gap-8 items-start w-full">
                  {save.thumb ? (
                    <div className="rounded-[18px] overflow-hidden shadow-card-lift bg-white shrink-0" style={{ width: 440 }}>
                      <img src={save.thumb} alt="" className="w-full object-cover" style={{ maxHeight: 420 }} />
                    </div>
                  ) : (
                    <div className="rounded-[18px] bg-white border border-line shadow-card px-8 py-10 shrink-0 flex items-center" style={{ width: 440, minHeight: 240 }}>
                      <p className="font-serif italic text-[28px] leading-[1.25] text-ink-2">“{save.thought}”</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 pt-2 min-w-[260px]">
                    <p className="text-[22px] font-semibold text-ink leading-tight">{save.title}</p>
                    <p className="text-[15px] text-ink-2 leading-[22px]">“{save.thought}”</p>
                    <p className="text-[12px] text-ink-3">{save.mediumLabel} · {whose}</p>
                    <div className="flex flex-col items-start gap-2 pt-3">
                      <button onClick={next} className="flex items-center gap-2 bg-ink text-white rounded-full pl-[18px] pr-5 py-3 text-[14px] font-medium hover:bg-black">
                        {walk.index < steps.length ? 'Next because' : 'To the end'} <span className="text-white/70">→</span>
                      </button>
                      <div className="flex items-center gap-1 pt-1">
                        {!own && (
                          <button onClick={() => leaveTo(() => makeConnectionFrom(step.id))} className="flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink px-2 py-1 whitespace-nowrap"><Icon name="connect" size={11} /> Make a connection</button>
                        )}
                        <button onClick={() => leaveTo(() => { if (!own) setBranchState(trail.id, 'expanded'); branchFromStep(step.id) })} className="flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink px-2 py-1 whitespace-nowrap"><Icon name="branch" size={11} /> Branch from here</button>
                        {walk.index > 1 && <button onClick={prev} className="text-[12px] text-ink-2 hover:text-ink px-2 py-1 whitespace-nowrap">← Back</button>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="px-10 pb-7 text-[11px] text-ink-4 font-mono">{own ? '' : `You can’t copy ${owner.name}’s trail. You can continue it.`}{trail.id === OWN_TRAIL ? 'Reading your own trail back is how you find the next step.' : ''}</p>
    </motion.div>
  )
}
