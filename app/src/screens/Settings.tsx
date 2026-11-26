import { useNavigate } from 'react-router-dom'
import { Empty } from '../ui/Empty'
import { BackIcon } from '../ui/Icons'

/** Pushed screen (outside the tab bar). Real settings arrive in a later ticket. */
export function Settings() {
  const navigate = useNavigate()
  return (
    <div className="shell">
      <main className="shell__main">
        <div className="topbar">
          <button className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
        </div>
        <h1 className="screen-title">Settings</h1>
        <Empty title="Nothing to set yet">Sound, vibration and timing options will appear here.</Empty>
      </main>
    </div>
  )
}
