import catalogue from './papers.json';

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  authorsText: string;
  year: number;
  originalKeywords: string[];
  originalKeywordsText: string;
  standardizedKeywords: string[];
  mainCategory: string;
  abstract: string;
  shortSummary: string;
  sourceUrl: string;
  sourceMetadata: Partial<Record<string, string>>;
};

export const papers: Paper[] = catalogue;

export const topics = [
  { id: 'social-vr', label: 'Social VR & interaction', keywords: ['social VR', 'social interaction'] },
  { id: 'safety', label: 'Safety & harassment', keywords: ['harassment', 'online harassment', 'gendered safety', 'safety strategies', 'user safety', 'platform governance', 'perceived harm'] },
  { id: 'identity', label: 'Identity & embodiment', keywords: ['avatar embodiment', 'avatars', 'gender identity', 'gender expression', 'role adoption'] },
  { id: 'equity', label: 'Gender bias & inclusion', keywords: ['gender bias', 'gender microaggressions', 'DEI training', 'inclusive design', 'workplace diversity', 'women in XR', 'marginalized users'] },
  { id: 'learning', label: 'Learning & education', keywords: ['higher education', 'immersive learning', 'learner experience', 'STEM education', 'perspective taking', 'DEI training'] },
] as const;

export type SortOrder = 'newest' | 'oldest';
export function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ı/g, 'i').replace(/\u00ad\s*/g, '').replace(/\s+/g, ' ').trim();
}

export function paperTopics(paper: Paper) {
  const keywords = new Set(paper.standardizedKeywords.map(normalize));
  return topics.filter(topic => topic.keywords.some(keyword => keywords.has(normalize(keyword))));
}

export function findPapers(query = '', selectedTopics: string[] = [], sort: SortOrder = 'newest') {
  const words = normalize(query).split(' ').filter(Boolean);
  return papers.filter(paper => {
    const haystack = normalize([paper.title, paper.authorsText, ...paper.authors, paper.abstract, paper.shortSummary, ...paper.standardizedKeywords, ...paper.originalKeywords, paper.mainCategory].join(' '));
    const ids = paperTopics(paper).map(topic => topic.id as string);
    return words.every(word => haystack.includes(word)) && selectedTopics.every(topic => ids.includes(topic));
  }).sort((a, b) => sort === 'oldest' ? a.year - b.year || Number(a.id) - Number(b.id) : b.year - a.year || Number(a.id) - Number(b.id));
}

export function relatedPapers(paper: Paper) {
  const keywordSet = new Set(paper.standardizedKeywords.map(normalize));
  const topicIds = new Set(paperTopics(paper).map(topic => topic.id));
  return papers.filter(other => other.id !== paper.id).map(other => {
    const sharedKeywords = other.standardizedKeywords.filter(keyword => keywordSet.has(normalize(keyword)));
    const sharedTopics = paperTopics(other).filter(topic => topicIds.has(topic.id));
    return { paper: other, sharedKeywords, sharedTopics, score: sharedKeywords.length * 4 + sharedTopics.length };
  }).filter(connection => connection.score > 0).sort((a, b) => b.score - a.score || b.paper.year - a.paper.year);
}

export function shortAuthors(paper: Paper) {
  const surnames = paper.authors.map(author => author.includes(',') ? author.split(',')[0] : author.trim().split(' ').at(-1));
  return surnames.length > 2 ? `${surnames[0]} et al.` : surnames.join(' & ');
}
