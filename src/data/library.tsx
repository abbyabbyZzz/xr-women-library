import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Paper } from './catalogue';

const DEFAULT_API_URL = 'https://xr-women-zotero-api-abby.snugotter139.chatgpt.site/api/papers';
const API_URL = import.meta.env.VITE_ZOTERO_API_URL || DEFAULT_API_URL;

type LibraryMeta = {
  source: 'zotero';
  groupId: string;
  total: number;
  count: number;
  libraryVersion: string | null;
  fetchedAt: string;
};

type LibraryResponse = {
  data: Paper[];
  meta: LibraryMeta;
};

type LibraryValue = {
  papers: Paper[];
  meta: LibraryMeta | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

const LibraryContext = createContext<LibraryValue | null>(null);
let libraryRequest: Promise<LibraryResponse> | null = null;

async function requestLibrary() {
  const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`The Zotero catalogue returned ${response.status}.`);
  const payload = await response.json() as LibraryResponse;
  if (!Array.isArray(payload.data)) throw new Error('The Zotero catalogue returned an unexpected response.');
  return {
    ...payload,
    data: payload.data.map(paper => ({
      ...paper,
      authors: Array.isArray(paper.authors) ? paper.authors : [],
      originalKeywords: Array.isArray(paper.originalKeywords) ? paper.originalKeywords : [],
      standardizedKeywords: Array.isArray(paper.standardizedKeywords) ? paper.standardizedKeywords : [],
      keywords: Array.isArray(paper.keywords) ? paper.keywords : [],
      categories: Array.isArray(paper.categories) ? paper.categories : [],
      sourceMetadata: paper.sourceMetadata ?? {},
    })),
  };
}

function loadLibrary() {
  if (!libraryRequest) {
    libraryRequest = requestLibrary().catch(error => {
      libraryRequest = null;
      throw error;
    });
  }
  return libraryRequest;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [meta, setMeta] = useState<LibraryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loadLibrary().then(payload => {
      if (!active) return;
      setPapers(payload.data);
      setMeta(payload.meta);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('The live Zotero collection could not be loaded. Please try again.');
      setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    libraryRequest = null;
    setAttempt(value => value + 1);
  }, []);
  const value = useMemo(() => ({ papers, meta, loading, error, retry }), [papers, meta, loading, error, retry]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary must be used inside LibraryProvider.');
  return value;
}
