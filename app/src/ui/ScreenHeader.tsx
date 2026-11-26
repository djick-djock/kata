import { Link } from 'react-router-dom'
import { SettingsIcon } from './Icons'

/** Title row with the Settings entry point on the right. */
export function ScreenHeader({ title }: { title: string }) {
  return (
    <div className="topbar">
      <h1 className="screen-title">{title}</h1>
      <Link to="/settings" className="icon-btn" aria-label="Settings">
        <SettingsIcon />
      </Link>
    </div>
  )
}
