import { useEffect } from 'react';
import { Play, ExternalLink, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { SeoContent } from '../components/SeoContent';
import { AdBanner } from '../components/AdBanner';
import { initKlaro, showKlaroManager } from '../monetization/klaroLoader';

// Nur Deutsch, kein Sprachumschalter - wie DatenschutzPage.jsx: diese Seite hat keinen
// Spielzustand (kein useGameStore), also auch keinen store.lang. TRANSLATIONS.de direkt
// statt der vollen i18n-Maschinerie, damit SeoContent (unten) dieselben, bereits
// vorhandenen Übersetzungstexte wiederverwenden kann statt sie zu duplizieren.
const t = (key) => TRANSLATIONS.de[key] ?? key;

// Landingpage unter "/" (siehe main.jsx/routes.js): eigenständige, textlastige Seite mit dem
// eigentlichen Spiel als <iframe src="/play"> - NICHT mehr das Spiel selbst. Grund: Google
// AdSense lehnte token-furnace.com wiederholt als "low value content" ab, obwohl unter "/"
// bereits echter Text stand (siehe SeoContent.jsx/routes.js) - ein Review sieht auf "/" aber
// zuerst das Spiel-UI selbst, den Text erst weit darunter. Mit dieser Trennung ist "/" eine
// normale Content-Seite (Anleitung, FAQ, Investoren-Prospekt) mit dem Spiel als EINEM
// Element darauf, nicht als einzigem Inhalt - Standardmuster bei HTML5-Game-Portalen.
// Gleicher Origin wie /play: das iframe ist same-origin (kein Cross-Origin-postMessage
// nötig), _headers erlaubt Self-Framing bereits ("frame-ancestors 'self'").
export function LandingPage() {
  useEffect(() => {
    document.title = 'Token Furnace – Der AI-Bubble Idle Clicker';
    initKlaro();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <header className="text-center flex flex-col gap-3 pt-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Token Furnace <span className="text-cyan-400">– Der AI-Bubble Idle Clicker</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('aboutText')}
          </p>
          <a
            href="#play"
            className="inline-flex items-center gap-2 self-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <Play className="w-4 h-4" /> Jetzt kostenlos spielen
          </a>
        </header>

        <AdBanner variant="leaderboard" label={t('adPlaceholderLabel')} />

        {/* Same-origin iframe statt direktem Mount: /play ist die vollständige Spiel-SPA
            (main.jsx mountGame(), eigene Tab-Routen via routes.js) - unverändert gegenüber
            vorher, nur unter neuem Pfad statt an der Domain-Wurzel. */}
        <section id="play" className="flex flex-col gap-2 scroll-mt-4">
          <div className="w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
            <iframe
              src="/play"
              title="Token Furnace spielen"
              className="w-full block"
              style={{ height: '80vh', minHeight: 480, border: 0 }}
              allow="autoplay"
            />
          </div>
          <a
            href="/play"
            className="inline-flex items-center gap-1.5 self-center text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Spiel im Vollbild in diesem Tab öffnen
          </a>
        </section>

        <AdBanner variant="rectangle" label={t('adPlaceholderLabel')} />

        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 text-sm text-slate-300 leading-relaxed">
          <SeoContent t={t} lang="de" section="all" />
        </div>

        <footer className="text-center text-[11px] text-slate-500 my-4 space-y-2">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/impressum"
              className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              {t('legalImprint')}
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="/datenschutz"
              className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              {t('legalPrivacy')}
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => showKlaroManager()}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              <ShieldCheck className="w-3 h-3" /> Werbe-Cookie-Einstellungen
            </button>
          </div>
          <div>{t('footerPrivacy')}</div>
        </footer>
      </div>
    </div>
  );
}
