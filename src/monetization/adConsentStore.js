// Reaktiver Zustand für die Adsterra-Einwilligung (Klaro), getrennt von der eigentlichen
// Klaro-Config/-Bibliothek: AdBanner.jsx, NativeAdBanner.jsx und die Popunder-Gate in App.jsx
// brauchen alle denselben Wert, aber Klaro selbst ist keine React-Komponente und kennt keine
// Hooks - dieses winzige Pub/Sub-Modul ist die Brücke dazwischen. Start: false (kein Consent),
// bis Klaros "adsterra"-Service-Callback (siehe klaroConfig.js) den echten Wert meldet -
// entspricht ohnehin dem korrekten Opt-in-Default vor jeder Nutzerentscheidung.
import { useEffect, useState } from 'react';

let hasConsent = false;
const listeners = new Set();

export function getAdsterraConsent() {
  return hasConsent;
}

export function setAdsterraConsent(value) {
  if (value === hasConsent) return;
  hasConsent = value;
  listeners.forEach((listener) => listener(value));
}

export function subscribeAdsterraConsent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdsterraConsent() {
  const [consent, setConsent] = useState(hasConsent);
  useEffect(() => subscribeAdsterraConsent(setConsent), []);
  return consent;
}
