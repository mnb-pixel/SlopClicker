import { Play } from 'lucide-react';
import { SiteLayout } from '../SiteLayout.jsx';
import { AdBanner } from '../../components/AdBanner';
import { VoxelButton } from '../components/VoxelButton.jsx';
import { HOME } from '../content/home.content.js';
import {
  Kicker,
  Section,
  Prose,
  Paragraphs,
  FeatureRow,
  Steps,
  FaqItems,
  PhoneShot,
  AppStoreBadge,
  PageEnd,
  BTN_PRIMARY,
  PLAY_URL,
} from '../ui.jsx';

// Startseite "/" (siehe siteRoutes.js): reine Content-Seite über das Spiel - das Spiel selbst
// läuft unter /play und ist hier nur verlinkt, nicht eingebettet. Hintergrund: AdSense lehnte
// die Seite mehrfach als "low value content" ab, solange "/" in erster Linie das Spiel-UI
// zeigte (zuletzt als Iframe mit Text darunter). Jetzt ist "/" eine normale, textstarke Seite
// mit Screenshots, Anleitung, FAQ und weiterführenden Unterseiten.
export function HomePage() {
  const h = HOME;
  return (
    <SiteLayout path="/" wide>
      <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
        <div>
          <Kicker>{h.hero.kicker}</Kicker>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 leading-[1.08]">
            {h.hero.title}
          </h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-transparent" />
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">{h.hero.lead}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href={PLAY_URL} className={`${BTN_PRIMARY} text-base px-6 py-3`}>
              <Play className="w-5 h-5" /> Im Browser spielen
            </a>
            <VoxelButton variant="hero" />
            <AppStoreBadge />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Kein Konto, keine Installation, keine Kosten. Als iOS-App unter dem Namen „Tokenkamin: AI Clicker“.
          </p>
        </div>
        <PhoneShot src="/screenshots/core.webp" alt={h.hero.shotAlt} priority className="justify-self-center" />
      </section>

      <ul className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {h.facts.map((fact) => (
          <li key={fact.label} className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-center">
            <span className="block text-2xl font-black font-mono text-cyan-300">{fact.value}</span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{fact.label}</span>
          </li>
        ))}
      </ul>

      <div className="max-w-3xl">
        <Section id="was-ist-token-furnace" title={h.about.title}>
          <Prose>
            <Paragraphs items={h.about.paragraphs} keyPrefix="about" />
          </Prose>
        </Section>
      </div>

      <div className="mt-10">
        <AdBanner variant="leaderboard" label="Werbung" />
      </div>

      {h.features.map((feature) => (
        <FeatureRow key={feature.id} {...feature} />
      ))}

      <div className="max-w-3xl">
        <Section id="so-spielst-du" title={h.howTo.title}>
          <Steps items={h.howTo.steps} />
        </Section>

        <Section id="kurz-gefragt" title={h.faq.title}>
          <FaqItems items={h.faq.items} />
          <p className="mt-5 text-sm">
            <a href="/faq" className="site-link">
              Alle häufigen Fragen und Antworten
            </a>
          </p>
        </Section>

        <Section id="satire" title={h.satire.title}>
          <Prose>
            <Paragraphs items={h.satire.paragraphs} keyPrefix="satire" />
          </Prose>
        </Section>

        <PageEnd next={h.next} ctaText="Kein Konto, keine Installation – der erste Prompt-Praktikant wartet bei 15 Dollar." />
      </div>
    </SiteLayout>
  );
}
