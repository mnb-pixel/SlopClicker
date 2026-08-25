// Übersetzungen für das Investor-Handbuch (ManualModal). Fett markierte Begriffe werden
// mit **doppelten Sternchen** notiert und von ManualModal.jsx per renderRich() in <strong>
// umgewandelt. Spielmechanik-Eigennamen (Engines, Corporate Actions, Buzzword Portfolio)
// bleiben bewusst in beiden Sprachen gleich.
//
// Pivot/Epochen-Rotation und Singularity Ascension (frühere Sections 4+5) sind mit dem
// Special-Tab entfernt (siehe App.jsx/DesktopView.jsx/NavBar.jsx) - "verwirrt nur ohne
// Mehrwert". Die zugehörige Store-Logik (ascend, pivot, credibility etc.) bleibt bestehen,
// nur ohne UI dafür, deshalb keine Handbuch-Erwähnung mehr.

export const MANUAL_CONTENT = {
  de: {
    modalTitle: 'Vertraulicher Investoren-Prospekt',
    s1Title: '1. Startup-Skalierung & Token-Generierung',
    s1Body1: 'Als Gründer eines bahnbrechenden KI-Startups skalierst du deine Unternehmung von bescheidenen Anfängen bis hin zu unerreichbaren Höhen. Durch manuelles Autorisieren und den Bau automatisierter Systeme steigerst du deinen Unternehmenswert kontinuierlich.',
    s1Li1: '**Passives Valuation-Wachstum (Netto-VPS)**: Deine Infrastruktur produziert rund um die Uhr neuen Unternehmenswert.',
    s1Li2: '**Exakte Bewertung**: Verfolge in Echtzeit jeden einzelnen erwirtschafteten Dollar.',
    s2Title: '2. Token Burn & Hype-Dynamik',
    s2Body1: 'Je weiter deine Unternehmung wächst, desto höher steigt deine Hype-Stufe. Ein höherer Hype zieht mehr Investoren an, erhöht jedoch auch deine laufenden Betriebskosten und die kontinuierliche **Burn Rate**!',
    s2Body2: 'Deine tatsächliche Netto-Generierung ergibt sich aus dem Gesamtertrag abzüglich der Verbrennungsrate. Steuere dagegen mit gezielten Unternehmensmaßnahmen und strategischen Entscheidungen.',
    s3Title: '3. Infrastruktur & Strategie-Portfolio',
    s3Li1: '**Engines**: Erweitere deine Infrastruktur stufenweise von einfachen Assistenten bis hin zu gigantischen Rechenzentren.',
    s3Li2: '**Effizienz-Upgrades**: Optimiere deine Klick-Leistung und vervielfache den Output deiner Systeme.',
    s3Li3: '**Corporate Actions**: Nutze Greenwashing-Initiativen zur Reduzierung der Burn Rate oder führe Massenentlassungen zur kurzfristigen Ertragssteigerung durch.',
    s3Li4: '**Buzzword Portfolio**: Sammele wertvolle Buzzword-Karten verschiedener Seltenheiten, um dein gesamtes Wachstum nachhaltig zu beflügeln.',
    s4Title: '4. Hardware-Thermik & Marktereignisse',
    s4Li1: '**GPU-Temperatur**: Zu schnelles manuelles Autorisieren erhitzt deine Prozessoren. Achte darauf, dass das System nicht überhitzt.',
    s4Li2: '**Markt-Ereignisse & Krisen**: Nutze spontan auftauchende Marktchancen oder wappne dich gegen unvorhergesehene Turbulenzen.',
    closeButton: 'VERSTANDEN & PROSPEKT SCHLIESSEN',
  },
  en: {
    modalTitle: 'Confidential Investor Prospectus',
    s1Title: '1. Startup Scale & Token Generation',
    s1Body1: 'As the founder of a groundbreaking AI startup, you scale your venture from humble beginnings to unreachable heights. By manually authorizing and building automated systems, you continuously grow your company valuation.',
    s1Li1: '**Passive Valuation Growth (Net VPS)**: Your infrastructure produces new company value around the clock.',
    s1Li2: '**Exact Valuation**: Track every single dollar earned in real time.',
    s2Title: '2. Token Burn & Hype Dynamics',
    s2Body1: 'The further your venture grows, the higher your hype tier climbs. Higher hype attracts more investors, but also increases your ongoing operating costs and continuous **Burn Rate**!',
    s2Body2: 'Your actual net generation is total output minus the burn rate. Counter it with targeted corporate actions and strategic decisions.',
    s3Title: '3. Infrastructure & Strategy Portfolio',
    s3Li1: '**Engines**: Expand your infrastructure step by step, from simple assistants to gigantic data centers.',
    s3Li2: '**Efficiency Upgrades**: Optimize your click power and multiply the output of your systems.',
    s3Li3: '**Corporate Actions**: Use greenwashing initiatives to reduce the Burn Rate, or run mass layoffs for a short-term revenue boost.',
    s3Li4: '**Buzzword Portfolio**: Collect valuable buzzword cards of varying rarity to sustainably power your overall growth.',
    s4Title: '4. Hardware Thermals & Market Events',
    s4Li1: '**GPU Temperature**: Authorizing manually too fast heats up your processors. Make sure the system does not overheat.',
    s4Li2: '**Market Events & Crises**: Seize spontaneous market opportunities or brace yourself against unforeseen turbulence.',
    closeButton: 'UNDERSTOOD & CLOSE PROSPECTUS',
  },
};
