import { lazy, Suspense, useEffect, useState } from 'react'
import { Canvas } from './canvas/Canvas'
import { FilePanel, SearchBar } from './panels/Chrome'
import { Toolbar } from './panels/Toolbar'
import { Sidebar } from './panels/Sidebar'
import { DetailModal } from './detail/DetailModal'
import { Shortcuts } from './panels/Shortcuts'
import { useHistory } from './lib/history'
import { loadScene } from './scenes'
import { useStore } from './store'
import { useCanvasApi } from './canvas/CanvasContext'

const MotionTuner = import.meta.env.DEV ? lazy(() => import('./dev/MotionTuner')) : null
// Agentation: annotate the running UI and the notes reach the coding agent (dev only)
const Agentation = import.meta.env.DEV ? lazy(() => import('agentation').then((m) => ({ default: m.Agentation }))) : null

export default function App() {
  const [tuner, setTuner] = useState(() => import.meta.env.DEV && new URLSearchParams(location.search).has('tune'))
  const [help, setHelp] = useState(false)
  useEffect(() => {
    let spaceFrom: ReturnType<typeof useStore.getState>['ui']['tool'] | null = null
    const inField = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
    }
    const onKey = (e: KeyboardEvent) => {
      const st = useStore.getState()
      const mod = e.metaKey || e.ctrlKey
      // undo / redo work everywhere except inside a text field (the field has its own)
      if (mod && (e.key === 'z' || e.key === 'Z')) {
        if (inField(e)) return
        e.preventDefault()
        if (e.shiftKey) useHistory.getState().redo(); else useHistory.getState().undo()
        return
      }
      if (mod && (e.key === 'y' || e.key === 'Y')) { if (inField(e)) return; e.preventDefault(); useHistory.getState().redo(); return }
      if (inField(e) || mod) return
      const k = e.key.toLowerCase()
      if (e.key === 'Escape') {
        if (help) setHelp(false)
        else if (st.draft) st.cancelDraft()
        else if (st.ui.detailStepId) st.openDetail(null)
        else if (st.ui.peekStepId) st.setPeek(null)
        else st.selectStep(null)
        return
      }
      if (e.key === '?' || (e.code === 'Slash' && e.shiftKey)) { setHelp((h) => !h); return }
      if (/^[0-9]$/.test(e.key)) { loadScene(e.key === '0' ? 10 : Number(e.key)); return }
      if (e.key === 'R' && e.shiftKey) { st.reset(); loadScene(1); return }
      if (e.key === 'D' && e.shiftKey && import.meta.env.DEV) { setTuner((t) => !t); return }
      if (e.key === ' ' && !e.repeat) { if (st.ui.tool !== 'hand') { spaceFrom = st.ui.tool; st.setTool('hand') } e.preventDefault(); return }
      if (k === 'v') st.setTool('select')
      if (k === 'h') st.setTool('hand')
      if (k === 't') st.setTool('thought')
      if (k === 'p' && st.ui.selectedStepId) st.togglePin(st.ui.selectedStepId)
      if (k === 'a') window.dispatchEvent(new CustomEvent('trails:toggle-add-menu'))
      if (k === 'f') { const api = useCanvasApi.getState().api; if (st.ui.overview) { api?.focusOwn(); st.setOverview(false) } else { api?.fitAll(); st.setOverview(true) } }
      if ((e.key === 'Backspace' || e.key === 'Delete') && st.ui.selectedStepId && !st.ui.detailStepId) { e.preventDefault(); st.removeStep(st.ui.selectedStepId) }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && spaceFrom) { useStore.getState().setTool(spaceFrom); spaceFrom = null }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onUp) }
  }, [help])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Canvas />
      <FilePanel />
      <SearchBar />
      <Sidebar />
      <Toolbar />
      <DetailModal />
      <Shortcuts open={help} onClose={() => setHelp(false)} />
      {tuner && MotionTuner && <Suspense fallback={null}><MotionTuner /></Suspense>}
      {Agentation && <Suspense fallback={null}><Agentation endpoint="http://localhost:4747" /></Suspense>}
    </div>
  )
}
