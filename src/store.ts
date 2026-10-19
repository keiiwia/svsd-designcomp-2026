import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Anchor, BecauseDraft, BranchState, Connection, Save, SidebarMode, Size, Stance, Step, Thought, Tool, Trail, TrailNote,
} from './types'
import { useCanvasApi } from './canvas/CanvasContext'
import {
  allSaves, keiiwiaConnections, keiiwiaSteps, keiiwiaThoughts, nearbySteps, trails as seedTrails,
  KEIIWIA_REPLY, KEIIWIA_TRAIL, OWN_TRAIL, YOU, ownTrailNote,
} from './data/seed'

export interface Camera { x: number; y: number; scale: number }

export interface Layers { reference: boolean; yours: boolean; everyone: boolean }

export interface WalkState { trailId: string; index: number; phase: 'because' | 'reference' }

export interface UIState {
  tool: Tool
  selectedStepId: string | null
  detailStepId: string | null
  sidebar: SidebarMode
  layers: Layers
  editingTitle: boolean
  connectHintStepId: string | null
  peekStepId: string | null
  walk: WalkState | null
  overview: boolean
  idea: { mode: 'edit'; saveId: string } | { mode: 'create'; fromStepId: string } | null
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
  pinned: Record<string, boolean>
  trailNotes: Record<string, TrailNote>
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
  addThought: (stepId: string, text: string, t?: number, stance?: Stance, parentId?: string) => void
  placeThought: (thoughtId: string, canvasPos: { x: number; y: number }) => void
  placeThread: (stepId: string, canvasPos: { x: number; y: number }) => void
  fanOutStack: (stackId: string) => void
  restack: (fanOf: string) => void
  moveNotes: (moves: { id: string; pos: { x: number; y: number } }[]) => void
  updateTrailNote: (trailId: string, patch: Partial<TrailNote>) => void
  toggleNoteItem: (trailId: string, itemId: string) => void
  addNoteItem: (trailId: string, text: string) => void
  addNote: (trailId: string, pos: { x: number; y: number }, text: string) => string
  updateNote: (id: string, text: string) => void
  deleteNote: (id: string) => void
  editingNoteId: string | null
  setEditingNote: (id: string | null) => void
  branchFromStep: (stepId: string) => void
  connectSaveToStep: (saveId: string, stepId: string) => void
  toggleLayer: (k: keyof Layers) => void
  togglePin: (stepId: string) => void
  removeStep: (stepId: string) => void
  updateSave: (id: string, patch: Partial<Pick<Save, 'title' | 'thought' | 'url'>>) => void
  openIdea: (idea: UIState['idea']) => void
  addIdea: (title: string, thought: string) => string
  updateConnection: (id: string, because: string) => void
  addLink: (url: string) => void
  placeNextSave: () => boolean
  startWalk: (trailId: string, index?: number) => void
  walkNext: () => void
  walkPrev: () => void
  endWalk: () => void
  setOverview: (v: boolean) => void
  reset: () => void
}

