// UMP consent (GDPR) and App Tracking Transparency orchestration - currently all no-ops.
// @capacitor-community/admob wurde aus dem iOS-Build entfernt (siehe nativeAdBridge.js): ohne
// Ad-SDK gibt es weder eine Werbe-Einwilligung einzuholen noch einen Grund, um Tracking-
// Erlaubnis für personalisierte Werbung zu bitten. useGameStore.js ruft diese Funktionen
// weiterhin fire-and-forget auf, sie bleiben deshalb als Stubs bestehen.
export async function ensureAdConsent() {}

export async function showAdPrivacyOptions() {}

export async function requestTrackingIfNeeded() {}
