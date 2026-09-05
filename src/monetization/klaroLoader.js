// Lädt Klaro (Cookie-Consent für Werbung) per dynamic import statt statisch - nur der
// Web-Build braucht es (siehe App.jsx/LegalFooter.jsx, beide gated auf useRoutes), ein
// statischer Import würde die ~66kB (gzip) aber auch der nativen App und dem CrazyGames-
// Build aufbürden, die dieselbe App.jsx/LegalFooter.jsx mitbauen, ohne sie je aufzurufen.
// Ein gecachtes Promise statt pro Aufruf neu zu importieren, damit initKlaro() (App.jsx,
// beim Mount) und showKlaroManager() (LegalFooter.jsx, bei Klick) sich dasselbe bereits
// geladene Modul teilen statt es doppelt anzufordern.
import klaroConfig from './klaroConfig';

let klaroModulePromise = null;

function loadKlaroModule() {
  if (!klaroModulePromise) {
    klaroModulePromise = Promise.all([
      import('klaro/dist/klaro-no-css'),
      import('klaro/dist/klaro.css'),
    ]).then(([klaroModule]) => klaroModule);
  }
  return klaroModulePromise;
}

export function initKlaro() {
  loadKlaroModule().then((Klaro) => Klaro.setup(klaroConfig));
}

export function showKlaroManager() {
  loadKlaroModule().then((Klaro) => Klaro.show(klaroConfig, true));
}
