import { useEffect } from 'react'
import { DialRoot, useDialKit } from 'dialkit'
import 'dialkit/styles.css'
import { defaultMotion, useMotion, type Easing, type Spring } from '../lib/motion'

const d = defaultMotion
const asSpring = (v: unknown): Spring => {
  const o = (v ?? {}) as Record<string, unknown>
  const out: Spring = {}
  for (const k of ['stiffness', 'damping', 'mass', 'visualDuration', 'bounce'] as const) {
    if (typeof o[k] === 'number') out[k] = o[k] as number
  }
  return out
}
const asEasing = (v: unknown, fallback: Easing): Easing => {
  const o = (v ?? {}) as { duration?: number; ease?: number[] }
  return {
    duration: typeof o.duration === 'number' ? o.duration : fallback.duration,
    ease: Array.isArray(o.ease) && o.ease.length === 4 ? (o.ease as Easing['ease']) : fallback.ease,
  }
}

/**
 * Dev-only DialKit panel. Drag the dials, watch the canvas, then copy the values into
 * `defaultMotion` in src/lib/motion.ts (the panel's JSON export has the same shape).
 */
export default function MotionTuner() {
  const p = useDialKit('Trails motion', {
    cards: {
      drop: { type: 'spring', ...d.cardDrop },
      pop: { type: 'spring', ...d.pop },
      stagger: [d.cardStagger, 0, 0.25, 0.01],
    },
    because: { spring: { type: 'spring', ...d.because } },
    edges: {
      draw: [d.edgeDraw, 0.1, 1.5, 0.05],
      crossDraw: [d.crossDraw, 0.1, 2, 0.05],
      chipDelay: [d.chipDelay, 0, 1.2, 0.05],
      _collapsed: true,
    },
    camera: { move: { type: 'easing', duration: d.camera.duration, ease: d.camera.ease } },
    walk: {
      pageTurn: { type: 'easing', duration: d.pageTurn.duration, ease: d.pageTurn.ease },
      slide: [d.pageSlide, 0, 240, 4],
      tilt: [d.pageTilt, 0, 40, 1],
      _collapsed: true,
    },
    nearby: { delay: [d.nearbyDelay, 0, 2, 0.05], stagger: [d.nearbyStagger, 0, 0.4, 0.01], _collapsed: true },
    panels: { fade: [d.panelFade, 0.05, 0.6, 0.01], _collapsed: true },
    detail: { open: { type: 'spring', ...d.modalOpen }, kenBurns: [d.kenBurns, 5, 120, 1], _collapsed: true },
  })

  useEffect(() => {
    useMotion.setState({
      cardDrop: asSpring(p.cards.drop),
      pop: asSpring(p.cards.pop),
      cardStagger: p.cards.stagger as number,
      because: asSpring(p.because.spring),
      edgeDraw: p.edges.draw as number,
      crossDraw: p.edges.crossDraw as number,
      chipDelay: p.edges.chipDelay as number,
      camera: asEasing(p.camera.move, d.camera),
      pageTurn: asEasing(p.walk.pageTurn, d.pageTurn),
      pageSlide: p.walk.slide as number,
      pageTilt: p.walk.tilt as number,
      nearbyDelay: p.nearby.delay as number,
      nearbyStagger: p.nearby.stagger as number,
      panelFade: p.panels.fade as number,
      modalOpen: asSpring(p.detail.open),
      kenBurns: p.detail.kenBurns as number,
    })
  })

  return <DialRoot position="bottom-left" defaultOpen theme="light" />
}
