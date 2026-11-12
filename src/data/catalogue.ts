export type Paper = {
  id: string;
  zoteroKey?: string;
  itemType?: string;
  title: string;
  authors: string[];
  authorsText: string;
  year: number;
  date?: string;
  originalKeywords: string[];
  originalKeywordsText: string;
  standardizedKeywords: string[];
  keywords?: string[];
  categories?: string[];
  mainCategory: string;
  abstract: string;
  shortSummary: string;
  sourceUrl: string;
  zoteroUrl?: string;
  sourceMetadata: Partial<Record<string, string>>;
  dateAdded?: string;
  dateModified?: string;
};

const broaderTopics = [
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

export function paperKeywords(paper: Paper) {
  return paper.keywords?.length ? paper.keywords : paper.standardizedKeywords;
}

export function paperCategories(paper: Paper) {
  return paper.categories?.length ? paper.categories : [paper.mainCategory].filter(Boolean);
}

export function categoryOptions(papers: Paper[]) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const paper of papers) {
    for (const category of paperCategories(paper)) {
      const key = normalize(category);
      const current = counts.get(key);
      counts.set(key, { name: current?.name ?? category, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function paperTopics(paper: Paper) {
  const keywords = new Set(paperKeywords(paper).map(normalize));
  return broaderTopics.filter(topic => topic.keywords.some(keyword => keywords.has(normalize(keyword))));
}

export function findPapers(papers: Paper[], query = '', selectedCategories: string[] = [], sort: SortOrder = 'newest') {
  const words = normalize(query).split(' ').filter(Boolean);
  return papers.filter(paper => {
    const categories = paperCategories(paper);
    const categoryKeys = new Set(categories.map(normalize));
    const haystack = normalize([paper.title, paper.authorsText, ...paper.authors, paper.abstract, paper.shortSummary, ...paperKeywords(paper), ...paper.originalKeywords, ...categories, paper.mainCategory].join(' '));
    return words.every(word => haystack.includes(word)) && selectedCategories.every(category => categoryKeys.has(normalize(category)));
  }).sort((a, b) => {
    if (!a.year && b.year) return 1;
    if (a.year && !b.year) return -1;
    const difference = sort === 'oldest' ? a.year - b.year : b.year - a.year;
    return difference || a.title.localeCompare(b.title);
  });
}

export function relatedPapers(papers: Paper[], paper: Paper) {
  const keywordSet = new Set(paperKeywords(paper).map(normalize));
  const topicIds = new Set(paperTopics(paper).map(topic => topic.id));
  const categorySet = new Set((paper.categories ?? []).map(normalize));
  return papers.filter(other => other.id !== paper.id).map(other => {
    const sharedKeywords = paperKeywords(other).filter(keyword => keywordSet.has(normalize(keyword)));
    const sharedTopics = paperTopics(other).filter(topic => topicIds.has(topic.id));
    const sharedCategories = (other.categories ?? []).filter(category => categorySet.has(normalize(category)));
    return { paper: other, sharedKeywords, sharedTopics, sharedCategories, score: sharedKeywords.length * 4 + sharedTopics.length * 2 + sharedCategories.length };
  }).filter(connection => connection.score > 0).sort((a, b) => b.score - a.score || b.paper.year - a.paper.year);
}

export function shortAuthors(paper: Paper) {
  const surnames = paper.authors.map(author => author.includes(',') ? author.split(',')[0] : author.trim().split(' ').at(-1));
  return surnames.length > 2 ? `${surnames[0]} et al.` : surnames.join(' & ') || 'Unknown author';
}
