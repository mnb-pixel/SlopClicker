// Light haptic feedback for the main tap button. No-op on web - for a clicker game, this is
// the single highest-value native touch the app can add (see docs/ios-app-konzept.md §3.1).
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

export function tapFeedback() {
  if (!isNative()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}
