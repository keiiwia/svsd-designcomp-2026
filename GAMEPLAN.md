# Trails — build game plan (Sat Oct 18 → Mon Oct 20, midday)

Source of truth for the build is the Figma file, page **prototypes** (10 numbered flow sections). The handoff doc describes earlier phone-first wireframes; the Figma is now a **desktop canvas product** (Figma/Are.na-style board with trails as frames, references as cards, connections as edges that carry a "because"). This plan follows the Figma.

## 0. What we are building, in one line

A single-page web app, demo-grade, that walks the ten Figma states end to end on a 1440×1024 canvas, deployed on Vercel, with no accounts and no backend. Every "other person" (keiiwia, mira, lena, jun) is seeded data.

## 1. Decisions (made so we can start; shout if any are wrong)

| Decision | Choice | Why |
|---|---|---|
| Hosting | Vercel, static site (`vercel` CLI is already installed) | Zero ops, preview URLs per push, free |
| Stack | Vite + React 19 + TypeScript, Tailwind v4, a **custom pan/zoom canvas** (absolutely positioned cards + one SVG layer for edges), Zustand for state, Framer Motion for popovers/transitions | Changed from React Flow on Saturday: the anchored-to-a-spot edges, auto-sizing trail frames and collapsed stacks were easier to own than to bend React Flow into. ~10 cards on screen, so performance is a non-issue |
| Persistence | `localStorage` only, plus a **Reset demo** shortcut | Enough for a video; survives refresh during recording |
| Backend / accounts / real Instagram capture | Cut | "From your phone" sidebar is seeded saves |
| Video playback | One short `.mp4` in `public/` for the dunes clip (or a still with a fake scrubber if the file is a problem) | We can't host films; the design only needs one clip |
| Search bar ("Looking for something specific?") | Render it, non-functional | It's in every screen, but the concept says no search. Decide for the video whether to keep it |
| Mic button in the because card | Visual only | Voice input is a day of work on its own |
| Fonts | Pull the exact families from Figma on Saturday; fall back to Google equivalents (italic serif → Instrument Serif / Cormorant; UI → Inter; mono labels → JetBrains Mono) | Avoid licensing surprises |
| Name | "Trails" (the T mark in the header) | Doc also says "Because"; the gesture is the because, the product is Trails |

## 1b. Status (Saturday evening)

Built and checked in the browser at 1440×1024:

