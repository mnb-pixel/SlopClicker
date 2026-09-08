import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { findSiteRoute } from './site/siteRoutes.js'
import {
  isCrazyGamesBuild,
  initCrazyGamesSdk,
  reportLoadingStart,
  reportLoadingStop,
  reportGameplayStart,
  reportGameplayStop,
} from './monetization/crazyGamesSdk'

const rootEl = document.getElementById('root')

// Zwei Welten in einem Bundle: die Content-Website (src/site/, "/" und die Unterseiten aus
// siteRoutes.js) und das Spiel (App.jsx unter /play/*). Beide werden bewusst NUR per
// dynamischem import() geladen, damit Vite sie in getrennte Chunks aufteilt - ein Aufruf
// von /anleitung lädt nie das Spiel-Bundle, /play nie die Content-Seiten.
//
// Web-Build: die Content-Seiten liegen als vorgerendertes HTML in dist/ (scripts/
// prerender.mjs), hier wird nur noch hydratisiert. Dev-Server: #root ist leer -> normal
// rendern. Nativer Build und CrazyGames gehen IMMER direkt ins Spiel: der Capacitor-WebView
// lädt das Bundle unter dem Pfad "/" - ohne diesen Guard bekäme die iOS-App die Startseite
// der Website statt des Spiels. crazyGamesSdk bleibt statischer Import:
// reportLoadingStart() muss so früh wie möglich feuern (siehe dort), das Modul zieht keinen
// Spielcode mit.
const isNativePlatform = !!window.Capacitor?.isNativePlatform?.()
const siteRoute = isNativePlatform || isCrazyGamesBuild() ? null : findSiteRoute(window.location.pathname)

if (siteRoute) {
  siteRoute.load().then((Page) => {
    const tree = (
      <StrictMode>
        <ErrorBoundary>
          <Page />
        </ErrorBoundary>
      </StrictMode>
    )
    // firstElementChild statt hasChildNodes(): ohne Prerender (Dev-Server, oder ein Build
    // nur per `vite build` statt `npm run build`) enthält #root nur den Marker-Kommentar aus
    // index.html - der zählt als Kindknoten, ist aber nichts, worauf sich hydratisieren ließe.
    if (rootEl.firstElementChild) {
      hydrateRoot(rootEl, tree)
    } else {
      createRoot(rootEl).render(tree)
    }
    document.title = siteRoute.title
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
      if (isNativePlatform) {
        document.documentElement.classList.add('native-app')
      }

      // Das SPA-Fallback-HTML für /play/* ist im Web-Build eine vorgerenderte Content-Seite
      // (siehe prerender.mjs): deren Canonical-Link gilt fürs Spiel nicht, und der
      // vorgerenderte Inhalt weicht dem Spiel.
      document.querySelector('link[rel="canonical"]')?.remove()
      rootEl.replaceChildren()

      // Muss VOR dem ersten Render feuern - CrazyGames zeigt bis reportLoadingStop() seinen
      // eigenen Ladebildschirm. In den anderen Builds ist das ein No-Op (siehe crazyGamesSdk.js).
      reportLoadingStart()

      createRoot(rootEl).render(
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
