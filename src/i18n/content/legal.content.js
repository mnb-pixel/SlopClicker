// Rechtstexte für Impressum & Datenschutzerklärung (LegalModal).
//
// ================================ ACHTUNG ================================
// Beide Texte sind ENTWÜRFE. Sie sind rechtlich NICHT ausreichend, solange die
// unten mit TODO markierten Pflichtangaben fehlen. Ein unvollständiges oder
// falsches Impressum ist in Deutschland abmahnfähig (§ 5 DDG, früher § 5 TMG).
// Es wurden bewusst KEINE Daten erfunden - fehlende Felder bleiben sichtbar leer
// und das Modal zeigt so lange einen Entwurfs-Hinweis an (siehe hasOpenTodos()).
// =========================================================================

// Sichtbarer Marker für noch fehlende Pflichtangaben. Taucht dieser String im
// gerenderten Text auf, ist der Rechtstext nicht veröffentlichungsreif.
export const LEGAL_TODO = '[[ BITTE EINTRAGEN ]]';

// ================================ HINWEIS ================================
// Betreiber ist laut quaell.bryopal.ch eine SCHWEIZER GmbH, keine deutsche. Die
// Abschnittstitel unten ("Angaben gemäß § 5 DDG", "§ 18 Abs. 2 MStV", "USt-IdNr. gemäß
// § 27a UStG") zitieren deutsches Recht - das ist die Rechtsgrundlage, mit der dieses
// Modal ursprünglich als Entwurf angelegt wurde, aber für eine Schweizer Gesellschaft
// vermutlich NICHT die zutreffende (einschlägig wäre u.a. Art. 3 lit. s UWG für die
// Anbieterkennzeichnung, ggf. revDSG statt DSGVO). Diese Zitate wurden bewusst NICHT
// eigenmächtig umgeschrieben, da das eine juristische Einschätzung ist - bitte von
// einer Person mit Rechtskenntnis prüfen lassen, bevor die Seite live geht.
// ===========================================================================

// Alle betreiberspezifischen Angaben an EINER Stelle - Impressum und
// Datenschutzerklärung ziehen beide hier heraus, damit nichts doppelt gepflegt
// werden muss. null bedeutet "fehlt noch" und wird als LEGAL_TODO gerendert.
export const OPERATOR = {
  // Quelle: quaell.bryopal.ch (Impressum der Bryopal GmbH)
  name: 'Bryopal GmbH',
  street: 'Seeblickstrasse 6a',
  postalCode: '9010',
  city: 'St. Gallen',
  country: 'Schweiz',
  email: 'contact@bryopal.ch',
  // Auf quaell.bryopal.ch ebenfalls nicht angegeben.
  phone: null,
  // Schweizer UID ist kein EU-USt-IdNr. nach § 27a UStG - deshalb nicht hier eingetragen
  // (würde eine falsche Rechtsgrundlage suggerieren), sondern unten unter "register" mit
  // korrekter Bezeichnung.
  vatId: null,
  register: 'UID: CHE-194.217.671, Handelsregisteramt des Kantons St. Gallen',
  // Auf quaell.bryopal.ch als "vertretungsberechtigte Person" gelistet, nicht explizit als
  // inhaltlich Verantwortlicher - für diese Seite mangels anderer Angabe übernommen.
  contentResponsible: 'Björn Moosmann',
  // Bestätigt: Cloudflare (Deployment läuft über *.workers.dev). Für eine vollständige
  // Anbieterkennzeichnung ggf. noch auf "Cloudflare, Inc." vs. konkretes Cloudflare-Produkt
  // (Pages/Workers) präzisieren.
  hostingProvider: 'Cloudflare, Inc.',
};

export function formatOperatorField(value) {
  return value === null || value === undefined || value === '' ? LEGAL_TODO : value;
}

// true, solange noch Pflichtangaben fehlen -> Entwurfs-Banner im Modal einblenden.
export function hasOpenTodos() {
  return [
    OPERATOR.name, OPERATOR.street, OPERATOR.postalCode, OPERATOR.city, OPERATOR.phone,
    OPERATOR.hostingProvider,
  ].some((v) => v === null || v === undefined || v === '');
}

