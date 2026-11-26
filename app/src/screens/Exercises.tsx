import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allExercises, CATEGORIES, drawingFor, localized, TAGS, type Category, type Tag } from '../catalog'
import { Drawing } from '../ui/Drawing'
import { SearchIcon } from '../ui/Icons'
import { ScreenHeader } from '../ui/ScreenHeader'
import { CATEGORY_LABEL, formatMeasure } from './exercise-format'
import './exercises.css'

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

export function Exercises() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [tag, setTag] = useState<Tag | null>(null)

  const exercises = allExercises()
  const usedTags = useMemo(() => TAGS.filter((t) => exercises.some((e) => e.tags.includes(t))), [exercises])
  const shown = useMemo(() => {
    const q = norm(query)
    return exercises.filter(
      (e) =>
        (!category || e.category === category) &&
        (!tag || e.tags.includes(tag)) &&
        (!q || Object.values(e.name).some((n) => norm(n).includes(q))),
    )
  }, [exercises, query, category, tag])

  return (
    <>
      <ScreenHeader title="Exercises" />
      <label className="search">
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" aria-label="Search exercises" />
      </label>
      <div className="chips" role="group" aria-label="Category">
        <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
            <span className="dot" style={{ background: `var(--color-category-${c === 'meditation' ? 'mobility' : c})` }} />
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="chips chips--tags" role="group" aria-label="Tag">
        {usedTags.map((t) => (
          <button key={t} type="button" className="chip chip--small" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
            {t}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="no-match">No exercise matches. Try another search or clear a filter.</p>
      ) : (
        <ul className="grid">
          {shown.map((e) => (
            <li key={e.id}>
              <Link to={`/exercises/${e.id}`} className="tile">
                <div className="tile__art">
                  <Drawing svg={drawingFor(e.id)} category={e.category} label={localized(e.name)} />
                </div>
                <span className="tile__name">{localized(e.name)}</span>
                <span className="tile__meta">
                  <span className="dot" style={{ background: `var(--color-category-${e.category === 'meditation' ? 'mobility' : e.category})` }} />
                  {CATEGORY_LABEL[e.category]} · {formatMeasure(e.measure, e.perSide)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
