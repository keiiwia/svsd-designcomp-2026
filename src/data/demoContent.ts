import type { Connection, Save, Step, Trail, User } from '../types'

/**
 * Demo trails from three more people, so suggestions and branches have something to draw on.
 * Text comes from the "Fake Content for Demo" page in Figma; media is free-to-use:
 *  - venue.jpg   Pexels 518389 (Wendy Wei)        robot.jpg  Pexels 8566441 (Kindel Media)
 *  - scrolling.mp4 Pexels 4232959 (Ricky Esquivel)
 *  - city.ogg    "Sunday in the city street noise2" (Wikimedia Commons, public domain)
 *  - shoepop.ogg "Loyalty Freak Music – Shoepop" (Wikimedia Commons, CC0)
 */
export const demoUsers: Record<string, User> = {
  maya:   { id: 'maya',   name: 'Maya Chen',     initial: 'M', color: '#6f9bd1', noteBg: '#e3edf9' },
  jordan: { id: 'jordan', name: 'Jordan Okafor', initial: 'J', color: '#c9a36b', noteBg: '#f7ecd6' },
  priya:  { id: 'priya',  name: 'Priya Raman',   initial: 'P', color: '#b07bb5', noteBg: '#f3e4f5' },
}

export const demoTrails: Record<string, Trail> = {
  't-maya': {
    id: 't-maya', title: 'Why does everything nostalgic feel better?', ownerId: 'maya',
    description: '“Everyone is buying old digital cameras to make new photos look old. I’m trying to work out what we actually miss.”',
    origin: { x: 0, y: 0 },
  },
  't-jordan': {
    id: 't-jordan', title: 'Who gets to decide what a city sounds like?', ownerId: 'jordan',
    description: '“I started recording ambient sounds for a beat, but the best parts were the sounds I usually tune out.”',
    origin: { x: 0, y: 0 },
  },
  't-priya': {
    id: 't-priya', title: 'Why do we make technology feel human?', ownerId: 'priya',
    description: '“A robot with two dots for eyes somehow feels more approachable than a realistic humanoid.”',
    origin: { x: 0, y: 0 },
  },
}

const W = 236

export const demoSaves: Save[] = [
  // ---- Maya Chen
  { id: 'm1', ownerId: 'maya', medium: 'text', mediumLabel: 'Text note', title: 'The digital camera revival', cardWidth: W, day: '',
    thought: 'Everyone is buying old digital cameras to make new photos look old. I think we miss the feeling of taking a picture without knowing if it was good, instead of checking it 15 times before posting.' },
  { id: 'm2', ownerId: 'maya', medium: 'link', mediumLabel: 'Link', title: 'Instagram as a personal portfolio', url: 'https://www.instagram.com/', cardWidth: W, day: '',
    thought: 'My profile feels like a portfolio of a person I’m trying to be. I archive pictures that don’t fit the aesthetic, even when those are the moments I remember most.' },
  { id: 'm3', ownerId: 'maya', medium: 'link', mediumLabel: 'Link', title: 'Memory is a remix', url: 'https://en.wikipedia.org/wiki/Memory_consolidation', cardWidth: W, day: '',
    thought: 'I read that remembering something isn’t exactly like opening a saved file. We reconstruct parts of it every time. Maybe that’s why childhood summers seem like one continuous perfect afternoon.' },
  { id: 'm4', ownerId: 'maya', medium: 'song', mediumLabel: 'Song', title: 'The burned CD era', thumb: '/img/audio-pill.png', imageHeight: 84, audio: '/audio/shoepop.ogg', duration: '2:19', cardWidth: W, day: '',
    thought: 'My older cousin made me a CD when I was 10. I still associate certain songs with the exact color of her bedroom. Spotify playlists are convenient, but they don’t feel like someone handing you a piece of themselves.' },
  { id: 'm5', ownerId: 'maya', medium: 'text', mediumLabel: 'Text note', title: 'The digital scrapbook', cardWidth: W, day: '',
    thought: 'I want a place to keep the things that mattered to me without having to turn them into a post. A screenshot of a conversation, a weird song, a blurry photo. Not everything needs to become content.' },
  { id: 'm6', ownerId: 'maya', medium: 'text', mediumLabel: 'Text note', title: 'An archive of unfinished thoughts', cardWidth: W, day: '',
    thought: 'What if a personal archive saved the thought that came with an image, not just the image? I could revisit the way I used to think, instead of only seeing the version of myself I decided to show everyone.' },

  // ---- Jordan Okafor
  { id: 'j1', ownerId: 'jordan', medium: 'sound', mediumLabel: 'Sound', title: 'Recording the city', thumb: '/img/audio-pill.png', imageHeight: 84, audio: '/audio/city.ogg', duration: '4:24', cardWidth: W, day: '',
    thought: 'I started recording ambient sounds for a beat, but the best parts were sounds I usually tune out. The city has its own rhythm. I wonder which sounds people think belong and which ones they consider noise.' },
  { id: 'j2', ownerId: 'jordan', medium: 'link', mediumLabel: 'Link', title: 'Who owns public space?', url: 'https://en.wikipedia.org/wiki/Public_space', cardWidth: W, day: '',
    thought: 'Some neighborhoods celebrate outdoor dining and live music while other places crack down on vendors and gathering. Public space isn’t really neutral if some people are more welcome in it than others.' },
  { id: 'j3', ownerId: 'jordan', medium: 'image', mediumLabel: 'Image', title: 'The disappearing music venue', thumb: '/img/venue.jpg', imageHeight: 150, cardWidth: W, day: '',
    thought: 'Tiny venues are where local scenes form before anyone knows they’re important. When one closes, you lose more than a business. You lose the place where people discover each other.' },
  { id: 'j4', ownerId: 'jordan', medium: 'link', mediumLabel: 'Link', title: 'Community archives and mixtapes', url: 'https://en.wikipedia.org/wiki/Mixtape', cardWidth: W, day: '',
    thought: 'I love that a homemade tape can tell you what a whole scene cared about. The song choices, the handwriting, the recording quality, even the mistakes reveal something an official archive might miss.' },
  { id: 'j5', ownerId: 'jordan', medium: 'text', mediumLabel: 'Text note', title: 'Ask the people who were there', cardWidth: W, day: '',
    thought: 'Maps show where things were, but people remember how it felt to be there. I’d rather hear three conflicting stories about a block than read one polished description of it.' },
  { id: 'j6', ownerId: 'jordan', medium: 'text', mediumLabel: 'Text note', title: 'A map you can listen to', cardWidth: W, day: '',
    thought: 'Imagine tapping a street corner and hearing a vendor describe their old stall, then listening to a musician remember their first gig nearby. A map could show not just where a city is, but how different people experienced it.' },

  // ---- Priya Raman
  { id: 'p1', ownerId: 'priya', medium: 'image', mediumLabel: 'Image', title: 'Why do we love little robot faces?', thumb: '/img/robot.jpg', imageHeight: 160, cardWidth: W, day: '',
    thought: 'A robot with two dots for eyes somehow feels more approachable than a realistic humanoid. Maybe we don’t need technology to look human. We just need enough cues to imagine a personality.' },
  { id: 'p2', ownerId: 'priya', medium: 'link', mediumLabel: 'Link', title: 'ELIZA and the illusion of understanding', url: 'https://en.wikipedia.org/wiki/ELIZA', cardWidth: W, day: '',
    thought: 'It’s wild that people felt understood by a relatively simple program that reflected their own words back at them. Sometimes the feeling of being heard matters more to us than the actual intelligence behind it.' },
  { id: 'p3', ownerId: 'priya', medium: 'video', mediumLabel: 'Video', title: 'Microinteractions are emotional', thumb: '/img/scrolling.jpg', video: '/video/scrolling.mp4', imageHeight: 132, duration: '0:08', cardWidth: W, day: '',
    thought: 'A tiny animation can make an interface feel considerate. But there’s a line between making something feel responsive and making it feel like it has emotions or intentions it doesn’t actually have.' },
  { id: 'p4', ownerId: 'priya', medium: 'link', mediumLabel: 'Link', title: 'AI companions and loneliness', url: 'https://en.wikipedia.org/wiki/Replika', cardWidth: W, day: '',
    thought: 'I don’t think it’s fair to dismiss people who find comfort in AI conversations. But if an app learns exactly what keeps someone coming back, how do we make sure it isn’t quietly optimizing for dependency?' },
]

