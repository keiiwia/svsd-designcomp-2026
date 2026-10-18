import { useStore } from './store'
import { KEIIWIA_TRAIL, OWN_TRAIL } from './data/seed'
import { useCanvasApi } from './canvas/CanvasContext'

/**
 * Deterministic snapshots of the ten Figma states, rebuilt by replaying actions
 * on a fresh store. Press 1–9 and 0 to jump between them while recording.
 */
export function loadScene(n: number) {
  const st = useStore.getState()
  st.reset()
  const s = () => useStore.getState()
  const o = s().trails[OWN_TRAIL].origin
  const place = (saveId: string, x: number, y: number) => s().placeSave(saveId, { x: o.x + x, y: o.y + y })
  const link = (from: string, to: string, because: string, anchor?: { x: number; y: number }, attachments: string[] = []) => {
    s().startDraft(from, to, anchor)
    s().updateDraft(because)
    for (const a of attachments) s().toggleDraftAttachment(a)
    s().commitDraft()
  }

  if (n <= 1) { s().setCamera({ x: 0, y: 0, scale: 1 }); recenter(); return }

  // 02 place references
  const vase = place('s-vase', 24, 56)
  const skirt = place('s-skirt', 360, 44)
  s().selectStep(null)
  if (n === 2) { recenter(); return }

  // 03 connect + name
  link(vase, skirt, 'tiny scenes on both', { x: 0.5, y: 0.55 })
  s().renameTrail(OWN_TRAIL, 'Things with stories on them')
  if (n === 3 || n === 4) { recenter(); return }

  // 05 her clip opens, thoughts locked
  if (n === 5) { s().openDetail('k2'); recenter(); return }

  // 06 draw from your skirt to her still
  s().makeConnectionFrom('k2')
  if (n === 6) { recenter(); return }

  // 07 linked: her trail joins your canvas
  const folded = place('s-folded', 700, 56)
  link(skirt, folded, 'same kind of folds')
  s().addNote(OWN_TRAIL, { x: 40, y: 290 }, 'The people are tiny and the trees are huge.')
  s().addNote(OWN_TRAIL, { x: 716, y: 300 }, 'Looks soft, but it would cut you.')
  link(skirt, 'k2', 'the red is the only thing moving — everything around it is muted and still.', { x: 0.62, y: 0.42 })
  s().setBranchState(KEIIWIA_TRAIL, 'collapsed')
  if (n === 7) { fit(); return }

  // 08 thoughts are open now
  if (n === 8) { s().openDetail('k2'); fit(); return }

  // 09 her whole branch next to yours
  s().setBranchState(KEIIWIA_TRAIL, 'expanded')
  s().setSidebar({ kind: 'branch', trailId: KEIIWIA_TRAIL })
  if (n === 9) { fit(); return }

  // 10 branch from her step 3
  s().branchFromStep('k3')
  fit()
}

function fit() {
  // wait a frame so measured card sizes exist, then fit every frame into view
  requestAnimationFrame(() => requestAnimationFrame(() => { useCanvasApi.getState().api?.fitAll(); useStore.getState().setOverview(true) }))
}

function recenter() {
  const el = document.querySelector('[data-canvas]') as HTMLElement | null
  if (!el) return
  const r = el.getBoundingClientRect()
  useStore.getState().setCamera({ x: Math.round((r.width - 1440) / 2), y: Math.round((r.height - 1024) / 2), scale: 1 })
}
