import { NavLink } from 'react-router-dom'
import { ExercisesIcon, HistoryIcon, HomeIcon, RoutinesIcon } from './Icons'

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/routines', label: 'Routines', Icon: RoutinesIcon, end: false },
  { to: '/exercises', label: 'Exercises', Icon: ExercisesIcon, end: false },
  { to: '/history', label: 'History', Icon: HistoryIcon, end: false },
]

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
