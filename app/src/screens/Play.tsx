import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BackIcon } from '../ui/Icons'

/** Stub: the player arrives in ticket 05. */
export function Play() {
  const { routineId = '' } = useParams()
  const [params] = useSearchParams()
  return (
    <div className="detail">
      <div className="detail__scroll">
        <div className="detail__bar"><Link to={`/routines/${routineId}`} className="icon-btn" aria-label="Back"><BackIcon /></Link></div>
        <h1 className="detail__title">Player</h1>
        <p className="no-match">The player arrives soon. Mode: {params.get('mode') === 'step' ? 'step by step' : 'play all'}.</p>
      </div>
    </div>
  )
}
