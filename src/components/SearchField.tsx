import { Search, X, ArrowRight } from 'lucide-react';
import { useId } from 'react';

type Props = { value: string; onChange: (value: string) => void; onSubmit: () => void; home?: boolean };

export default function SearchField({ value, onChange, onSubmit, home = false }: Props) {
  const id = useId();
  return <form className={`search-form ${home ? 'search-form-home' : ''}`} role="search" onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    <label className="sr-only" htmlFor={id}>Search papers, authors, or keywords</label>
    <Search size={21} aria-hidden="true" className="search-icon" />
    <input id={id} type="search" autoComplete="off" placeholder="Search papers, authors, or keywords..." value={value} onChange={event => onChange(event.target.value)} />
    {value ? <button className="icon-button clear-search" type="button" aria-label="Clear search" onClick={() => { onChange(''); document.getElementById(id)?.focus(); }}><X size={18} /></button> : null}
    <button className="search-submit" type="submit" aria-label="Search catalogue"><span>Search</span><ArrowRight size={18} aria-hidden="true" /></button>
  </form>;
}
