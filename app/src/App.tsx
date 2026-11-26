import { Route, Routes } from 'react-router-dom'
import { Exercises } from './screens/Exercises'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { Routines } from './screens/Routines'
import { Settings } from './screens/Settings'
import { Shell } from './ui/Shell'

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="routines" element={<Routines />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Shell />}>
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
