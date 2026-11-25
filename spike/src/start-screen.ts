import { VERSION } from './version'
import { DEFAULT_CONFIG, createTimer, type Timer, type TimerSnapshot } from './timer'
import { createWakeLock, type WakeLockState } from './wake-lock'
import { COUNTDOWN_PATTERN, PHASE_CHANGE_PATTERN, patternFor, vibrate, vibrationSupported } from './vibration'
import { CUE_LABELS, CUE_NAMES, cueFor, type CueName } from './cues'
import { createCuePlayer } from './audio'
import { requestPersistentStorage, type PersistState } from './persist'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Start screen: settings, big timer, controls and device status. */
export function renderStartScreen(root: HTMLElement): void {
  root.innerHTML = `
    <main class="screen" data-phase="idle" data-testid="screen">
      <header><h1>Kata Spike</h1><span class="version" data-testid="version">v${VERSION}</span></header>
      <section class="face" aria-live="off">
        <div class="phase" data-testid="phase">Ready</div>
        <div class="time" data-testid="time">0:00</div>
        <div class="round" data-testid="round">Round 0 / ${DEFAULT_CONFIG.rounds}</div>
      </section>
      <section class="controls">
        <button id="start" data-testid="start">Start</button>
        <button id="pause" data-testid="pause" disabled>Pause</button>
        <button id="stop" data-testid="stop" disabled>Stop</button>
      </section>
      <section class="settings">
        <label>Work (s) <input id="work" type="number" inputmode="numeric" min="1" value="${DEFAULT_CONFIG.workSeconds}" data-testid="work"></label>
        <label>Rest (s) <input id="rest" type="number" inputmode="numeric" min="0" value="${DEFAULT_CONFIG.restSeconds}" data-testid="rest"></label>
        <label>Rounds <input id="rounds" type="number" inputmode="numeric" min="1" value="${DEFAULT_CONFIG.rounds}" data-testid="rounds"></label>
      </section>
      <section class="sound">
        <label class="switch"><input id="sound" type="checkbox" checked data-testid="sound"> Sound on</label>
        <label class="vol">Volume <input id="volume" type="range" min="0" max="1" step="0.05" value="0.7" data-testid="volume"></label>
        <div class="tests">${CUE_NAMES.map((n) => `<button class="test" data-cue="${n}" data-testid="test-${n}">Test ${CUE_LABELS[n].toLowerCase()}</button>`).join('')}</div>
        <p class="note" data-testid="music-note">While testing, check your music: did it pause, duck (get quieter) or keep playing when a beep sounded? Record it on the Results screen.</p>
      </section>
      <section class="status">
        <div>Wake lock: <b data-testid="wakelock">...</b></div>
        <div>Vibration: <b data-testid="vibration">...</b></div>
        <div>Persistent storage: <b data-testid="persist">...</b></div>
      </section>
    </main>
    <div class="pulse" data-testid="pulse" data-active="false" aria-hidden="true"></div>`

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!
  const screen = $('.screen')
  const q = (id: string) => $<HTMLElement>(`[data-testid=${id}]`)
  const num = (id: string, min: number) => Math.max(min, Math.floor(Number($<HTMLInputElement>(`#${id}`).value)) || min)

  const wakeLabels: Record<WakeLockState, string> = { unsupported: 'not supported', idle: 'not held', held: 'HELD', failed: 'FAILED' }
  const wake = createWakeLock((state, detail) => {
    q('wakelock').textContent = wakeLabels[state] + (detail ? ` (${detail})` : '')
  })
  q('vibration').textContent = vibrationSupported() ? 'available' : 'not available'
  const persistLabels: Record<PersistState, string> = { unsupported: 'not supported', granted: 'granted', denied: 'not granted', error: 'error' }
  q('persist').textContent = 'requesting...'
  void requestPersistentStorage().then((s) => (q('persist').textContent = persistLabels[s]))

  const player = createCuePlayer()
  const pulseEl = $<HTMLElement>('.pulse')
  let pulseTimer: ReturnType<typeof setTimeout> | undefined
  const pulse = (cue: CueName) => {
    pulseEl.dataset.cue = cue
    pulseEl.dataset.active = 'true'
    clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => (pulseEl.dataset.active = 'false'), 350)
  }
  $<HTMLInputElement>('#sound').addEventListener('change', (ev) => {
    player.unlock()
    player.setEnabled((ev.target as HTMLInputElement).checked)
  })
  $<HTMLInputElement>('#volume').addEventListener('input', (ev) => player.setVolume(Number((ev.target as HTMLInputElement).value)))
  root.querySelectorAll<HTMLButtonElement>('.test').forEach((b) =>
    b.addEventListener('click', () => {
      const cue = b.dataset.cue as CueName
      player.unlock()
      player.play(cue)
      pulse(cue)
      vibrate(cue === 'beep' ? COUNTDOWN_PATTERN : PHASE_CHANGE_PATTERN)
    }),
  )

  let timer: Timer | null = null
  let interval: ReturnType<typeof setInterval> | undefined

  const render = (s: TimerSnapshot) => {
    const label = s.status === 'paused' ? 'Paused' : s.status === 'finished' ? 'Done' : s.status === 'idle' ? 'Ready' : s.phase?.kind === 'rest' ? 'Rest' : 'Work'
    screen.dataset.phase = s.status === 'running' ? s.phase!.kind : s.status === 'finished' ? 'idle' : s.status === 'paused' ? 'paused' : 'idle'
    q('phase').textContent = label
    q('time').textContent = s.status === 'idle' ? '0:00' : fmt(s.secondsLeft)
    q('round').textContent = `Round ${s.round} / ${s.rounds}`
    $<HTMLButtonElement>('#start').disabled = s.status === 'running' || s.status === 'paused'
    $<HTMLButtonElement>('#pause').disabled = s.status === 'idle' || s.status === 'finished'
    $<HTMLButtonElement>('#pause').textContent = s.status === 'paused' ? 'Resume' : 'Pause'
    $<HTMLButtonElement>('#stop').disabled = s.status === 'idle'
    root.querySelectorAll('input').forEach((i) => (i.disabled = s.status === 'running' || s.status === 'paused'))
  }
  const loop = () => {
    if (timer) render(timer.update())
  }
  const end = () => {
    clearInterval(interval)
    void wake.release()
  }

  $('#start').addEventListener('click', () => {
    player.unlock() // user gesture: allowed to start audio
    timer = createTimer({ workSeconds: num('work', 1), restSeconds: num('rest', 0), rounds: num('rounds', 1) }, () => performance.now())
    timer.on((e) => {
      const p = patternFor(e)
      if (p !== null) vibrate(p)
      const cue = cueFor(e)
      if (cue) {
        player.play(cue)
        pulse(cue)
      }
      if (e.type === 'finish') end()
    })
    void wake.request()
    timer.start()
    clearInterval(interval)
    interval = setInterval(loop, 100)
    loop()
  })
  $('#pause').addEventListener('click', () => {
    if (!timer) return
    const paused = timer.snapshot().status === 'paused'
    if (paused) {
      timer.resume()
      void wake.request()
    } else {
      timer.pause()
      void wake.release()
    }
    loop()
  })
  $('#stop').addEventListener('click', () => {
    timer?.stop()
    end()
    loop()
  })
  document.addEventListener('visibilitychange', loop)
}
