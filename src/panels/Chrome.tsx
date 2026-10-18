import { useStore } from '../store'
import { Icon } from '../components/ui'
import { OWN_TRAIL } from '../data/seed'

export function FilePanel() {
  const title = useStore((s) => s.trails[OWN_TRAIL].title)
  return (
    <div data-panel className="absolute left-6 top-6 bg-white rounded-[14px] shadow-panel flex items-center gap-3 pl-3 pr-4 py-2.5" style={{ zIndex: 80 }}>
      <span className="w-7 h-7 rounded-[8px] bg-ink text-white font-bold text-[14px] flex items-center justify-center">T</span>
      <span className="flex flex-col whitespace-nowrap">
        <span className="text-[14px] font-semibold text-ink leading-[18px]">{title}</span>
        <span className="text-[12px] text-ink-3 leading-[16px]">Your trails</span>
      </span>
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
