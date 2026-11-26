import { useEffect, useState } from 'react'

/** − value + control. The value can also be typed. */
export function Stepper({ label, value, onChange, min = 0, step = 5, suffix = '' }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; suffix?: string }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = (v: number) => onChange(Math.max(min, Math.round(v)))
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`${label}: less`} onClick={() => commit(value - step)} disabled={value <= min}>−</button>
      <span className="stepper__field">
        <input
          inputMode="numeric"
          aria-label={label}
          value={text}
          onChange={(e) => {
            const t = e.target.value.replace(/\D/g, '')
            setText(t)
            if (t !== '') commit(Number(t))
          }}
          onBlur={() => setText(String(value))}
        />
        {suffix && <span>{suffix}</span>}
      </span>
      <button type="button" aria-label={`${label}: more`} onClick={() => commit(value + step)}>+</button>
    </div>
  )
}
