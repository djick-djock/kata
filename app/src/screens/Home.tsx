import { Link } from 'react-router-dom'
import { Empty } from '../ui/Empty'
import { SettingsIcon } from '../ui/Icons'
import { KataMark } from '../ui/KataMark'

function greeting(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function Home() {
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <>
      <div className="topbar">
        <div className="brand">
          <KataMark />
          <span>Kata</span>
        </div>
        <Link to="/settings" className="icon-btn" aria-label="Settings">
          <SettingsIcon />
        </Link>
      </div>
      <p className="screen-sub">{date}</p>
      <h1 className="screen-title">{greeting(now)}</h1>
      <Empty title="Nothing pinned yet">Build a routine and pin it here to start in one tap.</Empty>
    </>
  )
}
