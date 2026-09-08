// Häufige Fragen (/faq), gruppiert. Antworten dürfen mehrere Absätze (Array) sein und
// **fett**/[Links](/pfad) enthalten (siehe renderRich in ui.jsx).
export const FAQ = {
  kicker: 'FAQ',
  title: 'Häufige Fragen',
  lead:
    'Kurze Antworten zu Kosten, Spielstand, Spielmechanik, Werbung und den Unterschieden zwischen Web-Version und iOS-App. Was hier fehlt, beantworten wir gern per [E-Mail](/ueber#kontakt).',
  ctaText: 'Noch Fragen? Die meisten beantwortet das Spiel nach fünf Minuten von selbst.',

  groups: [
    {
      id: 'spiel-und-kosten',
      title: 'Spiel & Kosten',
      items: [
        {
          q: 'Ist Token Furnace kostenlos?',
          a: 'Ja. Die Web-Version ist komplett kostenlos und ohne Einschränkungen spielbar. Die iOS-App „Tokenkamin: AI Clicker“ ist ebenfalls kostenlos; dort gibt es einen optionalen, einmaligen Kauf „Werbefrei“, der alle Videos und Banner entfernt. Es gibt keine Abos, keine Pay-to-win-Käufe und keine Karten oder Engines gegen echtes Geld.',
        },
        {
          q: 'Muss ich ein Konto anlegen?',
          a: 'Nein. Es gibt keine Registrierung und keine Anmeldung – du öffnest die Seite und spielst. Dein Fortschritt wird automatisch lokal gespeichert.',
        },
        {
          q: 'Worum geht es in dem Spiel?',
          a: 'Token Furnace ist ein Idle Clicker und eine Satire auf den KI-Hype: Du baust ein fiktives KI-Startup ohne echtes Produkt auf, ausschließlich getrieben von Buzzwords, Bewertungswachstum und Investorenvertrauen. Wie das mechanisch funktioniert, erklärt die [Spielanleitung](/anleitung).',
        },
        {
          q: 'Ist das Spiel eine Kritik an künstlicher Intelligenz?',
          a: 'Es ist eine Satire auf den Hype um sie – auf Bewertungen ohne Umsatz, Buzzwords ohne Bedeutung und Pitch Decks mit fünfzig Folien. Über die Technik selbst sagt das Spiel wenig; über die Branche, die sie verkauft, umso mehr. Alle Firmen, Personen und Meldungen im Spiel sind frei erfunden.',
        },
        {
          q: 'Wie lange dauert eine Runde?',
          a: 'Token Furnace hat kein klassisches Ende. Die ersten Millionen erreichst du in einer Sitzung, die erste Milliarde in ein paar Tagen mit gelegentlichem Vorbeischauen. Das komplette Buzzword-Album, alle 20 Engines und die letzten Erfolge sind Projekte für Wochen.',
        },
      ],
    },
    {
      id: 'spielstand',
      title: 'Spielstand & Geräte',
      items: [
        {
          q: 'Wo wird mein Spielstand gespeichert?',
          a: 'Lokal – im Speicher deines Browsers beziehungsweise auf deinem iPhone. Es gibt keinen Server, keine Cloud-Synchronisation und kein Konto. Löschst du die Website-Daten deines Browsers, ist auch der Spielstand weg; deshalb gibt es unter Einstellungen einen Export.',
        },
        {
          q: 'Kann ich meinen Spielstand auf ein anderes Gerät übertragen?',
          a: 'Ja. Unter **Einstellungen → Spielstand exportieren** lädst du deinen Fortschritt als Datei herunter. Auf dem anderen Gerät wählst du **Spielstand importieren** und die Datei aus – der dortige Fortschritt wird dabei ersetzt.',
        },
        {
          q: 'Kann ich das Spiel zurücksetzen?',
          a: 'Ja, unter **Einstellungen → Spielstand löschen**. Nach einer Sicherheitsabfrage beginnt das Spiel von vorn. Einen Rückweg gibt es nicht – vorher exportieren, wenn du unsicher bist.',
        },
        {
          q: 'Auf welchen Geräten und Browsern läuft Token Furnace?',
          a: 'Die Web-Version läuft in allen aktuellen Browsern (Chrome, Firefox, Safari, Edge) auf Desktop, Tablet und Smartphone. Die iOS-App benötigt iOS 15 oder neuer. Eine Android-App gibt es derzeit nicht – die Web-Version läuft aber auch im Android-Browser.',
        },
        {
          q: 'Gibt es das Spiel auf Englisch?',
          a: 'Ja. Die Sprache lässt sich in der Kopfzeile des Spiels zwischen Deutsch und Englisch umschalten. Diese Website ist ausschließlich auf Deutsch.',
        },
      ],
    },
    {
      id: 'spielmechanik',
      title: 'Spielmechanik',
      items: [
        {
          q: 'Läuft das Spiel offline weiter?',
          a: 'Deine Engines produzieren auch bei geschlossenem Tab weiter – mit 10 % der normalen Rate und für maximal vier Stunden. Kommst du innerhalb von 30 Minuten zurück, wird der Ertrag direkt gutgeschrieben; nach längerer Abwesenheit siehst du einen Bericht, bei dem ein Teil des Ertrags an ein Bonus-Video gebunden ist. Details in der [Anleitung](/anleitung#offline).',
        },
        {
          q: 'Warum ist mein Netto-VPS negativ?',
          a: 'Weil die Burn Rate am **Bestand** zehrt, nicht an der Produktion: Ein großes Konto verliert pro Sekunde mehr, als kleine Engines nachliefern. Das ist kein Fehler, sondern der Kern des Spiels. Gib die Bewertung aus – ein kleinerer Bestand brennt weniger – und erhöhe die Produktion. Die [Strategie-Seite](/strategie#burn-rate) hat Details.',
        },
        {
          q: 'Warum kann ich plötzlich nicht mehr klicken?',
          a: 'Deine GPU ist überhitzt. Jeder Tap bringt 2 °C, bei 100 °C sperrt sich der Button. Die Kühlung setzt erst nach 45 Sekunden ein, und erst unter 50 °C kannst du weiterklicken. Dauerhaft zwei Taps pro Sekunde vermeiden das komplett.',
        },
        {
          q: 'Wie bekomme ich Buzzword-Karten?',
          a: 'Nur über Booster-Packs im Shop-Bereich „Buzzwords“. Jedes Pack enthält eine zufällige, noch nicht gesammelte Karte; das erste kostet 600 Dollar, jedes weitere das Doppelte. Einzelne Karten lassen sich nicht direkt kaufen.',
        },
        {
          q: 'Was sind Hype-Stufen?',
          a: 'Zehn Stufen, die von deiner Lebenszeit-Bewertung abhängen – Stufe 2 ab 10.000 Dollar, jede weitere ab dem Hundertfachen. Höhere Stufen erhöhen die Burn Rate von 0,2 % auf bis zu 0,65 % pro Sekunde. Die Tabelle steht in der [Anleitung](/anleitung#hype-und-burn).',
        },
        {
          q: 'Was passiert bei einem Black-Swan-Ereignis?',
          a: 'Du verlierst 15 bis 30 % der Exemplare einer einzelnen Engine – etwa, weil das Rechenzentrum abbrennt. Das kommt sehr selten vor (frühestens alle 24 Stunden pro Engine-Typ, meist liegen Wochen dazwischen) und trifft nie mehrere Engines gleichzeitig.',
        },
      ],
    },
    {
      id: 'werbung-und-datenschutz',
      title: 'Werbung & Datenschutz',
      items: [
        {
          q: 'Gibt es Werbung?',
          a: [
            'In der Web-Version können Anzeigen erscheinen; sie werden erst geladen, wenn du im Cookie-Hinweis zugestimmt hast. Deine Entscheidung kannst du jederzeit über „Werbe-Cookie-Einstellungen“ im Seitenfuß ändern.',
            'Die iOS-App zeigt einen Banner und bietet Bonus-Videos an, mit denen du Boni wie die Sofort-Kühlung oder den Offline-Ertrag freischaltest. Der Kauf „Werbefrei“ entfernt beides dauerhaft.',
          ],
        },
        {
          q: 'Was bringt „Werbefrei“ in der iOS-App?',
          a: 'Alle Banner und Bonus-Videos verschwinden. Die Boni selbst bleiben exakt gleich – du holst sie mit einem Tap ab statt nach einem Video. Der Kauf ist einmalig und lässt sich auf einem neuen Gerät über „Käufe wiederherstellen“ zurückholen.',
        },
        {
          q: 'Welche Daten sammelt das Spiel?',
          a: 'Das Spiel selbst braucht kein Konto und speichert deinen Fortschritt nur lokal. Welche Daten Werbepartner verarbeiten – und nur nach deiner Zustimmung –, steht in der [Datenschutzerklärung](/datenschutz).',
        },
      ],
    },
    {
      id: 'sonstiges',
      title: 'Sonstiges',
      items: [
        {
          q: 'Was ist der Unterschied zwischen Web-Version und iOS-App?',
          a: 'Es ist dasselbe Spiel mit demselben Inhalt. Die App läuft nativ auf dem iPhone, hat haptisches Feedback, eigene Bonus-Videos und den Werbefrei-Kauf; die Web-Version braucht keine Installation und hat eigene URLs für Shop, Statistik und Einstellungen. Eine Übersicht steht auf der [Seite zur iOS-App](/ios-app).',
        },
        {
          q: 'Ich habe einen Fehler gefunden – wohin damit?',
          a: 'Schreib uns eine [E-Mail](/ueber#kontakt). Hilfreich sind Browser oder iOS-Version, Gerät, eine kurze Beschreibung und – falls möglich – ein Screenshot oder dein exportierter Spielstand.',
        },
        {
          q: 'Wer steckt hinter Token Furnace?',
          a: 'Die Bryopal GmbH aus St. Gallen in der Schweiz. Mehr dazu auf der Seite [Über uns](/ueber), die vollständigen Angaben im [Impressum](/impressum).',
        },
      ],
    },
  ],

  next: [
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Alle Mechaniken ausführlich erklärt.' },
    { href: '/ios-app', label: 'Die iOS-App', teaser: 'Tokenkamin: AI Clicker fürs iPhone.' },
  ],
};
