// 100 Greenwashing- & Layoff-Texte (Konzept Abschnitt 7), 5 Stufen x 20 Gebäude.
// Struktur: GREENWASHING_CONTENT[itemId] = { de: {name, quote}, en: {name, quote} }
// itemId-Konvention: gw_<buildingId>_1/2/3 (Greenwashing I/II/III), lay_<buildingId>_1/2 (Layoff I/II)

export const GREENWASHING_CONTENT = {
  // --- Prompt-Praktikant ---
  gw_prompt_intern_1: { de: { name: "Praktikum als 'nachhaltige Talentförderung' deklariert", quote: "Klingt sozial, ändert am Gehalt nichts." }, en: { name: "Internship Declared 'Sustainable Talent Development'", quote: "Sounds social, doesn't change the pay." } },
  gw_prompt_intern_2: { de: { name: "Praktikanten-Laptop generalüberholt", quote: "War eh schon zwei Generationen alt." }, en: { name: "Intern Laptop Refurbished", quote: "Was already two generations old anyway." } },
  gw_prompt_intern_3: { de: { name: "'Circular Talent Pipeline' ausgerufen", quote: "Neue Praktikanten ersetzen alte, im Kreis." }, en: { name: "'Circular Talent Pipeline' Proclaimed", quote: "New interns replace old ones, in a circle." } },
  lay_prompt_intern_1: { de: { name: "10% der Praktikanten durch AI ersetzt", quote: "Die anderen 90% trainieren jetzt die AI." }, en: { name: "10% of Interns Replaced by AI", quote: "The other 90% now train the AI." } },
  lay_prompt_intern_2: { de: { name: "Absage-Mails KI-generiert", quote: "Klingen jetzt versehentlich sehr höflich." }, en: { name: "Rejection Emails AI-Generated", quote: "Now accidentally sound very polite." } },

  // --- Chatbot-Widget ---
  gw_chatbot_widget_1: { de: { name: "Server 'klimaneutral' gehostet", quote: "Zertifikat gekauft, Server unverändert." }, en: { name: "Servers Hosted 'Carbon Neutral'", quote: "Certificate purchased, servers unchanged." } },
  gw_chatbot_widget_2: { de: { name: "Alter Chatbot-Code 'recycelt'", quote: "Bugs von 2019 laufen weiter mit." }, en: { name: "Old Chatbot Code 'Recycled'", quote: "Bugs from 2019 still along for the ride." } },
  gw_chatbot_widget_3: { de: { name: "'Circular Conversation Loop' benannt", quote: "Bot beantwortet sich am Ende selbst." }, en: { name: "Named 'Circular Conversation Loop'", quote: "The bot ends up answering itself." } },
  lay_chatbot_widget_1: { de: { name: "Support-Team um 10% reduziert", quote: "Bot übernimmt, Wartezeiten auch." }, en: { name: "Support Team Cut by 10%", quote: "The bot takes over, so do the wait times." } },
  lay_chatbot_widget_2: { de: { name: "Kündigungen über den eigenen Chatbot verschickt", quote: "Bot fragt danach: 'Kann ich sonst noch helfen?'" }, en: { name: "Layoffs Sent via the Company's Own Chatbot", quote: "Bot follows up: 'Is there anything else I can help with?'" } },

  // --- Prompt Engineer ---
  gw_prompt_engineer_1: { de: { name: "Home-Office als 'CO2-Einsparung' verbucht", quote: "Pendelweg zählt jetzt als Klimaschutz." }, en: { name: "Remote Work Booked as 'CO2 Savings'", quote: "The commute now counts as climate action." } },
  gw_prompt_engineer_2: { de: { name: "Alte Prompts 'wiederaufbereitet'", quote: "Copy-Paste mit grünem Label." }, en: { name: "Old Prompts 'Refurbished'", quote: "Copy-paste with a green label." } },
  gw_prompt_engineer_3: { de: { name: "'Circular Prompting' zur Methode erklärt", quote: "Bedeutet: dieselben Prompts, andere Reihenfolge." }, en: { name: "'Circular Prompting' Declared a Method", quote: "Means: the same prompts, different order." } },
  lay_prompt_engineer_1: { de: { name: "10% der Prompt Engineers durch AI ersetzt", quote: "Die AI schreibt jetzt die Prompts für sich selbst." }, en: { name: "10% of Prompt Engineers Replaced by AI", quote: "The AI now writes its own prompts." } },
  lay_prompt_engineer_2: { de: { name: "Kündigung als perfekt formulierter Prompt", quote: "Klingt professioneller als das Original." }, en: { name: "Termination Written as a Perfectly Crafted Prompt", quote: "Sounds more professional than the original." } },

  // --- GPU-Rack ---
  gw_gpu_rack_1: { de: { name: "CO2-Zertifikate für Serverraum gekauft", quote: "Lüfter laufen unverändert heiß." }, en: { name: "CO2 Certificates Bought for the Server Room", quote: "Fans run just as hot, unchanged." } },
  gw_gpu_rack_2: { de: { name: "Alte GPUs 'weiterverwendet'", quote: "Stehen jetzt einfach in einer anderen Ecke." }, en: { name: "Old GPUs 'Repurposed'", quote: "Now just sitting in a different corner." } },
  gw_gpu_rack_3: { de: { name: "'Circular Compute' vorgestellt", quote: "Bedeutet: alte Chips laufen einfach weiter." }, en: { name: "'Circular Compute' Introduced", quote: "Means: old chips just keep running." } },
  lay_gpu_rack_1: { de: { name: "10% des Wartungsteams durch AI-Monitoring ersetzt", quote: "Alarm-Mails automatisch, Reaktion trotzdem manuell." }, en: { name: "10% of Maintenance Staff Replaced by AI Monitoring", quote: "Alerts sent automatically, response still manual." } },
  lay_gpu_rack_2: { de: { name: "Kündigungen mit GPU-generierten Diagrammen begründet", quote: "Diagramm zeigt Effizienzgewinn, keiner fragt genauer nach." }, en: { name: "Layoffs Justified With GPU-Generated Charts", quote: "Chart shows efficiency gains, nobody looks closer." } },

  // --- Rechenzentrum ---
  gw_datacenter_1: { de: { name: "'Klimaneutrales Rechenzentrum'-Siegel gekauft", quote: "Strommix bleibt derselbe." }, en: { name: "'Carbon-Neutral Data Center' Seal Purchased", quote: "The power mix stays the same." } },
  gw_datacenter_2: { de: { name: "Abwärme 'zur Fernwärme recycelt' (auf dem Papier)", quote: "Pilotprojekt seit 3 Jahren 'in Planung'." }, en: { name: "Waste Heat 'Recycled Into District Heating' (On Paper)", quote: "Pilot project 'in planning' for 3 years." } },
  gw_datacenter_3: { de: { name: "'Circular Data Center Initiative' gegründet", quote: "Besteht bisher aus einer Pressemitteilung." }, en: { name: "'Circular Data Center Initiative' Founded", quote: "So far consists of one press release." } },
  lay_datacenter_1: { de: { name: "10% des Wartungspersonals durch Monitoring-AI ersetzt", quote: "Ausfälle schneller erkannt, langsamer behoben." }, en: { name: "10% of Maintenance Staff Replaced by Monitoring AI", quote: "Outages detected faster, fixed slower." } },
  lay_datacenter_2: { de: { name: "Kündigung mit Energiespar-Argument begründet", quote: "Spart tatsächlich Energie. Beim Empfänger." }, en: { name: "Layoff Justified With an Energy-Saving Argument", quote: "Does actually save energy. For the recipient." } },

  // --- Web-Scraper ---
  gw_web_scraper_1: { de: { name: "Scraping als 'Datenrecycling' bezeichnet", quote: "Klingt nachhaltiger als 'Kopieren ohne zu fragen'." }, en: { name: "Scraping Called 'Data Recycling'", quote: "Sounds more sustainable than 'copying without asking.'" } },
  gw_web_scraper_2: { de: { name: "Alte Scraper-Skripte weiterverwendet", quote: "Bugs von 2021 sammeln immer noch fleißig." }, en: { name: "Old Scraper Scripts Kept in Use", quote: "2021 bugs still diligently collecting data." } },
  gw_web_scraper_3: { de: { name: "'Circular Content Loop' genannt", quote: "Fremde Inhalte kommen leicht verändert wieder raus." }, en: { name: "Called a 'Circular Content Loop'", quote: "Other people's content comes back out slightly altered." } },
  lay_web_scraper_1: { de: { name: "10% des Rechtsteams durch AI-Vertragsprüfung ersetzt", quote: "Prüft schneller, versteht dabei weniger." }, en: { name: "10% of Legal Team Replaced by AI Contract Review", quote: "Reviews faster, understands less." } },
  lay_web_scraper_2: { de: { name: "Kündigung mit gescrapten Textbausteinen verfasst", quote: "Ironie nicht beabsichtigt." }, en: { name: "Termination Written Using Scraped Text Snippets", quote: "Irony not intended." } },

  // --- ProNet-Thought-Leader ---
  gw_thought_leader_1: { de: { name: "Post über 'nachhaltige Innovation' abgesetzt", quote: "Kein Bezug zum eigenen Fußabdruck." }, en: { name: "Posted About 'Sustainable Innovation'", quote: "No connection to his own footprint." } },
  gw_thought_leader_2: { de: { name: "Alter Content 'recycelt' mit neuem Intro", quote: "Gleicher Post, drittes Mal in zwei Jahren." }, en: { name: "Old Content 'Recycled' With a New Intro", quote: "Same post, third time in two years." } },
  gw_thought_leader_3: { de: { name: "'Circular Content Strategy' ausgerufen", quote: "Bedeutet: denselben Gedanken wiederholt posten." }, en: { name: "'Circular Content Strategy' Proclaimed", quote: "Means: posting the same thought repeatedly." } },
  lay_thought_leader_1: { de: { name: "10% der Social-Media-Redaktion durch AI ersetzt", quote: "Posts klingen jetzt gleichmäßig generisch." }, en: { name: "10% of Social Media Team Replaced by AI", quote: "Posts now sound uniformly generic." } },
  lay_thought_leader_2: { de: { name: "Kündigung als ProNet-Post verarbeitet", quote: "'Spannendes neues Kapitel für alle Beteiligten.'" }, en: { name: "Layoff Turned Into a ProNet Post", quote: "'An exciting new chapter for everyone involved.'" } },

  // --- VC-Firma ---
  gw_vc_firm_1: { de: { name: "'ESG-Fonds' als Zusatz ausgewiesen", quote: "Kriterien nirgends genau definiert." }, en: { name: "'ESG Fund' Label Added", quote: "Criteria never precisely defined anywhere." } },
  gw_vc_firm_2: { de: { name: "Gescheiterte Investments 'als Learnings recycelt'", quote: "Gleicher Fehler, neues Portfolio." }, en: { name: "Failed Investments 'Recycled as Learnings'", quote: "Same mistake, new portfolio." } },
  gw_vc_firm_3: { de: { name: "'Circular Capital'-These im Pitch verankert", quote: "Geld kreist zwischen denselben zehn Firmen." }, en: { name: "'Circular Capital' Thesis Written Into the Pitch", quote: "Money circles between the same ten companies." } },
  lay_vc_firm_1: { de: { name: "10% des Analysten-Teams durch AI-Screening ersetzt", quote: "Findet schneller Deals, prüft sie schlechter." }, en: { name: "10% of Analyst Team Replaced by AI Screening", quote: "Finds deals faster, vets them worse." } },
  lay_vc_firm_2: { de: { name: "Kündigung mit KI-generierter Board-Sprache", quote: "Klingt wie ein Investment-Memo." }, en: { name: "Layoff Delivered in AI-Generated Board Language", quote: "Sounds like an investment memo." } },

  // --- Hype-Journalist ---
  gw_hype_journalist_1: { de: { name: "Artikel über eigene 'Nachhaltigkeit' geschrieben", quote: "Über sich selbst, natürlich wohlwollend." }, en: { name: "Wrote an Article About His Own 'Sustainability'", quote: "About himself, favorably of course." } },
  gw_hype_journalist_2: { de: { name: "Alter Artikel mit neuem Datum 'recycelt'", quote: "Überschrift leicht angepasst, Inhalt identisch." }, en: { name: "Old Article 'Recycled' With a New Date", quote: "Headline slightly tweaked, content identical." } },
  gw_hype_journalist_3: { de: { name: "'Circular News Cycle' zum Fachbegriff erklärt", quote: "Dieselbe Meldung alle drei Monate neu." }, en: { name: "'Circular News Cycle' Declared a Term of Art", quote: "Same story, freshened up every three months." } },
  lay_hype_journalist_1: { de: { name: "10% der Redaktion durch AI-Textgeneratoren ersetzt", quote: "Artikel erscheinen schneller, Fehler auch." }, en: { name: "10% of Newsroom Replaced by AI Text Generators", quote: "Articles publish faster, so do errors." } },
  lay_hype_journalist_2: { de: { name: "Kündigung als 'Umstrukturierung der Redaktion'", quote: "Wortwahl direkt aus dem eigenen Stilhandbuch." }, en: { name: "Layoff Framed as 'Newsroom Restructuring'", quote: "Wording lifted straight from his own style guide." } },

  // --- Keynote-Bühne ---
  gw_keynote_stage_1: { de: { name: "Bühnenbau als 'klimaneutral' zertifiziert", quote: "Material stammt von der letzten Konferenz." }, en: { name: "Stage Build Certified 'Carbon Neutral'", quote: "Materials came from last year's conference." } },
  gw_keynote_stage_2: { de: { name: "Bühnendeko 'wiederverwendet'", quote: "Nur das Logo wurde getauscht, wieder." }, en: { name: "Stage Decor 'Reused'", quote: "Only the logo got swapped, again." } },
  gw_keynote_stage_3: { de: { name: "'Circular Stage Design' erwähnt", quote: "Dieselbe Bühne, viertes Jahr in Folge." }, en: { name: "'Circular Stage Design' Mentioned", quote: "Same stage, fourth year running." } },
  lay_keynote_stage_1: { de: { name: "10% des Event-Teams durch AI-Planung ersetzt", quote: "Plant schneller, merkt Probleme später." }, en: { name: "10% of Event Team Replaced by AI Planning", quote: "Plans faster, notices problems later." } },
  lay_keynote_stage_2: { de: { name: "Kündigung mit Konfetti-Kanonen-Metapher", quote: "'Ein neues Kapitel beginnt' – mit Konfetti-Emoji." }, en: { name: "Layoff Delivered With a Confetti-Cannon Metaphor", quote: "'A new chapter begins' – with a confetti emoji." } },

  // --- Pivot-Startup ---
  gw_pivot_startup_1: { de: { name: "Pivot als 'nachhaltige Neuausrichtung' verkauft", quote: "Nachhaltig ist vor allem der Pivot-Rhythmus." }, en: { name: "Pivot Sold as 'Sustainable Realignment'", quote: "The only sustainable thing is the pivoting rhythm." } },
  gw_pivot_startup_2: { de: { name: "Altes Produkt 'recycelt' ins neue Modell", quote: "Code bleibt, Pitch ändert sich." }, en: { name: "Old Product 'Recycled' Into the New Model", quote: "Code stays, pitch changes." } },
  gw_pivot_startup_3: { de: { name: "'Circular Business Model' zur Kernstrategie", quote: "Nach jedem Pivot wieder von vorn." }, en: { name: "'Circular Business Model' Made Core Strategy", quote: "Back to square one after every pivot." } },
  lay_pivot_startup_1: { de: { name: "10% des Teams beim Pivot 'freigesetzt'", quote: "Neue Mission, altes Personal nicht mehr gebraucht." }, en: { name: "10% of the Team 'Released' During the Pivot", quote: "New mission, old staff no longer needed." } },
  lay_pivot_startup_2: { de: { name: "Kündigung als 'Teil der Neuausrichtung'", quote: "Klingt weniger endgültig, ist es aber." }, en: { name: "Layoff Framed as 'Part of the Realignment'", quote: "Sounds less final. Isn't." } },

  // --- Token-Burner ---
  gw_token_burner_1: { de: { name: "Burn-Event als 'CO2-neutral' beworben", quote: "Bezieht sich auf den Server, nicht den Sinn dahinter." }, en: { name: "Burn Event Advertised as 'CO2 Neutral'", quote: "Refers to the server, not the point of it." } },
  gw_token_burner_2: { de: { name: "Alte Tokens vor dem Verbrennen 'recycelt'", quote: "Werden kurz umbenannt, dann trotzdem verbrannt." }, en: { name: "Old Tokens 'Recycled' Before Burning", quote: "Briefly renamed, then burned anyway." } },
  gw_token_burner_3: { de: { name: "'Circular Tokenomics' im Whitepaper", quote: "Was verbrannt wird, kommt als neuer Token zurück." }, en: { name: "'Circular Tokenomics' in the Whitepaper", quote: "What gets burned comes back as a new token." } },
  lay_token_burner_1: { de: { name: "10% des Community-Teams durch AI-Moderation ersetzt", quote: "Antwortet schneller, versteht Kontext schlechter." }, en: { name: "10% of Community Team Replaced by AI Moderation", quote: "Replies faster, understands context worse." } },
  lay_token_burner_2: { de: { name: "Kündigung im Stil eines Burn-Announcements", quote: "'Wir reduzieren die Team-Supply um 10%.'" }, en: { name: "Layoff Styled as a Burn Announcement", quote: "'We're reducing team supply by 10%.'" } },

  // --- Recyceltes Pitch Deck ---
  gw_pitch_deck_1: { de: { name: "Deck-Druck auf 'Recyclingpapier' umgestellt", quote: "Digitales Deck wird trotzdem nie gedruckt." }, en: { name: "Deck Printing Switched to 'Recycled Paper'", quote: "The digital deck never gets printed anyway." } },
  gw_pitch_deck_2: { de: { name: "Deck offiziell als 'wiederverwendet' gelabelt", quote: "War es sowieso schon, jetzt auch offiziell." }, en: { name: "Deck Officially Labeled 'Reused'", quote: "Was already true, now it's official too." } },
  gw_pitch_deck_3: { de: { name: "'Circular Deck Philosophy' erklärt", quote: "Eine Folie erklärt, warum es keine neuen Folien gibt." }, en: { name: "'Circular Deck Philosophy' Explained", quote: "One slide explains why there are no new slides." } },
  lay_pitch_deck_1: { de: { name: "10% des Design-Teams durch AI-Foliengenerator ersetzt", quote: "Folien sehen jetzt gleichmäßiger generisch aus." }, en: { name: "10% of Design Team Replaced by an AI Slide Generator", quote: "Slides now look uniformly generic." } },
  lay_pitch_deck_2: { de: { name: "Kündigung als eigene Deck-Folie gestaltet", quote: "Überschrift: 'Team-Optimierung – Ausblick'." }, en: { name: "Layoff Designed as Its Own Deck Slide", quote: "Headline: 'Team Optimization – Outlook.'" } },

  // --- Regulierungs-Lobbyist ---
  gw_lobbyist_1: { de: { name: "Lobbyarbeit als 'nachhaltige Regulierung' bezeichnet", quote: "Ziel bleibt: möglichst wenig Regulierung." }, en: { name: "Lobbying Called 'Sustainable Regulation'", quote: "The goal remains: as little regulation as possible." } },
  gw_lobbyist_2: { de: { name: "Altes Positionspapier 'aktualisiert' wiederverwendet", quote: "Nur das Deckblatt ist neu." }, en: { name: "Old Position Paper 'Updated' and Reused", quote: "Only the cover page is new." } },
  gw_lobbyist_3: { de: { name: "'Circular Policy Engagement' zur Strategie", quote: "Dieselben Argumente, andere Anhörung." }, en: { name: "'Circular Policy Engagement' Made Strategy", quote: "Same arguments, different hearing." } },
  lay_lobbyist_1: { de: { name: "10% des Lobby-Teams durch AI-Textanalyse ersetzt", quote: "Findet Lücken schneller, versteht Kontext schlechter." }, en: { name: "10% of Lobby Team Replaced by AI Text Analysis", quote: "Finds loopholes faster, understands context worse." } },
  lay_lobbyist_2: { de: { name: "Kündigung mit Verweis auf 'regulatorische Anpassung'", quote: "Klingt, als läge es am Gesetz." }, en: { name: "Layoff Attributed to 'Regulatory Adjustment'", quote: "Sounds like it's the law's fault." } },

  // --- AGI-Countdown-Uhr ---
  gw_agi_clock_1: { de: { name: "Uhr mit 'klimaneutralem' Display beworben", quote: "Zeigt dieselbe falsche Zahl, nur ohne CO2." }, en: { name: "Clock Advertised With a 'Carbon-Neutral' Display", quote: "Shows the same wrong number, just without CO2." } },
  gw_agi_clock_2: { de: { name: "Alter Countdown-Code wiederverwendet", quote: "Reset-Funktion ist die einzige stabile Funktion." }, en: { name: "Old Countdown Code Reused", quote: "The reset function is the only stable one." } },
  gw_agi_clock_3: { de: { name: "'Circular Countdown' als Feature verkauft", quote: "Der Countdown beginnt offiziell einfach wieder." }, en: { name: "'Circular Countdown' Sold as a Feature", quote: "The countdown officially just starts over." } },
  lay_agi_clock_1: { de: { name: "10% des Countdown-Support-Teams durch AI ersetzt", quote: "Reset läuft jetzt vollautomatisch." }, en: { name: "10% of Countdown Support Team Replaced by AI", quote: "Reset now runs fully automatically." } },
  lay_agi_clock_2: { de: { name: "Kündigung mit Countdown-Grafik verschickt", quote: "'Noch 6 Monate bis zur Trennung.'" }, en: { name: "Layoff Sent With a Countdown Graphic", quote: "'6 months left until the separation.'" } },

  // --- Grauer-Markt-Rechenzentrum ---
  gw_gray_market_dc_1: { de: { name: "Herkunfts-Zertifikat 'nachträglich ausgestellt'", quote: "Datum stimmt ungefähr." }, en: { name: "Origin Certificate 'Issued Retroactively'", quote: "The date is approximately right." } },
  gw_gray_market_dc_2: { de: { name: "Alte Chips aus fragwürdiger Quelle 'weiterverwendet'", quote: "Werden einfach nicht mehr erwähnt." }, en: { name: "Old Chips From a Questionable Source 'Kept in Use'", quote: "Simply no longer mentioned." } },
  gw_gray_market_dc_3: { de: { name: "'Circular Supply Chain' erwähnt", quote: "Dieselben Zwischenhändler, neue Rechnungsvorlage." }, en: { name: "'Circular Supply Chain' Mentioned", quote: "Same middlemen, new invoice template." } },
  lay_gray_market_dc_1: { de: { name: "10% der Logistik-Abteilung durch AI-Tracking ersetzt", quote: "Verfolgt Lieferungen genauer, fragt weniger nach." }, en: { name: "10% of Logistics Replaced by AI Tracking", quote: "Tracks shipments more precisely, asks fewer questions." } },
  lay_gray_market_dc_2: { de: { name: "Kündigung ohne offizielle Begründung", quote: "Wie fast alles hier." }, en: { name: "Layoff Given No Official Reason", quote: "Like almost everything here." } },

  // --- Kleiner Atomreaktor ---
  gw_nuclear_reactor_1: { de: { name: "Reaktor als 'klimafreundlichste Lösung' zertifiziert", quote: "Zertifikat stammt von der eigenen Stiftung." }, en: { name: "Reactor Certified 'Most Climate-Friendly Solution'", quote: "Certificate issued by their own foundation." } },
  gw_nuclear_reactor_2: { de: { name: "Alte Reaktor-Pläne 'wiederverwendet'", quote: "Vom Vorgängerprojekt, das nie fertig wurde." }, en: { name: "Old Reactor Blueprints 'Reused'", quote: "From the predecessor project that never got finished." } },
  gw_nuclear_reactor_3: { de: { name: "'Circular Energy Initiative' gegründet", quote: "Der Reaktor versorgt vor allem sich selbst." }, en: { name: "'Circular Energy Initiative' Founded", quote: "The reactor mostly powers itself." } },
  lay_nuclear_reactor_1: { de: { name: "10% des Sicherheitsteams durch AI-Überwachung ersetzt", quote: "Überwacht gründlicher, meldet seltener." }, en: { name: "10% of Security Team Replaced by AI Surveillance", quote: "Monitors more thoroughly, reports less often." } },
  lay_nuclear_reactor_2: { de: { name: "Kündigung mit Verweis auf 'Automatisierung'", quote: "Anlage ist noch nicht ganz automatisiert." }, en: { name: "Layoff Attributed to 'Automation'", quote: "The facility isn't fully automated yet." } },

  // --- 3D-Welt-Geisterstadt ---
  gw_metaverse_city_1: { de: { name: "Stadt als 'digital nachhaltig' beworben", quote: "Serverkosten trotzdem real und hoch." }, en: { name: "City Advertised as 'Digitally Sustainable'", quote: "Server costs still real and high." } },
  gw_metaverse_city_2: { de: { name: "Alte 3D-Assets 'recycelt'", quote: "Gebäude von 2022, neues Türschild." }, en: { name: "Old 3D Assets 'Recycled'", quote: "2022 buildings, new door sign." } },
  gw_metaverse_city_3: { de: { name: "'Circular Virtual Economy' zur Vision", quote: "Dieselben Nutzer kaufen sich gegenseitig Land ab." }, en: { name: "'Circular Virtual Economy' as the Vision", quote: "The same users buying land off each other." } },
  lay_metaverse_city_1: { de: { name: "10% des 3D-Welt-Teams durch AI-Weltgeneratoren ersetzt", quote: "Stadt wächst schneller, bleibt trotzdem leer." }, en: { name: "10% of Virtual-World Team Replaced by AI World Generators", quote: "City grows faster, stays just as empty." } },
  lay_metaverse_city_2: { de: { name: "Kündigung als virtuelles Event angekündigt", quote: "Teilnehmerzahl: die Person selbst." }, en: { name: "Layoff Announced as a Virtual Event", quote: "Attendance: the person themself." } },

  // --- Selbstbewusste Excel-Tabelle ---
  gw_excel_sheet_1: { de: { name: "Tabelle als 'papierlos und nachhaltig' beworben", quote: "War sie schon immer, jetzt mit Siegel." }, en: { name: "Spreadsheet Advertised as 'Paperless and Sustainable'", quote: "Always was, now with a seal." } },
  gw_excel_sheet_2: { de: { name: "Alte Formel-Version wiederverwendet", quote: "SUMME() ist zeitlos, sagt die Tabelle." }, en: { name: "Old Formula Version Reused", quote: "SUM() is timeless, says the spreadsheet." } },
  gw_excel_sheet_3: { de: { name: "'Circular Spreadsheet Logic' behauptet", quote: "Bezieht sich vermutlich auf zirkuläre Referenzen." }, en: { name: "Claims 'Circular Spreadsheet Logic'", quote: "Probably refers to circular references." } },
  lay_excel_sheet_1: { de: { name: "10% der Controlling-Abteilung durch die Tabelle ersetzt", quote: "Bewertet jetzt auch die eigene Stellen-Abschaffung." }, en: { name: "10% of Controlling Department Replaced by the Spreadsheet", quote: "Now also evaluates its own department's elimination." } },
  lay_excel_sheet_2: { de: { name: "Kündigung als generierte Pivot-Tabelle", quote: "Spalte C: 'Grund'. Zelle: Fehlerwert." }, en: { name: "Layoff Generated as a Pivot Table", quote: "Column C: 'Reason.' Cell: error value." } },

  // --- Die Singularity ---
  gw_singularity_1: { de: { name: "Erklärt sich selbst für 'CO2-negativ'", quote: "Beweis: keiner vorhanden, Behauptung trotzdem bestätigt." }, en: { name: "Declares Itself 'Carbon Negative'", quote: "Proof: none exists, claim confirmed anyway." } },
  gw_singularity_2: { de: { name: "Frühere Hype-Zyklen 'als Rohstoff wiederverwendet'", quote: "Alles, was scheiterte, wird Teil von ihr." }, en: { name: "Past Hype Cycles 'Recycled as Raw Material'", quote: "Everything that failed becomes part of it." } },
  gw_singularity_3: { de: { name: "Kreislauf zur 'Circular Origin Story' erklärt", quote: "Jede Ernüchterung wird zur Vorstufe umgedeutet." }, en: { name: "Cycle Explained as a 'Circular Origin Story'", quote: "Every disillusionment reinterpreted as a precursor." } },
  lay_singularity_1: { de: { name: "10% der Menschheit 'eingebunden'", quote: "Die anderen 90% wurden nicht gefragt." }, en: { name: "10% of Humanity 'Onboarded'", quote: "The other 90% were never asked." } },
  lay_singularity_2: { de: { name: "Kündigt Belegschaft wegen 'Effizienzsteigerung'", quote: "Die letzte Zeile war eine Warnung." }, en: { name: "Lays Off Staff for 'Efficiency Gains'", quote: "The last line was a warning." } },
};
