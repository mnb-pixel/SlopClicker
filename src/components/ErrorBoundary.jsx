import React from 'react';

// Ohne das: ein Render-Fehler irgendwo im Baum (z.B. ein kaputter Save-State nach einem
// zukünftigen Änderung an der Save-Struktur, oder ein Edge-Case in einer der ~1000
// Content-Strings) reißt die GESAMTE App runter - React unmountet den kompletten Tree,
// der Nutzer sieht eine leere weiße Seite ohne jede Erklärung, und es gibt keinerlei
// Hinweis, was passiert ist (weder für den Nutzer noch für uns).
//
// Absichtlich als eigenständige Komponente statt inline in App.jsx: React Error Boundaries
// MÜSSEN Klassenkomponenten sein (componentDidCatch/getDerivedStateFromError haben aktuell
// kein Hook-Äquivalent), unabhängig vom Rest der Codebasis, der durchgehend Function
// Components nutzt.
//
// Kein externer Fehler-Tracking-Dienst angebunden (siehe console.error unten) - das würde
// einen Account bei einem Anbieter wie Sentry voraussetzen. Der Hook-Punkt ist bewusst an
// einer Stelle: einen echten SDK-Call hier in componentDidCatch ergänzen, sobald einer
// existiert, deckt dann automatisch die gesamte App ab.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Landet im Browser-Devtools-Log - ohne verbundenen Fehler-Tracking-Dienst der einzige
    // Ort, an dem das aktuell sichtbar wird.
    console.error('Unerwarteter Fehler, App-Baum abgefangen von ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-sm w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 text-center shadow-2xl">
          <div className="text-3xl mb-2">📉</div>
          <h1 className="font-black text-lg uppercase tracking-wide text-rose-300 mb-2">
            Unerwarteter Absturz
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Etwas ist schiefgelaufen. Dein Spielstand liegt sicher im Browser - ein Neuladen
            behebt das in der Regel.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-rose-500 text-slate-950 hover:bg-rose-400 active:scale-95 transition-all"
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }
}
