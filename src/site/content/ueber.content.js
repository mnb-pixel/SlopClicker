// Über uns & Kontakt (/ueber). Betreiberdaten kommen aus OPERATOR (legal.content.js) und
// werden in UeberPage.jsx eingesetzt - hier nur die Texte.
export const UEBER = {
  kicker: 'Über uns',
  title: 'Über Token Furnace',
  lead: 'Ein kleines Spiel über eine große Blase – gebaut von einer kleinen Firma aus St. Gallen.',
  ctaText: 'Das Spiel erklärt sich am besten selbst.',

  sections: [
    {
      id: 'warum',
      title: 'Warum dieses Spiel',
      blocks: [
        ['p', 'Token Furnace entstand aus der Beobachtung, dass sich die Logik eines Idle Clickers – Zahlen, die immer nur wachsen, egal was man tut – erstaunlich wenig von der Logik mancher Startup-Bewertung unterscheidet. Beides funktioniert, solange alle mitspielen. Also haben wir ein Spiel daraus gemacht: eines, in dem der Umsatz dauerhaft bei null steht und die Bewertung trotzdem steigt.'],
        ['p', 'Die Satire richtet sich nicht gegen künstliche Intelligenz als Technik, sondern gegen die Art, wie sie verkauft wird: gegen Buzzwords, die nichts bedeuten, Layoffs, die „Restrukturierung“ heißen, und Greenwashing per gekauftem Zertifikat. Alle Firmen, Personen, Produkte und Meldungen im Spiel sind frei erfunden. Ähnlichkeiten mit echten Pitch Decks sind nicht beabsichtigt, aber schwer zu vermeiden.'],
      ],
    },
    {
      id: 'wie-gebaut',
      title: 'Wie es gebaut ist',
      blocks: [
        ['p', 'Token Furnace ist eine Web-Anwendung, die vollständig in deinem Browser läuft. Es gibt keinen Spielserver: Deine Bewertung, deine Engines und deine Karten liegen ausschließlich auf deinem Gerät, und der Export unter Einstellungen gibt dir die Datei in die Hand. Die iOS-App verpackt dieselbe Anwendung in eine native Hülle – ergänzt um haptisches Feedback, Bonus-Videos und den Werbefrei-Kauf über Apples In-App-Kauf-System.'],
        ['p', 'Finanziert wird das Spiel über Werbung: in der Web-Version erst nach deiner Zustimmung im Cookie-Hinweis, in der App wahlweise gar nicht. Es gibt keine Käufe, die das Spiel schneller machen, und keine Mechanik, die auf Ungeduld spekuliert. Die Zahlen im Spiel sind absichtlich transparent – die [Anleitung](/anleitung) legt sie bis auf die Nachkommastelle offen.'],
      ],
    },
    {
      id: 'wer',
      title: 'Wer dahinter steht',
      blocks: [
        ['p', 'Hinter Token Furnace steht die Bryopal GmbH, ein kleines Unternehmen aus St. Gallen in der Schweiz. Das Spiel ist ein Nebenprojekt – gebaut, weil wir es selbst spielen wollten, und weiterentwickelt, weil andere es auch tun. Die vollständigen Angaben stehen im [Impressum](/impressum).'],
      ],
    },
  ],

  kontakt: {
    title: 'Kontakt',
    intro: 'Fragen, Fehler, Ideen oder Presseanfragen – am einfachsten per E-Mail. Wir lesen alles, antworten aber nicht immer sofort; es ist ein Nebenprojekt.',
    hintsTitle: 'Bei Fehlermeldungen hilft uns',
    hints: [
      'Gerät und Browser beziehungsweise iOS-Version.',
      'Was du gerade getan hast, als der Fehler auftrat.',
      'Wenn möglich ein Screenshot – und bei Problemen mit dem Spielstand die unter Einstellungen exportierte Datei.',
    ],
  },

  next: [
    { href: '/faq', label: 'Häufige Fragen', teaser: 'Vielleicht ist die Antwort schon da.' },
    { href: '/', label: 'Startseite', teaser: 'Zurück zum Überblick.' },
  ],
};
