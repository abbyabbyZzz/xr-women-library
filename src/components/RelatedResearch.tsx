import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, List, Network } from 'lucide-react';
import { relatedPapers, shortAuthors, type Paper } from '../data/catalogue';

type Props = { paper: Paper; papers: Paper[]; returnTo: string };

export default function RelatedResearch({ paper, papers, returnTo }: Props) {
  const [view, setView] = useState<'network' | 'list'>('network');
  const connections = relatedPapers(papers, paper);
  const networkConnections = connections.slice(0, 5);
  const positions = networkConnections.length <= 2
    ? [{ x: 20, y: 50 }, { x: 80, y: 50 }]
    : [{ x: 17, y: 20 }, { x: 83, y: 20 }, { x: 17, y: 80 }, { x: 83, y: 80 }, { x: 50, y: 94 }];
  return <section className="related-section" aria-labelledby="related-heading">
    <div className="section-title-row"><div><h2 id="related-heading">Related research</h2></div>
      {connections.length ? <div className="view-switch" role="group" aria-label="Related research view">
        <button aria-pressed={view === 'network'} onClick={() => setView('network')}><Network size={16} aria-hidden="true" /><span>Network</span></button>
        <button aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} aria-hidden="true" /><span>List</span></button>
      </div> : null}
    </div>
    <p className="section-intro">Connected through shared Zotero tags, collections, and broader topics. These connections show subject similarity, not citations.</p>
    {connections.length === 0 ? <p className="quiet-panel">No tag or collection connections are available in Zotero yet.</p> : <>
      {view === 'network' ? <div className="network-panel">
        <div className="network-graph" aria-label={`Research network for ${shortAuthors(paper)}, ${paper.year || 'date unavailable'}`}>
          <svg className="network-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {networkConnections.map((connection, i) => <line key={connection.paper.id} x1="50" y1="45" x2={positions[i].x} y2={positions[i].y} />)}
          </svg>
          <div className="network-current" style={{ left: '50%', top: '45%' }}><span className="node-dot" /><span className="node-label">Selected paper</span><strong>{shortAuthors(paper)}</strong><span>{paper.year || 'Date unavailable'}</span></div>
          {networkConnections.map((connection, i) => {
            const connectionLabel = connection.sharedKeywords[0] ?? connection.sharedCategories[0] ?? connection.sharedTopics[0]?.label;
            return <Link className="network-node" title={connection.paper.title} key={connection.paper.id} to={`/papers/${connection.paper.id}`} state={{ returnTo }} style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }} aria-label={`${connection.paper.title}. Shared connection: ${connectionLabel}`}>
              <span className="node-label">{connection.paper.year || 'No date'}<ArrowUpRight size={13} aria-hidden="true" /></span><strong>{shortAuthors(connection.paper)}</strong><span className="node-topic">{connectionLabel}</span>
            </Link>;
          })}
        </div>
        <div className="network-caption"><span className="legend-dot" /> Current paper <span className="legend-line" /> Shared Zotero metadata <button className="text-button" onClick={() => setView('list')}>{connections.length > 5 ? `Read all ${connections.length} connections` : 'Read connections as a list'} <ArrowRightSmall /></button></div>
      </div> : <ol className="related-list">
        {connections.map(({ paper: other, sharedKeywords, sharedTopics, sharedCategories }) => {
          const labels = sharedKeywords.length ? sharedKeywords : sharedCategories.length ? sharedCategories : sharedTopics.map(topic => topic.label);
          return <li key={other.id}><Link to={`/papers/${other.id}`} state={{ returnTo }}><div className="related-meta">{shortAuthors(other)} · {other.year || 'No date'}<ArrowUpRight size={17} aria-hidden="true" /></div><h3>{other.title}</h3><p><span>Shared metadata: </span>{labels.join(' · ')}</p></Link></li>;
        })}
      </ol>}
    </>}
  </section>;
}

function ArrowRightSmall() { return <span aria-hidden="true">→</span>; }
