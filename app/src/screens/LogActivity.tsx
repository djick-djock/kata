import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ACTIVITY_TYPES, deleteActivity, formatPace, getActivity, paceSecondsPerKm, saveActivity, validateActivity, type ActivityType } from '../data/activities'
import type { Feel } from '../data/sessions'
import { notify } from '../ui/Toast'
import './exercises.css'
import './routines.css'
import './log.css'

const FEELS: { value: Feel; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'good', label: 'Good' },
  { value: 'hard', label: 'Hard' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const dateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const timeValue = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const digits = (s: string) => s.replace(/\D/g, '').slice(0, 3)

/** Local date and time inputs to epoch ms; undefined when either is empty or invalid. */
function toTimestamp(date: string, time: string): number | undefined {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const t = /^(\d{2}):(\d{2})/.exec(time)
  if (!d || !t) return undefined
  return new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2])).getTime()
}

/** Pushed screen: log (or edit, at /log/:id) an activity done outside Kata. */
export function LogActivity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hasHistory = useLocation().key !== 'default'
  const [ready, setReady] = useState(!id)
  const [missing, setMissing] = useState(false)
  const [type, setType] = useState<ActivityType>('run')
  const [date, setDate] = useState(() => dateValue(new Date()))
  const [time, setTime] = useState(() => timeValue(new Date()))
  const [h, setH] = useState('')
  const [m, setM] = useState('')
  const [s, setS] = useState('')
  const [dist, setDist] = useState('')
  const [feel, setFeel] = useState<Feel | undefined>()
  const [notes, setNotes] = useState('')
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  // Kept so editing never drops fields this form does not show.
  const [keep, setKeep] = useState<{ source?: string; externalId?: string; route?: unknown; heartRate?: unknown }>({})

  useEffect(() => {
    if (!id) return
    let live = true
    void getActivity(id).then((a) => {
      if (!live) return
      if (!a) { setMissing(true); return }
      const d = new Date(a.startedAt)
      setType(a.type); setDate(dateValue(d)); setTime(timeValue(d))
      const total = a.durationSeconds
      setH(total >= 3600 ? String(Math.floor(total / 3600)) : ''); setM(String(Math.floor((total % 3600) / 60))); setS(String(total % 60))
      setDist(a.distanceKm === undefined ? '' : String(a.distanceKm))
      setFeel(a.feel); setNotes(a.notes ?? '')
      setKeep({ source: a.source, externalId: a.externalId, route: a.route, heartRate: a.heartRate })
      setReady(true)
    }, () => live && setMissing(true))
    return () => { live = false }
  }, [id])

  const durationSeconds = Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0)
  const distText = dist.trim().replace(',', '.')
  const distanceKm = distText === '' ? undefined : Number(distText)
  const errors = validateActivity({ durationSeconds, distanceKm })
  const startedAt = toTimestamp(date, time)
  const whenError = startedAt === undefined ? 'Choose a date and a start time.' : undefined
  const pace = paceSecondsPerKm(durationSeconds, distanceKm)
  const show = tried

  function leave() {
    if (hasHistory) navigate(-1)
    else navigate('/', { replace: true })
  }

  async function save() {
    setTried(true)
    if (errors.duration || errors.distance || startedAt === undefined || saving) return
    setSaving(true)
    try {
      await saveActivity({ ...keep, id, type, startedAt, durationSeconds, distanceKm, feel, notes })
      notify(id ? 'Activity updated' : 'Activity saved to history')
      leave()
    } catch {
      setSaving(false)
      notify('Could not save the activity')
    }
  }

  async function remove() {
    if (!id || !window.confirm('Delete this activity?')) return
    await deleteActivity(id)
    notify('Activity deleted')
    leave()
  }

  if (missing) {
    return <div className="detail"><div className="detail__scroll"><p className="no-match">Activity not found.</p><button className="btn" onClick={leave}>Back</button></div></div>
  }
  if (!ready) return <div className="detail" />

  return (
    <div className="detail log">
      <div className="detail__scroll">
        <div className="log__bar">
          <button type="button" className="log__cancel" onClick={leave}>Cancel</button>
          <h1 className="log__title">{id ? 'Edit activity' : 'Log activity'}</h1>
          <span aria-hidden="true" />
        </div>

        <div className="log__group" role="group" aria-label="Type">
          <span className="log__label">Type</span>
          <div className="chips chips--flush">
            {ACTIVITY_TYPES.map((t) => (
              <button key={t.value} type="button" className="chip" aria-pressed={type === t.value} onClick={() => setType(t.value)}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="log__grid">
          <label className="log__group"><span className="log__label">Date</span>
            <input className="log__input" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={show && !!whenError} />
          </label>
          <label className="log__group"><span className="log__label">Start</span>
            <input className="log__input" type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-invalid={show && !!whenError} />
          </label>
        </div>
        {show && whenError && <p className="log__error" role="alert">{whenError}</p>}

        <div className="log__grid">
          <div className="log__group" role="group" aria-label="Duration" aria-describedby={show && errors.duration ? 'err-duration' : undefined}>
            <span className="log__label">Duration</span>
            <div className="log__input log__dur" data-invalid={show && !!errors.duration}>
              <label><input inputMode="numeric" placeholder="0" aria-label="Hours" value={h} onChange={(e) => setH(digits(e.target.value))} /><span>h</span></label>
              <label><input inputMode="numeric" placeholder="0" aria-label="Minutes" value={m} onChange={(e) => setM(digits(e.target.value))} /><span>m</span></label>
              <label><input inputMode="numeric" placeholder="0" aria-label="Seconds" value={s} onChange={(e) => setS(digits(e.target.value))} /><span>s</span></label>
            </div>
          </div>
          <label className="log__group"><span className="log__label">Distance</span>
            <span className="log__input log__dist" data-invalid={show && !!errors.distance}>
              <input inputMode="decimal" placeholder="0.0" aria-label="Distance in kilometres" value={dist} onChange={(e) => setDist(e.target.value.replace(/[^\d.,-]/g, ''))} />
              <span>km</span>
            </span>
          </label>
        </div>
        {show && errors.duration && <p className="log__error" id="err-duration" role="alert">{errors.duration}</p>}
        {show && errors.distance && <p className="log__error" role="alert">{errors.distance}</p>}

        {pace !== undefined && (
          <div className="log__pace" data-testid="pace">
            <span>Average pace (calculated)</span>
            <strong>{formatPace(pace)}<small> /km</small></strong>
          </div>
        )}

        <div className="log__group" role="group" aria-label="How did it feel? (optional)">
          <span className="log__label">How did it feel? (optional)</span>
          <div className="complete__opts">
            {FEELS.map((f) => (
              <button key={f.value} type="button" className="complete__opt" aria-pressed={feel === f.value} onClick={() => setFeel(feel === f.value ? undefined : f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        <label className="log__group"><span className="log__label">Notes (optional)</span>
          <textarea className="log__input log__notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        {id && <button type="button" className="btn btn--danger log__delete" onClick={() => void remove()}>Delete activity</button>}
      </div>
      <div className="detail__cta">
        <button type="button" className="btn btn--primary btn--block btn--tall" onClick={() => void save()} disabled={saving}>{id ? 'Save changes' : 'Save to history'}</button>
      </div>
    </div>
  )
}
