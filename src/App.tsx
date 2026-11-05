import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Box, Check, Filter, Search, X } from 'lucide-react';
import SearchField from './components/SearchField';
import RelatedResearch from './components/RelatedResearch';
import VirtualLocation from './components/VirtualLocation';
import { findPapers, papers, topics, type Paper, type SortOrder } from './data/catalogue';
import { verifiedFrameUrl, virtualLibrary } from './data/locations';

function Header() {
  const entryUrl = verifiedFrameUrl(virtualLibrary.worldUrl, virtualLibrary.worldUrlVerified);
  return <header className="site-header"><div className="container header-inner">
    <Link to="/" className="brand" aria-label="XR Women Research Library home"><BookOpen size={25} strokeWidth={1.4} aria-hidden="true" /><span className="brand-name">XR WOMEN</span><span className="brand-divider" /><span className="brand-subtitle">Research Library</span></Link>
    <nav aria-label="Main navigation"><NavLink to="/" end>Home</NavLink><NavLink to="/papers">Browse papers</NavLink><NavLink to="/about">About project</NavLink>{entryUrl ? <a href={entryUrl} target="_blank" rel="noopener noreferrer">Enter Virtual Library<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : null}</nav>
  </div></header>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><div><BookOpen size={17} strokeWidth={1.4} aria-hidden="true" /><span>XR Women Research Library</span></div><p>Research for more inclusive realities.</p><a href="https://www.xrwomen.com/" target="_blank" rel="noopener noreferrer">XR Women<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div></footer>;
}

function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!first.current) document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    first.current = false;
  }, [pathname]);
  return null;
}

function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  useEffect(() => { document.title = 'XR Women · Research Library'; }, []);
  return <main id="main-content" className="home-main">
    <div className="home-motif" aria-hidden="true"><svg viewBox="0 0 320 340"><circle cx="236" cy="135" r="118" /><circle cx="236" cy="135" r="88" /><path d="M60 95v150h150M60 245l140-140M270 10v270" /><circle className="motif-dot" cx="60" cy="245" r="5" /><circle className="motif-dot" cx="200" cy="105" r="4" /></svg></div>
    <div className="container home-content"><div className="home-kicker"><span />A curated collection by XR Women</div>
      <h1 tabIndex={-1}>Explore the<br /><em>Research Library</em></h1>
      <p className="home-intro">Discover research on extended reality, gender, and the<br className="desktop-break" /> people shaping more inclusive immersive worlds.</p>
      <div className="home-search"><SearchField home value={query} onChange={setQuery} onSubmit={() => navigate(`/papers${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)} /></div>
      <div className="suggestions"><p>Explore a research topic</p><div>{topics.filter(t => t.id !== 'social-vr').map(topic => <Link key={topic.id} to={`/papers?topic=${topic.id}`}>{topic.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div></div>
      <Link className="browse-link" to="/papers">Browse the complete collection<ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
    <div className="container home-context"><div className="context-icon"><Box size={27} strokeWidth={1.2} aria-hidden="true" /></div><div><p className="eyebrow">A companion to the virtual library</p><p>Start with a paper. Discover its connections. Find its place in FrameVR.</p></div><span className="context-index">Extended reality <span>Shared knowledge</span></span></div>
  </main>;
}

function Catalogue() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = params.get('q') ?? '';
  const selected = [...new Set(params.getAll('topic'))].filter(id => topics.some(topic => topic.id === id));
  const sort: SortOrder = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const results = findPapers(query, selected, sort);
  const returnTo = `/papers${params.size ? `?${params.toString()}` : ''}`;
  function updateQuery(value: string) {
    setParams(prev => { const next = new URLSearchParams(prev); value ? next.set('q', value) : next.delete('q'); return next; }, { replace: true });
  }
  function toggleTopic(id: string) {
    setParams(prev => { const next = new URLSearchParams(prev); const current = next.getAll('topic'); next.delete('topic'); const values = current.includes(id) ? current.filter(t => t !== id) : [...current, id]; values.forEach(t => next.append('topic', t)); return next; });
  }
  useEffect(() => { document.title = 'Research catalogue · XR Women'; }, []);
  return <main id="main-content" className="container catalogue-main">
    <div className="catalogue-heading"><div><p className="eyebrow">The collection</p><h1 tabIndex={-1}>Research catalogue</h1></div><p>Perspectives on XR, gender,<br />and inclusive virtual worlds.</p></div>
    <SearchField value={query} onChange={updateQuery} onSubmit={() => updateQuery(query.trim())} />
    <div className="catalogue-layout"><aside className={`filter-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Research topic filters">
      <button className="filter-toggle" aria-expanded={filtersOpen} aria-controls="topic-options" onClick={() => setFiltersOpen(!filtersOpen)}><Filter size={17} aria-hidden="true" />Research topics{selected.length ? <span>{selected.length}</span> : null}<ArrowDown size={16} aria-hidden="true" /></button>
      <div id="topic-options" className="topic-options"><div className="filter-heading"><h2>Research topics</h2><Filter size={15} aria-hidden="true" /></div><p className="filter-help">Select topics to refine your search. Multiple selections match all.</p>
        <div className="filter-options">{topics.map(topic => <label key={topic.id} className={selected.includes(topic.id) ? 'selected' : ''}><input type="checkbox" checked={selected.includes(topic.id)} onChange={() => toggleTopic(topic.id)} /><span className="checkbox-visual" aria-hidden="true">{selected.includes(topic.id) ? <Check size={12} strokeWidth={2.5} /> : null}</span><span>{topic.label}</span><span className="topic-count">{findPapers(query, [topic.id]).length}</span></label>)}</div>
        {selected.length ? <button className="text-button clear-topics" onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.delete('topic'); return next; })}>Clear topic filters<X size={14} aria-hidden="true" /></button> : null}
        <div className="sidebar-note"><BookOpen size={20} strokeWidth={1.3} aria-hidden="true" /><p>A focused, growing collection.<br />Search explores the {papers.length} papers in this catalogue.</p></div>
      </div>
    </aside>
    <section className="results" aria-labelledby="results-heading"><div className="results-toolbar"><h2 id="results-heading" role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? 'paper' : 'papers'}<span>{query || selected.length ? ' found' : ' in the collection'}</span></h2><label className="sort-label">Sort by<select aria-label="Sort papers by publication year" value={sort} onChange={event => setParams(prev => { const next = new URLSearchParams(prev); event.target.value === 'oldest' ? next.set('sort', 'oldest') : next.delete('sort'); return next; })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
      {query || selected.length ? <div className="active-filters"><span>Showing</span>{query ? <button onClick={() => updateQuery('')} aria-label={`Remove search ${query}`}>“{query}”<X size={13} aria-hidden="true" /></button> : null}{selected.map(id => <button key={id} onClick={() => toggleTopic(id)} aria-label={`Remove ${topics.find(t => t.id === id)!.label} filter`}>{topics.find(t => t.id === id)!.label}<X size={13} aria-hidden="true" /></button>)}<button className="clear-all" onClick={() => setParams(sort === 'oldest' ? { sort } : {})}>Clear all</button></div> : null}
      {results.length ? <ol className="paper-results">{results.map(paper => <PaperResult key={paper.id} paper={paper} returnTo={returnTo} />)}</ol> : <div className="empty-state"><Search size={30} strokeWidth={1.2} aria-hidden="true" /><h3>No matching papers</h3><p>This curated collection has no papers matching your search and topics. Try an author’s name or a broader term such as “gender”.</p><button className="button primary" onClick={() => setParams({})}>Clear search and filters<ArrowRight size={17} aria-hidden="true" /></button></div>}
      {results.length ? <div className="results-end"><span />You’ve reached the end of this selection<span /></div> : null}
    </section></div>
  </main>;
}

