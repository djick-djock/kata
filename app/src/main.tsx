import '@fontsource-variable/outfit/wght.css'
import '@fontsource-variable/inter/wght.css'
import './ui/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { requestPersistentStorage } from './platform/persist'
import { registerServiceWorker } from './platform/pwa'

void requestPersistentStorage()
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
