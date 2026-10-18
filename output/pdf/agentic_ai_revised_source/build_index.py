"""Regenerate the concept index from revised PDF pages, never original page numbers.
Run after build_book.py, then rebuild. Repeat once if the contents page count changes.
"""
from pathlib import Path
import re,json
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent
ALIASES={
 'Approval interrupt':['approval interrupts','approval wait'],
 'Autonomy level':['autonomy levels'],
 'Context compaction':['observation compaction','compaction'],
 'Instruction pack':['instruction packs'],
 'MCP gateway':['gateway'],
 'Multimodal agent':['multimodal agents'],
 'Retry budget':['retry budgets'],
 'Shadow release':['shadow'],
 'Synthetic data':['synthetic cases','synthetic and adversarial datasets'],
 'Workflow vs agent':['workflow','workflows'],
 'Authorisation':['authorization'], 'Evaluator–optimizer':['evaluator-optimizer'],
 'Audit log':['audit record','audit trail'], 'Canary release':['canary'],
 'Cross-tenant access':['cross-tenant','cross tenant'], 'Deterministic replay':['replay'],
 'Latency budget':['latency'], 'LLM gateway':['model gateway','gateway'],
 'Loop detection':['repeated handoff','cycle','loop'], 'MCP registry':['registry'],
 'Memory write gate':['memory write','write gate'], 'Model routing':['routing'],
 'Multi-agent systems':['multi-agent'], 'Parallel tool calls':['parallel calls','parallel execution','parallelism'],
 'Precondition re-validation':['precondition','revalidation'], 'Risk score':['risk tier','risk score'],
 'Schema drift':['schema change','contract drift'], 'Secrets management':['secret','credential'],
 'Slice analysis':['slice'], 'Stop reason':['stop reason','completion status','terminal reason'],
 'Supervisor pattern':['supervisor'], 'Task lifecycle (A2A)':['task lifecycle','task state'],
 'Time travel':['time travel','historical checkpoint'], 'Tool description':['description'],
 'Tool registry':['registry'], 'Trust boundary':['trust boundary','trust boundaries'],
 'Voice agent':['voice'], 'Agent card':['agent card','agentcard'],
 'Golden trajectory':['golden trajectory','reference trajectory'],
 'Progress file':['progress file','progress record'], 'Activity (durable execution)':['activity','activities'],
 'Reader/actor split':['reader/actor','reader and actor','reader-actor'],
 'Self-hosted inference':['self-host','self hosted'], 'Tool annotations':['annotation'],
 'OpenTelemetry':['opentelemetry','otel'], 'Data residency':['residency'], 'Quantisation':['quantization'], 'SQL agent':['sql'],
 'Risk score':['risk score','risk classification','risk tier'],
}
def norm(s):return re.sub(r'[^a-z0-9]+',' ',s.casefold()).strip()
def main():
 layout=json.loads((ROOT/'layout_manifest.json').read_text());reader=PdfReader(str(ROOT.parent/'Agentic_AI_Engineering_revised.pdf'))
 pages=[norm(p.extract_text() or '') for p in reader.pages];chapters=[e for e in layout['chapters'] if e['key'].startswith('ch-')]
 ranges={}
 for i,c in enumerate(chapters):
  start=c['pdf_page'];end=chapters[i+1]['pdf_page']-1 if i+1<len(chapters) else min(e['pdf_page'] for e in layout['chapters'] if e['pdf_page']>start)-1
  ranges[int(c['key'][3:])]=(start,end)
 entries=[];fallbacks=[]
 for e in sorted(json.loads((ROOT/'index_terms.json').read_text()),key=lambda e:e['term'].casefold()):
  term=e['term'];base=re.sub(r'\(.*?\)','',term).strip();aliases=[norm(z.strip()) for z in base.split('/')]+[norm(z) for z in ALIASES.get(term,[])]
  refs=[];found=[]
  for ch in e['chapters']:
   if ch not in ranges:continue
   start,end=ranges[ch];matches=[p for p in range(start,end+1) if any(k and (' '+k+' ') in (' '+pages[p-1]+' ') for k in aliases)]
   if matches:found.append(matches[0])
  if not found:
   available=[ranges[ch][0] for ch in e['chapters'] if ch in ranges]
   if available:found=available[:1];fallbacks.append({'term':term,'chapter':e['chapters'],'pdf_page':found[0]})
  for pdf_page in list(dict.fromkeys(found))[:6]:refs.append({'pdf_page':pdf_page,'page':pdf_page-layout['body_start']+1})
  entries.append({'term':term,'references':refs})
 (ROOT/'index_entries.json').write_text(json.dumps(entries,indent=2))
 (ROOT/'index_match_report.json').write_text(json.dumps({'entries':len(entries),'fallbacks':fallbacks},indent=2))
 lines=['# Index','','Page references locate discussions in the revised edition. Each reference is a clickable link. For a concept expressed in plainer language, its chapter introduction provides the starting point.','']
 letter=''
 for e in entries:
  if e['term'][0].upper()!=letter:letter=e['term'][0].upper();lines+=['## '+letter,'']
  refs=', '.join(f'[{r["page"]}](#pdfpage-{r["pdf_page"]})' for r in e['references'])
  lines+=[f'**{e["term"]}** {refs}','']
 (ROOT/'index.md').write_text('\n'.join(lines));print(json.dumps({'entries':len(entries),'fallbacks':fallbacks},indent=2))
if __name__=='__main__':main()
