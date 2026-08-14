// Persistent key/value storage abstraction for the game save.
//
// Web keeps using raw localStorage, unchanged - this is deliberate, not a shortcut: Capacitor's
// own web fallback for @capacitor/preferences also happens to sit on top of localStorage, but
// under a different key prefix, so routing the web build through it would silently orphan
// every existing player's save on the next deploy (a lookup miss under the new key, not a
// crash - the kind of bug that ships quietly).
//
// Native (iOS) uses @capacitor/preferences instead of localStorage. A WKWebView's localStorage
// can be evicted by iOS under storage pressure - for an idle game where the save IS the
// product, that's not an acceptable risk. Preferences persists to UserDefaults/a file, which
// iOS does not evict the same way. See docs/ios-app-konzept.md §7.
//
// The interface is async on both platforms (even though web's localStorage is sync) so
// callers don't need two code paths.
import { Preferences } from '@capacitor/preferences';

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

export async function getItem(key) {
  if (isNative()) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return null;
  }
}

export async function setItem(key, value) {
  if (isNative()) {
    // Kein try/catch hier: ein Preferences.set()-Fehler soll den Aufrufer erreichen (siehe
    // useGameStore.js saveGame), damit er wie ein localStorage-Fehler behandelt und dem
    // Spieler sichtbar gemeldet wird, statt still zu verhungern.
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function removeItem(key) {
  if (isNative()) {
    await Preferences.remove({ key });
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}
