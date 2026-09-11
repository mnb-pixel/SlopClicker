// Anzeigetexte für Upgrades und Corporate Actions (Greenwashing/Layoffs) - eine Quelle
// für StoreTab (Schublade) UND ZoneBuyPanel (Kaufpanel in der 3D-Szene). Beide zeigen
// dieselben Posten, nur an verschiedenen Orten; zwei Textbauer hätten irgendwann
// unterschiedliche Wortwahl für denselben Kauf gezeigt.
//
// Reine Funktionen: `tr` kommt vom Aufrufer, kein eigener i18n-Zugriff.

export const buildingName = (buildingId, tr) => tr(`building_${buildingId}_name`);

export const upgradeName = (up, tr) => (up.type === 'building' ? tr(`upgrade_${up.id}_name`) : tr(`miscup_${up.id}_name`));

export const upgradeQuote = (up, tr) => (up.type === 'building' ? tr(`upgrade_${up.id}_quote`) : tr(`miscup_${up.id}_quote`));

export const upgradeDescription = (up, tr) => {
  if (up.type !== 'building') return tr(`miscup_${up.id}_description`);
  return tr('buildingUpgradeEffectDesc')
    .replace('{building}', buildingName(up.buildingId, tr))
    .replace('{pct}', Math.round((up.effect.value - 1) * 100));
};

// Ziel-Badge ("🎯 GPU-Rack"): nur für die Schublade interessant, wo Upgrades aller
// Gebäude gemischt aufgelistet werden - im Kaufpanel einer Zone ist das Ziel schon durch
// den Panel-Kopf klar, deshalb dort nicht verwendet.
export const upgradeTargetBadge = (up, tr) => {
  if (!up) return '';
  if (up.type === 'building') return `🎯 ${buildingName(up.buildingId, tr)}`;
  if (up.type === 'click') return `🎯 ${tr('affectsClick')}`;
  if (up.type === 'syndicate') {
    return up.req?.buildingId ? `🎯 ${buildingName(up.req.buildingId, tr)}` : `🎯 ${tr('affectsSyndicate')}`;
  }
  return `🎯 ${tr('affectsGlobal')}`;
};

export const gwName = (item, tr) => {
  const val = tr(`gw_${item.id}_name`);
  if (val && val !== `gw_${item.id}_name`) return val;
  const bName = buildingName(item.buildingId, tr);
  return item.type === 'greenwashing' ? `${tr('gwFallbackName')} ${item.tier} (${bName})` : `${tr('layoffFallbackName')} ${item.tier} (${bName})`;
};

export const gwQuote = (item, tr) => {
  const val = tr(`gw_${item.id}_quote`);
  if (val && val !== `gw_${item.id}_quote`) return val;
  return item.type === 'greenwashing' ? tr('gwFallbackQuote') : tr('layoffFallbackQuote');
};

export const gwEffectDesc = (item, tr) => {
  if (item.type === 'greenwashing' && item.tier === 1) return tr('gwEffect1');
  if (item.type === 'greenwashing' && item.tier === 2) return tr('gwEffect2');
  if (item.type === 'greenwashing' && item.tier === 3) return tr('gwEffect3');
  if (item.type === 'layoff' && item.tier === 1) return tr('layoffEffect1');
  if (item.type === 'layoff' && item.tier === 2) return tr('layoffEffect2');
  return '';
};
