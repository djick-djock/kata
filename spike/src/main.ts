import './styles.css'
import { registerServiceWorker } from './pwa'
import { renderStartScreen } from './start-screen'
import { renderResultsScreen } from './results-screen'

const app = document.getElementById('app')!
app.innerHTML = `
  <nav class="tabs">
    <button data-tab="timer" data-testid="tab-timer" aria-pressed="true">Timer</button>
    <button data-tab="results" data-testid="tab-results" aria-pressed="false">Results</button>
  </nav>
  <div id="pane-timer"></div>
  <div id="pane-results" hidden></div>`
// Both panes stay mounted so the timer keeps running while viewing results.
renderStartScreen(app.querySelector('#pane-timer')!)
renderResultsScreen(app.querySelector('#pane-results')!)
app.querySelectorAll<HTMLButtonElement>('.tabs button').forEach((b) =>
  b.addEventListener('click', () => {
    app.querySelectorAll<HTMLButtonElement>('.tabs button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)))
    app.querySelector<HTMLElement>('#pane-timer')!.hidden = b.dataset.tab !== 'timer'
    app.querySelector<HTMLElement>('#pane-results')!.hidden = b.dataset.tab !== 'results'
  }),
)
registerServiceWorker()
