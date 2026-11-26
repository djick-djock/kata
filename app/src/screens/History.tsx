import { Empty } from '../ui/Empty'
import { ScreenHeader } from '../ui/ScreenHeader'

export function History() {
  return (
    <>
      <ScreenHeader title="History" />
      <Empty title="No sessions yet">Finished sessions will show up here.</Empty>
    </>
  )
}
