// Entscheidet einmalig beim Start, ob die 3D-Insel laufen kann. Ohne WebGL (sehr alte
// Browser, abgeschaltete Hardwarebeschleunigung in manchen Firmenumgebungen) fällt das
// Spiel auf die alte Button-Ansicht zurück (Header, Tabs, GPU-Button, Icon-Liste).
let cached = null;

export function hasWebGL() {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    cached = Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
}
