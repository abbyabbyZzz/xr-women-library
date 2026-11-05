"""Import the supplied TXT without rewriting academic text. Run only for a new source revision."""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1])
destination = Path(__file__).resolve().parents[1] / 'src' / 'data' / 'papers.json'
fields = r'^(ID|Title|Authors|Year|Original Keywords|Standardized Keywords|Main Category|Abstract\s*|Short Summary|Link/Location|Journal credibility):[ \t]*'
papers = []
for block in re.split(r'^---\s*$', source.read_text(encoding='utf-8-sig'), flags=re.M):
    matches = list(re.finditer(fields, block, flags=re.M))
    if not matches:
        continue
    record = {m.group(1).strip(): block[m.end():matches[i + 1].start() if i + 1 < len(matches) else len(block)].strip() for i, m in enumerate(matches)}
    if 'ID' not in record:
        continue
    original = record['Original Keywords']
    # Record 5 uses a bibliographic author string and comma-separated keywords.
    authors = ['Zhang, J.', 'Juvrud, J.'] if record['ID'] == '5' else record['Authors'].split('; ')
    original_keywords = [] if original.startswith('Not specified') else re.split(r';\s*' if ';' in original else r',\s*', original)
    papers.append({
        'id': record['ID'],
        'title': record['Title'],
        'authors': authors,
        'authorsText': record['Authors'],
        'year': int(record['Year']),
        'originalKeywords': original_keywords,
        'originalKeywordsText': original,
        'standardizedKeywords': re.split(r';\s*', record['Standardized Keywords']),
        'mainCategory': record['Main Category'],
        'abstract': record['Abstract'],
        'shortSummary': record['Short Summary'],
        'sourceUrl': record['Link/Location'],
        'sourceMetadata': {key: value for key, value in record.items() if key == 'Journal credibility'},
    })
if len(papers) != 6 or {p['id'] for p in papers} != set('123456'):
    raise ValueError('Expected the six distinct source records.')
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(papers, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Imported {len(papers)} records; abstracts and source metadata preserved.')