const initialUI: UIState = {
  tool: 'select',
  selectedStepId: null,
  detailStepId: null,
  sidebar: { kind: 'saves' },
  layers: { reference: true, yours: true, everyone: false },
  editingTitle: false,
  connectHintStepId: null,
  peekStepId: null,
  walk: null,
  overview: false,
  idea: null,
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
    pinned: {} as Record<string, boolean>,
    trailNotes: { [OWN_TRAIL]: JSON.parse(JSON.stringify(ownTrailNote)) } as Record<string, TrailNote>,
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
        // placing never steals the sidebar: the rest of your phone saves stay in reach
        set({
          steps: { ...s.steps, [id]: step },
          placed: [...s.placed, saveId],
          seq: s.seq + 1,
        })
        return id
      },

      moveStep: (stepId, pos) => set((s) => ({ steps: { ...s.steps, [stepId]: { ...s.steps[stepId], pos } } })),
      moveNote: (id, pos) => set((s) => ({ thoughts: { ...s.thoughts, [id]: { ...s.thoughts[id], onCanvas: pos } } })),
      selectStep: (stepId) =>
        set((s) => ({
          ui: {
            ...s.ui,
            selectedStepId: stepId,
            // picking a card by hand dismisses an action panel so the selection can show
            sidebar: stepId && (s.ui.sidebar.kind === 'connection' || s.ui.sidebar.kind === 'branchFrom') ? { kind: 'saves' } : s.ui.sidebar,
          },
        })),
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
        const fromThought = s.thoughts[d.fromStepId]
        const from = s.steps[d.fromStepId] ?? s.steps[fromThought?.stepId ?? '']
        const to = s.steps[d.toStepId]
        if (!from || !to) { set({ draft: null }); return }
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
        if (crossTrail) requestAnimationFrame(() => requestAnimationFrame(() => useCanvasApi.getState().api?.fitAll()))
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
        // bring her step and your trail into the same view
        requestAnimationFrame(() => requestAnimationFrame(() => useCanvasApi.getState().api?.fitAll()))
      },

      setBranchState: (trailId, st) => {
        set((s) => ({ branchState: { ...s.branchState, [trailId]: st } }))
        if (st === 'expanded') requestAnimationFrame(() => requestAnimationFrame(() => useCanvasApi.getState().api?.fitAll()))
      },
      setSidebar: (sidebar) => set((s) => ({ ui: { ...s.ui, sidebar } })),

      addThought: (stepId, text, t, stance, parentId) => {
        const s = get()
        const id = `th${s.seq}`
        set({ thoughts: { ...s.thoughts, [id]: { id, stepId, authorId: YOU, text, t, stance, parentId } }, seq: s.seq + 1 })
      },

      placeThought: (thoughtId, canvasPos) => {
        const s = get()
        const th = s.thoughts[thoughtId]
        const trail = s.trails[s.steps[th.stepId]?.trailId ?? OWN_TRAIL]
        set({ thoughts: { ...s.thoughts, [thoughtId]: { ...th, pulled: true, onCanvas: { x: canvasPos.x - trail.origin.x, y: canvasPos.y - trail.origin.y }, stackId: undefined } } })
      },

      placeThread: (stepId, canvasPos) => {
        const s = get()
        const trail = s.trails[s.steps[stepId]?.trailId ?? OWN_TRAIL]
        const roots = Object.values(s.thoughts).filter((t) => t.stepId === stepId && !t.parentId && t.stance !== 'linked your skirt')
        const stackId = `stack-${stepId}`
        const next = { ...s.thoughts }
        roots.forEach((t, i) => {
          next[t.id] = { ...t, pulled: true, stackId, onCanvas: { x: canvasPos.x - trail.origin.x + i * 5, y: canvasPos.y - trail.origin.y + i * 5 } }
        })
        set({ thoughts: next })
      },

      fanOutStack: (stackId) => {
        const s = get()
        const members = Object.values(s.thoughts).filter((t) => t.stackId === stackId && t.onCanvas)
        if (members.length === 0) return
        const cx = members[0].onCanvas!.x + 75, cy = members[0].onCanvas!.y + 36
        const next = { ...s.thoughts }
        const r = 150
        members.forEach((t, i) => {
          const a = -Math.PI / 2 + (i / members.length) * Math.PI * 2
          next[t.id] = { ...t, stackId: undefined, fanOf: stackId, onCanvas: { x: cx + Math.cos(a) * r - 75, y: cy + Math.sin(a) * r * 0.7 - 36 } }
        })
        set({ thoughts: next })
      },

      restack: (fanOf) => {
        const s = get()
        const members = Object.values(s.thoughts).filter((t) => t.fanOf === fanOf && t.onCanvas)
        if (members.length === 0) return
        const base = members[0].onCanvas!
        const next = { ...s.thoughts }
        members.forEach((t, i) => { next[t.id] = { ...t, fanOf: undefined, stackId: fanOf, onCanvas: { x: base.x + i * 5, y: base.y + i * 5 } } })
        set({ thoughts: next })
      },
      moveNotes: (moves) =>
        set((s) => {
          const next = { ...s.thoughts }
          for (const m of moves) if (next[m.id]) next[m.id] = { ...next[m.id], onCanvas: m.pos }
          return { thoughts: next }
        }),

      updateTrailNote: (trailId, patch) =>
        set((s) => ({ trailNotes: { ...s.trailNotes, [trailId]: { ...(s.trailNotes[trailId] ?? { title: '', body: '', items: [] }), ...patch } } })),
      toggleNoteItem: (trailId, itemId) =>
        set((s) => {
          const n = s.trailNotes[trailId]
          if (!n) return {}
          return { trailNotes: { ...s.trailNotes, [trailId]: { ...n, items: n.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) } } }
        }),
      addNoteItem: (trailId, text) =>
        set((s) => {
          const n = s.trailNotes[trailId] ?? { title: '', body: '', items: [] }
          return { trailNotes: { ...s.trailNotes, [trailId]: { ...n, items: [...n.items, { id: `i${s.seq}`, text, done: false }] } }, seq: s.seq + 1 }
        }),

      addNote: (trailId, pos, text) => {
        const s = get()
        const id = `note${s.seq}`
        // notes hang off the first step of the trail for data purposes
        const first = Object.values(s.steps).find((st) => st.trailId === trailId)
        set({
          thoughts: { ...s.thoughts, [id]: { id, stepId: first?.id ?? '', authorId: YOU, text, onCanvas: pos } },
          seq: s.seq + 1,
          editingNoteId: text ? null : id,
        })
        return id
      },
      updateNote: (id, text) => set((s) => ({ thoughts: { ...s.thoughts, [id]: { ...s.thoughts[id], text } } })),
      deleteNote: (id) =>
        set((s) => {
          const { [id]: _gone, ...rest } = s.thoughts
          return { thoughts: rest, editingNoteId: s.editingNoteId === id ? null : s.editingNoteId }
        }),
      editingNoteId: null,
      setEditingNote: (editingNoteId) => set({ editingNoteId }),

      branchFromStep: (stepId) => set((s) => ({ ui: { ...s.ui, sidebar: { kind: 'branchFrom', stepId }, selectedStepId: stepId } })),

      connectSaveToStep: (saveId, stepId) => {
        const s = get()
        const from = s.steps[stepId]
        const fromTrail = s.trails[from.trailId]
        // new branch trail of yours, placed under the step
        const trailId = `t-branch-${s.seq}`
        // land the new step clear of the source card, whatever its height
        const fromHeight = useSizes.getState().sizes[stepId]?.h ?? 230
        const newTrail: Trail = {
          id: trailId, title: 'Untitled trail', ownerId: YOU,
          origin: { x: fromTrail.origin.x + from.pos.x - 24, y: fromTrail.origin.y + from.pos.y + fromHeight + 70 },
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
        requestAnimationFrame(() => requestAnimationFrame(() => useCanvasApi.getState().api?.fitAll()))
      },

      toggleLayer: (k) => set((s) => ({ ui: { ...s.ui, layers: { ...s.ui.layers, [k]: !s.ui.layers[k] } } })),
      togglePin: (stepId) => set((s) => ({ pinned: { ...s.pinned, [stepId]: !s.pinned[stepId] } })),
      updateSave: (id, patch) =>
        set((s) => {
          const cur = s.saves[id]
          if (!cur) return {}
          const rewritten = patch.thought !== undefined && patch.thought.trim() !== cur.thought.trim() && cur.thought.trim() !== ''
          const previous = rewritten ? [{ thought: cur.thought, at: new Date().toISOString() }, ...(cur.previous ?? [])].slice(0, 20) : cur.previous
          return { saves: { ...s.saves, [id]: { ...cur, ...patch, previous } } }
        }),
      openIdea: (idea) => set((s) => ({ ui: { ...s.ui, idea } })),
      // a written idea becomes a text reference of yours, ready to place or branch with
      addIdea: (title, thought) => {
        const s = get()
        const id = `idea${s.seq}`
        const save: Save = { id, ownerId: YOU, medium: 'text', mediumLabel: 'Idea', title: title || 'An idea', thought, cardWidth: 170, day: 'Today' }
        set({ saves: { ...s.saves, [id]: save }, seq: s.seq + 1 })
        return id
      },
      // Let go of one of your own references: its connections and canvas notes go with it, the save returns to your phone
      removeStep: (stepId) =>
        set((s) => {
          const step = s.steps[stepId]
          if (!step || s.trails[step.trailId]?.ownerId !== YOU) return {}
          const { [stepId]: _gone, ...steps } = s.steps
          const connections = Object.fromEntries(Object.entries(s.connections).filter(([, c]) => c.fromStepId !== stepId && c.toStepId !== stepId))
          const thoughts = Object.fromEntries(Object.entries(s.thoughts).filter(([, t]) => t.stepId !== stepId))
          const { [stepId]: _p, ...pinned } = s.pinned
          return {
            steps, connections, thoughts, pinned,
            placed: s.placed.filter((id) => id !== step.saveId),
            ui: { ...s.ui, selectedStepId: s.ui.selectedStepId === stepId ? null : s.ui.selectedStepId },
          }
        }),
      updateConnection: (id, because) =>
        set((s) => (s.connections[id] ? { connections: { ...s.connections, [id]: { ...s.connections[id], because } } } : {})),

      // Add link: a pointer reference (a still, quote or timestamp plus a link out)
      addLink: (url) => {
        const s = get()
        let host = url
        try { host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '') } catch { /* keep raw */ }
        const id = `link${s.seq}`
        const save: Save = { id, ownerId: YOU, medium: 'link', mediumLabel: 'Link', title: host, thought: '', url, cardWidth: 160, day: 'Today' }
        set({ saves: { ...s.saves, [id]: save }, seq: s.seq + 1 })
        const own = Object.values(get().steps).filter((st) => st.trailId === OWN_TRAIL)
        const right = own.reduce((m, st) => Math.max(m, st.pos.x + 200), 24)
        const o = get().trails[OWN_TRAIL].origin
        get().placeSave(id, { x: o.x + right, y: o.y + 60 })
      },

      // Add image: the next save waiting on your phone lands on the canvas
      placeNextSave: () => {
        const s = get()
        const next = Object.values(s.saves).find((sv) => sv.ownerId === YOU && !s.placed.includes(sv.id) && sv.thumb)
        if (!next) return false
        const own = Object.values(s.steps).filter((st) => st.trailId === OWN_TRAIL)
        const right = own.reduce((m, st) => Math.max(m, st.pos.x + 210), 24)
        const o = s.trails[OWN_TRAIL].origin
        s.placeSave(next.id, { x: o.x + right, y: o.y + 56 })
        return true
      },
      startWalk: (trailId, index = 1) =>
        set((s) => ({ ui: { ...s.ui, walk: { trailId, index, phase: index <= 1 ? 'reference' : 'because' }, detailStepId: null, peekStepId: null, selectedStepId: null, tool: 'walk' } })),
      walkNext: () =>
        set((s) => {
          const w = s.ui.walk
          if (!w) return {}
          const count = Object.values(s.steps).filter((st) => st.trailId === w.trailId).length
          if (w.phase === 'because') return { ui: { ...s.ui, walk: { ...w, phase: 'reference' } } }
          if (w.index >= count) return { ui: { ...s.ui, walk: { ...w, index: count + 1, phase: 'reference' } } }
          return { ui: { ...s.ui, walk: { trailId: w.trailId, index: w.index + 1, phase: 'because' } } }
        }),
      walkPrev: () =>
        set((s) => {
          const w = s.ui.walk
          if (!w) return {}
          if (w.phase === 'reference' && w.index > 1) return { ui: { ...s.ui, walk: { ...w, phase: 'because', index: Math.min(w.index, Object.values(s.steps).filter((st) => st.trailId === w.trailId).length) } } }
          if (w.index > 1) return { ui: { ...s.ui, walk: { ...w, index: w.index - 1, phase: 'reference' } } }
          return {}
        }),
      endWalk: () => set((s) => ({ ui: { ...s.ui, walk: null, tool: 'select' } })),
      setOverview: (overview) => set((s) => ({ ui: { ...s.ui, overview } })),
      reset: () => set({ ...freshState() }),
    }),
    {
      name: 'trails-demo-v2',
      partialize: (s) => {
        const { draft: _d, camera: _c, editingNoteId: _e, ...rest } = s
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
