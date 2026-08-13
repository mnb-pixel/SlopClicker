// Native foreground/background lifecycle signal, supplementing the existing
// document.visibilitychange/focus/blur tracking in useGameStore.js.
//
// A WKWebView's document.visibilitychange does not reliably fire when the surrounding iOS
// app is actually backgrounded (home button, app switcher) - it's a web-page-lifecycle
// signal being asked to describe a native app-lifecycle transition it isn't always told
// about. @capacitor/app's appStateChange comes straight from UIApplication and is the
// reliable signal on iOS. See docs/ios-app-konzept.md §7.
//
// This is deliberately additive, not a replacement: on web this is a no-op (the existing
// listeners already cover it there), and on native it's one more trigger that re-runs the
// same visibility check rather than a parallel state machine.
import { App } from '@capacitor/app';

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

// onChange receives `isActive: boolean` (true = foreground, false = background). Returns an
// unsubscribe function; safe to call even if the native listener never attached (web).
export function subscribeNativeAppState(onChange) {
  if (!isNative()) return () => {};
  const listenerPromise = App.addListener('appStateChange', ({ isActive }) => onChange(isActive));
  return () => {
    listenerPromise.then((handle) => handle.remove()).catch(() => {});
  };
}
