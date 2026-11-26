import { Route, Routes } from 'react-router-dom'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { Exercises } from './screens/Exercises'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { LogActivity } from './screens/LogActivity'
import { Play } from './screens/Play'
import { RoutineBuilder } from './screens/RoutineBuilder'
import { Routines } from './screens/Routines'
import { SessionComplete } from './screens/SessionComplete'
import { SessionDetails } from './screens/SessionDetails'
import { Settings } from './screens/Settings'
import { Shell } from './ui/Shell'
import { Toaster } from './ui/Toast'

export function App() {
  return (
    <>
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="routines" element={<Routines />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="exercises/:id" element={<ExerciseDetail />} />
      <Route path="routines/:id" element={<RoutineBuilder />} />
      <Route path="play/:routineId" element={<Play />} />
      <Route path="history/:sessionId" element={<SessionDetails />} />
      <Route path="session-complete" element={<SessionComplete />} />
      <Route path="log" element={<LogActivity />} />
      <Route path="log/:id" element={<LogActivity />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Shell />}>
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
    <Toaster />
    </>
  )
}
