import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { TAB_ROUTES } from '../../routes';

// Schublade über der Szene. Handy: von unten, bis ca. 72% Höhe. Desktop: von rechts,
// 420px breit. Die Szene bleibt dahinter sichtbar und läuft weiter. Inhalt sind die
// unveränderten Tab-Komponenten (StoreTab, StatsTab, MiscTab).
//
// Rahmen im Grafik-Stil der Insel (Papier, Tinte, klotzige Kanten, Griff zum Ziehen),
// Inhalt in einer dunklen Einlassung - wie ein Display, das in dieses Brett eingebaut
// ist. Der Grund für die Zweiteilung ist handfest: StoreTab & Co. gehören AUCH der
// normalen Spielansicht unter /play und tragen ihre dunklen Farben fest im Markup.
// Sie hier hell umzufärben hieße, ihr Styling aus der Ferne per CSS zu überschreiben -
// jede spätere Änderung an den Tabs würde in dieser Ansicht lautlos kaputtgehen.
export function Drawer({ open, title, onClose, useRoutes = false, children }) {
  if (!open) return null;

  const closeButton = useRoutes ? (
    <Link to={TAB_ROUTES[1]} aria-label="Close" className="hud-drawer__close">
      <X className="w-4 h-4" />
    </Link>
  ) : (
    <button onClick={onClose} aria-label="Close" className="hud-drawer__close">
      <X className="w-4 h-4" />
    </button>
  );

  // Backdrop: Klick daneben schließt. Im Web-Build läuft das über die Route, sonst über
  // den State-Setter - beides landet auf Tab 1.
  const backdropClose = useRoutes ? undefined : onClose;

  return (
    <>
      <div className="hud-drawer-backdrop" onClick={backdropClose}>
        {useRoutes && <Link to={TAB_ROUTES[1]} className="absolute inset-0" aria-hidden="true" tabIndex={-1} />}
      </div>
      <aside className="hud-drawer" role="dialog" aria-label={title}>
        <span className="hud-drawer__grip" aria-hidden="true" />
        <div className="hud-drawer__head">
          <h2 className="hud-drawer__title">{title}</h2>
          {closeButton}
        </div>
        <div className="hud-drawer__body">{children}</div>
      </aside>
    </>
  );
}
