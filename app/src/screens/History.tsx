import { useEffect, useMemo, useState } from 'react'
import { listSessions, type SessionRow } from '../data/sessions'
import { canGoNext, monthGrid, monthLabel, monthOf, recentItems, shiftMonth, toEntries } from '../history/calendar'
import { currentStreak, dayKey, monthMarkers, monthStats } from '../history/streak'
import { BackIcon } from '../ui/Icons'
import { Empty } from '../ui/Empty'
import { ScreenHeader } from '../ui/ScreenHeader'
import './history.css'

/** Everything History shows comes from here; activities become a second source in this one place. */
function useHistoryData(): SessionRow[] | undefined {
  const [sessions, setSessions] = useState<SessionRow[]>()
  useEffect(() => {
    let live = true
    listSessions().then((s) => live && setSessions(s))
    return () => {
      live = false
    }
  }, [])
  return sessions
}

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function History() {
  const sessions = useHistoryData()
  const now = Date.now()
  const todayKey = dayKey(now)
  const current = monthOf(todayKey)
  const [shown, setShown] = useState(current)
  const entries = useMemo(() => toEntries(sessions ?? []), [sessions])

  if (!sessions) return <ScreenHeader title="History" />
  if (sessions.length === 0) {
    return (
      <>
        <ScreenHeader title="History" />
        <Empty title="No sessions yet">Finished sessions will show up here.</Empty>
      </>
    )
  }

  const stats = monthStats(entries, current.year, current.month)
  const streak = currentStreak(entries, now)
  const markers = new Map(monthMarkers(entries, shown.year, shown.month).map((m) => [m.day, m]))
  const recent = recentItems(sessions, now)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <>
      <ScreenHeader title="History" />
      <div className="hstats">
        <div className="hstat"><strong>{stats.routines}</strong><span>Routines</span></div>
        <div className="hstat"><strong>{stats.activities}</strong><span>Activities</span></div>
        <div className="hstat"><strong>{streak} {streak === 1 ? 'day' : 'days'}</strong><span>Active streak</span></div>
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
        <div className="cal__grid">
          {WEEK.map((w, i) => <span key={i} className="cal__dow" aria-hidden="true">{w}</span>)}
          {monthGrid(shown).map((day, i) => {
            if (day === null) return <span key={`b${i}`} />
            const m = markers.get(day)
            const key = `${shown.year}-${pad(shown.month)}-${pad(day)}`
            return (
              <span key={key} className={`cal__day${key === todayKey ? ' cal__day--today' : ''}`} aria-current={key === todayKey ? 'date' : undefined}>
                {day}
                <i className={`cal__dot${m?.routine ? ' cal__dot--on' : ''}`} aria-label={m?.routine ? 'Routine done' : undefined} />
              </span>
            )
          })}
        </div>
      </section>

      <ul className="recent">
        {recent.map((r) => (
          <li key={r.id} className="recent__row">
            <i className="recent__dot" style={{ background: `var(--color-category-${r.category}, var(--color-textFaint))` }} />
            <div className="recent__text">
              <span className="recent__name">{r.name}</span>
              <span className="recent__when">{r.when}</span>
            </div>
            <span className={`recent__status${r.partial ? ' recent__status--partial' : ''}`}>
              {r.status}
              {r.partial && <small>Partial</small>}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
