import type { Connection, Save, Step, Thought, Trail, TrailNote, User } from '../types'

export const users: Record<string, User> = {
  you:     { id: 'you',     name: 'You',     initial: 'Y', color: '#c47a52', noteBg: '#ffe7d6' },
  keiiwia: { id: 'keiiwia', name: 'keiiwia', initial: 'K', color: '#8f9bd6', noteBg: '#e8ebf8' },
  mira:    { id: 'mira',    name: 'mira',    initial: 'M', color: '#c98a80', noteBg: '#fbe3ea' },
  lena:    { id: 'lena',    name: 'lena',    initial: 'L', color: '#c2a24a', noteBg: '#fbf1d2' },
  jun:     { id: 'jun',     name: 'jun',     initial: 'J', color: '#9c86c2', noteBg: '#ece7fa' },
  kellysu: { id: 'kellysu', name: 'kellysu', initial: 'K', color: '#7fa89a', noteBg: '#e4f3da' },
  theo:    { id: 'theo',    name: 'theo',    initial: 'T', color: '#9c86c2', noteBg: '#ece7fa' },
}

export const YOU = 'you'
export const DISPLAY_NAME = 'Adam'

// Your phone saves, in sidebar order
export const yourSaves: Save[] = [
  { id: 's-vase', ownerId: YOU, medium: 'image', mediumLabel: 'Image', title: 'Painted vase',
    thought: 'you only see the people as it turns', thumb: '/img/vase.png', imageHeight: 156, day: 'Tuesday' },
  { id: 's-skirt', ownerId: YOU, medium: 'video', mediumLabel: 'Video', title: 'Embroidered skirt',
    thought: 'love how the red moves', thumb: '/img/skirt.png', imageHeight: 220, day: 'Wednesday' },
  { id: 's-folded', ownerId: YOU, medium: 'object', mediumLabel: 'Image', title: 'Folded object',
    thought: 'is this paper or metal??', thumb: '/img/folded.png', imageHeight: 150, day: 'Thursday' },
  { id: 's-note', ownerId: YOU, medium: 'text', mediumLabel: 'Text note', title: 'A note you wrote',
    thought: 'same field from the train, looked different every time', day: 'Friday' },
]

// keiiwia's trail "People leaving"
export const keiiwiaSaves: Save[] = [
  { id: 'k-poster', ownerId: 'keiiwia', medium: 'poster', mediumLabel: 'Poster', title: 'Coastline poster',
    thought: 'just horizon, nobody in it', cardWidth: 120, day: '' },
  { id: 'k-dunes', ownerId: 'keiiwia', medium: 'film', mediumLabel: 'Film still', title: 'Film still, dunes',
    thought: 'she just walks off and the camera stays put', thumb: '/img/dunes.png', video: '/video/dunes.mp4',
    imageHeight: 140, cardWidth: 230, duration: '2:10', day: '' },
  { id: 'k-log', ownerId: 'keiiwia', medium: 'writing', mediumLabel: 'Writing', title: 'A lighthouse keeper’s log',
    thought: 'same weather every day, never written the same', cardWidth: 150, day: '' },
  { id: 'k-fog', ownerId: 'keiiwia', medium: 'sound', mediumLabel: 'Sound', title: 'Fog signal',
    thought: 'what you hear when you can’t see anything', cardWidth: 124, day: '' },
]

// Nearby references from other people (one-step trails so the detail view works)
export const nearbySaves: Save[] = [
  { id: 'n-song', ownerId: 'kellysu', medium: 'song', mediumLabel: 'Song', title: 'Ceilings',
    thought: 'this song makes my room feel like somewhere else', thumb: '/img/audio-pill.png', imageHeight: 70, day: '' },
  { id: 'n-textile', ownerId: 'mira', medium: 'textile', mediumLabel: 'Textile', title: 'Worn hem',
    thought: 'you can see where the hem wore down from walking', day: '' },
  { id: 'n-object', ownerId: 'jun', medium: 'object', mediumLabel: 'Object', title: 'Folding stool',
    thought: 'folds down small enough to take anywhere', day: '' },
  { id: 'n-writing', ownerId: 'theo', medium: 'writing', mediumLabel: 'Writing', title: 'A list',
    thought: 'a list of colours my grandmother wouldn’t wear', day: '' },
  { id: 'n-photo', ownerId: 'lena', medium: 'photo', mediumLabel: 'Photograph', title: 'Red coat',
    thought: 'red coat, grey hills. the only colour in the shot', day: '' },
]

export const allSaves: Record<string, Save> = Object.fromEntries(
  [...yourSaves, ...keiiwiaSaves, ...nearbySaves].map((s) => [s.id, s]),
)

export const OWN_TRAIL = 't-you'
export const KEIIWIA_TRAIL = 't-keiiwia'

