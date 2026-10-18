import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useStore } from './store'
import { useMotion } from './lib/motion'
import { useHistory } from './lib/history'

if (import.meta.env.DEV) {
  const w = window as unknown as { __trails: typeof useStore; __motion: typeof useMotion; __history: typeof useHistory }
  w.__trails = useStore
  w.__motion = useMotion
  w.__history = useHistory
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
