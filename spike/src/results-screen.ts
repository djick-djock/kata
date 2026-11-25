import { CHECKS, loadResults, resultsToText, saveResults, type Verdict } from './results'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Results checklist: pass/fail/untested per check, device fields, persisted locally, copyable as text. */
export function renderResultsScreen(root: HTMLElement): void {
  const r = loadResults()
  const verdicts: Verdict[] = ['untested', 'pass', 'fail']
  root.innerHTML = `
    <section class="results" data-testid="results">
      <h2>Results</h2>
      ${CHECKS.map(
        (c) => `<fieldset class="check"><legend>${c.label}</legend><div class="seg">${verdicts
          .map((v) => `<label class="v-${v}"><input type="radio" name="chk-${c.id}" value="${v}" data-testid="chk-${c.id}-${v}"${r.checks[c.id] === v ? ' checked' : ''}><span>${v}</span></label>`)
          .join('')}</div></fieldset>`,
      ).join('')}
      <label class="field">Phone model <input id="f-phone" data-testid="f-phone" value="${esc(r.phone)}" autocomplete="off"></label>
      <label class="field">Android version <input id="f-android" data-testid="f-android" value="${esc(r.android)}" autocomplete="off"></label>
      <label class="field">Music app <input id="f-music" data-testid="f-music" value="${esc(r.music)}" autocomplete="off"></label>
      <button id="copy" data-testid="copy">Copy results as text</button>
      <div class="copied" data-testid="copy-status" aria-live="polite"></div>
      <textarea id="copy-fallback" data-testid="copy-fallback" readonly hidden rows="9"></textarea>
    </section>`

  const input = (id: string) => root.querySelector<HTMLInputElement>(id)!
  const collect = () => {
    for (const c of CHECKS) {
      const sel = root.querySelector<HTMLInputElement>(`input[name=chk-${c.id}]:checked`)
      r.checks[c.id] = (sel?.value as Verdict) ?? 'untested'
    }
    r.phone = input('#f-phone').value
    r.android = input('#f-android').value
    r.music = input('#f-music').value
    return r
  }
  const save = () => void saveResults(collect())
  root.addEventListener('change', save)
  root.addEventListener('input', save)

  const status = root.querySelector<HTMLElement>('[data-testid=copy-status]')!
  const fallback = root.querySelector<HTMLTextAreaElement>('#copy-fallback')!
  root.querySelector('#copy')!.addEventListener('click', async () => {
    const text = resultsToText(collect())
    saveResults(r)
    try {
      await navigator.clipboard.writeText(text)
      fallback.hidden = true
      status.textContent = 'Copied.'
    } catch {
      fallback.hidden = false
      fallback.value = text
      fallback.focus()
      fallback.select()
      status.textContent = 'Clipboard unavailable: text selected, copy it manually.'
    }
  })
}
