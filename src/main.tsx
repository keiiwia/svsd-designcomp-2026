import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useStore } from './store'
import { useMotion } from './lib/motion'

if (import.meta.env.DEV) {
  const w = window as unknown as { __trails: typeof useStore; __motion: typeof useMotion }
  w.__trails = useStore
  w.__motion = useMotion
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
