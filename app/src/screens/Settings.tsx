import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../data/db'
import { BackupError, exportAll, importBackupText, parseBackup, validateBackup } from '../backup/backup'
import { saveBackupFile } from '../backup/file'
import { lastBackupLabel, setLastBackup } from '../backup/nudge'
import { BackupNudge } from '../backup/BackupNudge'
import { useBackupStatus } from '../backup/useLastBackup'
import { requestPersistentStorage, type PersistState } from '../platform/persist'
import { Sheet } from '../ui/Sheet'
import { saveSetting, useSettings } from '../data/settings'
import { BackIcon } from '../ui/Icons'
import { Stepper } from '../ui/Stepper'
import { VersionToggle } from '../owner/VersionToggle'
import './settings.css'
import './routines.css'

const MAX_SWITCH_PAUSE = 60

const PERSIST_TEXT: Record<PersistState, string> = {
  granted: 'Granted: the browser should keep your data',
  denied: 'Not granted: the browser may clear data when space is low',
  unsupported: 'Not supported by this browser',
  error: 'Could not be checked',
}

/** Backup and restore. Import is validated before the confirmation sheet; nothing changes until Replace is confirmed. */
function BackupSection() {
  const { last } = useBackupStatus()
  const [persist, setPersist] = useState<PersistState | null>(null)
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)
  const [pending, setPending] = useState<{ text: string; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    void requestPersistentStorage().then(setPersist)
  }, [])

  const doExport = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const doc = await exportAll(db)
      if (await saveBackupFile(doc)) {
        setLastBackup(Date.now())
        setMsg({ text: 'Backup saved.', error: false })
      }
    } catch {
      setMsg({ text: 'Could not create the backup.', error: true })
    } finally {
      setBusy(false)
    }
  }

  const onPick = async (file: File | undefined) => {
    if (input.current) input.current.value = ''
    if (!file) return
    setMsg(null)
    try {
      const text = await file.text()
      // Validate fully before asking to confirm; nothing is written here.
      validateBackup(db, parseBackup(text))
      setPending({ text, name: file.name })
    } catch (e) {
      setMsg({ text: e instanceof BackupError ? e.message : 'Could not read this file.', error: true })
    }
  }

  const doImport = async () => {
    if (!pending) return
    setBusy(true)
    try {
      const doc = await importBackupText(db, pending.text)
      setLastBackup(Math.max(Date.parse(doc.exportedAt), 1))
      setMsg({ text: 'Backup restored.', error: false })
    } catch (e) {
      setMsg({ text: e instanceof BackupError ? e.message : 'Restore failed. Your data was not changed.', error: true })
    } finally {
      setPending(null)
      setBusy(false)
    }
  }

  return (
    <section className="setgroup" aria-label="Backup">
      <h2 className="setgroup__title">Backup</h2>
      <BackupNudge inSettings />
      <div className="setrow">
        <div className="setrow__text"><strong>Last backup</strong><span data-testid="last-backup">{lastBackupLabel(last, Date.now())}</span></div>
      </div>
      <div className="setrow">
        <div className="setrow__text"><strong>Persistent storage</strong><span data-testid="persist-status">{persist ? PERSIST_TEXT[persist] : 'Checking...'}</span></div>
      </div>
      <button type="button" className="btn btn--block" disabled={busy} onClick={() => void doExport()}>Export backup</button>
      <button type="button" className="btn btn--block" disabled={busy} onClick={() => input.current?.click()}>Import backup</button>
      <input ref={input} type="file" accept="application/json,.json" hidden data-testid="import-input" onChange={(e) => void onPick(e.target.files?.[0])} />
      {msg && <p className={`setnote${msg.error ? ' setnote--error' : ''}`} role={msg.error ? 'alert' : 'status'}>{msg.text}</p>}
      <p className="setnote">Saves everything (routines, sessions, activities, settings) to one file you keep.</p>
      {pending && (
        <Sheet title="Replace all data?" onClose={() => setPending(null)}>
          <p>Importing <strong>{pending.name}</strong> will overwrite everything on this device: routines, sessions, activities and settings. This cannot be undone.</p>
          <button type="button" className="btn btn--primary btn--block btn--tall" disabled={busy} onClick={() => void doImport()}>Replace everything</button>
        </Sheet>
      )}
    </section>
  )
}

/** Pushed screen (outside the tab bar), reachable from Home. Changes are stored at once and used from the next session. */
export function Settings() {
  const navigate = useNavigate()
  const s = useSettings()
  return (
    <div className="shell">
      <main className="shell__main">
        <div className="topbar">
          <button className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
        </div>
        <h1 className="screen-title">Settings</h1>
        {s && (
          <>
            <section className="setgroup" aria-label="Session">
              <h2 className="setgroup__title">Session</h2>
              <div className="setrow">
                <div className="setrow__text">
                  <strong>Switch pause</strong>
                  <span>Pause between the two sides of a per-side exercise</span>
                </div>
                <div className="setrow__control">
                  <Stepper label="Switch pause" value={s.switchPauseSeconds} min={0} step={1} suffix="s" onChange={(v) => void saveSetting('switchPauseSeconds', Math.min(MAX_SWITCH_PAUSE, v))} />
                </div>
              </div>
            </section>

            <section className="setgroup" aria-label="Cues">
              <h2 className="setgroup__title">Cues</h2>
              <label className="setrow setrow--tap">
                <span className="setrow__text"><strong>Sound</strong><span>Beeps and bells during a session</span></span>
                <input type="checkbox" role="switch" className="switch" checked={s.sound} onChange={(e) => void saveSetting('sound', e.target.checked)} />
              </label>
              <label className="setrow setrow--tap">
                <span className="setrow__text"><strong>Vibration</strong><span>Short buzzes on the same cues</span></span>
                <input type="checkbox" role="switch" className="switch" checked={s.vibration} onChange={(e) => void saveSetting('vibration', e.target.checked)} />
              </label>
              <label className="setrow setrow--tap">
                <span className="setrow__text"><strong>Visual pulse</strong><span>Screen flash on the same cues</span></span>
                <input type="checkbox" role="switch" className="switch" checked={s.pulse} onChange={(e) => void saveSetting('pulse', e.target.checked)} />
              </label>
              <div className="setrow setrow--col">
                <div className="setrow__head">
                  <label htmlFor="volume"><strong>Volume</strong></label>
                  <span className="setrow__value">{Math.round(s.volume * 100)}%</span>
                </div>
                <input id="volume" type="range" className="slider" min={0} max={100} step={5} value={Math.round(s.volume * 100)} disabled={!s.sound} onChange={(e) => void saveSetting('volume', Number(e.target.value) / 100)} />
              </div>
              <p className="setnote">Changes apply from the next session.</p>
            </section>
          </>
        )}
        <BackupSection />

        <VersionToggle>Kata {__APP_VERSION__}</VersionToggle>
      </main>
    </div>
  )
}
