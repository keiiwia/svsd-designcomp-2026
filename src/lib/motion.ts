import { create } from 'zustand'

/**
 * Every spring, easing and duration in the app, in one place.
 * In dev, the DialKit panel (Shift+D) writes into this store live; in production these are the values.
 */
export interface Spring { stiffness?: number; damping?: number; mass?: number; visualDuration?: number; bounce?: number }
export interface Easing { duration: number; ease: [number, number, number, number] }

export interface MotionTokens {
  cardDrop: Spring        // a reference landing on the canvas, a note appearing
  cardStagger: number     // seconds between cards when a branch expands
  because: Spring         // the blue because card
  edgeDraw: number        // seconds to draw a same-trail line
  crossDraw: number       // seconds to draw a cross-trail curve
  chipDelay: number       // seconds before a because chip fades in
  camera: Easing          // zoom out / zoom in / fit
  pageTurn: Easing        // walk mode
  pageSlide: number       // px a page travels on turn
  pageTilt: number        // degrees of perspective tilt on turn
  nearbyDelay: number     // seconds after the first link before nearby references appear
  nearbyStagger: number
  panelFade: number       // sidebar panels
  modalOpen: Spring       // the detail view
  kenBurns: number        // seconds for the slow zoom on a still
}

export const defaultMotion: MotionTokens = {
  // Tuned for screen recording: springs settle in ~0.6s with a soft overshoot, lines take
  // long enough to be seen drawing, and nothing snaps.
  cardDrop: { stiffness: 230, damping: 26, mass: 1 },
  cardStagger: 0.11,
  because: { stiffness: 260, damping: 28, mass: 1 },
  edgeDraw: 0.8,
  crossDraw: 1.1,
  chipDelay: 0.55,
  camera: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] },
  pageTurn: { duration: 0.7, ease: [0.3, 0.75, 0.2, 1] },
  pageSlide: 48,
  pageTilt: 8,
  nearbyDelay: 0.6,
  nearbyStagger: 0.12,
  panelFade: 0.24,
  modalOpen: { stiffness: 260, damping: 30, mass: 1 },
  kenBurns: 45,
}

export const useMotion = create<MotionTokens>(() => ({ ...defaultMotion }))

/** Spread a spring token into a Motion transition. */
export const spring = (s: Spring) => ({ type: 'spring' as const, ...s })
