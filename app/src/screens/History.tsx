import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { listSessions, type SessionRow } from '../data/sessions'
import { listActivities, type ActivityRow } from '../data/activities'
import { activityMonthTotals, canGoNext, monthGrid, monthLabel, monthOf, formatDistance, recentItems, shiftMonth, toEntries } from '../history/calendar'
import { currentStreak, dayKey, monthMarkers, monthStats } from '../history/streak'
import { BackIcon, PlusIcon, SettingsIcon } from '../ui/Icons'
import { Empty } from '../ui/Empty'
import { BackupNudge } from '../backup/BackupNudge'
import './history.css'

/** Everything History shows comes from here. */
function useHistoryData(): { sessions: SessionRow[]; activities: ActivityRow[] } | undefined {
  const [data, setData] = useState<{ sessions: SessionRow[]; activities: ActivityRow[] }>()
  useEffect(() => {
    let live = true
    void Promise.all([listSessions(), listActivities()]).then(([sessions, activities]) => live && setData({ sessions, activities }))
    return () => {
      live = false
    }
  }, [])
  return data
}

function HistoryHeader() {
  return (
    <>
    <div className="topbar">
      <h1 className="screen-title">History</h1>
      <Link to="/log" className="hlog">
        <PlusIcon /> Log
      </Link>
      <Link to="/settings" className="icon-btn" aria-label="Settings">
        <SettingsIcon />
      </Link>
    </div>
    <BackupNudge />
    </>
  )
}

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function History() {
  const data = useHistoryData()
  const sessions = data?.sessions
  const activities = useMemo(() => data?.activities ?? [], [data])
  const now = Date.now()
  const todayKey = dayKey(now)
  const current = monthOf(todayKey)
  const [shown, setShown] = useState(current)
  const entries = useMemo(() => toEntries(sessions ?? [], data?.activities ?? []), [sessions, data])

  if (!sessions) return <HistoryHeader />
  if (sessions.length === 0 && activities.length === 0) {
    return (
      <>
        <HistoryHeader />
        <Empty title="No sessions yet">Finished sessions will show up here.</Empty>
      </>
    )
  }

  const stats = monthStats(entries, current.year, current.month)
  const totals = activityMonthTotals(activities, current.year, current.month)
  const streak = currentStreak(entries, now)
  const markers = new Map(monthMarkers(entries, shown.year, shown.month).map((m) => [m.day, m]))
  const recent = recentItems(sessions, now, 20, undefined, activities)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <>
      <HistoryHeader />
      <div className="hstats">
        <div className="hstat"><strong>{stats.routines}</strong><span>Routines</span></div>
        <div className="hstat"><strong>{stats.activities}</strong><span>Activities</span></div>
        <div className="hstat"><strong>{streak} {streak === 1 ? 'day' : 'days'}</strong><span>Active streak</span></div>
        <div className="hstat hstat--half"><strong>{formatDistance(totals.distanceKm)} km</strong><span>Distance</span></div>
        <div className="hstat hstat--half"><strong>{totals.runs}</strong><span>{totals.runs === 1 ? 'Run' : 'Runs'}</span></div>
      </div>

      <section className="cal" aria-label="Calendar">
        <div className="cal__head">
          <h2 className="cal__title">{monthLabel(shown)}</h2>
          <button type="button" className="cal__nav" aria-label="Previous month" onClick={() => setShown(shiftMonth(shown, -1))}>
            <BackIcon />
          </button>
          <button type="button" className="cal__nav cal__nav--next" aria-label="Next month" disabled={!canGoNext(shown, current)} onClick={() => setShown(shiftMonth(shown, 1))}>
            <BackIcon />
          </button>
        </div>
        <p className="cal__legend" aria-hidden="true"><i className="cal__key" />Routine<i className="cal__key cal__key--logged" />Logged</p>
        <div className="cal__grid">
          {WEEK.map((w, i) => <span key={i} className="cal__dow" aria-hidden="true">{w}</span>)}
          {monthGrid(shown).map((day, i) => {
            if (day === null) return <span key={`b${i}`} />
            const m = markers.get(day)
            const key = `${shown.year}-${pad(shown.month)}-${pad(day)}`
            return (
              <span key={key} className={`cal__day${key === todayKey ? ' cal__day--today' : ''}`} aria-current={key === todayKey ? 'date' : undefined}>
                {day}
                <span className="cal__dots">
                  {m?.routine && <i className="cal__dot cal__dot--on" aria-label="Routine done" />}
                  {m?.logged && <i className="cal__dot cal__dot--logged" aria-label="Activity logged" />}
                </span>
              </span>
            )
          })}
        </div>
      </section>

      <ul className="recent">
        {recent.map((r) => (
          <li key={r.id} className="recent__row">
            <Link to={r.to} className="recent__link">
              <i className="recent__dot" style={{ background: `var(--color-category-${r.category}, var(--color-textFaint))` }} />
              <div className="recent__text">
                <span className="recent__name">{r.name}</span>
                <span className="recent__when">{r.when}{r.detail && ` · ${r.detail}`}</span>
              </div>
              <span className={`recent__status${r.partial ? ' recent__status--partial' : ''}${r.kind === 'activity' ? ' recent__status--logged' : ''}`}>
                {r.status}
                {r.partial && <small>Partial</small>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