export const trails: Record<string, Trail> = {
  [OWN_TRAIL]: { id: OWN_TRAIL, title: 'Untitled trail', ownerId: YOU, origin: { x: 160, y: 300 } },
  [KEIIWIA_TRAIL]: {
    id: KEIIWIA_TRAIL, title: 'People leaving', ownerId: 'keiiwia',
    description: '“I keep saving pictures of people leaving. This is where I’m trying to work out why.”',
    branchedFrom: { trailTitle: 'Empty rooms', ownerId: 'jun', stepIndex: 3 },
    origin: { x: 160, y: 720 },
  },
  't-kellysu': { id: 't-kellysu', title: 'Songs for empty rooms', ownerId: 'kellysu', origin: { x: 0, y: 0 } },
  't-mira': { id: 't-mira', title: 'Clothes that carry stories', ownerId: 'mira', origin: { x: 0, y: 0 } },
  't-jun': { id: 't-jun', title: 'Empty rooms', ownerId: 'jun', origin: { x: 0, y: 0 } },
  't-theo': { id: 't-theo', title: 'Things she said', ownerId: 'theo', origin: { x: 0, y: 0 } },
  't-lena': { id: 't-lena', title: 'One colour', ownerId: 'lena', origin: { x: 0, y: 0 } },
}

// Positions are relative to the trail origin
export const keiiwiaSteps: Step[] = [
  { id: 'k1', trailId: KEIIWIA_TRAIL, saveId: 'k-poster', index: 1, pos: { x: 24, y: 120 } },
  { id: 'k2', trailId: KEIIWIA_TRAIL, saveId: 'k-dunes', index: 2, pos: { x: 230, y: 40 } },
  { id: 'k3', trailId: KEIIWIA_TRAIL, saveId: 'k-log', index: 3, pos: { x: 620, y: 112 } },
  { id: 'k4', trailId: KEIIWIA_TRAIL, saveId: 'k-fog', index: 4, pos: { x: 880, y: 118 } },
]

export const nearbySteps: Step[] = [
  { id: 'n1', trailId: 't-kellysu', saveId: 'n-song', index: 1, pos: { x: 0, y: 0 } },
  { id: 'n2', trailId: 't-mira', saveId: 'n-textile', index: 1, pos: { x: 0, y: 0 } },
  { id: 'n3', trailId: 't-jun', saveId: 'n-object', index: 1, pos: { x: 0, y: 0 } },
  { id: 'n4', trailId: 't-theo', saveId: 'n-writing', index: 1, pos: { x: 0, y: 0 } },
  { id: 'n5', trailId: 't-lena', saveId: 'n-photo', index: 1, pos: { x: 0, y: 0 } },
]

export const keiiwiaConnections: Connection[] = [
  { id: 'kc1', fromStepId: 'k1', toStepId: 'k2', because: 'finally someone in it', attachments: [], authorId: 'keiiwia' },
  { id: 'kc2', fromStepId: 'k2', toStepId: 'k3', because: 'people leaving again', attachments: [], authorId: 'keiiwia' },
  { id: 'kc3', fromStepId: 'k3', toStepId: 'k4', because: 'still nobody, just the sound', attachments: [], authorId: 'keiiwia' },
]

export const KEIIWIA_BECAUSE =
  'After a poster with nobody in it, finally a person — and she’s leaving. The camera just lets her go.'

export const keiiwiaThoughts: Thought[] = [
  { id: 'th1', stepId: 'k2', authorId: 'keiiwia', text: 'She never once looks back at the camera.', t: 12 },
  { id: 'th2', stepId: 'k2', authorId: 'mira', stance: 'disagrees', text: 'I don’t think it’s still though — the grass is moving the whole time.', t: 41,
    onCanvas: { x: 620, y: 230 } },
  { id: 'th3', stepId: 'k2', authorId: 'lena', parentId: 'th2', text: 'Maybe she’s the only thing moving on purpose.' },
  { id: 'th4', stepId: 'k2', authorId: 'jun', stance: 'wonders', text: 'Is the camera the still one? Nobody seems to be holding it.', t: 88 },
  { id: 'th5', stepId: 'k2', authorId: 'kellysu', text: 'jun’s right — I left it on a tripod and walked into the shot.', t: 88, parentId: 'th4' },
]

// What keiiwia says after you link to her still
export const KEIIWIA_REPLY = 'Never noticed the dress was the only thing moving. You’re right.'

export const whoBranched = [
  { trailTitle: 'Things with stories on them', ownerId: YOU, fromStep: 2, onCanvas: true },
  { trailTitle: 'Songs for empty rooms', ownerId: 'kellysu', fromStep: 3, onCanvas: false },
  { trailTitle: 'Clothes that carry stories', ownerId: 'mira', fromStep: 2, onCanvas: false },
]

// Nearby card placement, relative to your frame's right edge / top
export const nearbyLayout: Record<string, { dx: number; dy: number; anchor: 'right' | 'top' | 'bottom' }> = {
  k2: { dx: -150, dy: -126, anchor: 'top' },
  n1: { dx: 70, dy: -78, anchor: 'top' },
  n2: { dx: 48, dy: 70, anchor: 'right' },
  n3: { dx: 30, dy: 200, anchor: 'right' },
  n5: { dx: 60, dy: 330, anchor: 'right' },
  n4: { dx: 60, dy: 28, anchor: 'bottom' },
}

export const WELCOME = ['Welcome back, Adam.', 'Got a new idea to rabbit hole through?']

export const ownTrailNote: TrailNote = {
  title: 'Tiny people, big things',
  body: 'Every save so far has small bodies inside something bigger — the figures on the vase, the people stitched into the skirt.',
  items: [
    { id: 'i1', text: 'maybe it’s about scale?', done: false },
    { id: 'i2', text: 'the film still breaks it — one person, and she’s leaving', done: false },
    { id: 'i3', text: 'ask keiiwia where the film still is from', done: false },
    { id: 'i4', text: 'also find more embroidery history', done: false },
  ],
}
