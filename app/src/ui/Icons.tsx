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
export const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
)
export const StepByStepIcon = () => (
  <Icon><path d="M5 5v14" /><path d="M10 6.5v11a.8.8 0 0 0 1.2.7l8-5.5a.8.8 0 0 0 0-1.4l-8-5.5a.8.8 0 0 0-1.2.7z" /></Icon>
)
export const ChevronDownIcon = () => (
  <Icon><path d="M6 9l6 6 6-6" /></Icon>
)
export const RepeatIcon = () => (
  <Icon size={20}><path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" /></Icon>
)
export const GripIcon = () => (
  <Icon size={20}><circle cx="9" cy="6" r="0.8" /><circle cx="15" cy="6" r="0.8" /><circle cx="9" cy="12" r="0.8" /><circle cx="15" cy="12" r="0.8" /><circle cx="9" cy="18" r="0.8" /><circle cx="15" cy="18" r="0.8" /></Icon>
)
export const PinIcon = () => (
  <Icon size={20}><path d="M9 4h6l-1 5 3 3v1.5H7V12l3-3zM12 13.5V20" /></Icon>
)
export const TemplateIcon = () => (
  <Icon><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></Icon>
)
export const CopyIcon = () => (
  <Icon><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1" /></Icon>
)
export const TrashIcon = () => (
  <Icon size={20}><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" /></Icon>
)
