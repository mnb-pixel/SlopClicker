import { Fragment } from 'react';
import { AdBanner } from '../components/AdBanner';
import { Section, Sub, Prose, Bullets, DataTable, Callout, Steps, renderRich } from './ui.jsx';

// Alle Abschnitte einer Textseite; nach dem Abschnitt mit Index adAfter ein Werbeslot
// (AdBanner rendert nichts, solange VITE_ADSENSE_CLIENT_ID leer ist - siehe AdBanner.jsx).
export function ContentSections({ sections, adAfter = 1 }) {
  return sections.map((section, i) => (
    <Fragment key={section.id}>
      <Section id={section.id} kicker={section.kicker} title={section.title}>
        <Blocks blocks={section.blocks} keyPrefix={section.id} />
      </Section>
      {i === adAfter && (
        <div className="mt-10">
          <AdBanner variant="rectangle" label="Werbung" />
        </div>
      )}
    </Fragment>
  ));
}

// Rendert die Block-Listen aus src/site/content/*.js. Format pro Block:
//   ['h3', 'Zwischenüberschrift', 'optionale-id']
//   ['p', 'Absatz mit **fett** und [Link](/pfad)']
//   ['ul', ['Punkt', 'Punkt']]
//   ['table', { caption, head: [...], rows: [[...], ...] }]
//   ['callout', 'Titel', 'Text']
//   ['steps', [{ title, text }, ...]]
export function Blocks({ blocks, keyPrefix = 'blk' }) {
  return blocks.map((block, i) => {
    const key = `${keyPrefix}-${i}`;
    const [type, a, b] = block;
    switch (type) {
      case 'h3':
        return (
          <Sub key={key} id={b}>
            {a}
          </Sub>
        );
      case 'p':
        return (
          <Prose key={key}>
            <p>{renderRich(a, key)}</p>
          </Prose>
        );
      case 'ul':
        return (
          <Prose key={key}>
            <Bullets items={a} keyPrefix={key} />
          </Prose>
        );
      case 'table':
        return <DataTable key={key} caption={a.caption} head={a.head} rows={a.rows} />;
      case 'callout':
        return (
          <Callout key={key} title={a}>
            {renderRich(b, key)}
          </Callout>
        );
      case 'steps':
        return <Steps key={key} items={a} />;
      default:
        return null;
    }
  });
}
