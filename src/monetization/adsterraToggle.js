// Temporärer Kill-Switch für die komplette Adsterra-Anbindung (Banner, Native Banner,
// Popunder) - das Netzwerk wirkte zu "shady", vorerst auf Eis gelegt. Klaro/Cookie-Consent
// bleibt bewusst UNBERÜHRT: Der Banner erscheint weiter, Einwilligungen werden weiter
// gespeichert (siehe klaroConfig.js/adConsentStore.js) - nur die tatsächliche
// Skript-Einbindung ist deaktiviert, unabhängig vom Consent-Status. Einfach wieder auf
// true stellen, sobald ein Anbieter feststeht, mit dem alle einverstanden sind.
export const ADSTERRA_ENABLED = false;
