import type { CSSProperties, ReactNode } from 'react'
import clsx from 'clsx'
import { users } from '../data/seed'

import iconSearch from '../assets/icons/search.svg'
import iconPlay from '../assets/icons/play.svg'
import iconGrip from '../assets/icons/grip.svg'
import iconChev from '../assets/icons/chev.svg'
import iconPhone from '../assets/icons/phone.svg'
import iconText from '../assets/icons/text.svg'
import iconMove from '../assets/icons/move.svg'
import iconThought from '../assets/icons/thought.svg'
import iconRef from '../assets/icons/ref.svg'
import iconBranch from '../assets/icons/branch.svg'
import iconWalk from '../assets/icons/walk.svg'
import iconPlus from '../assets/icons/plus.svg'
import iconMic from '../assets/icons/mic.svg'
import iconConnect from '../assets/icons/connect.svg'
import iconPause from '../assets/icons/pause.svg'
import iconMuted from '../assets/icons/muted.svg'
import iconSource from '../assets/icons/source.svg'
import iconClose from '../assets/icons/close.svg'
import iconLock from '../assets/icons/lock.svg'

const icons = {
  search: iconSearch, play: iconPlay, grip: iconGrip, chev: iconChev, phone: iconPhone, text: iconText,
  move: iconMove, thought: iconThought, ref: iconRef, branch: iconBranch, walk: iconWalk, plus: iconPlus,
  mic: iconMic, connect: iconConnect, pause: iconPause, muted: iconMuted, source: iconSource, close: iconClose,
  lock: iconLock,
}
export type IconName = keyof typeof icons

/** Monochrome icon rendered through a CSS mask so it takes currentColor. */
export function Icon({ name, size = 16, className, style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  const url = icons[name]
  return (
    <span
      aria-hidden
      className={clsx('inline-block shrink-0', className)}
      style={{
        width: size, height: size, backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${url}")`, maskImage: `url("${url}")`,
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        ...style,
      }}
    />
  )
}

export function Avatar({ userId, size = 22, className, ring = true }: { userId: string; size?: number; className?: string; ring?: boolean }) {
  const u = users[userId]
  return (
    <span
      className={clsx('inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0', className)}
      style={{ width: size, height: size, background: u.color, fontSize: Math.round(size * 0.46), border: ring ? '1.5px solid white' : 'none', lineHeight: 1 }}
    >
      {u.initial}
    </span>
  )
}

export function AvatarStack({ ids, size = 24 }: { ids: string[]; size?: number }) {
  return (
    <span className="inline-flex">
      {ids.map((id, i) => (
        <Avatar key={id} userId={id} size={size} className={i > 0 ? '-ml-1.5' : ''} />
      ))}
    </span>
  )
}

export function Pill({ children, dark, blue, className, onClick, icon, title }: {
  children: ReactNode; dark?: boolean; blue?: boolean; className?: string; onClick?: () => void; icon?: IconName; title?: string
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full whitespace-nowrap transition-colors',
        dark ? 'bg-ink text-white hover:bg-black' : blue ? 'bg-white text-blue' : 'border border-line text-ink-2 hover:bg-paper',
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  )
}

export function KindDot({ userId, size = 7 }: { userId: string; size?: number }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: users[userId].color }} />
}
