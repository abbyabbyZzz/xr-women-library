import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Check, Filter, Pause, Play, RefreshCw, Search, X } from 'lucide-react';
import SearchField from './components/SearchField';
import RelatedResearch from './components/RelatedResearch';
import VirtualLocation from './components/VirtualLocation';
import ResearchField, { useReducedMotionPreference } from './components/ResearchField';
import useHomeScroll from './components/useHomeScroll';
import { categoryOptions, findPapers, paperCategories, paperKeywords, type Paper, type SortOrder } from './data/catalogue';
import { LibraryProvider, useLibrary } from './data/library';
import { verifiedFrameUrl, virtualLibrary } from './data/locations';

function Header() {
  const { pathname } = useLocation();
  const entryUrl = verifiedFrameUrl(virtualLibrary.worldUrl, virtualLibrary.worldUrlVerified);
  function scrollHome(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (pathname === '/' && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }
  return <header className="site-header"><div className="container header-inner">
    <Link to="/" onClick={scrollHome} className="brand" aria-label="XR Women Research Library home"><BookOpen size={29} strokeWidth={1.3} aria-hidden="true" /><span className="brand-wordmark"><span className="brand-name">XR WOMEN</span><span className="brand-subtitle">Research Library</span></span></Link>
    <nav aria-label="Main navigation"><NavLink aria-label="Home" onClick={scrollHome} to="/" end>Home</NavLink><NavLink aria-label="Browse papers" to="/papers">Browse papers</NavLink>{entryUrl ? <a href={entryUrl} target="_blank" rel="noopener noreferrer">Enter Virtual Library<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : null}</nav>
  </div></header>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><div><BookOpen size={17} strokeWidth={1.4} aria-hidden="true" /><span>XR Women Research Library</span></div><p>Research for more inclusive realities.</p><a href="https://www.xrwomen.com/" target="_blank" rel="noopener noreferrer">XR Women<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div></footer>;
}

function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!first.current) document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    first.current = false;
  }, [pathname]);
  return null;
}

