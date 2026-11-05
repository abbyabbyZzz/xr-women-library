import test from 'node:test';
import assert from 'node:assert/strict';
import { findPapers, papers, relatedPapers } from '../src/data/catalogue';
import { locationForPaper, verifiedFrameUrl } from '../src/data/locations';

test('the complete catalogue contains exactly the six supplied publication records', () => {
  assert.deepEqual(papers.map(p => p.id), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(papers.map(p => p.sourceUrl), [
    'https://doi.org/10.1007/s10055-026-01388-1',
    'https://doi.org/10.1016/j.cexr.2026.100149',
    'https://doi.org/10.1145/3610027',
    'https://doi.org/10.1371/journal.pone.0269430',
    'https://doi.org/10.3389/frvir.2024.1305758',
    'https://doi.org/10.1109/VRW62533.2024.00065',
  ]);
  assert.equal(papers[2].sourceMetadata['Journal credibility'], 'Ulrichsweb (user-verified)');
  assert.match(papers[4].abstract, /\nMethods: /);
  assert.match(papers[3].originalKeywordsText, /^Not specified/);
});

test('the requested searches find the intended papers, regardless of case or accents', () => {
  assert.deepEqual(findPapers('HARASSMENT').map(p => p.id), ['1', '3']);
  assert.deepEqual(findPapers('Zhang').map(p => p.id), ['5']);
  assert.deepEqual(findPapers('microaggressions').map(p => p.id), ['2']);
  assert.deepEqual(findPapers('Caki').map(p => p.id), ['2']);
  assert.deepEqual(findPapers('platform governance').map(p => p.id), ['1']);
});

test('topic filters combine with each other and with search; clear restores all papers', () => {
  assert.deepEqual(findPapers('', ['safety']).map(p => p.id), ['1', '6', '3']);
  assert.deepEqual(findPapers('', ['safety', 'identity']).map(p => p.id), ['3']);
  assert.deepEqual(findPapers('Chen', ['safety']).map(p => p.id), ['1']);
  assert.equal(findPapers('Zhang', ['safety']).length, 0);
  assert.equal(findPapers('nonexistent research topic').length, 0);
  assert.equal(findPapers('', []).length, 6);
  assert.deepEqual(findPapers('', [], 'oldest').map(p => p.year), [2022, 2023, 2024, 2024, 2026, 2026]);
});

test('related research is explainable, symmetric, catalogue-only, and excludes the current paper', () => {
  for (const paper of papers) {
    const connections = relatedPapers(paper);
    for (const connection of connections) {
      assert.notEqual(connection.paper.id, paper.id);
      assert.ok(papers.some(p => p.id === connection.paper.id));
      assert.ok(connection.sharedKeywords.length || connection.sharedTopics.length);
      assert.ok(relatedPapers(connection.paper).some(c => c.paper.id === paper.id));
    }
  }
  assert.ok(relatedPapers(papers[0]).some(c => c.paper.id === '3' && c.sharedKeywords.some(k => k.toLowerCase() === 'social vr')));
});

test('virtual destinations require a verified HTTPS FrameVR URL; DOI and deceptive URLs are rejected', () => {
  assert.equal(verifiedFrameUrl('https://framevr.io/example', true), 'https://framevr.io/example');
  for (const url of ['https://doi.org/10.1145/3610027', 'javascript:alert(1)', 'http://framevr.io/test', 'https://framevr.io.evil.example/test', 'https://evilframevr.io/test', 'https://name:secret@framevr.io/test']) {
    assert.equal(verifiedFrameUrl(url, true), undefined);
  }
  assert.equal(verifiedFrameUrl('https://framevr.io/example', false), undefined);
  for (const paper of papers) assert.deepEqual(locationForPaper(paper.id), {});
});