// steps run left to right, with a little rise and fall so the lines are not dead straight
function row(trailId: string, ids: string[]): Step[] {
  return ids.map((saveId, i) => ({ id: `${trailId}-${i + 1}`, trailId, saveId, index: i + 1, pos: { x: 24 + i * 440, y: i % 2 === 0 ? 40 : 72 } }))
}

export const demoSteps: Step[] = [
  ...row('t-maya', ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']),
  ...row('t-jordan', ['j1', 'j2', 'j3', 'j4', 'j5', 'j6']),
  ...row('t-priya', ['p1', 'p2', 'p3', 'p4']),
]

function chain(trailId: string, authorId: string, becauses: string[]): Connection[] {
  return becauses.map((because, i) => ({ id: `${trailId}-c${i + 1}`, fromStepId: `${trailId}-${i + 1}`, toStepId: `${trailId}-${i + 2}`, because, attachments: [], authorId }))
}

export const demoConnections: Connection[] = [
  ...chain('t-maya', 'maya', [
    'Maybe it’s not the camera quality we miss. It’s the fact that old photos weren’t designed for an audience. That got me thinking about how we perform our lives online.',
    'What if curation isn’t just a social media thing? We edit our memories, too. I found the idea of nostalgia being a reconstruction, not a perfect replay, really interesting.',
    'This reminds me of how music can instantly bring back an entire era, including feelings you didn’t know you still had.',
    'A burned CD was a physical artifact of a relationship. That made me think about all the little digital things we make that disappear when an app shuts down.',
    'Maybe the real thing I’m trying to preserve isn’t the memory itself, but the context around it: what I thought, who I was with, and why it mattered.',
  ]),
  ...chain('t-jordan', 'jordan', [
    'The word “noise” is subjective. That sent me down a search about sound ordinances and who gets reported for making too much noise.',
    'If the rules change, the soundscape changes too. I started looking at neighborhoods that lost their local music venues as rents increased.',
    'It made me wonder how we document a scene before it disappears. A recording might preserve a sound, but can it preserve the social world around it?',
    'This made me think about oral histories. A place’s history isn’t only in buildings and records. It’s in how people describe being there.',
    'What if the archive wasn’t just something you visited later? What if you could explore a neighborhood through sounds and the memories attached to them?',
  ]),
  ...chain('t-priya', 'priya', [
    'This reminds me of the psychology concept that people attribute human qualities to things that respond to them, even when those things are pretty simple.',
    'If people can feel understood by something that doesn’t truly understand them, then the interface itself might be shaping their trust. I started thinking about tiny feedback animations.',
    'That line becomes more important when the product isn’t a tool but something people talk to every day. I went looking at stories about AI companions.',
  ]),
]
