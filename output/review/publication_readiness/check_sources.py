"""Audit local provenance and source reachability; HTTP success is not fact verification."""
from pathlib import Path
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
import hashlib
import html
import json
import re
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / 'output/pdf/agentic_ai_complete_source'
OUT = Path(__file__).resolve().parent
files = [*sorted((SOURCE/'chapters').glob('*.md')),
         *sorted((SOURCE/'research_lessons').glob('*.json')),
         *sorted((SOURCE/'visual_lessons').glob('*.json')),
         SOURCE/'front_matter.md', SOURCE/'appendices.md']
locations = defaultdict(list)
for file in files:
    for number, line in enumerate(file.read_text().splitlines(), 1):
        for raw in re.findall(r'https?://[^\s<>"\]}]+', line):
            url = html.unescape(raw.rstrip(').,;'))
            if url not in {'https://', 'http://'}:
                locations[url].append(f'{file.relative_to(SOURCE)}:{number}')


def check(url):
    row = {'url': url, 'locations': locations[url]}
    try:
        request = Request(url, headers={'User-Agent': 'Mozilla/5.0 (book-reference-check)'})
        with urlopen(request, timeout=12) as result:
            row.update(status=result.status, final_url=result.url,
                       content_type=result.headers.get('Content-Type', ''))
    except HTTPError as error:
        row.update(status=error.code, final_url=error.url, error=str(error))
    except (URLError, TimeoutError, OSError) as error:
        row.update(status=None, error=f'{type(error).__name__}: {error}')
    return row


with ThreadPoolExecutor(max_workers=8) as pool:
    checked = list(pool.map(check, sorted(locations)))
report = {'checked_date': '2026-10-17', 'method': 'HTTP GET, streaming headers only',
          'scope': 'All chapter, lesson, preface and appendix URLs; no claim of content validation',
          'unique_urls': len(checked),
          'status_counts': dict(Counter(str(r['status']) for r in checked)),
          'sources': checked}
(OUT/'reference_reachability.json').write_text(json.dumps(report, indent=2))

provenance = json.loads((SOURCE/'fonts/provenance.json').read_text())
font_rows = []
for record in provenance:
    file = SOURCE/'fonts'/record['file']
    actual = hashlib.sha256(file.read_bytes()).hexdigest()
    font_rows.append({'file': record['file'], 'matches_record': actual==record['sha256'],
                      'sha256': actual, 'source': record.get('source', record.get('url'))})
(OUT/'font_provenance_check.json').write_text(json.dumps(font_rows, indent=2))
print(json.dumps({'unique_urls': len(checked), 'status_counts': report['status_counts'],
                  'font_records': len(font_rows),
                  'font_hash_mismatches': [r['file'] for r in font_rows if not r['matches_record']]}))
