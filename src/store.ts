import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Anchor, BecauseDraft, BranchState, Connection, Save, SidebarMode, Size, Step, Thought, Tool, Trail,
} from './types'
import {
  allSaves, keiiwiaConnections, keiiwiaSteps, keiiwiaThoughts, nearbySteps, trails as seedTrails,
  KEIIWIA_REPLY, KEIIWIA_TRAIL, OWN_TRAIL, YOU,
} from './data/seed'

export interface Camera { x: number; y: number; scale: number }

export interface Layers { reference: boolean; yours: boolean; everyone: boolean }

export interface UIState {
  tool: Tool
  selectedStepId: string | null
  detailStepId: string | null
  sidebar: SidebarMode
  layers: Layers
  editingTitle: boolean
  connectHintStepId: string | null
  peekStepId: string | null
}

export interface TrailsState {
  saves: Record<string, Save>
  placed: string[]
  trails: Record<string, Trail>
  steps: Record<string, Step>
  connections: Record<string, Connection>
  thoughts: Record<string, Thought>
  branchState: Record<string, BranchState>
  unlocked: Record<string, boolean>
  nearbyVisible: boolean
  ui: UIState
  draft: BecauseDraft | null
  camera: Camera
  seq: number

  // actions
  setTool: (t: Tool) => void
  setCamera: (c: Camera) => void
  placeSave: (saveId: string, canvasPos: { x: number; y: number }) => string
  moveStep: (stepId: string, pos: { x: number; y: number }) => void
  moveNote: (thoughtId: string, pos: { x: number; y: number }) => void
  selectStep: (stepId: string | null) => void
  renameTrail: (trailId: string, title: string) => void
  setEditingTitle: (v: boolean) => void
  startDraft: (fromStepId: string, toStepId: string, anchor?: Anchor, t?: number) => void
  updateDraft: (text: string) => void
  toggleDraftAttachment: (saveId: string) => void
  cancelDraft: () => void
  commitDraft: () => void
  openDetail: (stepId: string | null) => void
  setPeek: (stepId: string | null) => void
  makeConnectionFrom: (stepId: string) => void
  setBranchState: (trailId: string, s: BranchState) => void
  setSidebar: (m: SidebarMode) => void
  addThought: (stepId: string, text: string, t?: number) => void
  addNote: (trailId: string, pos: { x: number; y: number }, text: string) => void
  branchFromStep: (stepId: string) => void
  connectSaveToStep: (saveId: string, stepId: string) => void
  toggleLayer: (k: keyof Layers) => void
  reset: () => void
}

const initialUI: UIState = {
  tool: 'add',
  selectedStepId: null,
  detailStepId: null,
  sidebar: { kind: 'saves' },
  layers: { reference: true, yours: true, everyone: false },
  editingTitle: false,
  connectHintStepId: null,
  peekStepId: null,
}

export function freshState() {
  const steps: Record<string, Step> = {}
  for (const s of [...keiiwiaSteps, ...nearbySteps]) steps[s.id] = s
  const connections: Record<string, Connection> = {}
  for (const c of keiiwiaConnections) connections[c.id] = c
  const thoughts: Record<string, Thought> = {}
  for (const t of keiiwiaThoughts) thoughts[t.id] = t
  return {
    saves: { ...allSaves },
    placed: [] as string[],
    trails: JSON.parse(JSON.stringify(seedTrails)) as Record<string, Trail>,
    steps,
    connections,
    thoughts,
    branchState: { [KEIIWIA_TRAIL]: 'hidden' } as Record<string, BranchState>,
    unlocked: {} as Record<string, boolean>,
    nearbyVisible: false,
    ui: { ...initialUI },
    draft: null as BecauseDraft | null,
    camera: { x: 0, y: 0, scale: 1 },
    seq: 1,
  }
}

