import React from 'react';
import { Play, Sparkles, Truck, Home, Cpu, Layers, ArrowRight } from 'lucide-react';
import { VoxelSiteLayout } from '../VoxelSiteLayout.jsx';
import { VOXEL_PLAY_URL, PLAY_URL } from '../ui.jsx';
import { VoxelIcon } from '../../components/scene3d/voxelIcons.jsx';

// Die 8 markantesten Showcase-Engines für die Voxel-Galerie
const VOXEL_SHOWCASE_ENGINES = [
  { id: 'prompt_intern', name: 'Prompt-Praktikant', desc: 'Schreibtisch mit Hoodie, Kaffeetasse, Schwenklampe und Tastatur.', tier: 1 },
  { id: 'prompt_engineer', name: 'Prompt-Engineer', desc: 'Dual-Monitor-Setup mit Matrix-Code, Noise-Cancelling-Kopfhörern und Energy-Drink.', tier: 2 },
  { id: 'gpu_rack', name: 'GPU Server Rack', desc: '42HE Serverschrank mit NVLink-Busbars und Status-LED-Leiste.', tier: 2 },
  { id: 'token_burner', name: 'Token Burner', desc: 'Industrieller Verbrennungsofen mit Flammenkern und glühenden Münzen.', tier: 1 },
  { id: 'thought_leader', name: 'Thought Leader', desc: 'Steve-Jobs-Rollkragen, Keynote-Rednerpult und riesige Videowand.', tier: 3 },
  { id: 'vc_firm', name: 'VC-Glasturm', desc: 'Monolithischer Glasturm mit Helikopter-Landeplatz und Penthouse.', tier: 2 },
  { id: 'nuclear_reactor', name: 'Atomreaktor', desc: 'Tokamak-Reaktorkammer mit Cherenkov-blauem Kühlwasserbecken.', tier: 3 },
  { id: 'singularity', name: 'Singularität', desc: 'Konzentrische Dyson-Ringe mit rotierendem Gravitations-Kern.', tier: 3 },
];

export function VoxelHomePage() {
  return (
    <VoxelSiteLayout>
      {/* 1. HERO SECTION */}
      <section className="text-center py-6 sm:py-12 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-6">
          <span className="voxel-led-dot" />
          <span className="font-mono text-xs font-black tracking-widest text-cyan-300 uppercase">
            3D VOXEL EDITION JETZT SPIELBAR
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white leading-tight max-w-3xl mx-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          TOKEN FURNACE IN{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-400 bg-clip-text text-transparent">
            VOLLER 3D-VOXEL-GRAFIK
          </span>
        </h1>

        <div className="mt-4 mx-auto h-1 w-28 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 rounded-full" />

        <p className="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
          Erlebe den satirischen AI-Bubble Idle Clicker aus einer völlig neuen Perspektive:
          Ein plastischer 3D-Campus, ein idyllisches Vorortdorf am Fluss, der rauchende
          Server-Kamin mit GPU-Express-Laster und 20 handgefertigte Micro-Voxel-Engines.
        </p>

        {/* Action Button: Führt direkt zum Voxel-Spiel */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={VOXEL_PLAY_URL}
            className="voxel-btn px-8 py-4 text-base sm:text-lg font-mono font-black tracking-wider text-white shadow-[0_0_25px_rgba(6,182,212,0.7)]"
          >
            <Play className="w-5 h-5 fill-cyan-300 text-cyan-300" />
            <span>Im Browser spielen (3D Voxel)</span>
            <span className="voxel-led-dot ml-1" />
          </a>
          <a
            href={PLAY_URL}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Lieber Classic 2D spielen <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="mt-3 text-xs text-slate-500 font-mono">
          Kein Download, kein Account • Gleicher Spielstand wie in der 2D-Version
        </p>
      </section>

      {/* 2. STATS / FACTS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-10 font-mono">
        {[
          { val: '20', label: 'Micro-Voxel Engines' },
          { val: '89', label: 'Gemütliche Dorfhäuser' },
          { val: '100%', label: 'Synchroner Spielstand' },
          { val: '0 €', label: 'Kostenlos im Browser' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-cyan-500/30 bg-slate-900/70 p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          >
            <span className="block text-2xl sm:text-3xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
              {item.val}
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* 3. HIGHLIGHT-FEATURES */}
      <section className="my-16">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
            [ NEUE 3D-FEATURE-HIGHLIGHTS ]
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-mono text-white mt-1">
            DIE VOXEL-WELT IM DETAIL
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-white mb-2">360° Vorortdorf & Fluss</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              89 lückenlos verifizierte Einfamilienhäuser mit Giebeldächern, Schornsteinen, Vorgartenzäunen
              und parkenden Autos säumen den Campus. Keine hässlichen Riesenhochhäuser – eine harmonische
              Miniaturwelt mit Bogenbrücke und See.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-white mb-2">GPU-Express-Einsatz</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Läuft der Server-Kamin heiß (100°C Meltdown), fährt ein animierter Lieferwagen mit
              Warnleuchten die freie Kamin-Allee hinauf, entlädt frische GPU-Racks und kühlt den Schlot
              in einer 45-Sekunden-Rettungssequenz ab.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-white mb-2">Vollständiger Spielstand</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Du verlierst keinen Cent: Die Voxel-Edition greift auf exakt denselben Spielstand zu wie
              die 2D-Version. Jeder Klick, jedes Upgrade und jede Bewertung überträgt sich 1:1 in
              Echtzeit in die 3D-Welt.
            </p>
          </div>
        </div>
      </section>

      {/* 4. MICRO-VOXEL ENGINES SHOWCASE */}
      <section className="my-16">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
            [ HANDGEFERTIGTE VOXEL-KUNST ]
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-mono text-white mt-1">
            20 DETAILREICHE MICRO-VOXEL ENGINES
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2 font-mono">
            Jedes Gebäude wurde aus feinsten Voxel-Steinen (0.6px – 1.5px) zusammengesetzt und besitzt
            thematische Requisiten und eine 4-stufige visuelle Gold-Progression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOXEL_SHOWCASE_ENGINES.map((eng) => (
            <div
              key={eng.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 flex flex-col items-center text-center hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="w-24 h-24 flex items-center justify-center bg-slate-950/80 rounded-lg border border-slate-800 p-2 mb-3 shadow-inner group-hover:scale-105 transition-transform">
                <VoxelIcon buildingId={eng.id} tier={eng.tier} size={64} />
              </div>
              <h4 className="font-mono font-black text-sm text-slate-100 mb-1">{eng.name}</h4>
              <p className="text-xs text-slate-400 leading-normal">{eng.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="my-16 p-8 sm:p-12 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950 text-center relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.25)]">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black font-mono text-white mb-4">
            BEREIT FÜR DEN 3D-CAMPUS?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Starte die Voxel-Edition direkt in deinem Browser. Keine Installation, kein Konto –
            dein KI-Startup erwacht in isometrischer 3D-Pracht zum Leben.
          </p>
          <a
            href={VOXEL_PLAY_URL}
            className="voxel-btn px-10 py-5 text-lg font-mono font-black tracking-wider text-white shadow-[0_0_30px_rgba(6,182,212,0.8)]"
          >
            <Play className="w-6 h-6 fill-cyan-300 text-cyan-300" />
            <span>Jetzt Voxel 3D Spielen</span>
            <span className="voxel-led-dot ml-1" />
          </a>
        </div>
      </section>
    </VoxelSiteLayout>
  );
}
