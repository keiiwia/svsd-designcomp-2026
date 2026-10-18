import { useEffect } from 'react'
import { Canvas } from './canvas/Canvas'
import { FilePanel, SearchBar, Toolbar } from './panels/Chrome'
import { Sidebar } from './panels/Sidebar'
import { DetailModal } from './detail/DetailModal'
import { loadScene } from './scenes'
import { useStore } from './store'

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const st = useStore.getState()
      if (e.key === 'Escape') {
        if (st.draft) st.cancelDraft()
        else if (st.ui.detailStepId) st.openDetail(null)
        else if (st.ui.peekStepId) st.setPeek(null)
        else st.selectStep(null)
      }
      if (/^[0-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
        loadScene(e.key === '0' ? 10 : Number(e.key))
      }
      if (e.key === 'R' && e.shiftKey) { st.reset(); loadScene(1) }
      if (e.key === 'v' || e.key === 'V') st.setTool('add')
      if (e.key === 'h' || e.key === 'H') st.setTool('move')
      if (e.key === 't' || e.key === 'T') st.setTool('thought')
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
    </div>
  )
}
