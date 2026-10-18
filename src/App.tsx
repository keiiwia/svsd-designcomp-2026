import { lazy, Suspense, useEffect, useState } from 'react'
import { Canvas } from './canvas/Canvas'
import { FilePanel, SearchBar } from './panels/Chrome'
import { Toolbar } from './panels/Toolbar'
import { Sidebar } from './panels/Sidebar'
import { DetailModal } from './detail/DetailModal'
import { WalkMode } from './detail/WalkMode'
import { loadScene } from './scenes'
import { useStore } from './store'
import { useCanvasApi } from './canvas/CanvasContext'

const MotionTuner = import.meta.env.DEV ? lazy(() => import('./dev/MotionTuner')) : null

export default function App() {
  const [tuner, setTuner] = useState(() => import.meta.env.DEV && new URLSearchParams(location.search).has('tune'))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const st = useStore.getState()
      if (e.key === 'Escape') {
        if (st.ui.walk) st.endWalk()
        else if (st.draft) st.cancelDraft()
        else if (st.ui.detailStepId) st.openDetail(null)
        else if (st.ui.peekStepId) st.setPeek(null)
        else st.selectStep(null)
      }
      if (/^[0-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
        loadScene(e.key === '0' ? 10 : Number(e.key))
      }
      if (e.key === 'R' && e.shiftKey) { st.reset(); loadScene(1) }
      if (e.key === 'D' && e.shiftKey && import.meta.env.DEV) setTuner((t) => !t)
      if (e.key === 'v') st.setTool('select')
      if (e.key === 'h') st.setTool('hand')
      if (e.key === 't') st.setTool('thought')
      if (e.key === 'p' && st.ui.selectedStepId) st.togglePin(st.ui.selectedStepId)
      if (e.key === 'a') window.dispatchEvent(new CustomEvent('trails:toggle-add-menu'))
      if (e.key === 'f') { const api = useCanvasApi.getState().api; if (st.ui.overview) { api?.focusOwn(); st.setOverview(false) } else { api?.fitAll(); st.setOverview(true) } }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Canvas />
      <FilePanel />
      <SearchBar />
      <Sidebar />
      <Toolbar />
      <DetailModal />
      <WalkMode />
      {tuner && MotionTuner && <Suspense fallback={null}><MotionTuner /></Suspense>}
    </div>
  )
}