export const LEGAL_CONTENT = {
  de: {
    draftBanner:
      'ENTWURF – noch nicht rechtsverbindlich. Die mit ' + LEGAL_TODO +
      ' markierten Pflichtangaben fehlen und müssen vor einer Veröffentlichung ergänzt werden.',
    lastUpdatedLabel: 'Stand',
    lastUpdated: 'August 2026',
    dsarFormTitle: 'Anfrage zu deinen Daten stellen',

    impressum: {
      title: 'Impressum',
      sections: [
        {
          title: 'Angaben gemäß § 5 DDG',
          lines: [
            '{name}',
            '{street}',
            '{postalCode} {city}',
            '{country}',
          ],
        },
        {
          title: 'Kontakt',
          lines: [
            'E-Mail: {email}',
            'Telefon: {phone}',
          ],
        },
        {
          title: 'Umsatzsteuer-Identifikationsnummer',
          lines: [
            'USt-IdNr. gemäß § 27a Umsatzsteuergesetz: {vatId}',
          ],
        },
        {
          title: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
          lines: [
            '{contentResponsible}',
          ],
        },
        {
          title: 'Streitbeilegung',
          lines: [
            'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
          ],
        },
        {
          title: 'Haftung für Inhalte und Links',
          lines: [
            'Die Inhalte dieses Angebots wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.',
            'Dieses Angebot ist eine **Satire**. Alle dargestellten Firmen, Personen, Produkte, Auszeichnungen und Meldungen sind **frei erfunden**. Ähnlichkeiten mit real existierenden Unternehmen oder Personen sind nicht beabsichtigt.',
            'Für Inhalte externer Links sind ausschließlich deren Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.',
          ],
        },
      ],
    },

    datenschutz: {
      title: 'Datenschutzerklärung',
      sections: [
        {
          title: '1. Verantwortlicher',
          lines: [
            'Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:',
            '{name}, {street}, {postalCode} {city}, {country}',
            'E-Mail: {email}',
          ],
        },
        {
          title: '2. Spielstand-Speicherung auf deinem Gerät',
          lines: [
            'Dein Spielfortschritt wird **ausschließlich lokal in deinem Browser** gespeichert (Local Storage, Schlüssel `SLOP_CLICKER_GAME_SAVE_V1`). Diese Daten verlassen dein Gerät nicht und werden nicht an uns oder Dritte übertragen.',
            'Gespeichert werden ausschließlich Spielwerte wie Bewertung, gekaufte Engines, Upgrades und Statistiken. Es werden **keine Namen, E-Mail-Adressen oder sonstigen personenbezogenen Daten** erhoben.',
            'Du kannst diese Daten jederzeit selbst löschen: über die Schaltfläche „Spielstand löschen" in den Einstellungen oder indem du die Website-Daten in deinem Browser leerst.',
          ],
        },
        {
          title: '3. Hosting und Server-Logfiles',
          lines: [
            'Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter technisch notwendige Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt des Zugriffs, abgerufene Datei, Browsertyp).',
            'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse an einem technisch fehlerfreien und sicheren Betrieb.',
            'Hosting-Anbieter: {hostingProvider}',
          ],
        },
        {
          title: '4. Werbung',
          lines: [
            'Derzeit ist **kein Werbenetzwerk eingebunden**. Die im Spiel sichtbaren Werbeflächen sind reine Platzhalter ohne Datenverarbeitung, ohne Cookies und ohne Tracking.',
            'Sobald ein echtes Werbenetzwerk integriert wird, ist dieser Abschnitt zwingend zu ergänzen: Name und Anbieter des Netzwerks, verarbeitete Daten, Empfänger, Drittlandtransfer sowie – bei nicht zwingend erforderlichen Cookies – die Einholung einer Einwilligung nach § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO.',
          ],
        },
        {
          title: '5. Belohnungs-Videos im Spiel',
          lines: [
            'Die im Spiel angebotenen „Video ansehen"-Belohnungen sind aktuell simuliert. Es wird kein echtes Video geladen und es findet keine Übertragung an Dritte statt.',
          ],
        },
        {
          title: '6. Deine Rechte',
          lines: [
            'Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).',
            'Erteilte Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen.',
            'Außerdem steht dir ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO).',
            'Für alle Anliegen genügt eine formlose Nachricht an: {email}',
          ],
        },
      ],
    },
  },

  en: {
    draftBanner:
      'DRAFT – not yet legally binding. The mandatory details marked ' + LEGAL_TODO +
      ' are still missing and must be filled in before going live.',
    lastUpdatedLabel: 'Last updated',
    lastUpdated: 'August 2026',
    dsarFormTitle: 'Submit a data request',

    impressum: {
      title: 'Legal Notice',
      sections: [
        {
          title: 'Information pursuant to § 5 DDG (German Digital Services Act)',
          lines: [
            '{name}',
            '{street}',
            '{postalCode} {city}',
            '{country}',
          ],
        },
        {
          title: 'Contact',
          lines: [
            'Email: {email}',
            'Phone: {phone}',
          ],
        },
        {
          title: 'VAT Identification Number',
          lines: [
            'VAT ID pursuant to § 27a German VAT Act: {vatId}',
          ],
        },
        {
          title: 'Responsible for content pursuant to § 18 (2) MStV',
          lines: [
            '{contentResponsible}',
          ],
        },
        {
          title: 'Dispute Resolution',
          lines: [
            'We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
          ],
        },
        {
          title: 'Liability for Content and Links',
          lines: [
            'The content of this service has been compiled with care. No guarantee is given for its accuracy, completeness or timeliness.',
            'This service is a **satire**. All companies, people, products, awards and news items depicted are **entirely fictional**. Any resemblance to real companies or people is unintended.',
            'The operators of linked external pages are solely responsible for their content. No legal violations were apparent at the time of linking.',
          ],
        },
      ],
    },

    datenschutz: {
      title: 'Privacy Policy',
      sections: [
        {
          title: '1. Controller',
          lines: [
            'The controller for data processing on this website within the meaning of the GDPR is:',
            '{name}, {street}, {postalCode} {city}, {country}',
            'Email: {email}',
          ],
        },
        {
          title: '2. Game Progress Stored on Your Device',
          lines: [
            'Your game progress is stored **exclusively in your own browser** (local storage, key `SLOP_CLICKER_GAME_SAVE_V1`). This data never leaves your device and is not transmitted to us or to any third party.',
            'Only game values such as valuation, purchased engines, upgrades and statistics are stored. **No names, email addresses or other personal data** are collected.',
            'You can delete this data at any time using the "Wipe save data" button in the settings, or by clearing this site\'s data in your browser.',
          ],
        },
        {
          title: '3. Hosting and Server Log Files',
          lines: [
            'When you access this website, our hosting provider processes technically necessary access data (e.g. IP address, time of access, file requested, browser type).',
            'The legal basis is Art. 6(1)(f) GDPR – legitimate interest in technically sound and secure operation.',
            'Hosting provider: {hostingProvider}',
          ],
        },
        {
          title: '4. Advertising',
          lines: [
            'No advertising network is currently integrated. The ad areas visible in the game are pure placeholders with no data processing, no cookies and no tracking.',
            'As soon as a real advertising network is integrated, this section must be extended accordingly: the name and provider of the network, the data processed, recipients, transfers to third countries, and – for non-essential cookies – consent pursuant to § 25(1) TDDDG and Art. 6(1)(a) GDPR.',
          ],
        },
        {
          title: '5. In-Game Reward Videos',
          lines: [
            'The "watch video" rewards offered in the game are currently simulated. No actual video is loaded and no data is transmitted to third parties.',
          ],
        },
        {
          title: '6. Your Rights',
          lines: [
            'You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and to object to processing (Art. 21 GDPR).',
            'You may withdraw any consent given at any time with effect for the future.',
            'You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR).',
            'An informal message to the following address is sufficient for any request: {email}',
          ],
        },
      ],
    },
  },
};
