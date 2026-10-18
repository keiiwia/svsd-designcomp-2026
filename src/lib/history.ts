import { create } from 'zustand'
import { useStore, type TrailsState } from '../store'
import { useDrag } from '../canvas/drag'

/**
 * Undo / redo over the data slice of the store. UI state (tool, selection, camera)
 * is not part of history. A drag counts as one step, however many moves it produced.
 */
const KEYS = ['saves', 'placed', 'trails', 'steps', 'connections', 'thoughts', 'branchState', 'unlocked', 'nearbyVisible', 'pinned', 'trailNotes'] as const
type Key = (typeof KEYS)[number]
type Snapshot = Pick<TrailsState, Key>

const pick = (s: TrailsState): Snapshot => Object.fromEntries(KEYS.map((k) => [k, s[k]])) as Snapshot
const same = (a: Snapshot, b: Snapshot) => KEYS.every((k) => a[k] === b[k])

interface HistoryState { past: Snapshot[]; future: Snapshot[]; undo: () => void; redo: () => void }

let last: Snapshot = pick(useStore.getState())
let applying = false
let dragCaptured = false
const MAX = 60

export const useHistory = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    const cur = pick(useStore.getState())
    applying = true
    useStore.setState(prev)
    last = prev
    applying = false
    set({ past: past.slice(0, -1), future: [cur, ...future].slice(0, MAX) })
  },
  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return
    const next = future[0]
    const cur = pick(useStore.getState())
    applying = true
    useStore.setState(next)
    last = next
    applying = false
    set({ past: [...past, cur].slice(-MAX), future: future.slice(1) })
  },
}))

useStore.subscribe((state) => {
  if (applying) return
  const now = pick(state)
  if (same(now, last)) return
  const dragging = useDrag.getState().drag.kind !== 'none'
  if (!dragging || !dragCaptured) {
    useHistory.setState((h) => ({ past: [...h.past, last].slice(-MAX), future: [] }))
    if (dragging) dragCaptured = true
  }
  last = now
})

useDrag.subscribe((d) => { if (d.drag.kind === 'none') dragCaptured = false })

/** Scene loads and resets start a fresh history. */
export function clearHistory() {
  last = pick(useStore.getState())
  useHistory.setState({ past: [], future: [] })
}
