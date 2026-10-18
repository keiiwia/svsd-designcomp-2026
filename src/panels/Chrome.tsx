import { useStore } from '../store'
import { Icon } from '../components/ui'
import { OWN_TRAIL } from '../data/seed'

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
