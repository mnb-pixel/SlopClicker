import * as THREE from 'three';
import { FURNACE_ANCHOR } from '../../data/zonesData';
import { buildOffice } from './buildOffice';
import { buildBasement } from './buildBasement';
import { buildStage } from './buildStage';
import { buildTower } from './buildTower';
import { buildEndgame } from './buildEndgame';

// Zonen-Bauer je Zone. Fehlt ein Eintrag, bleibt die Zone eine leere Platte.
// Signatur: (palette, zoneDef, furnaceAnchor) -> { group, update(zone, ctx, palette), applyPalette }
const ZONE_BUILDERS = {
  office: buildOffice,
  basement: buildBasement,
  stage: buildStage,
  tower: buildTower,
  endgame: buildEndgame,
};

// Zonen-Grundplatten auf der Insel. In Phase 1 sind das nur flache Platten: hell (Weg-
// Farbe), sobald die Zone freigeschaltet ist, sonst dunkleres Gras. Sie sind das
// Klickziel für das Kaufpanel und liefern die Ankerpunkte der HTML-Beschriftungen.
// Die eigentlichen Gebäude kommen ab Phase 3 als Kinder dieser Gruppen dazu.
//
// Drei Sichtbarkeitsstufen pro Zone (aus deriveZones, Regel in utils/buildingUnlock.js):
// revealed = Platte sichtbar und anklickbar; teaser = Platte sichtbar, aber dunkel und
// nicht anklickbar (das ist die eine "???"-Zone dahinter); alles Weitere ist gar nicht
// erst da - die Platte wird unsichtbar geschaltet, damit die Insel nicht verrät, was
// noch kommt.
export function buildZones(palette, zonesData) {
  const group = new THREE.Group();
  const hitMeshes = [];
  const plates = {};
  const labelAnchors = {};
  const builders = {};
  const effects = {};
  const dummy = new THREE.Object3D();

  function hash01(i) {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  // Zonen-Effekte, für alle Zonen gleich gebaut:
  // - damaged (Black Swan): rote Platte blinkt, dunkler Rauch über der Zone
  // - laidOff (Layoff): Umzugskartons in der Zonenecke
  // - greenwashed (Greenwashing): Plastikpflanzen in Töpfen und grünes Banner
  function buildEffects(zone) {
    const g = new THREE.Group();
    const { anchor3d, footprint } = zone;
    g.position.set(anchor3d.x, 0.3, anchor3d.z);

    const smokeMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true, transparent: true, opacity: 0.85 });
    const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), smokeMat, 10);
    smoke.frustumCulled = false;
    smoke.count = 0;
    g.add(smoke);
    const smokePhase = Float32Array.from({ length: 10 }, (_, i) => hash01(i + 3000));

    const boxMat = new THREE.MeshLambertMaterial({ color: palette.cardboard, flatShading: true });
    const boxes = new THREE.Group();
    boxes.visible = false;
    const corner = { x: -footprint.w / 2 + 0.7, z: footprint.d / 2 - 0.7 };
    [
      [0, 0.3, 0, 0.6, 0.6, 0.6, 0.1],
      [0.7, 0.25, 0.1, 0.5, 0.5, 0.5, -0.2],
      [0.3, 0.85, 0.05, 0.5, 0.5, 0.5, 0.35],
      [-0.6, 0.2, 0.5, 0.4, 0.4, 0.4, 0.6],
    ].forEach(([x, y, z, w, h, d, yaw]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxMat);
      m.position.set(corner.x + x, y, corner.z + z);
      m.rotation.y = yaw;
      m.castShadow = true;
      boxes.add(m);
    });
    g.add(boxes);

    const potMat = new THREE.MeshLambertMaterial({ color: palette.pot, flatShading: true });
    const plantMat = new THREE.MeshLambertMaterial({ color: palette.plant, flatShading: true });
    const plants = new THREE.Group();
    plants.visible = false;
    const spots = [
      { x: footprint.w / 2 - 0.5, z: footprint.d / 2 - 0.5 },
      { x: footprint.w / 2 - 0.5, z: -footprint.d / 2 + 0.5 },
      { x: -footprint.w / 2 + 0.5, z: -footprint.d / 2 + 0.5 },
    ];
    spots.forEach((sp, i) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.35, 6), potMat);
      pot.position.set(sp.x, 0.17, sp.z);
      plants.add(pot);
      for (let k = 0; k < 3; k += 1) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + (k % 2) * 0.06, 0), plantMat);
        leaf.position.set(sp.x + Math.sin(k * 2.1 + i) * 0.16, 0.5 + k * 0.16, sp.z + Math.cos(k * 2.1 + i) * 0.16);
        plants.add(leaf);
      }
    });
    // Banner: grüner Streifen an zwei Pfosten an der Vorderkante, weißer Kreis als Siegel.
    const bannerMat = new THREE.MeshLambertMaterial({ color: palette.banner, flatShading: true });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.04), bannerMat);
    banner.position.set(0, 1.3, footprint.d / 2 + 0.1);
    plants.add(banner);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    seal.rotation.x = Math.PI / 2;
    seal.position.set(-0.8, 1.3, footprint.d / 2 + 0.14);
    plants.add(seal);
    [-1.25, 1.25].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5), potMat);
      post.position.set(x, 0.8, footprint.d / 2 + 0.1);
      plants.add(post);
    });
    g.add(plants);

    return {
      group: g,
      smoke,
      smokePhase,
      boxes,
      plants,
      mats: { boxMat, potMat, plantMat, bannerMat },
    };
  }

  zonesData.forEach((zone) => {
    const { anchor3d, footprint } = zone;
    const mat = new THREE.MeshLambertMaterial({
      color: palette.plateLocked,
      flatShading: true,
      transparent: true,
      opacity: 0.55,
    });
    const plate = new THREE.Mesh(new THREE.BoxGeometry(footprint.w, 0.3, footprint.d), mat);
    plate.position.set(anchor3d.x, 0.15, anchor3d.z);
    plate.receiveShadow = true;
    plate.userData.zoneId = zone.id;
    // Beides setzt update() pro Frame. Start: nicht da - sonst blitzt beim ersten Bild
    // die komplette Insel auf, bevor der erste update() die Sichtbarkeit kennt.
    plate.visible = false;
    plate.userData.clickable = false;
    group.add(plate);
    hitMeshes.push(plate);
    plates[zone.id] = { plate, mat, unlocked: null, selected: null };

    effects[zone.id] = buildEffects(zone);
    group.add(effects[zone.id].group);

    const makeBuilder = ZONE_BUILDERS[zone.id];
    if (makeBuilder) {
      const built = makeBuilder(palette, zone, FURNACE_ANCHOR);
      built.group.visible = false;
      group.add(built.group);
      builders[zone.id] = built;
    }

    // Beschriftung sitzt vom Ofen weg gerückt am äußeren Rand der Platte, damit die
    // Schilder der hinteren Zonen nicht über dem Schlot hängen.
    if (zone.labelAnchor3d) {
      labelAnchors[zone.id] = new THREE.Vector3(zone.labelAnchor3d.x, zone.labelAnchor3d.y, zone.labelAnchor3d.z);
    } else {
      const len = Math.hypot(anchor3d.x, anchor3d.z) || 1;
      const push = Math.min(footprint.w, footprint.d) * 0.45;
      labelAnchors[zone.id] = new THREE.Vector3(
        anchor3d.x + (anchor3d.x / len) * push,
        1.4,
        anchor3d.z + (anchor3d.z / len) * push
      );
    }
  });

  return {
    group,
    hitMeshes,
    labelAnchors,
    // ctx: { dt, t, reduced, tickerText }
    update(zones, selectedId, p, ctx) {
      zones.forEach((z) => {
        const entryEarly = plates[z.id];
        if (entryEarly) {
          // Nicht freigeschaltet und auch nicht der Platzhalter -> Zone existiert für
          // den Spieler noch gar nicht.
          entryEarly.plate.visible = z.revealed || z.teaser;
          // Der Platzhalter ist bewusst tot: es gibt dort nichts zu kaufen, ein
          // Kaufpanel mit ausschließlich gesperrten Zeilen wäre nur eine Sackgasse.
          entryEarly.plate.userData.clickable = Boolean(z.revealed);
        }

        const built = builders[z.id];
        if (built) {
          built.group.visible = z.unlocked;
          if (z.unlocked) built.update(z, ctx, p);
        }
        const fx = effects[z.id];
        if (fx) {
          fx.boxes.visible = z.unlocked && z.laidOff;
          fx.plants.visible = z.unlocked && z.greenwashed;
          fx.smoke.count = z.unlocked && z.damaged ? 10 : 0;
          if (fx.smoke.count > 0) {
            for (let i = 0; i < 10; i += 1) {
              fx.smokePhase[i] = (fx.smokePhase[i] + ctx.dt * (ctx.reduced ? 0 : 0.5)) % 1;
              const ph = fx.smokePhase[i];
              dummy.position.set((hash01(i) - 0.5) * z.footprint.w * 0.6, 0.5 + ph * 3.5, (hash01(i + 9) - 0.5) * z.footprint.d * 0.6);
              dummy.scale.setScalar(0.4 + ph * 1.6);
              dummy.rotation.set(ph * 3, i, 0);
              dummy.updateMatrix();
              fx.smoke.setMatrixAt(i, dummy.matrix);
            }
            fx.smoke.instanceMatrix.needsUpdate = true;
          }
        }

        const entry = plates[z.id];
        if (!entry) return;
        const selected = selectedId === z.id;
        // Black Swan: Platte blinkt rot, solange die Zone beschädigt ist.
        if (z.damaged && z.unlocked) {
          const k = ctx.reduced ? 0.6 : 0.35 + Math.max(0, Math.sin(ctx.t * 8)) * 0.5;
          entry.mat.emissive.setHex(p.danger).multiplyScalar(k);
          entry.damagedApplied = true;
          return;
        }
        if (entry.unlocked === z.unlocked && entry.selected === selected && !entry.damagedApplied) return;
        entry.damagedApplied = false;
        entry.unlocked = z.unlocked;
        entry.selected = selected;
        entry.mat.color.setHex(z.unlocked ? p.path : p.plateLocked);
        entry.mat.opacity = z.unlocked ? 1 : 0.55;
        entry.mat.emissive.setHex(selected ? p.neon : 0x000000).multiplyScalar(selected ? 0.35 : 0);
      });
    },
    applyPalette(p) {
      // Plattenfarben werden beim nächsten update() neu gesetzt.
      Object.values(plates).forEach((e) => {
        e.unlocked = null;
      });
      Object.values(builders).forEach((b) => b.applyPalette(p));
      Object.values(effects).forEach((fx) => {
        fx.mats.boxMat.color.setHex(p.cardboard);
        fx.mats.potMat.color.setHex(p.pot);
        fx.mats.plantMat.color.setHex(p.plant);
        fx.mats.bannerMat.color.setHex(p.banner);
      });
    },
  };
}
