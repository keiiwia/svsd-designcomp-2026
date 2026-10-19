import type { Connection, Save, Step, Thought, Trail, User } from '../types'

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

// ---------------------------------------------------------------------------
// Discussion on the demo trails (and a little more on keiiwia's), so every step has people in it.
// Replies point at parentId; t is seconds into a clip for timed thoughts.
type T = { id: string; stepId: string; authorId: string; text: string; stance?: Thought['stance']; t?: number; parentId?: string }
const th = (id: string, stepId: string, authorId: string, text: string, extra: Partial<T> = {}): Thought => ({ id, stepId, authorId, text, ...extra })

export const demoThoughts: Thought[] = [
  // ---- Maya: nostalgia
  th('mth1', 't-maya-1', 'lena', 'I bought one of these last year. The thing I didn’t expect: I take fewer photos, and I look at them more.', { stance: 'built on it' }),
  th('mth2', 't-maya-1', 'jun', 'Is it the camera, or the fact that you can’t post from it without a few extra steps? The friction might be doing the work.', { stance: 'wonders' }),
  th('mth3', 't-maya-1', 'maya', 'That’s probably it. The three days between shooting and seeing them are the part I’d keep.', { parentId: 'mth2' }),
  th('mth4', 't-maya-2', 'kellysu', 'Same. My archive folder is more honest than my grid.', { stance: 'agrees' }),
  th('mth5', 't-maya-2', 'theo', 'I don’t think curating is the problem. A portfolio is a kind of honesty too: it’s choosing who you’re trying to become.', { stance: 'disagrees' }),
  th('mth6', 't-maya-2', 'maya', 'Fair. Maybe what bothers me is that the choosing happens so fast, before I know what I think.', { parentId: 'mth5' }),
  th('mth7', 't-maya-3', 'priya', 'If memory is reconstructed every time, does writing the thought down freeze it in a way that’s actually less true?', { stance: 'wonders' }),
  th('mth8', 't-maya-3', 'jordan', 'Or it gives you a second version to compare against. Two reconstructions are more honest than one.', { parentId: 'mth7' }),
  th('mth9', 't-maya-4', 'kellysu', 'The hiss at the start is the whole point. Someone pressed record on this.', { t: 18 }),
  th('mth10', 't-maya-4', 'mira', 'The handwriting on the disc did more work than the tracklist. You knew who it was from before you heard a note.', { stance: 'built on it', t: 64 }),
  th('mth11', 't-maya-4', 'jordan', 'Playlists are shared with everyone at once. A CD was for one person. I think that’s the difference you’re circling.', { stance: 'wonders', t: 102 }),
  th('mth12', 't-maya-5', 'lena', 'A screenshot of a conversation is the most honest artifact I own, and it lives in a folder called “misc”.', { stance: 'agrees' }),
  th('mth13', 't-maya-5', 'theo', 'Does it stop being a scrapbook the moment someone else can see it?', { stance: 'wonders' }),
  th('mth14', 't-maya-5', 'maya', 'I think it stays one as long as nothing in it was made to be seen.', { parentId: 'mth13' }),
  th('mth15', 't-maya-6', 'keiiwia', 'This is close to what I’m doing with the leaving pictures. The pictures weren’t the point. The sentence under each one was.', { stance: 'built on it' }),
  th('mth16', 't-maya-6', 'priya', 'The unfinished part matters. A finished thought is a post. An unfinished one is still yours.', { stance: 'agrees' }),

  // ---- Jordan: the sound of a city
  th('jth1', 't-jordan-1', 'kellysu', 'The pigeons. I’d never have kept the pigeons, and now they’re my favourite part.', { t: 22 }),
  th('jth2', 't-jordan-1', 'mira', 'Who decided the traffic is background and the voices are foreground? You’re already mixing when you listen.', { stance: 'wonders', t: 95 }),
  th('jth3', 't-jordan-1', 'jordan', 'Exactly the question. I caught myself turning down the bus and had to ask why.', { parentId: 'jth2', t: 95 }),
  th('jth4', 't-jordan-2', 'theo', 'Not sure “neutral” was ever on the table. Every square was built for someone. The question is who it was built against.', { stance: 'disagrees' }),
  th('jth5', 't-jordan-2', 'jordan', 'Agreed, and that’s a sharper way to say it. “Built against” is going in my notes.', { parentId: 'jth4' }),
  th('jth6', 't-jordan-2', 'priya', 'Do the rules change the people, or do the people change and the rules catch up?', { stance: 'wonders' }),
  th('jth7', 't-jordan-3', 'maya', 'The venue I grew up with is a gym now. Nobody filmed the last show. That’s the part that gets me.', { stance: 'agrees' }),
  th('jth8', 't-jordan-3', 'lena', 'What’s left is usually a flyer someone kept. Paper outlives the room.', { stance: 'built on it' }),
  th('jth9', 't-jordan-3', 'kellysu', 'Half my friends met in a basement that fits forty people. You can’t start a scene in a stadium.'),
  th('jth10', 't-jordan-4', 'maya', 'This is the burned-CD thing from my trail, seen from the other side: the mistake on the tape is the proof a person made it.', { stance: 'built on it' }),
  th('jth11', 't-jordan-4', 'jun', 'Does an official archive have to lose that? Or does it just need to keep the handwriting?', { stance: 'wonders' }),
  th('jth12', 't-jordan-4', 'jordan', 'Keep the handwriting. Keep the bad recording. Index it, don’t clean it.', { parentId: 'jth11' }),
  th('jth13', 't-jordan-5', 'theo', 'Three conflicting stories is the accurate version. Agreement is usually just the loudest person.', { stance: 'agrees' }),
  th('jth14', 't-jordan-5', 'mira', 'How do you ask without steering? People tell you the story they think you want.', { stance: 'wonders' }),
  th('jth15', 't-jordan-6', 'priya', 'This is where the “what did you just think?” prompt belongs. Not after the fact. At the corner, while it’s still loud.', { stance: 'built on it' }),
  th('jth16', 't-jordan-6', 'keiiwia', 'Would the map change what you hear when you walk without it?', { stance: 'wonders' }),
  th('jth17', 't-jordan-6', 'jordan', 'Probably. I’d be fine with that. I already walk differently since I started recording.', { parentId: 'jth16' }),

  // ---- Priya: technology that feels human
  th('pth1', 't-priya-1', 'jun', 'Two dots and a tilt. Everything else is our imagination filling in.', { stance: 'agrees' }),
  th('pth2', 't-priya-1', 'mira', 'I don’t think it’s approachable, I think it’s safe. A face that simple can’t judge you back.', { stance: 'disagrees' }),
  th('pth3', 't-priya-1', 'priya', 'That’s a better word for it. Safe. The realistic ones feel like they’re watching.', { parentId: 'pth2' }),
  th('pth4', 't-priya-2', 'theo', 'Weizenbaum was alarmed by exactly this. He built it, then spent years warning people about it.'),
  th('pth5', 't-priya-2', 'maya', 'If being heard matters more than being understood, what does that say about how we listen to each other?', { stance: 'wonders' }),
  th('pth6', 't-priya-2', 'lena', 'That most of us are waiting to talk.', { parentId: 'pth5' }),
  th('pth7', 't-priya-3', 'kellysu', 'The little bounce when the feed catches. It’s apologising for making you wait.', { t: 2 }),
  th('pth8', 't-priya-3', 'jun', 'At what point does “considerate” become a performance of care? The app doesn’t care. The animator did.', { stance: 'wonders', t: 5 }),
  th('pth9', 't-priya-3', 'priya', 'Maybe that’s the honest version: the animation is the designer’s care, delivered late.', { parentId: 'pth8', t: 5 }),
  th('pth10', 't-priya-4', 'jordan', 'Dismissing it is easy from outside loneliness. The design question is real, though.', { stance: 'agrees' }),
  th('pth11', 't-priya-4', 'mira', 'Could an app be built to make itself less needed over time? Has anyone tried?', { stance: 'wonders' }),
  th('pth12', 't-priya-4', 'priya', 'That’s the version I’d want to design. Success looks like someone closing it.', { parentId: 'pth11' }),

  // ---- more voices on keiiwia's "People leaving"
  th('kth1', 'k1', 'maya', 'Is the empty horizon the point, or is it what the person who left is looking at?', { stance: 'wonders' }),
  th('kth2', 'k1', 'lena', 'The emptiness only reads as leaving because of what comes next. On its own it’s just a beach.', { stance: 'agrees' }),
  th('kth3', 'k3', 'jordan', 'A log is the original field recording. Same weather, never written the same.', { stance: 'built on it' }),
  th('kth4', 'k3', 'theo', 'Is it leaving if you write it down every day and stay?', { stance: 'wonders' }),
  th('kth5', 'k4', 'priya', 'A sound designed for when seeing fails. That’s the whole trail in one object.'),
  th('kth6', 'k4', 'kellysu', 'I have a recording of one from the ferry. Want it for the trail?', { stance: 'built on it' }),

  // ---- the one-step trails nearby
  th('nth1', 'n1', 'maya', 'Found this through your trail. It does what the burned CD did: makes the room somewhere else.', { stance: 'agrees' }),
  th('nth2', 'n2', 'lena', 'The wear is the story. A new hem has nothing to say.', { stance: 'built on it' }),
  th('nth3', 'n4', 'mira', 'A list of what she wouldn’t wear tells you more than a photo of what she did.', { stance: 'agrees' }),
  th('nth4', 'n5', 'keiiwia', 'One colour and the rest grey. Same trick as the dunes.', { stance: 'built on it' }),
]
