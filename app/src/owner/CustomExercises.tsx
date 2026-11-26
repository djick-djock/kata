import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../data/db'
import { BackupError, readBackupText } from '../backup/backup'
import { notify } from '../ui/Toast'
import { Sheet } from '../ui/Sheet'
import { BackIcon } from '../ui/Icons'
import { formatMeasure } from '../screens/exercise-format'
import { listRoutines } from '../data/routines'
import { submit } from '../request'
import { groupCustomExercises, customListText, usageLabel, type CustomGroup } from './custom-exercises'
import { RequestDrawing } from './RequestDrawing'
import { useOwnerMode } from './owner'
import '../screens/settings.css'
import '../screens/routines.css'
import './custom-exercises.css'

/** Reads a backup file's custom exercises without importing: validation and parsing only, the database is never touched. */
export function customFromBackupText(text: string): CustomGroup[] {
  const doc = readBackupText(db, text)
  return groupCustomExercises((doc.tables.routines ?? []) as Parameters<typeof groupCustomExercises>[0])
}

/** Owner-only screen listing the custom steps in use, from this device or (read only) from a backup file. */
export function CustomExercises() {
  const owner = useOwnerMode()
  const [local, setLocal] = useState<CustomGroup[] | null>(null)
  const [file, setFile] = useState<{ name: string; list: CustomGroup[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void listRoutines().then((r) => setLocal(groupCustomExercises(r)))
  }, [])

  const onPick = async (f: File | undefined) => {
    if (input.current) input.current.value = ''
    if (!f) return
    setError(null)
    try {
      setFile({ name: f.name, list: customFromBackupText(await f.text()) })
    } catch (e) {
      setFile(null)
      setError(e instanceof BackupError ? e.message : 'Could not read this file.')
    }
  }

  const shown = file ? file.list : local
  const copy = async () => {
    if (!shown) return
    const text = customListText(shown, file?.name)
    // Reuses the request module's clipboard transport (and its manual-copy fallback) with a transport function.
    const r = await submit({ appId: 'kata', type: 'custom-exercises', payload: {} }, async () => {
      try {
        await navigator.clipboard.writeText(text)
        return { ok: true as const, transport: 'clipboard' }
      } catch {
        return { ok: false as const, transport: 'clipboard', reason: 'manual-copy' as const, text }
      }
    })
    if (r.ok) notify('List copied')
    else setManual(r.text)
  }

  if (!owner) return null
  return (
    <div className="shell">
      <main className="shell__main">
        <div className="topbar">
          <Link to="/settings" className="icon-btn" aria-label="Back"><BackIcon /></Link>
        </div>
        <h1 className="screen-title">Custom exercises</h1>
        <p className="setnote" data-testid="source">
          {file ? <>From the file <strong>{file.name}</strong>. Read only: nothing is imported.</> : 'In your routines on this device.'}
        </p>
        <div className="cx__actions">
          <button type="button" className="btn" disabled={!shown?.length} data-testid="copy-list" onClick={() => void copy()}>Copy list</button>
          <button type="button" className="btn" data-testid="read-backup" onClick={() => input.current?.click()}>Read a backup file</button>
          {file && <button type="button" className="btn" onClick={() => setFile(null)}>Back to my list</button>}
        </div>
        <input ref={input} type="file" accept="application/json,.json" hidden data-testid="backup-input" onChange={(e) => void onPick(e.target.files?.[0])} />
        {error && <p className="setnote setnote--error" role="alert">{error}</p>}
        {shown && shown.length === 0 && <p className="setnote" data-testid="empty">No custom exercises {file ? 'in this file' : 'in your routines'}.</p>}
        <ul className="cx__list" data-testid="cx-list">
          {shown?.map((g) => (
            <li key={g.name.toLowerCase()} className="cx__item" data-testid="cx-item">
              <strong className="cx__name">{g.name}</strong>
              <span className="cx__meta">{formatMeasure(g.measure, g.perSide)} · {usageLabel(g)}</span>
              {g.details && <p className="cx__details">{g.details}</p>}
              <RequestDrawing exercise={g} />
            </li>
          ))}
        </ul>
        {manual !== null && (
          <Sheet title="Copy the list" onClose={() => setManual(null)}>
            <p>Copying was blocked. Select the text below and copy it.</p>
            <textarea readOnly className="video__input" rows={10} value={manual} onFocus={(e) => e.currentTarget.select()} />
          </Sheet>
        )}
      </main>
    </div>
  )
}
