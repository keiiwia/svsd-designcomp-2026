export type Medium =
  | 'image' | 'video' | 'text' | 'object' | 'song' | 'writing'
  | 'photo' | 'film' | 'poster' | 'textile' | 'sound'

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

export interface Thought {
  id: string
  stepId: string
  authorId: string
  text: string
  stance?: 'built on it' | 'disagrees' | 'wonders' | 'linked your skirt'
  t?: number
  parentId?: string
  onCanvas?: { x: number; y: number }
}

export type Tool = 'move' | 'thought' | 'add' | 'branch' | 'walk'
export type BranchState = 'hidden' | 'ghost' | 'collapsed' | 'expanded'
export type SidebarMode =
  | { kind: 'saves' }
  | { kind: 'connection'; connectionId: string }
  | { kind: 'branch'; trailId: string }
  | { kind: 'branchFrom'; stepId: string }
  | { kind: 'none' }

export interface BecauseDraft {
  fromStepId: string
  toStepId: string
  anchor?: Anchor
  t?: number
  text: string
  attachments: string[]
}

export interface Size { w: number; h: number }
