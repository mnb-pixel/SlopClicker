import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import {
  isCrazyGamesBuild,
  initCrazyGamesSdk,
  reportLoadingStart,
  reportLoadingStop,
  reportGameplayStart,
  reportGameplayStop,
} from './monetization/crazyGamesSdk'

// Marker-Klasse für native-only CSS (siehe .native-app-Regeln in index.css). Das
// Touch-Verhalten eines Clickers (kein Doppeltap-Zoom, keine Auswahl-Lupe, kein Bounce)
// wird bewusst NUR in der App erzwungen - die Web-Version soll sich unverändert wie eine
// normale Webseite verhalten (Pull-to-refresh, Zoom).
if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
  document.documentElement.classList.add('native-app')
}

// Muss VOR dem ersten Render feuern - CrazyGames zeigt bis reportLoadingStop() seinen
// eigenen Ladebildschirm. In den anderen Builds ist das ein No-Op (siehe crazyGamesSdk.js).
reportLoadingStart()

function mount() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

// mount() läuft IMMER sofort, unabhängig von SDK.init() - eine vorige Fassung hat das
// Mounten hinter initCrazyGamesSdk().finally() versteckt ("Data-Module braucht init() zuerst"),
// aber wenn init() in einer Vorschau-/QA-Umgebung aus irgendeinem Grund nie auflöst (hängt statt
// zu resolven/rejecten), feuert .finally() nie und die Seite bleibt für immer auf dem
// statischen Vor-Mount-Fallback aus index.html stehen - genau das ist in der CrazyGames-
// Vorschau passiert. Data-Module/Ad-Aufrufe (storage.js, crazyGamesAdBridge.js) prüfen selbst
// nur, ob window.CrazyGames.SDK existiert (Script bereits geladen) - sie brauchen init() nicht
// zwingend vorher abgeschlossen, das SDK puffert das intern.
mount()

if (isCrazyGamesBuild()) {
  // Timeout-Absicherung: reportLoadingStop()/gameplayStart() sollen auch dann feuern, wenn
  // init() hängt - sonst bleibt CrazyGames' eigener Ladebildschirm über dem bereits
  // spielbaren Spiel liegen.
  const initWithTimeout = Promise.race([
    initCrazyGamesSdk(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ])
  initWithTimeout.finally(() => {
    reportLoadingStop()
    reportGameplayStart()
  })

  // Grobe erste Fassung für "wann läuft gerade gespielt": an Tab-Sichtbarkeit gekoppelt.
  // Eine feinere Anbindung an einzelne Modals/Menüs ist ein möglicher späterer Ausbau,
  // für die Einreichung reicht dieser Stand.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      reportGameplayStop()
    } else {
      reportGameplayStart()
    }
  })
}
