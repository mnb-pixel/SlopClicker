import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

// Marker-Klasse für native-only CSS (siehe .native-app-Regeln in index.css). Das
// Touch-Verhalten eines Clickers (kein Doppeltap-Zoom, keine Auswahl-Lupe, kein Bounce)
// wird bewusst NUR in der App erzwungen - die Web-Version soll sich unverändert wie eine
// normale Webseite verhalten (Pull-to-refresh, Zoom).
if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
  document.documentElement.classList.add('native-app')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
