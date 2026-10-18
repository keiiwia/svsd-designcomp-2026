export type Medium =
  | 'image' | 'video' | 'text' | 'object' | 'song' | 'writing'
  | 'photo' | 'film' | 'poster' | 'textile' | 'sound' | 'link'

export interface User {
  id: string
  name: string
  initial: string
  color: string
  noteBg: string
}

export interface Save {
  id: string
  ownerId: string
  url?: string
  medium: Medium
  mediumLabel: string
  title: string
  thought: string
  thumb?: string
  video?: string
  imageHeight?: number
  cardWidth?: number
  duration?: string
  day: string
}

export interface Trail {
  id: string
  title: string
  ownerId: string
  description?: string
  branchedFrom?: { trailTitle: string; ownerId: string; stepIndex: number }
  origin: { x: number; y: number }
}

export interface Step {
  id: string
  trailId: string
  saveId: string
  index: number
  pos: { x: number; y: number }
}

export interface Anchor { x: number; y: number }

export interface Connection {
  id: string
  fromStepId: string
  toStepId: string
  anchor?: Anchor
  t?: number
  because: string
  attachments: string[]
  authorId: string
}

export type Stance = 'built on it' | 'disagrees' | 'wonders' | 'agrees' | 'linked your skirt'

export interface Thought {
  id: string
  stepId: string
  authorId: string
  text: string
  stance?: Stance
  t?: number
  parentId?: string
  onCanvas?: { x: number; y: number }
  stackId?: string
  /** members of a popped-open stack remember it so they can be stacked again */
  fanOf?: string
  /** dragged onto the canvas by you from a conversation */
  pulled?: boolean
}

export interface TrailNote {
  title: string
  body: string
  items: { id: string; text: string; done: boolean }[]
}

export type Tool = 'select' | 'hand' | 'thought' | 'walk'
export type BranchState = 'hidden' | 'ghost' | 'collapsed' | 'expanded'
export type SidebarMode =
  | { kind: 'saves' }
  | { kind: 'connection'; connectionId: string }
  | { kind: 'branch'; trailId: string }
  | { kind: 'branchFrom'; stepId: string }
  | { kind: 'none' }

export interface BecauseDraft {
  /** a step id, or a thought id when you draw from a thought bubble */
  fromStepId: string
  toStepId: string
  anchor?: Anchor
  t?: number
  text: string
  attachments: string[]
}

export interface Size { w: number; h: number }
