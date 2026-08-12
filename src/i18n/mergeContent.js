// Verschmilzt die großen Content-Dictionaries (Gebäude, Upgrades, Greenwashing,
// Achievements, Events) in flache Übersetzungs-Keys, damit die bestehende t()-Funktion
// (TRANSLATIONS[lang][key], Fallback auf en) sie unverändert nutzen kann.
// FR/ES sind hier bewusst noch nicht befüllt -> fallen automatisch auf EN zurück,
// bis sie ergänzt werden (System ist mehrsprachig vorbereitet, ohne jetzt 4x
// übersetzt werden zu müssen).

import { BUILDINGS_CONTENT } from './content/buildings.content';
import { UPGRADES_CONTENT } from './content/upgrades.content';
import { GREENWASHING_CONTENT } from './content/greenwashing.content';
import { ACHIEVEMENTS_CONTENT } from './content/achievements.content';
import { EVENTS_CONTENT } from './content/events.content';
import { CREDIBILITY_CONTENT } from './content/credibility.content';
import { HEAVENLY_CONTENT } from './content/heavenly.content';
import { BLACKSWAN_CONTENT } from './content/blackswan.content';
import { MISC_UPGRADES_CONTENT } from './content/miscUpgrades.content';
import { EPOCHS_CONTENT } from './content/epochs.content';

const LANGS = ['de', 'en'];

function pick(byLang, lang) {
  return byLang[lang] || byLang.en || byLang.de || {};
}

export function buildContentTranslations() {
  const out = { de: {}, en: {} };

  Object.entries(BUILDINGS_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`building_${id}_name`] = text.name;
    });
  });

  Object.entries(UPGRADES_CONTENT).forEach(([buildingId, byThreshold]) => {
    Object.entries(byThreshold).forEach(([threshold, byLang]) => {
      const upId = `${buildingId}_up_${threshold}`;
      LANGS.forEach((lang) => {
        const text = pick(byLang, lang);
        if (text.name) out[lang][`upgrade_${upId}_name`] = text.name;
        if (text.quote) out[lang][`upgrade_${upId}_quote`] = text.quote;
      });
    });
  });

  Object.entries(GREENWASHING_CONTENT).forEach(([itemId, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`gw_${itemId}_name`] = text.name;
      if (text.quote) out[lang][`gw_${itemId}_quote`] = text.quote;
    });
  });

  Object.entries(ACHIEVEMENTS_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`ach_${id}_name`] = text.name;
      if (text.quote) out[lang][`ach_${id}_quote`] = text.quote;
    });
  });

  Object.entries(EVENTS_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.title) out[lang][`event_${id}_title`] = text.title;
      if (text.desc) out[lang][`event_${id}_desc`] = text.desc;
    });
  });

  Object.entries(CREDIBILITY_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`${id}_name`] = text.name;
      if (text.quote) out[lang][`${id}_quote`] = text.quote;
    });
  });

  Object.entries(HEAVENLY_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`heavenly_${id}_name`] = text.name;
      if (text.quote) out[lang][`heavenly_${id}_quote`] = text.quote;
      if (text.description) out[lang][`heavenly_${id}_description`] = text.description;
    });
  });

  Object.entries(BLACKSWAN_CONTENT).forEach(([buildingId, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.title) out[lang][`blackswan_${buildingId}_title`] = text.title;
      if (text.desc) out[lang][`blackswan_${buildingId}_desc`] = text.desc;
    });
  });

  Object.entries(MISC_UPGRADES_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`miscup_${id}_name`] = text.name;
      if (text.quote) out[lang][`miscup_${id}_quote`] = text.quote;
      if (text.description) out[lang][`miscup_${id}_description`] = text.description;
    });
  });

  Object.entries(EPOCHS_CONTENT).forEach(([id, byLang]) => {
    LANGS.forEach((lang) => {
      const text = pick(byLang, lang);
      if (text.name) out[lang][`epoch_${id}_name`] = text.name;
      if (text.prefix !== undefined) out[lang][`epoch_${id}_prefix`] = text.prefix;
    });
  });

  return out;
}
