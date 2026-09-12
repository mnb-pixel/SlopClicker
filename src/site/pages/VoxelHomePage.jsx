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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fffdf6] border-2 border-[#c8bb9f] shadow-[0_2px_0_#c8bb9f] mb-6">
          <span className="voxel-led-dot" />
          <span className="font-mono text-xs font-black tracking-widest text-[#2f855a] uppercase">
            3D VOXEL EDITION JETZT SPIELBAR
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-[#22313f] leading-tight max-w-3xl mx-auto drop-shadow-sm">
          TOKEN FURNACE IN{' '}
          <span className="bg-gradient-to-r from-[#2f855a] via-[#0e7490] to-[#b8420d] bg-clip-text text-transparent">
            VOLLER 3D-VOXEL-GRAFIK
          </span>
        </h1>

        <div className="mt-4 mx-auto h-1.5 w-28 bg-gradient-to-r from-[#48bb78] via-[#38bdf8] to-[#f59e0b] rounded-full shadow-sm" />

        <p className="mt-6 text-base sm:text-xl text-[#334155] leading-relaxed max-w-2xl mx-auto font-sans font-medium">
          Erlebe den satirischen AI-Bubble Idle Clicker aus einer völlig neuen Perspektive:
          Ein lebendiger 3D-Campus, ein idyllisches Vorortdorf am Fluss, der rauchende
          Server-Kamin mit GPU-Express-Laster und 20 handgefertigte Micro-Voxel-Engines.
        </p>

        {/* Action Buttons: Führt direkt zum Voxel-Spiel */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={VOXEL_PLAY_URL}
            className="voxel-btn px-8 py-4 text-base sm:text-lg"
          >
            <Play className="w-5 h-5 fill-white text-white" />
            <span>Im Browser spielen (3D Voxel)</span>
            <span className="voxel-led-dot ml-1" />
          </a>
          <a
            href={PLAY_URL}
            className="voxel-btn-paper px-6 py-4 text-sm font-mono font-black text-[#22313f]"
          >
            <span>Lieber Classic 2D spielen</span>
            <ArrowRight className="w-4 h-4 text-[#6d7f8e]" />
          </a>
        </div>

        <p className="mt-4 text-xs text-[#6d7f8e] font-mono font-bold">
          Kein Download, kein Account • Synchroner Spielstand mit der 2D-Version
        </p>
      </section>

      {/* 2. STATS / FACTS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10 font-mono">
        {[
          { val: '20', label: 'Micro-Voxel Engines', color: 'text-[#12694a]' },
          { val: '89', label: 'Gemütliche Dorfhäuser', color: 'text-[#c05621]' },
          { val: '100%', label: 'Synchroner Spielstand', color: 'text-[#0e7490]' },
          { val: '0 €', label: 'Kostenlos im Browser', color: 'text-[#f59e0b]' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border-2 border-[#c8bb9f] bg-[#fffdf6] p-4 text-center shadow-[0_4px_0_#c8bb9f,0_8px_20px_rgba(28,42,56,0.06)]"
          >
            <span className={`block text-3xl sm:text-4xl font-black ${item.color}`}>
              {item.val}
            </span>
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#6d7f8e] mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* 3. HIGHLIGHT-FEATURES */}
      <section className="my-16">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[#2f855a]">
            [ NEUE 3D-FEATURE-HIGHLIGHTS ]
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-mono text-[#22313f] mt-1">
            DIE VOXEL-WELT IM DETAIL
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border-2 border-[#c8bb9f] bg-[#fffdf6] p-6 flex flex-col items-start shadow-[0_4px_0_#c8bb9f,0_10px_24px_rgba(28,42,56,0.08)]">
            <div className="w-12 h-12 rounded-xl bg-[#fff2eb] border-2 border-[#f3c9a0] flex items-center justify-center text-[#c05621] mb-4 shadow-sm">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-[#22313f] mb-2">360° Vorortdorf & Fluss</h3>
            <p className="text-sm text-[#4a5568] leading-relaxed">
              89 lückenlos verifizierte Einfamilienhäuser mit Giebeldächern, Schornsteinen, Vorgartenzäunen
              und parkenden Autos säumen den Campus. Keine hässlichen Riesenhochhäuser – eine harmonische
              Miniaturwelt mit Bogenbrücke und See.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#c8bb9f] bg-[#fffdf6] p-6 flex flex-col items-start shadow-[0_4px_0_#c8bb9f,0_10px_24px_rgba(28,42,56,0.08)]">
            <div className="w-12 h-12 rounded-xl bg-[#fef9ed] border-2 border-[#fde047] flex items-center justify-center text-[#b45309] mb-4 shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-[#22313f] mb-2">GPU-Express-Einsatz</h3>
            <p className="text-sm text-[#4a5568] leading-relaxed">
              Läuft der Server-Kamin heiß (100°C Meltdown), fährt ein animierter Lieferwagen mit
              Warnleuchten die freie Kamin-Allee hinauf, entlädt frische GPU-Racks und kühlt den Schlot
              in einer 45-Sekunden-Rettungssequenz ab.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#c8bb9f] bg-[#fffdf6] p-6 flex flex-col items-start shadow-[0_4px_0_#c8bb9f,0_10px_24px_rgba(28,42,56,0.08)]">
            <div className="w-12 h-12 rounded-xl bg-[#edfaf1] border-2 border-[#a7f3d0] flex items-center justify-center text-[#2f855a] mb-4 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-mono font-black text-lg text-[#22313f] mb-2">Vollständiger Spielstand</h3>
            <p className="text-sm text-[#4a5568] leading-relaxed">
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
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[#2f855a]">
            [ HANDGEFERTIGTE VOXEL-KUNST ]
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-mono text-[#22313f] mt-1">
            20 DETAILREICHE MICRO-VOXEL ENGINES
          </h2>
          <p className="text-sm text-[#6d7f8e] max-w-xl mx-auto mt-2 font-mono font-bold">
            Jedes Gebäude wurde aus feinsten Voxel-Steinen (0.6px – 1.5px) zusammengesetzt und besitzt
            thematische Requisiten und eine 4-stufige visuelle Gold-Progression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOXEL_SHOWCASE_ENGINES.map((eng) => (
            <div
              key={eng.id}
              className="rounded-2xl border-2 border-[#c8bb9f] bg-[#fffdf6] p-4 flex flex-col items-center text-center shadow-[0_3px_0_#c8bb9f,0_6px_16px_rgba(28,42,56,0.06)] hover:translate-y-[-2px] hover:shadow-[0_5px_0_#c8bb9f,0_12px_24px_rgba(28,42,56,0.1)] transition-all group"
            >
              <div className="w-24 h-24 flex items-center justify-center bg-[#f3ece0] rounded-xl border-2 border-[#ded3bd] p-2 mb-3 shadow-inner group-hover:scale-105 transition-transform">
                <VoxelIcon buildingId={eng.id} tier={eng.tier} size={64} />
              </div>
              <h4 className="font-mono font-black text-sm text-[#22313f] mb-1">{eng.name}</h4>
              <p className="text-xs text-[#6d7f8e] leading-normal">{eng.desc}</p>
              <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-[#f3ece0] border border-[#c8bb9f] text-[10px] font-mono font-bold text-[#2f855a]">
                Tier {eng.tier} Visual
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="my-16 p-8 sm:p-12 rounded-3xl border-2 border-[#c8bb9f] bg-gradient-to-b from-[#fffdf6] to-[#f3ece0] text-center relative overflow-hidden shadow-[0_6px_0_#c8bb9f,0_16px_36px_rgba(28,42,56,0.12)]">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black font-mono text-[#22313f] mb-4">
            BEREIT FÜR DEN 3D-CAMPUS?
          </h2>
          <p className="text-[#4a5568] text-base sm:text-lg mb-8 leading-relaxed font-medium">
            Starte die Voxel-Edition direkt in deinem Browser. Keine Installation, kein Konto –
            dein KI-Startup erwacht in isometrischer 3D-Pracht zum Leben.
          </p>
          <a
            href={VOXEL_PLAY_URL}
            className="voxel-btn px-10 py-5 text-lg"
          >
            <Play className="w-6 h-6 fill-white text-white" />
            <span>Jetzt Voxel 3D Spielen</span>
            <span className="voxel-led-dot ml-1" />
          </a>
        </div>
      </section>
    </VoxelSiteLayout>
  );
}
