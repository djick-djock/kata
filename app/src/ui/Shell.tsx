import { Outlet } from 'react-router-dom'
import { TabBar } from './TabBar'

/** App frame: scrolling content area plus the four-tab bottom bar. Pushed screens render outside it. */
export function Shell() {
  return (
    <div className="shell">
      <main className="shell__main">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