function PaperResult({ paper, returnTo }: { paper: Paper; returnTo: string }) {
  return <li className="paper-result"><span className="paper-index">{paper.id.padStart(2, '0')}</span><Link to={`/papers/${paper.id}`} state={{ returnTo }} className="paper-result-link"><div className="result-category">{paper.mainCategory}<span>{paper.year}<ArrowUpRight size={19} aria-hidden="true" /></span></div><h3>{paper.title}</h3><p className="result-authors">{paper.authorsText}</p><p className="result-summary">{paper.shortSummary}</p><div className="keyword-list">{paper.standardizedKeywords.slice(0, 3).map(word => <span key={word}>{word}</span>)}{paper.standardizedKeywords.length > 3 ? <span className="more-keywords">+{paper.standardizedKeywords.length - 3} keywords</span> : null}</div></Link></li>;
}

function PaperDetail() {
  const { id } = useParams();
  const paper = papers.find(item => item.id === id);
  const location = useLocation();
  const rawReturn = (location.state as { returnTo?: string } | null)?.returnTo;
  const returnTo = rawReturn && /^\/papers(?:\?|$)/.test(rawReturn) ? rawReturn : '/papers';
  useEffect(() => { document.title = paper ? `${paper.title} · XR Women` : 'Paper not found · XR Women'; }, [paper]);
  if (!paper) return <NotFound paper />;
  return <main id="main-content" className="container detail-main"><Link to={returnTo} className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to search results</Link>
    <div className="detail-layout"><article className="paper-article"><header className="paper-heading"><p className="eyebrow">Research paper <span> / </span> {paper.year}</p><h1 tabIndex={-1}>{paper.title}</h1><p className="detail-authors">{paper.authorsText}</p><div className="detail-category"><span className="category-dot" />{paper.mainCategory}</div></header>
      <section className="summary-section" aria-labelledby="summary-heading"><h2 id="summary-heading">At a glance</h2><p>{paper.shortSummary}</p></section>
      <section className="abstract-section" aria-labelledby="abstract-heading"><h2 id="abstract-heading">Abstract</h2><div className="abstract-text">{paper.abstract.replace(/\u00ad\s*\n\s*/g, '').split(/\n(?=(?:Introduction|Methods|Results|Discussion):)/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>
      <section className="keywords-section" aria-labelledby="keywords-heading"><h2 id="keywords-heading">Keywords & topics</h2><h3>Standardized keywords</h3><div className="keyword-list detail-keywords">{paper.standardizedKeywords.map(keyword => <Link to={`/papers?q=${encodeURIComponent(keyword)}`} key={keyword}>{keyword}<ArrowUpRight size={12} aria-hidden="true" /></Link>)}</div><h3>Original keywords</h3><p className="original-keywords">{paper.originalKeywordsText}</p></section>
      <section className="source-section" aria-labelledby="source-heading"><h2 id="source-heading">Original publication</h2><a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer">{paper.sourceUrl.replace('https://doi.org/', 'doi: ')}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>{Object.entries(paper.sourceMetadata).map(([key, value]) => <p key={key} className="source-note">{key}: {value}. As recorded in the supplied catalogue.</p>)}</section>
    </article><aside className="detail-aside"><div className="publication-card"><span className="eyebrow">Read the research</span><BookOpen size={23} strokeWidth={1.3} aria-hidden="true" /><p>Continue to the original paper on the publisher’s website.</p><a className="button primary" href={paper.sourceUrl} target="_blank" rel="noopener noreferrer">Open publication<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a><span className="publication-note">Publication year {paper.year} · Catalogue #{paper.id.padStart(2, '0')}</span></div><VirtualLocation paperId={paper.id} /><p className="catalogue-provenance">Part of a {papers.length}-paper research catalogue.<br />Academic content follows the supplied source.</p></aside></div>
    <RelatedResearch key={paper.id} paper={paper} returnTo={returnTo} />
  </main>;
}

function NotFound({ paper = false }: { paper?: boolean }) {
  return <main id="main-content" className="container not-found"><p className="eyebrow">Outside the collection</p><h1 tabIndex={-1}>{paper ? 'Paper not found' : 'Page not found'}</h1><p>{paper ? 'This paper is not in the current catalogue.' : 'This page is not part of the research library.'}</p><Link className="button primary" to="/papers">Browse the collection<ArrowRight size={17} aria-hidden="true" /></Link></main>;
}

function AboutProject() {
  useEffect(() => { document.title = 'About the project · XR Women'; }, []);
  return <main id="main-content" className="container about-main">
    <header className="about-heading"><p className="eyebrow">About this library</p><h1 tabIndex={-1}>About the project</h1><p>A place to explore research on extended reality, gender, and inclusion.</p></header>
    <div className="about-layout"><article className="about-article">
      <section aria-labelledby="about-purpose"><h2 id="about-purpose">Research discovery, with context</h2><p>The XR Women Research Library is a digital catalogue and navigation companion to a virtual research library in FrameVR. It brings academic papers into one focused collection so visitors can search, read an overview, and follow connections between research topics.</p></section>
      <section aria-labelledby="about-collection"><h2 id="about-collection">What’s in the collection</h2><p>The current collection contains {papers.length} papers exploring social VR, harassment and safety, gender identity, avatar embodiment, education, and inclusion. Each record presents its authors, year, abstract, summary, keywords, and original publication link.</p><p>Paper information follows the supplied academic catalogue. Original abstracts are preserved, and publication links lead to the corresponding sources.</p></section>
      <section aria-labelledby="about-connections"><h2 id="about-connections">Following research connections</h2><p>Related papers are connected by shared standardized keywords and broader research topics. You can explore these connections through a small network or a readable list on each paper’s page. They indicate subject similarity, rather than citations or evidence of influence.</p></section>
      <section aria-labelledby="about-virtual"><h2 id="about-virtual">From the catalogue to FrameVR</h2><p>Each paper has a dedicated space for its virtual-library placement. Verified world and paper-location links will appear as those locations are mapped. Until then, the paper page clearly shows “Location not yet mapped”.</p></section>
      <Link className="button primary" to="/papers">Explore the collection<ArrowRight size={17} aria-hidden="true" /></Link>
    </article><aside className="about-note"><BookOpen size={25} strokeWidth={1.3} aria-hidden="true" /><p className="eyebrow">Project at a glance</p><dl><dt>Collection</dt><dd>{papers.length} academic papers</dd><dt>Focus</dt><dd>XR, gender, safety, and inclusion</dd><dt>Virtual companion</dt><dd>FrameVR research library</dd><dt>Current stage</dt><dd>Interactive MVP</dd></dl><Link className="text-button" to="/">Start with a search<ArrowRight size={15} aria-hidden="true" /></Link></aside></div>
  </main>;
}

export default function App() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header /><RouteFocus /><Routes><Route path="/" element={<Home />} /><Route path="/papers" element={<Catalogue />} /><Route path="/search" element={<Catalogue />} /><Route path="/papers/:id" element={<PaperDetail />} /><Route path="/about" element={<AboutProject />} /><Route path="*" element={<NotFound />} /></Routes><Footer /></>;
}
