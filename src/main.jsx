import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import {
  isCrazyGamesBuild,
  initCrazyGamesSdk,
  reportLoadingStart,
  reportLoadingStop,
  reportGameplayStart,
  reportGameplayStop,
} from './monetization/crazyGamesSdk'

const root = createRoot(document.getElementById('root'))

// /datenschutz ist eine eigenständige Seite (DatenschutzPage.jsx), kein Teil des
// Spiel-SPA-Zustands - siehe MiscTab.jsx/DesktopView.jsx, die dorthin bewusst mit einem
// echten <a href> statt einem <Link> verlinken (voller Seitenaufruf, kein Client-Routing).
// App.jsx (useGameStore + alle Tabs) und react-router-dom werden hier bewusst NUR per
// dynamischem import() geladen (statt oben statisch), damit Vite beide Zweige in
// getrennte Chunks aufteilt: ein Aufruf/Reload von /datenschutz lädt dadurch wirklich
// nur den kleinen DatenschutzPage-Chunk, nie das komplette Spiel-Bundle. crazyGamesSdk
// bleibt bewusst ein normaler statischer Import oben - das Modul zieht kein Spielcode mit
// (nur SDK-Glue, siehe dort) und reportLoadingStart() muss weiterhin so früh wie möglich
// feuern (siehe Kommentar dort).
const isDatenschutzRoute =
  typeof window !== 'undefined' && window.location.pathname === '/datenschutz'

if (isDatenschutzRoute) {
  import('./pages/DatenschutzPage.jsx').then(({ DatenschutzPage }) => {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <DatenschutzPage />
        </ErrorBoundary>
      </StrictMode>,
    )
  })
} else {
  mountGame()
}

function mountGame() {
  Promise.all([import('react-router-dom'), import('./App.jsx')]).then(
    ([{ BrowserRouter }, { default: App }]) => {
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

      root.render(
        <StrictMode>
          <ErrorBoundary>
            {/* Immer aktiv, auch in CrazyGames/nativ - reine Client-Navigation über die
                History API, keine echte Seitennavigation. App.jsx entscheidet selbst (per
                useRoutes-Flag, siehe dort), ob NavBar echte URLs nutzt oder wie bisher rein
                über React-State schaltet - hier ist der Provider nur immer vorhanden, damit
                useLocation() in App.jsx unabhängig vom Build-Modus als Hook aufgerufen
                werden darf (Rules of Hooks: kann nicht bedingt aufgerufen werden). */}
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ErrorBoundary>
        </StrictMode>,
      )

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
    },
  )
}