- All ten states render from the scene hotkeys (`1`–`9`, `0` = state 10, `Shift+R` resets).
- Live interactions verified: drag a save onto the canvas, pull a line from a card's port to a spot on another card, write a because and link, rename the trail, nearby references appear, hover card, detail view locked and unlocked, Make a connection → ghost frame → link → collapsed stack + thread sidebar, Add keiiwia's branch → expanded frame + branch sidebar, click her step → floating toolbar → Branch from here sidebar.
- Saturday-night polish done: inline thought notes (thought tool or the step toolbar, `T` key, Enter to finish, double-click a note to edit), mount/draw-in motion for cards, edges, chips, frames and nearby cards, a live playhead in the detail view (slow zoom on the still, clickable scrubber, thoughts surface as the playhead passes them), hover peek in the step strip, and the view fits itself after branching from a step.
- Should-haves done too: Reference / Yours / Everyone toggles filter cards, chips and notes; Zoom out animates to an overview of every trail and flips to Zoom in; hovering one of her steps on the canvas (or in the detail strip) peeks her because first; Walk mode (`Walk her trail`, `Walk from here`, the Walk tool, or Walk in a peek) reads a trail because-first with a page turn, arrow keys to move, Esc to leave, and ends on Branch from here.
- Nice-to-haves done: the right sidebar now follows what you select (reference, whose step, the conversation as coloured bubbles with I agree / I disagree / I wonder replies and a "Branch it" nudge on disagreements); with nothing selected it shows the trail overview (title, who's on it, a clickable minimap of every trail with the viewport, and an editable notes block with a checklist). Any bubble can be dragged onto the canvas, where it stays tethered to its clip and can be linked to a reference with a because; dragging the conversation header drops the whole thread as a stack that pops open.
- Sunday-night bug bash: the whole golden path was driven live (not via hotkeys) from Shift+R through branching from her step 3, and all ten scenes replay with zero console errors. Fixed on the way: placing a save no longer steals the sidebar, action panels (new link, branch from step) win over the selection panel, the view fits itself when you start or land a cross-trail link and when a branch expands, your own thoughts show up in the thread, the seeded notes stay hidden until the trail is named, and the canvas no longer pushes its top-left off smaller screens.
- Trackpad pinch now zooms the canvas, never the page (native non-passive wheel listener, Safari gesture events swallowed).
- Motion tuning with DialKit: every spring, easing and duration lives in `src/lib/motion.ts` (`defaultMotion`). In dev, press **Shift+D** (or open `/?tune=1`) for the DialKit panel; drag the dials while the canvas animates, then copy the numbers back into `defaultMotion`. DialKit is dev-only and tree-shaken out of the production build. The animation library is now `motion` (same API as framer-motion, imported from `motion/react`).
- Toolbar rebuilt to the Figma "Compact" style: Select ▾ (Select · Hand) · Thought · Add ▾ (Add link · Add image · Add note) · Pin | icon layer toggles (Reference · Yours · Everyone, with Everyone locked until your first link). Tooltips show shortcuts: V select, H hand, T thought, A add menu, P pin the selected card, F zoom to fit / back. Zoom out left the toolbar; it lives on F and on the map in the overview panel. Add link makes a pointer card from a URL, Add image drops the next phone save, Add note is the thought tool.
- Fixed a cascade bug while doing it: the stylesheet's button reset was unlayered and beat every Tailwind utility on buttons, so backgrounds and paddings on buttons had been partly ignored. It now sits in the base layer.
- Visual feedback with Agentation: in dev, the small button bottom-right opens its toolbar. Hover an element, click it, write the note, Add. Notes sync to a local server (`npx -y agentation-mcp server`, port 4747), which Claude reads either through its MCP tools (`claude mcp add agentation -- npx -y agentation-mcp server` is already registered for this project; takes effect in a new Claude session) or over HTTP in the current session. The Copy button also gives markdown you can paste into chat. Dev-only, not in the production build.
- Canvas layout round: the grip on a trail heading drags that trail on its own (other frames stay put, cross-trail lines follow), your cards show connection ports on all four sides, and everything has more air: wider frame padding, keiiwia's frame sits further below yours, her steps and because chips are spaced so labels never touch a card, and nearby references sit further out.
- Not yet done: the real `dunes.mp4` clip (drop it in `public/video/dunes.mp4` and the detail view picks it up automatically), Walk mode is just the detail view, the mic button and the search bar are visual only.

**To deploy:** the folder is a git repo now with one commit. Run these once (the remote add needs your approval):

```bash
git remote add origin https://github.com/keiiwia/svsd-designcomp-2026.git
```
```bash
git pull --rebase origin main && git push -u origin main
```
Then at vercel.com/new import `keiiwia/svsd-designcomp-2026` (framework auto-detects as Vite, no settings needed). Or `vercel login` then `vercel --prod` from this folder.

## 2. Scope tiers

**Golden path (must ship, in this order):** the exact sequence the video walks.

1. **01 Saves arrive**: canvas, welcome line, empty "Untitled trail" frame with +, "From your phone" sidebar (4 seeded saves), bottom toolbar with layer toggles.
2. **02 Place references**: drag a save from the sidebar into the trail frame → reference card (image / video / text / object variants, title + thought). Save leaves the sidebar.
3. **03 Draw connection + 03a Write because + 03b Name trail**: connection tool, drag from a card to a **spot** on another card, blue "Because" popover (text, + attachment, mic, "Link them"), edge with a small label chip, inline rename of the trail.
4. **04 Nearby references + 04a hover card**: after the first link, 6 to 8 small cards from other people's trails fade in around the frame; hover shows image, meta, "Make a connection".
5. **05 Detail locked**: click a nearby card → modal: media (video with timeline markers), title, "From keiiwia's trail · People leaving", step strip with "1 more", right panel with her because, "Make a connection", and a **locked, blurred "5 thoughts here"** block.
6. **06 Connect to hers + 06a/06b/06c**: draw from your skirt to her film still (anchor at 0:41), same because popover, attachment menu (Add a picture / Paste a link / From this trail / From your saves), attached vase chip inside the because.
7. **07 Branch collapsed**: her trail lands on your canvas as a collapsed stack ("4 steps in her trail", "Add keiiwia's branch"); right sidebar shows the Skirt → Film still connection with your because, "Add a thought…", and the thread (keiiwia built on it / mira disagrees / lena).
8. **08 Detail open + 08b Step peek**: the same modal, thoughts now unlocked: timestamped thoughts on the video, two-row step strip (your trail / keiiwia's trail, "started from jun's Empty rooms"), peek popover on a step.
9. **09 Branch expanded**: "Add keiiwia's branch" expands her four steps as a second frame under yours; "Walk her trail" / "Collapse"; sidebar with her description, "Branched from jun's Empty rooms at step 3", "Who branched off it".
10. **10 Branch from step**: click her step 3 → floating toolbar (Add a thought / Branch from here / Walk from here); dashed placeholder card; sidebar "Branch from keiiwia's step 3" with "From your saves" + Connect.

**Should (Sunday evening, if the golden path is green):** sticky thought notes on the canvas (the peach "You" notes and pink "mira disagrees" note), layer toggles actually filtering (Reference / Yours / Everyone), "Zoom out" overview, edge-draw animation, stack expand animation.

**Nice (Monday morning only if ahead):** trail-overview sidebar with minimap and notes (Sidebar explorations), thoughts-as-conversation sidebar, dragging a thought bubble onto the canvas (Thoughts onto the canvas), "Walk her trail" as a step-by-step reading mode (the page-turn from the concept doc).

**Cut for Monday:** accounts, real capture / share sheet, cross-device sync, search, voice, media diet, earned reveals beyond the one locked-thoughts block, mobile layout.

## 3. Architecture

```
src/
  app/            App shell, routes (/ canvas, /capture optional later)
  canvas/         ReactFlow setup, pan/zoom, tools (hand / note / add reference / connect / branch)
    nodes/        TrailFrame (group), ReferenceCard, ThoughtNote, BranchStack, NearbyCard, PlaceholderCard
    edges/        BecauseEdge (label chip, anchor-aware endpoint), CrossTrailEdge (blue curve)
  panels/         SavesSidebar, ConnectionSidebar (thread), BranchSidebar, BranchFromStepSidebar, Toolbar
  detail/         DetailModal (media, step strip, because panel, thoughts locked/open, step peek)
  because/        BecausePopover (text, attachments menu, chips, Link them)
  data/
    seed.ts       users, saves, trails, steps, connections, thoughts (all copy lifted from Figma)
    scenes.ts     snapshots of app state for Figma steps 01..10 (press 1..0 to jump)
  store/          Zustand store + localStorage persistence + reset
  styles/         tokens from Figma (colors, radii, shadows, fonts)
public/           images exported from the Figma "references" page, dunes clip
```

**Data model (keep it flat):**

- `User {id, name, initial, color}` — you (Adam), keiiwia, mira, lena, jun, kellysu
- `Save {id, medium: image|video|text|object|link, title, thought, thumb, src?, day}`
- `Trail {id, title, ownerId, description?, branchedFrom?: {trailId, stepIndex}, frame: {x,y,w,h}}`
- `Step {id, trailId, saveId, index, pos: {x,y}}`
- `Connection {id, fromStepId, toStepId, toAnchor?: {x,y} | {t: seconds}, because, attachments: SaveRef[], authorId}`
- `Thought {id, stepId, authorId, text, stance?: 'built on it'|'disagrees'|'wonders', t?: seconds, parentId?}`
- `UI {tool, selection, openDetailStepId, sidebar, layers: {reference, yours, everyone}, unlocked: Set<trailId>}`

**Key mechanics**

- Trail frames are React Flow **parent nodes**; cards use `extent: 'parent'`.
- Dragging from the sidebar uses HTML5 drag + `screenToFlowPosition` (documented React Flow pattern).
- Anchor-to-spot: on connection drop, store the pointer offset inside the target card (or a timestamp for video). The custom edge reads node positions via `useInternalNode` and draws to the stored anchor, ignoring handles.
- "Thoughts locked" is one boolean per foreign trail, flipped when you link to any of its steps.
- **Scenes:** every Figma step is a serialised store snapshot. Number keys load them. This is the recording safety net: no retyping the demo from scratch if a take goes wrong.

## 4. Schedule (Eastern)

### Saturday Oct 18, now → midnight (~8h)

| Block | Deliverable |
|---|---|
| 3:30–4:30 | `git init`, scaffold Vite + TS + Tailwind + React Flow, push to GitHub, first Vercel deploy. Export images + fonts + color tokens from Figma. Write `seed.ts` with all copy from the ten screens. |
| 4:30–7:30 | Canvas: dotted background, trail frame node, reference card node (4 media variants), saves sidebar with drag-in, toolbar shell, persistence. **States 01–02 done.** |
| 7:30–10:30 | Connection tool, because popover, edge + label chip, trail rename. **States 03–03b done.** Hero moment polished first, not last. |
| 10:30–11:30 | Deploy, screen-record a 30-second pass to check it reads on video. Fix what looks wrong at 1440×1024. |

### Sunday Oct 19, 10am → midnight (~12h)

| Block | Deliverable |
|---|---|
| 10:00–12:30 | Nearby cards appear after first link, hover card, "Make a connection". **04–04a.** |
| 12:30–3:30 | Detail modal: media, step strip, because panel, locked thoughts; connect-to-hers reuses the popover; attachment menu + chip; unlock. **05–06c.** |
| 3:30–6:30 | Branch stack on canvas, connection sidebar with thread, detail open with timestamped thoughts, step peek. **07–08b.** |
| 6:30–9:00 | Branch expanded (second frame, Walk / Collapse, branch sidebar), branch from step (floating toolbar, placeholder, saves sidebar + Connect). **09–10.** |
| 9:00–11:00 | Scenes 01–10 captured, Reset demo, motion pass (popover spring, edge draw, stack expand), empty/hover/cursor states. Side-by-side pass against Figma. |
| 11:00–12:00 | Deploy. Full golden-path run-through, write down every bug. Script writing happens in parallel (doc says Sunday). |

### Monday Oct 20, 8am → noon

| Block | Deliverable |
|---|---|
| 8:00–9:00 | Fix Sunday's bug list. **Feature freeze at 9am.** |
| 9:00–10:30 | Three clean end-to-end runs of the golden path on the deployed URL. Anything that breaks twice gets a scene snapshot as fallback. |
| 10:30–noon | Final deploy, custom Vercel domain if wanted, browser zoom and cursor settings locked for recording. Recording starts after noon. |

## 5. Risks and the fallback for each

| Risk | Fallback |
|---|---|
| React Flow fights the anchored-edge or parent-frame behaviour | Edges only need to look right at the seeded positions; hard-code anchor offsets in seed data and skip free-form anchoring |
| Video clip (hosting, autoplay, muted) | Still image with a drawn scrubber and markers; nobody will notice in a video |
| Time: 07–10 are the heaviest screens | 07 (branch collapsed + thread) is the emotional payoff and ships; 09–10 degrade to a static expanded frame with no interaction |
| Dragging from sidebar into the frame is fiddly | Click-to-place: click a save, it lands in the next slot |
| Fonts not licensed for web | Google fallbacks listed above |

## 6. Open questions (answer when you can; none block Saturday)

1. Who's building: me end to end with you reviewing, or you coding parts? The schedule assumes the former.
2. Keep the search bar on screen or drop it for the "no search" rule?
3. Fonts: do you have web licences for the Figma families, or should I use the Google fallbacks?
4. Is the short dunes clip available as a file (even a 10-second screen capture)?
5. Scenes for the video: is 01→10 the exact order you'll record, or will you also want the "alternate" frames (01 alt, 07 alt)?

**design.md:** not needed. Everything I'd put in it (tokens, fonts, copy, assets) I can pull from the Figma file directly during the first block. The one thing that would help is the dunes video file.
