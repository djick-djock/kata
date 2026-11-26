import type { Feel } from '../data/sessions'
import '../screens/complete.css'

const FEELS: { value: Feel; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'good', label: 'Good' },
  { value: 'hard', label: 'Hard' },
]

/** "How did it feel?" Easy / Good / Hard. Tapping the chosen one again clears it. */
export function FeelChooser({ feel, onPick }: { feel: Feel | undefined; onPick: (f: Feel) => void }) {
  return (
    <div className="complete__feel" role="group" aria-label="How did it feel? (optional)">
      <p className="complete__q">How did it feel? (optional)</p>
      <div className="complete__opts">
        {FEELS.map((f) => (
          <button key={f.value} type="button" className="complete__opt" aria-pressed={feel === f.value} onClick={() => onPick(f.value)}>{f.label}</button>
        ))}
      </div>
    </div>
  )
}
