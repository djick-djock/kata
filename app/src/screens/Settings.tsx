import { useNavigate } from 'react-router-dom'
import { saveSetting, useSettings } from '../data/settings'
import { BackIcon } from '../ui/Icons'
import { Stepper } from '../ui/Stepper'
import './settings.css'
import './routines.css'

const MAX_SWITCH_PAUSE = 60

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

        <p className="setversion">Kata {__APP_VERSION__}</p>
      </main>
    </div>
  )
}
