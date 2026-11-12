import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../src/data/papers.json';
import { categoryOptions, findPapers, relatedPapers, type Paper } from '../src/data/catalogue';
import { locationForPaper, verifiedFrameUrl } from '../src/data/locations';

const papers = fixture as Paper[];

test('the legacy catalogue fixture retains the six supplied publication records', () => {
  assert.deepEqual(papers.map(p => p.id), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(papers.map(p => p.sourceUrl), [
    'https://doi.org/10.1007/s10055-026-01388-1',
    'https://doi.org/10.1016/j.cexr.2026.100149',
    'https://doi.org/10.1145/3610027',
    'https://doi.org/10.1371/journal.pone.0269430',
    'https://doi.org/10.3389/frvir.2024.1305758',
    'https://doi.org/10.1109/VRW62533.2024.00065',
  ]);
});

test('search finds papers regardless of case or accents', () => {
  assert.deepEqual(findPapers(papers, 'HARASSMENT').map(p => p.id), ['1', '3']);
  assert.deepEqual(findPapers(papers, 'Zhang').map(p => p.id), ['5']);
  assert.deepEqual(findPapers(papers, 'Caki').map(p => p.id), ['2']);
  assert.equal(findPapers(papers, 'nonexistent research topic').length, 0);
  assert.deepEqual(findPapers(papers, '', [], 'oldest').map(p => p.year), [2022, 2023, 2024, 2024, 2026, 2026]);
});

test('categories come from Zotero collections with an item-type fallback', () => {
  const livePapers = [
    { ...papers[0], categories: ['Museum experience'], mainCategory: 'Museum experience' },
    { ...papers[1], categories: ['Museum experience', 'Education'], mainCategory: 'Museum experience' },
  ];
  assert.deepEqual(categoryOptions(livePapers), [
    { name: 'Museum experience', count: 2 },
    { name: 'Education', count: 1 },
  ]);
  assert.deepEqual(findPapers(livePapers, '', ['Education']).map(paper => paper.id), ['2']);
});

test('related research is explainable, symmetric, catalogue-only, and excludes the current paper', () => {
  for (const paper of papers) {
    const connections = relatedPapers(papers, paper);
    for (const connection of connections) {
      assert.notEqual(connection.paper.id, paper.id);
      assert.ok(papers.some(p => p.id === connection.paper.id));
      assert.ok(connection.sharedKeywords.length || connection.sharedTopics.length || connection.sharedCategories.length);
      assert.ok(relatedPapers(papers, connection.paper).some(c => c.paper.id === paper.id));
    }
  }
});

test('virtual destinations require a verified HTTPS FrameVR URL', () => {
  assert.equal(verifiedFrameUrl('https://framevr.io/example', true), 'https://framevr.io/example');
  for (const url of ['https://doi.org/10.1145/3610027', 'javascript:alert(1)', 'http://framevr.io/test', 'https://framevr.io.evil.example/test']) {
    assert.equal(verifiedFrameUrl(url, true), undefined);
  }
  for (const paper of papers) {
    const location = locationForPaper(paper.id);
    assert.equal(location.worldUrl, undefined);
    assert.equal(location.directSpotUrl, undefined);
  }
});
