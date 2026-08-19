// CrazyGames SDK v3 lifecycle glue - see docs.crazygames.com/sdk/game/. Only relevant for
// the --mode crazygames build (see vite.config.js): there, index.html loads the SDK as a
// blocking classic <script> (not async/module) BEFORE main.jsx's deferred module script, so
// window.CrazyGames.SDK is guaranteed to already exist by the time any of this runs - no
// need to wait for a script "load" event. In the regular web/native builds that script tag
// is stripped entirely, so window.CrazyGames stays undefined and every export here is a
// harmless no-op.
export function isCrazyGamesBuild() {
  return typeof window !== 'undefined' && !!window.CrazyGames?.SDK;
}

// Verified live against the real SDK (headless Chrome against the built --mode crazygames
// bundle): calling ANY window.CrazyGames.SDK.game.* method before SDK.init() has resolved
// throws synchronously ("CrazySDK is not initialized yet"), NOT a silent no-op/queued call
// as assumed earlier. Since main.jsx calls reportLoadingStart() at the very top of the
// module - deliberately before init can possibly have resolved yet, to bracket the loading
// screen as early as possible - that throw happened at module top level and killed the rest
// of the script before createRoot().render() ever ran. Every SDK call below is now wrapped
// so a throw (from this or any other future SDK quirk) can never again take the whole app
// down with it - worst case is a console warning, never a stuck page.
function safeSdkCall(fn) {
  if (!isCrazyGamesBuild()) return;
  try {
    fn();
  } catch (e) {
    console.warn('[CrazyGames SDK] call failed:', e);
  }
}

let initPromise = null;

// Required once before any other SDK call (ads, game lifecycle) actually does anything.
// Memoized: React strict mode / multiple callers must not trigger init() twice.
export function initCrazyGamesSdk() {
  if (!isCrazyGamesBuild()) return Promise.resolve(false);
  if (!initPromise) {
    initPromise = window.CrazyGames.SDK.init()
      .then(() => true)
      .catch((e) => {
        console.warn('[CrazyGames SDK] init() failed:', e);
        return false;
      });
  }
  return initPromise;
}

// loadingStart/Stop bracket the initial load - CrazyGames shows its own loading screen
// until loadingStop() fires, so this must run as early as possible (main.jsx, before
// createRoot().render()) and stop right after the app has mounted. Calling this before
// init() has resolved is harmless now (safeSdkCall) even though the SDK itself rejects it -
// see the comment above for why that specific case used to be fatal.
export function reportLoadingStart() {
  safeSdkCall(() => window.CrazyGames.SDK.game.loadingStart());
}

export function reportLoadingStop() {
  safeSdkCall(() => window.CrazyGames.SDK.game.loadingStop());
}

// gameplayStart/Stop tell CrazyGames when it's safe to show a midgame ad (only during a
// "stopped" break, never mid-play). Wired to tab visibility in main.jsx as a first pass -
// tying this to actual menu/modal state instead of just tab-visibility is a possible later
// refinement, not required for submission.
export function reportGameplayStart() {
  safeSdkCall(() => window.CrazyGames.SDK.game.gameplayStart());
}

export function reportGameplayStop() {
  safeSdkCall(() => window.CrazyGames.SDK.game.gameplayStop());
}
