// Reaktiver Zustand für die Werbe-Cookie-Einwilligung (Klaro), getrennt von der eigentlichen
// Klaro-Config/-Bibliothek: eine künftige Ad-Komponente braucht denselben Wert, Klaro selbst
// ist aber keine React-Komponente und kennt keine Hooks - dieses winzige Pub/Sub-Modul ist
// die Brücke dazwischen. Start: false (kein Consent), bis Klaros "advertising"-Service-
// Callback (siehe klaroConfig.js) den echten Wert meldet - entspricht ohnehin dem korrekten
// Opt-in-Default vor jeder Nutzerentscheidung.
//
// Aktuell von KEINER Komponente konsumiert (kein aktives Ad-Netzwerk, siehe AdBanner.jsx) -
// bleibt bestehen, damit ein künftiger Anbieter die Consent-Basis direkt nutzen kann statt
// sie neu zu bauen.
import { useEffect, useState } from 'react';

let hasConsent = false;
const listeners = new Set();

export function getAdConsent() {
  return hasConsent;
}

export function setAdConsent(value) {
  if (value === hasConsent) return;
  hasConsent = value;
  listeners.forEach((listener) => listener(value));
}

export function subscribeAdConsent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdConsent() {
  const [consent, setConsent] = useState(hasConsent);
  useEffect(() => subscribeAdConsent(setConsent), []);
  return consent;
}
