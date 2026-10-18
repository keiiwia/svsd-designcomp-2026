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
  cardDrop: { stiffness: 380, damping: 30, mass: 1 },
  cardStagger: 0.06,
  because: { stiffness: 420, damping: 32, mass: 1 },
  edgeDraw: 0.5,
  crossDraw: 0.7,
  chipDelay: 0.3,
  camera: { duration: 0.55, ease: [0.3, 0.7, 0.2, 1] },
  pageTurn: { duration: 0.42, ease: [0.3, 0.7, 0.2, 1] },
  pageSlide: 60,
  pageTilt: 10,
  nearbyDelay: 0.35,
  nearbyStagger: 0.09,
  panelFade: 0.18,
  modalOpen: { stiffness: 380, damping: 34, mass: 1 },
  kenBurns: 40,
}

export const useMotion = create<MotionTokens>(() => ({ ...defaultMotion }))

/** Spread a spring token into a Motion transition. */
export const spring = (s: Spring) => ({ type: 'spring' as const, ...s })
