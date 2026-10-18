import clsx from 'clsx'
import { useStore } from '../store'
import { Icon, type IconName } from '../components/ui'
import { OWN_TRAIL } from '../data/seed'
import { useCanvasApi } from '../canvas/CanvasContext'
import type { Tool } from '../types'

export function FilePanel() {
  const title = useStore((s) => s.trails[OWN_TRAIL].title)
  return (
    <div data-panel className="absolute left-6 top-6 bg-white rounded-[18px] shadow-panel flex items-center gap-[15px] pl-[15px] pr-[18px] py-3" style={{ zIndex: 80 }}>
      <span className="w-9 h-9 rounded-[9px] bg-ink text-white font-bold text-[18px] flex items-center justify-center">T</span>
      <span className="flex flex-col gap-0.5 whitespace-nowrap">
        <span className="text-[18px] font-semibold text-[#1e1e1e] tracking-[0.09px]">{title}</span>
        <span className="text-[16px] text-[#757575] tracking-[0.08px]">Your trails</span>
      </span>
      <Icon name="chev" size={20} className="text-ink-2" />
    </div>
  )
}

export function SearchBar() {
  return (
    <div data-panel className="absolute left-1/2 -translate-x-1/2 top-[30px] bg-white border-[1.5px] border-line rounded-full flex items-center gap-[15px] pl-[21px] pr-[27px] py-[15px] shadow-[0px_1.5px_4.5px_0px_rgba(31,26,20,0.06)]" style={{ zIndex: 80 }}>
      <Icon name="search" size={22} className="text-ink-4" />
      <input placeholder="Looking for something specific?" className="bg-transparent outline-none text-[18px] w-[300px] text-ink placeholder:text-ink-4" />
    </div>
  )
}

const tools: { id: Tool; icon: IconName; label: string }[] = [
  { id: 'move', icon: 'move', label: 'Move' },
  { id: 'thought', icon: 'thought', label: 'Thought' },
  { id: 'add', icon: 'ref', label: 'Add from saves' },
  { id: 'branch', icon: 'branch', label: 'Branch' },
  { id: 'walk', icon: 'walk', label: 'Walk' },
]

export function Toolbar() {
  const tool = useStore((s) => s.ui.tool)
  const setTool = useStore((s) => s.setTool)
  const layers = useStore((s) => s.ui.layers)
  const toggleLayer = useStore((s) => s.toggleLayer)
  const overview = useStore((s) => s.ui.overview)
  const setOverview = useStore((s) => s.setOverview)
  const toggleZoom = () => {
    const api = useCanvasApi.getState().api
    if (!api) return
    if (overview) { api.focusOwn(); setOverview(false) } else { api.fitAll(); setOverview(true) }
  }
  const chips: { k: keyof typeof layers; label: string; color: string }[] = [
    { k: 'reference', label: 'Reference', color: '#aba59c' },
    { k: 'yours', label: 'Yours', color: '#c47a52' },
    { k: 'everyone', label: 'Everyone', color: '#7fa89a' },
  ]
  return (
    <div data-panel className="absolute left-1/2 -translate-x-1/2 bottom-[40px] bg-white border border-line rounded-[16px] shadow-toolbar flex items-center gap-1 pl-2 pr-3.5 py-[7px]" style={{ zIndex: 80 }}>
      {tools.map((t) => (
        <button key={t.id} title={t.label} onClick={() => setTool(t.id)}
          className={clsx('w-[38px] h-[38px] rounded-[10px] flex items-center justify-center transition-colors', tool === t.id ? 'bg-ink text-white' : 'text-ink-2 hover:bg-paper')}>
          <Icon name={t.icon} size={19} />
        </button>
      ))}
      <span className="w-px h-6 bg-line mx-1" />
      {chips.map((c) => (
        <button key={c.k} onClick={() => toggleLayer(c.k)}
          className={clsx('flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-[10px] text-[13px] font-medium transition-colors', layers[c.k] ? 'bg-frame text-ink' : 'text-ink-4 hover:bg-paper')}>
          <span className="w-[9px] h-[9px] rounded-full" style={{ background: layers[c.k] ? c.color : 'transparent', border: layers[c.k] ? 'none' : `1.5px solid ${c.color}` }} />
          {c.label}
        </button>
      ))}
      <span className="w-px h-6 bg-line mx-1" />
      <button onClick={toggleZoom} className="text-[13px] font-medium text-ink-2 px-1 hover:text-ink whitespace-nowrap">{overview ? 'Zoom in' : 'Zoom out'}</button>
    </div>
  )
}
