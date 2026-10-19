import { useMemo } from 'react'
import { useStore, useSizes } from '../store'
import { frameRect, type Rect } from '../lib/geometry'
import { OWN_TRAIL } from '../data/seed'
import type { Step, Trail } from '../types'

/** Everything the canvas needs to lay out, derived once per render. */
export function useVisible() {
  const trails = useStore((s) => s.trails)
  const steps = useStore((s) => s.steps)
  const saves = useStore((s) => s.saves)
  const thoughts = useStore((s) => s.thoughts)
  const branchState = useStore((s) => s.branchState)
  const connections = useStore((s) => s.connections)
  const hint = useStore((s) => s.ui.connectHintStepId)
  const draft = useStore((s) => s.draft)
  const sizes = useSizes((s) => s.sizes)

  return useMemo(() => {
    const stepList = Object.values(steps)
    const connList = Object.values(connections)
    const noteList = Object.values(thoughts).filter((t) => t.onCanvas)

    const visibleSteps: Step[] = []
    const frames: { trail: Trail; rect: Rect; state: 'own' | 'ghost' | 'collapsed' | 'expanded'; steps: Step[] }[] = []

    for (const trail of Object.values(trails)) {
      const own = trail.ownerId === 'you'
      const tSteps = stepList.filter((s) => s.trailId === trail.id).sort((a, b) => a.index - b.index)
      const notesHere = noteList.filter((n) => {
        const st = steps[n.stepId]
        return st && st.trailId === trail.id && !n.pulled
      })
      if (own) {
        // branch trails of yours only appear once they have steps
        if (trail.id !== OWN_TRAIL && tSteps.length === 0) continue
        const rect = frameRect(trail, tSteps, saves, notesHere, sizes)
        frames.push({ trail, rect, state: 'own', steps: tSteps })
        visibleSteps.push(...tSteps)
        continue
      }
      const bs = branchState[trail.id] ?? 'hidden'
      if (bs === 'hidden') continue
      if (bs === 'expanded') {
        const rect = frameRect(trail, tSteps, saves, notesHere, sizes, 1280)
        frames.push({ trail, rect, state: 'expanded', steps: tSteps })
        visibleSteps.push(...tSteps)
      } else {
        // ghost / collapsed: only the step you are linking (or linked) to
        const linked = new Set<string>()
        for (const c of connList) {
          const a = steps[c.fromStepId], b = steps[c.toStepId]
          if (!a || !b) continue
          if (a.trailId === trail.id && b.trailId !== trail.id) linked.add(a.id)
          if (b.trailId === trail.id && a.trailId !== trail.id) linked.add(b.id)
        }
        if (hint && steps[hint]?.trailId === trail.id) linked.add(hint)
        if (draft) {
          for (const id of [draft.fromStepId, draft.toStepId]) if (steps[id]?.trailId === trail.id) linked.add(id)
        }
        const shown = tSteps.filter((s) => linked.has(s.id))
        if (shown.length === 0) continue
        const rect = frameRect(trail, shown, saves, [], sizes, 460)
        // the "draw from one of yours to here" hint hangs below the card while a link is waiting
        if (bs === 'ghost') rect.h += 40
        frames.push({ trail, rect, state: bs, steps: shown })
        visibleSteps.push(...shown)
      }
    }

    const visibleIds = new Set(visibleSteps.map((s) => s.id))
    const shownFrames = new Set(frames.filter((f) => f.state === 'own' || f.state === 'expanded').map((f) => f.trail.id))
    const visibleNotes = noteList.filter((n) => n.pulled || shownFrames.has(steps[n.stepId]?.trailId ?? ''))
    for (const n of visibleNotes) visibleIds.add(n.id)
    const visibleConnections = connList.filter((c) => visibleIds.has(c.fromStepId) && visibleIds.has(c.toStepId))
    const ownFrame = frames.find((f) => f.trail.id === OWN_TRAIL)!

    return { frames, visibleSteps, visibleConnections, ownFrame, notes: visibleNotes }
  }, [trails, steps, saves, thoughts, branchState, connections, hint, draft, sizes])
}
