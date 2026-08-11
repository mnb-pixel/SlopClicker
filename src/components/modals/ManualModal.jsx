import React from 'react';
import { BookOpen, X, Sparkles, RotateCw, Flame, ShieldAlert, Cpu, Layers, Zap } from 'lucide-react';

export function ManualModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1C2B3A] text-[#EAE7DA] border-2 border-[#8A6A1F] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#14202C] border-b border-[#8A6A1F]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8A6A1F]" />
            <h2 className="font-serif font-black text-lg tracking-wide uppercase text-[#EAE7DA]">
              Form S-1 Confidential Investor Prospectus
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#2A3C50] text-[#EAE7DA] hover:bg-[#8A6A1F] hover:text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Manual Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-6 text-xs leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-[#8A6A1F]/30">
            <h3 className="font-serif font-extrabold text-sm text-[#8A6A1F] uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 1. Startup Scale & Token Generation
            </h3>
            <p className="mb-2">
              Als Gründer eines bahnbrechenden KI-Startups skalierst du deine Unternehmung von bescheidenen Anfängen bis hin zu unerreichbaren Höhen. Durch manuelles Autorisieren und den Bau automatisierter Systeme steigerst du deinen Unternehmenswert kontinuierlich.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>Passives Valuation-Wachstum (Netto-VPS)</strong>: Deine Infrastruktur produziert rund um die Uhr neuen Unternehmenswert.</li>
              <li><strong>Exakte Bewertung</strong>: Verfolge in Echtzeit jeden einzelnen erwirtschafteten Dollar.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-rose-500/30">
            <h3 className="font-serif font-extrabold text-sm text-rose-400 uppercase mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" /> 2. Token Burn & Hype-Dynamik
            </h3>
            <p className="mb-2">
              Je weiter deine Unternehmung wächst, desto höher steigt deine Hype-Stufe. Ein höherer Hype zieht mehr Investoren an, erhöht jedoch auch deine laufenden Betriebskosten und die kontinuierliche <strong>Burn Rate</strong>!
            </p>
            <p className="text-slate-300">
              Deine tatsächliche Netto-Generierung ergibt sich aus dem Gesamtertrag abzüglich der Verbrennungsrate. Steuere dagegen mit gezielten Unternehmensmaßnahmen und strategischen Entscheidungen.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-cyan-500/30">
            <h3 className="font-serif font-extrabold text-sm text-cyan-400 uppercase mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> 3. Infrastruktur & Strategie-Portfolio
            </h3>
            <div className="space-y-2 text-slate-300">
              <div>
                <strong className="text-cyan-300">AI Engines</strong>: Erweitere deine Infrastruktur stufenweise von einfachen Assistenten bis hin zu gigantischen Rechenzentren.
              </div>
              <div>
                <strong className="text-amber-300">Effizienz-Upgrades</strong>: Optimiere deine Klick-Leistung und vervielfache den Output deiner Systeme.
              </div>
              <div>
                <strong className="text-emerald-300">Corporate Actions</strong>: Nutze Greenwashing-Initiativen zur Reduzierung der Burn Rate oder führe Massenentlassungen zur kurzfristigen Ertragssteigerung durch.
              </div>
              <div>
                <strong className="text-fuchsia-300">Buzzword Portfolio</strong>: Sammele wertvolle Buzzword-Karten verschiedener Seltenheiten, um dein gesamtes Wachstum nachhaltig zu beflügeln.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-[#8A6A1F]/30">
            <h3 className="font-serif font-extrabold text-sm text-[#8A6A1F] uppercase mb-2 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4" /> 4. Pivot Strategy & Epochen-Rotation
            </h3>
            <p className="mb-2">
              Ab einem gewissen Zuwachs an Unternehmenswert kannst du einen strategischen <strong>Pivot</strong> vollziehen. Engines, Upgrades und Valuation bleiben dabei erhalten — ein Pivot belohnt dich mit wertvoller <strong>Credibility</strong> für den Wertzuwachs seit deinem letzten Pivot und rotiert dein Startup in die nächste Hype-Epoche.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 mb-2">
              <li><strong>😇 Idealisten-Pfad</strong>: Investiere Credibility in nachhaltige Strukturen, um deine Burn Rate dauerhaft zu drosseln.</li>
              <li><strong>😈 Zyniker-Pfad</strong>: Setze auf aggressives Hype-Wachstum, um deine Erträge massiv zu steigern.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-purple-500/30">
            <h3 className="font-serif font-extrabold text-sm text-purple-300 uppercase mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" /> 5. Singularity Ascension & Kosmischer Aufstieg
            </h3>
            <p className="mb-2">
              Erreicht dein Startup gigantische Bewertungshöhen, schaltet sich die <strong>Singularity Ascension</strong> frei. Dieser finale Reset verleiht dir ein höheres Prestige-Level und <strong>Heavenly Chips</strong>.
            </p>
            <p className="text-slate-300">
              Prestige-Level und kosmische Upgrades gewähren dir permanente Vorteile, die über alle zukünftigen Neuanfänge hinweg bestehen bleiben.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-serif font-extrabold text-sm text-amber-300 uppercase mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> 6. Hardware-Thermik & Marktevents
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>GPU-Temperatur</strong>: Zu schnelles Manuelles Autorisieren erhitzt deine Prozessoren. Achte darauf, dass das System nicht überhitzt.</li>
              <li><strong>Markt-Ereignisse & Krisen</strong>: Nutze spontan auftauchende Marktchancen oder wappne dich gegen unvorhergesehene Turbulenzen.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#14202C] border-t border-[#8A6A1F]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8A6A1F] text-slate-950 font-black rounded-xl hover:bg-[#C59B3F] transition-all uppercase tracking-wider text-xs shadow-lg"
          >
            VERSTANDEN & PROSPEKT SCHLIESSEN
          </button>
        </div>
      </div>
    </div>
  );
}