export const useStore = create<TrailsState>()(
  persist(
    (set, get) => ({
      ...freshState(),

      setTool: (tool) => set((s) => ({ ui: { ...s.ui, tool } })),
      setCamera: (camera) => set({ camera }),

      placeSave: (saveId, canvasPos) => {
        const s = get()
        const trail = s.trails[OWN_TRAIL]
        const id = `st${s.seq}`
        const own = Object.values(s.steps).filter((st) => st.trailId === OWN_TRAIL)
        const step: Step = {
          id, trailId: OWN_TRAIL, saveId, index: own.length + 1,
          pos: { x: canvasPos.x - trail.origin.x, y: canvasPos.y - trail.origin.y },
        }
        set({
          steps: { ...s.steps, [id]: step },
          placed: [...s.placed, saveId],
          seq: s.seq + 1,
          ui: { ...s.ui, selectedStepId: id },
        })
        return id
      },

      moveStep: (stepId, pos) => set((s) => ({ steps: { ...s.steps, [stepId]: { ...s.steps[stepId], pos } } })),
      moveNote: (id, pos) => set((s) => ({ thoughts: { ...s.thoughts, [id]: { ...s.thoughts[id], onCanvas: pos } } })),
      selectStep: (stepId) => set((s) => ({ ui: { ...s.ui, selectedStepId: stepId } })),
      renameTrail: (trailId, title) => set((s) => ({ trails: { ...s.trails, [trailId]: { ...s.trails[trailId], title } } })),
      setEditingTitle: (editingTitle) => set((s) => ({ ui: { ...s.ui, editingTitle } })),

      startDraft: (fromStepId, toStepId, anchor, t) =>
        set({ draft: { fromStepId, toStepId, anchor, t, text: '', attachments: [] } }),
      updateDraft: (text) => set((s) => (s.draft ? { draft: { ...s.draft, text } } : {})),
      toggleDraftAttachment: (saveId) =>
        set((s) => {
          if (!s.draft) return {}
          const has = s.draft.attachments.includes(saveId)
          return { draft: { ...s.draft, attachments: has ? s.draft.attachments.filter((a) => a !== saveId) : [...s.draft.attachments, saveId] } }
        }),
      cancelDraft: () => set({ draft: null }),

      commitDraft: () => {
        const s = get()
        const d = s.draft
        if (!d || !d.text.trim()) return
        const id = `c${s.seq}`
        const from = s.steps[d.fromStepId], to = s.steps[d.toStepId]
        const conn: Connection = {
          id, fromStepId: d.fromStepId, toStepId: d.toStepId, anchor: d.anchor, t: d.t,
          because: d.text.trim(), attachments: d.attachments, authorId: YOU,
        }
        const next: Partial<TrailsState> = {
          connections: { ...s.connections, [id]: conn },
          draft: null,
          seq: s.seq + 1,
          nearbyVisible: true,
        }
        const crossTrail = from.trailId !== to.trailId
        if (crossTrail) {
          const other = from.trailId === OWN_TRAIL ? to.trailId : from.trailId
          next.unlocked = { ...s.unlocked, [other]: true }
          next.branchState = { ...s.branchState, [other]: s.branchState[other] === 'expanded' ? 'expanded' : 'collapsed' }
          next.ui = { ...s.ui, sidebar: { kind: 'connection', connectionId: id }, connectHintStepId: null, selectedStepId: null, layers: { ...s.ui.layers, everyone: true } }
          // the author of the other trail responds
          const otherStep = from.trailId === OWN_TRAIL ? to : from
          if (otherStep.id === 'k2') {
            const you: Thought = { id: `th-you-${id}`, stepId: 'k2', authorId: YOU, stance: 'linked your skirt', text: conn.because, t: d.t ?? 41 }
            const reply: Thought = { id: `th-reply-${id}`, stepId: 'k2', authorId: 'keiiwia', stance: 'built on it', text: KEIIWIA_REPLY }
            next.thoughts = { ...s.thoughts, [you.id]: you, [reply.id]: reply }
          }
        } else {
          next.ui = { ...s.ui, selectedStepId: null, layers: { ...s.ui.layers, everyone: true } }
        }
        set(next)
      },

      openDetail: (stepId) => set((s) => ({ ui: { ...s.ui, detailStepId: stepId, peekStepId: null } })),
      setPeek: (stepId) => set((s) => ({ ui: { ...s.ui, peekStepId: stepId } })),

      makeConnectionFrom: (stepId) => {
        const s = get()
        const step = s.steps[stepId]
        const bs = s.branchState[step.trailId]
        set({
          branchState: { ...s.branchState, [step.trailId]: bs === 'hidden' || !bs ? 'ghost' : bs },
          ui: { ...s.ui, detailStepId: null, connectHintStepId: stepId, sidebar: { kind: 'saves' } },
        })
      },

      setBranchState: (trailId, st) => set((s) => ({ branchState: { ...s.branchState, [trailId]: st } })),
      setSidebar: (sidebar) => set((s) => ({ ui: { ...s.ui, sidebar } })),

      addThought: (stepId, text, t) => {
        const s = get()
        const id = `th${s.seq}`
        set({ thoughts: { ...s.thoughts, [id]: { id, stepId, authorId: YOU, text, t } }, seq: s.seq + 1 })
      },

      addNote: (trailId, pos, text) => {
        const s = get()
        const id = `note${s.seq}`
        // notes hang off the first step of the trail for data purposes
        const first = Object.values(s.steps).find((st) => st.trailId === trailId)
        set({ thoughts: { ...s.thoughts, [id]: { id, stepId: first?.id ?? '', authorId: YOU, text, onCanvas: pos } }, seq: s.seq + 1 })
      },

      branchFromStep: (stepId) => set((s) => ({ ui: { ...s.ui, sidebar: { kind: 'branchFrom', stepId }, selectedStepId: stepId } })),

      connectSaveToStep: (saveId, stepId) => {
        const s = get()
        const from = s.steps[stepId]
        const fromTrail = s.trails[from.trailId]
        // new branch trail of yours, placed under the step
        const trailId = `t-branch-${s.seq}`
        const newTrail: Trail = {
          id: trailId, title: 'Untitled trail', ownerId: YOU,
          origin: { x: fromTrail.origin.x + from.pos.x - 24, y: fromTrail.origin.y + from.pos.y + 150 },
          branchedFrom: { trailTitle: fromTrail.title, ownerId: fromTrail.ownerId, stepIndex: from.index },
        }
        const stepId2 = `st${s.seq}`
        const step: Step = { id: stepId2, trailId, saveId, index: 1, pos: { x: 24, y: 44 } }
        set({
          trails: { ...s.trails, [trailId]: newTrail },
          steps: { ...s.steps, [stepId2]: step },
          placed: [...s.placed, saveId],
          seq: s.seq + 1,
          draft: { fromStepId: stepId, toStepId: stepId2, text: '', attachments: [] },
          ui: { ...s.ui, sidebar: { kind: 'saves' } },
        })
      },

      toggleLayer: (k) => set((s) => ({ ui: { ...s.ui, layers: { ...s.ui.layers, [k]: !s.ui.layers[k] } } })),
      reset: () => set({ ...freshState() }),
    }),
    {
      name: 'trails-demo-v1',
      partialize: (s) => {
        const { draft: _d, camera: _c, ...rest } = s
        return rest as TrailsState
      },
    },
  ),
)

// Measured sizes of cards / notes, not persisted
interface SizesState { sizes: Record<string, Size>; setSize: (id: string, size: Size) => void }
export const useSizes = create<SizesState>((set) => ({
  sizes: {},
  setSize: (id, size) =>
    set((s) => {
      const cur = s.sizes[id]
      if (cur && Math.abs(cur.w - size.w) < 0.5 && Math.abs(cur.h - size.h) < 0.5) return s
      return { sizes: { ...s.sizes, [id]: size } }
    }),
}))

// Selectors
export const ownSteps = (s: TrailsState) => Object.values(s.steps).filter((st) => st.trailId === OWN_TRAIL)
export const stepsOf = (s: TrailsState, trailId: string) =>
  Object.values(s.steps).filter((st) => st.trailId === trailId).sort((a, b) => a.index - b.index)
export const thoughtsOf = (s: TrailsState, stepId: string) =>
  Object.values(s.thoughts).filter((t) => t.stepId === stepId)
