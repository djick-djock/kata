import type { ReactNode } from 'react'

function Icon({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const HomeIcon = () => (
  <Icon><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></Icon>
)
export const RoutinesIcon = () => (
  <Icon><rect x="4" y="4" width="16" height="6" rx="3" /><rect x="4" y="14" width="16" height="6" rx="3" /></Icon>
)
export const ExercisesIcon = () => (
  <Icon><circle cx="12" cy="4.5" r="1.8" /><path d="M5 9l7 1.5L19 9M12 10.5V15M12 15l-4 6M12 15l4 6" /></Icon>
)
export const HistoryIcon = () => (
  <Icon><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></Icon>
)
export const SettingsIcon = () => (
  <Icon><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></Icon>
)
export const BackIcon = () => (
  <Icon><path d="M15 5l-7 7 7 7" /></Icon>
)
export const SearchIcon = () => (
  <Icon><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Icon>
)
export const LinkIcon = () => (
  <Icon><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Icon>
)
export const PlusIcon = () => (
  <Icon><path d="M12 5v14M5 12h14" /></Icon>
)