function Home() {
  const [query, setQuery] = useState('');
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  const mainRef = useRef<HTMLElement>(null);
  useHomeScroll(mainRef, reducedMotion);
  const navigate = useNavigate();
  const { papers, loading, error, retry } = useLibrary();
  const suggestions = [
    { label: 'Virtual museums', query: 'virtual museum' },
    { label: 'Immersive experiences', query: 'immersive' },
    { label: 'Accessibility', query: 'accessible' },
    { label: 'Inclusion', query: 'inclusion' },
  ].filter(topic => findPapers(papers, topic.query).length > 0);
  useEffect(() => { document.title = 'XR Women · Research Library'; }, []);
  return <main id="main-content" className="home-main" tabIndex={-1} ref={mainRef}>
    <section id="home-search-panel" className="home-stage home-panel" aria-label="Explore the research library" tabIndex={-1}>
      <ResearchField paused={motionPaused || reducedMotion} />
      <div className="container home-layout"><div className="home-copy">
        <h1 tabIndex={-1}><span>Research</span> <span>Library<span className="title-point">.</span></span></h1>
        <p className="home-intro">Discover research on extended reality, museums, gender, and the people shaping more inclusive immersive worlds.</p>
        <div className="home-search"><SearchField home value={query} onChange={setQuery} onSubmit={() => navigate(`/papers${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)} /></div>
        {suggestions.length ? <div className="suggestions"><p>Follow a subject</p><div>{suggestions.map(topic => <Link key={topic.query} to={`/papers?q=${encodeURIComponent(topic.query)}`}>{topic.label}<ArrowUpRight size={13} aria-hidden="true" /></Link>)}</div></div> : null}
      </div></div>
      <div className="container home-floor"><Link className="browse-link" to="/papers">{loading || error ? 'Browse the collection' : `Browse all ${papers.length} papers`}<ArrowUpRight size={18} aria-hidden="true" /></Link><a className="home-scroll-link" href="#home-about">About the project<ArrowDown size={18} aria-hidden="true" /></a><div className="field-controls">{reducedMotion ? <span className="motion-reduced">Motion reduced</span> : <button className="motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{motionPaused ? 'Resume motion' : 'Pause motion'}</button>}</div></div>
    </section>
    <section id="home-about" className="home-about home-panel" aria-labelledby="home-about-heading" tabIndex={-1}>
      <div className="container home-about-content">
        <h2 id="home-about-heading">About the<br /> project<span className="title-point">.</span></h2>
        <div className="home-about-copy"><p className="home-about-lead">Research for more<br className="desktop-break" /> inclusive realities.</p><p>The XR Women Research Library brings research on extended reality, museums, gender, and inclusion into one searchable collection.</p><p>A digital catalogue and a companion to our virtual research library in FrameVR. Start with a paper, follow its topics, and explore its place in the collection.</p><Link className="home-about-link" to="/about">More about the project<ArrowUpRight size={20} aria-hidden="true" /></Link></div>
      </div>
      <div className="container home-about-bottom"><div className="home-context"><span className={`live-source ${error ? 'is-error' : ''}`} role="status"><span />{loading ? 'Connecting to Zotero' : error ? 'Connection unavailable' : 'Live from Zotero'}</span><p>Articles update when the catalogue is opened.</p>{error ? <button className="text-button" onClick={retry}>Reconnect<RefreshCw size={14} aria-hidden="true" /></button> : <span className="home-source-note">VR Library Museum collection</span>}</div><a className="home-scroll-link" href="#home-search-panel">Back to search<ArrowUp size={17} aria-hidden="true" /></a></div>
      <Footer />
    </section>
  </main>;
}

function LibraryState({ error, retry }: { error?: string | null; retry?: () => void }) {
  return <div className={`library-state ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'} aria-live="polite">
    {error ? <><BookOpen size={30} strokeWidth={1.2} aria-hidden="true" /><h2>Live collection unavailable</h2><p>{error}</p>{retry ? <button className="button primary" onClick={retry}><RefreshCw size={16} aria-hidden="true" />Try again</button> : null}</> : <><span className="loading-mark" aria-hidden="true" /><h2>Loading the Zotero collection</h2><p>Retrieving the latest papers and metadata.</p></>}
  </div>;
}

function Catalogue() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { papers, loading, error, retry, meta } = useLibrary();
  const categories = categoryOptions(papers);
  const query = params.get('q') ?? '';
  const selected = [...new Set(params.getAll('category'))].filter(name => categories.some(category => category.name === name));
  const sort: SortOrder = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const results = findPapers(papers, query, selected, sort);
  const returnTo = `/papers${params.size ? `?${params.toString()}` : ''}`;
  function updateQuery(value: string) {
    setParams(previous => { const next = new URLSearchParams(previous); value ? next.set('q', value) : next.delete('q'); return next; }, { replace: true });
  }
  function toggleCategory(name: string) {
    setParams(previous => { const next = new URLSearchParams(previous); const current = next.getAll('category'); next.delete('category'); const values = current.includes(name) ? current.filter(value => value !== name) : [...current, name]; values.forEach(value => next.append('category', value)); return next; });
  }
  useEffect(() => { document.title = 'Research catalogue · XR Women'; }, []);
  return <main id="main-content" className="container catalogue-main">
    <div className="catalogue-heading"><div><h1 tabIndex={-1}>Research catalogue<span className="title-point">.</span></h1></div><p><span className="live-source"><span />Zotero connected</span>Latest library version {meta?.libraryVersion ?? '—'}</p></div>
    <SearchField value={query} onChange={updateQuery} onSubmit={() => updateQuery(query.trim())} />
    {loading ? <LibraryState /> : error ? <LibraryState error={error} retry={retry} /> : <div className="catalogue-layout"><aside className={`filter-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Zotero collection filters">
      <button className="filter-toggle" aria-expanded={filtersOpen} aria-controls="category-options" onClick={() => setFiltersOpen(!filtersOpen)}><Filter size={17} aria-hidden="true" />Collections{selected.length ? <span>{selected.length}</span> : null}<ArrowDown size={16} aria-hidden="true" /></button>
      <div id="category-options" className="topic-options"><div className="filter-heading"><h2>Zotero collections</h2><Filter size={15} aria-hidden="true" /></div><p className="filter-help">Collections and item types update directly from Zotero. Multiple selections match all.</p>
        {categories.length ? <div className="filter-options">{categories.map(category => <label key={category.name} className={selected.includes(category.name) ? 'selected' : ''}><input type="checkbox" checked={selected.includes(category.name)} onChange={() => toggleCategory(category.name)} /><span className="checkbox-visual" aria-hidden="true">{selected.includes(category.name) ? <Check size={12} strokeWidth={2.5} /> : null}</span><span>{category.name}</span><span className="topic-count">{findPapers(papers, query, [category.name]).length}</span></label>)}</div> : <p className="filter-empty">No Zotero Collections have been assigned yet. Item types are used as a temporary fallback.</p>}
        {selected.length ? <button className="text-button clear-topics" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete('category'); return next; })}>Clear collection filters<X size={14} aria-hidden="true" /></button> : null}
        <div className="sidebar-note"><BookOpen size={20} strokeWidth={1.3} aria-hidden="true" /><p>Connected to Zotero.<br />Search explores the {papers.length} live papers in this catalogue.</p></div>
      </div>
    </aside>
    <section className="results" aria-labelledby="results-heading"><div className="results-toolbar"><h2 id="results-heading" role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? 'paper' : 'papers'}<span>{query || selected.length ? ' found' : ' in the live collection'}</span></h2><label className="sort-label">Sort by<select aria-label="Sort papers by publication year" value={sort} onChange={event => setParams(previous => { const next = new URLSearchParams(previous); event.target.value === 'oldest' ? next.set('sort', 'oldest') : next.delete('sort'); return next; })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
      {query || selected.length ? <div className="active-filters"><span>Showing</span>{query ? <button onClick={() => updateQuery('')} aria-label={`Remove search ${query}`}>“{query}”<X size={13} aria-hidden="true" /></button> : null}{selected.map(name => <button key={name} onClick={() => toggleCategory(name)} aria-label={`Remove ${name} filter`}>{name}<X size={13} aria-hidden="true" /></button>)}<button className="clear-all" onClick={() => setParams(sort === 'oldest' ? { sort } : {})}>Clear all</button></div> : null}
      {results.length ? <ol className="paper-results">{results.map(paper => <PaperResult key={paper.id} paper={paper} returnTo={returnTo} />)}</ol> : <div className="empty-state"><Search size={30} strokeWidth={1.2} aria-hidden="true" /><h3>No matching papers</h3><p>The live Zotero collection has no papers matching this search. Try an author, title, or broader term.</p><button className="button primary" onClick={() => setParams({})}>Clear search and filters<ArrowRight size={17} aria-hidden="true" /></button></div>}
      {results.length ? <div className="results-end"><span />Live data from Zotero · You’ve reached the end<span /></div> : null}
    </section></div>}
  </main>;
}

function PaperResult({ paper, returnTo }: { paper: Paper; returnTo: string }) {
  const keywords = paperKeywords(paper);
  return <li className="paper-result"><Link to={`/papers/${paper.id}`} state={{ returnTo }} className="paper-result-link"><div className="result-category">{paper.mainCategory}<span>{paper.year || 'Date unavailable'}<ArrowUpRight size={19} aria-hidden="true" /></span></div><h3>{paper.title}</h3><p className="result-authors">{paper.authorsText}</p><p className="result-summary">{paper.shortSummary}</p>{keywords.length ? <div className="keyword-list">{keywords.slice(0, 3).map(word => <span key={word}>{word}</span>)}{keywords.length > 3 ? <span className="more-keywords">+{keywords.length - 3} tags</span> : null}</div> : <p className="metadata-pending">No Zotero tags yet</p>}</Link></li>;
}

function PaperDetail() {
  const { id } = useParams();
  const { papers, loading, error, retry } = useLibrary();
  const paper = papers.find(item => item.id === id);
  const location = useLocation();
  const rawReturn = (location.state as { returnTo?: string } | null)?.returnTo;
  const returnTo = rawReturn && /^\/papers(?:\?|$)/.test(rawReturn) ? rawReturn : '/papers';
  useEffect(() => { document.title = paper ? `${paper.title} · XR Women` : loading ? 'Loading paper · XR Women' : 'Paper not found · XR Women'; }, [paper, loading]);
  if (loading) return <main id="main-content" className="container detail-main"><Link to={returnTo} className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to catalogue</Link><LibraryState /></main>;
  if (error) return <main id="main-content" className="container detail-main"><Link to={returnTo} className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to catalogue</Link><LibraryState error={error} retry={retry} /></main>;
  if (!paper) return <NotFound paper />;
  const keywords = paperKeywords(paper);
  const categories = paperCategories(paper);
  return <main id="main-content" className="container detail-main"><Link to={returnTo} className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to search results</Link>
    <div className="detail-layout"><article className="paper-article"><header className="paper-heading"><h1 tabIndex={-1}>{paper.title}</h1><p className="detail-authors">{paper.authorsText}</p><div className="detail-category"><span className="paper-year">{paper.year || 'Date unavailable'}</span><span className="category-dot" />{paper.mainCategory}</div></header>
      <section className="abstract-section" aria-labelledby="abstract-heading"><h2 id="abstract-heading">Abstract</h2><div className="abstract-text">{paper.abstract ? paper.abstract.replace(/\u00ad\s*\n\s*/g, '').split(/\n(?=(?:Introduction|Methods|Results|Discussion):)/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="metadata-pending">No abstract is available in Zotero yet.</p>}</div></section>
      <section className="keywords-section" aria-labelledby="keywords-heading"><h2 id="keywords-heading">Collections & tags</h2><h3>{paper.categories?.length ? 'Zotero collections' : 'Zotero item type'}</h3><div className="keyword-list detail-keywords">{categories.map(category => <Link to={`/papers?category=${encodeURIComponent(category)}`} key={category}>{category}<ArrowUpRight size={12} aria-hidden="true" /></Link>)}</div><h3>Zotero tags</h3>{keywords.length ? <div className="keyword-list detail-keywords">{keywords.map(keyword => <Link to={`/papers?q=${encodeURIComponent(keyword)}`} key={keyword}>{keyword}<ArrowUpRight size={12} aria-hidden="true" /></Link>)}</div> : <p className="original-keywords">No tags have been added to this Zotero item.</p>}</section>
      <section className="source-section" aria-labelledby="source-heading"><h2 id="source-heading">Original publication</h2>{paper.sourceUrl ? <a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer">{paper.sourceUrl.replace('https://doi.org/', 'doi: ')}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <p className="metadata-pending">No publication URL is available.</p>}{Object.entries(paper.sourceMetadata).map(([key, value]) => <p key={key} className="source-note">{key}: {value}</p>)}</section>
    </article><aside className="detail-aside"><div className="publication-card"><span className="eyebrow">Read the research</span><BookOpen size={23} strokeWidth={1.3} aria-hidden="true" /><p>Continue to the original publication or Zotero record.</p>{paper.sourceUrl ? <a className="button primary" href={paper.sourceUrl} target="_blank" rel="noopener noreferrer">Open publication<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : null}<span className="publication-note">Live Zotero record · {paper.year || 'No date'}</span></div><VirtualLocation paperId={paper.id} /><p className="catalogue-provenance">Part of a {papers.length}-paper live Zotero catalogue.<br />Metadata updates from the source group.</p></aside></div>
    <RelatedResearch key={paper.id} paper={paper} papers={papers} returnTo={returnTo} />
  </main>;
}

function NotFound({ paper = false }: { paper?: boolean }) {
  return <main id="main-content" className="container not-found"><h1 tabIndex={-1}>{paper ? 'Paper not found' : 'Page not found'}</h1><p>{paper ? 'This item is not in the current Zotero catalogue.' : 'This page is not part of the research library.'}</p><Link className="button primary" to="/papers">Browse the collection<ArrowRight size={17} aria-hidden="true" /></Link></main>;
}

function AboutProject() {
  const { papers, loading, error, retry } = useLibrary();
  useEffect(() => { document.title = 'About the project · XR Women'; }, []);
  return <main id="main-content" className="container about-main">
    <header className="about-heading"><h1 tabIndex={-1}>About the project<span className="title-point">.</span></h1><p>A live place to explore research on extended reality, museums, gender, and inclusion.</p></header>
    {loading ? <LibraryState /> : error ? <LibraryState error={error} retry={retry} /> : <div className="about-layout"><article className="about-article">
      <section aria-labelledby="about-purpose"><h2 id="about-purpose">Research discovery, with context</h2><p>The XR Women Research Library is a digital catalogue and navigation companion to a virtual research library in FrameVR. Its Browse Papers collection now reads directly from the VR Library Museum Zotero group.</p></section>
      <section aria-labelledby="about-collection"><h2 id="about-collection">What’s in the collection</h2><p>The live collection currently contains {papers.length} research items. Titles, authors, dates, abstracts, publication links, Collections, and Tags follow the current Zotero records.</p><p>When collaborators update Zotero, visitors receive the latest metadata the next time the catalogue loads.</p></section>
      <section aria-labelledby="about-connections"><h2 id="about-connections">Following research connections</h2><p>Related papers are connected by shared Zotero Tags, Collections, and broader topic mappings. They indicate subject similarity, rather than citations or evidence of influence.</p></section>
      <section aria-labelledby="about-virtual"><h2 id="about-virtual">From the catalogue to FrameVR</h2><p>Each paper has a dedicated space for its virtual-library placement. Verified world and paper-location links will appear as those locations are mapped.</p></section>
      <Link className="button primary" to="/papers">Explore the live collection<ArrowRight size={17} aria-hidden="true" /></Link>
    </article><aside className="about-note"><BookOpen size={25} strokeWidth={1.3} aria-hidden="true" /><p className="eyebrow">Project at a glance</p><dl><dt>Collection</dt><dd>{papers.length} Zotero research items</dd><dt>Source</dt><dd>VR Library Museum group</dd><dt>Virtual companion</dt><dd>FrameVR research library</dd><dt>Current stage</dt><dd>Live Zotero integration</dd></dl><Link className="text-button" to="/">Start with a search<ArrowRight size={15} aria-hidden="true" /></Link></aside></div>}
  </main>;
}

export default function App() {
  const { pathname } = useLocation();
  return <LibraryProvider><div className={`app-shell${pathname === '/' ? ' app-shell-home' : ''}`}><a className="skip-link" href="#main-content">Skip to content</a><Header /><RouteFocus /><Routes><Route path="/" element={<Home />} /><Route path="/papers" element={<Catalogue />} /><Route path="/search" element={<Catalogue />} /><Route path="/papers/:id" element={<PaperDetail />} /><Route path="/about" element={<AboutProject />} /><Route path="*" element={<NotFound />} /></Routes>{pathname === '/' ? null : <Footer />}</div></LibraryProvider>;
}
