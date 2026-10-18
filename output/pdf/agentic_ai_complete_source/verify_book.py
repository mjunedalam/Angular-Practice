"""Check page-unit bounds, text preservation, diagram collisions and manuscript coverage."""
from pathlib import Path
import argparse,json,re,collections,hashlib
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent

def norm(s):return ''.join(c for c in s.casefold() if c.isalnum())
def verify(preview=False,atlas=False):
    pdf=ROOT.parent/('Agentic_AI_Engineering_visual_atlas.pdf' if atlas else ('Agentic_AI_Engineering_complete_preview.pdf' if preview else 'Agentic_AI_Engineering_complete.pdf'))
    layout=json.loads((ROOT/('atlas_layout.json' if atlas else ('preview_layout.json' if preview else 'layout_manifest.json'))).read_text())
    r=PdfReader(str(pdf));texts=[p.extract_text() or '' for p in r.pages];normalized=[norm(t) for t in texts]
    issues=[];tested=0;diagram_texts=0
    x,y,w,h=layout['frame']
    ids=collections.Counter(u['id'] for u in layout['units'])
    for uid,count in ids.items():
        if count!=1:issues.append({'kind':'repeated_unit','id':uid,'count':count})
    for u in layout['units']:
        if u['bottom']<y-.2 or u['top']>y+h+.2:issues.append({'kind':'unit_bounds','unit':u})
        for t in u.get('text',[]):
            n=norm(t);tested+=1
            if n and n not in normalized[u['page']-1]:issues.append({'kind':'missing_text','id':u['id'],'page':u['page'],'text':t[:220]})
    for d in layout['diagram_layouts']+[{**v,'figure':v['id']} for v in layout.get('visual_layouts',[])]+layout.get('part_layouts',[]):
        for t in d['text']:
            diagram_texts+=1
            if t['x']<0 or t['y']<0 or t['x']+t['width']>w+.1 or t['y']+t['height']>d['panel_height']+.1:issues.append({'kind':'diagram_bounds','figure':d['figure'],'text':t})
            if norm(t['text']) not in normalized[d['page']-1]:issues.append({'kind':'diagram_missing_text','figure':d['figure'],'page':d['page'],'text':t['text']})
        for i,a in enumerate(d['text']):
            for b in d['text'][i+1:]:
                ow=min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x']);oh=min(a['y']+a['height'],b['y']+b['height'])-max(a['y'],b['y'])
                if ow>1 and oh>1:issues.append({'kind':'diagram_overlap','figure':d['figure'],'page':d['page'],'text':[a['text'],b['text']]})
    chapters=[];word_count=0;figures=0;checks=0;exercises=0;code=0
    for file in sorted((ROOT/'chapters').glob('*.md')):
        raw=file.read_text();ch=int(file.stem);chapters.append(ch);word_count+=len(raw.split())
        fs=raw.count(':::diagram');cs=raw.count(':::check');es=raw.count(':::exercise');figures+=fs;checks+=cs;exercises+=es;code+=len(re.findall(r'^```[^\n]+$',raw,re.M))
        if not (fs>=3 and cs==4 and 2<=es<=3):issues.append({'kind':'chapter_contract','chapter':ch,'figures':fs,'checks':cs,'exercises':es})
    if not preview and chapters!=list(range(1,40)):issues.append({'kind':'chapter_sequence','chapters':chapters})
    if len(r.pages)!=layout['pages']:issues.append({'kind':'page_count'})
    for ch,digest in layout.get('lesson_sources',{}).items():
        if hashlib.sha256((ROOT/'visual_lessons'/f'{int(ch):02}.json').read_bytes()).hexdigest()!=digest:issues.append({'kind':'stale_visual_source','chapter':ch})
    for ch,digest in layout.get('research_sources',{}).items():
        if hashlib.sha256((ROOT/'research_lessons'/f'{int(ch):02}.json').read_bytes()).hexdigest()!=digest:issues.append({'kind':'stale_research_source','chapter':ch})
    visuals=layout.get('visual_layouts',[])
    if not preview and len(visuals)!=117:issues.append({'kind':'visual_count','count':len(visuals)})
    if not preview and len(layout.get('part_layouts',[]))!=10:issues.append({'kind':'part_map_count'})
    if not preview and len(layout.get('research_sources',{}))!=39:issues.append({'kind':'research_source_count'})
    covers=layout.get('cover_layouts',[])
    if [(c['kind'],c['page']) for c in covers]!=[('front',1),('back',len(r.pages))]:issues.append({'kind':'cover_order'})
    for d in covers:
        for t in d['text']:
            if t['x']<0 or t['y']<0 or t['x']+t['width']>d['width']+.1 or t['y']+t['height']>d['height']+.1:issues.append({'kind':'cover_text_bounds','text':t})
            if norm(t['text']) not in normalized[d['page']-1]:issues.append({'kind':'cover_text_missing','text':t})
        for i,a in enumerate(d['text']):
            for b in d['text'][i+1:]:
                ow=min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x']);oh=min(a['y']+a['height'],b['y']+b['height'])-max(a['y'],b['y'])
                if ow>1 and oh>1:issues.append({'kind':'cover_text_overlap','text':[a['text'],b['text']]})
    for filename,digest in layout.get('chapter_sources',{}).items():
        if hashlib.sha256((ROOT/'chapters'/filename).read_bytes()).hexdigest()!=digest:
            issues.append({'kind':'stale_chapter_source','chapter':filename})
    page_refs={p.indirect_reference.idnum for p in r.pages}
    links=0
    for page_index,page in enumerate(r.pages):
        for ar in page.get('/Annots',[]):
            annotation=ar.get_object();destination=annotation.get('/Dest');action=annotation.get('/A')
            if action and action.get('/S')=='/GoTo':destination=action.get('/D')
            if isinstance(destination,list):
                links+=1
                if getattr(destination[0],'idnum',None) not in page_refs:issues.append({'kind':'bad_destination','page':page_index+1})
    report={'pdf':str(pdf),'pages':len(r.pages),'chapters':len(chapters),'chapter_source_words':0 if atlas else word_count,'chapter_diagrams':0 if atlas else figures,'total_diagrams':len(layout['diagram_layouts'])+len(visuals)+len(layout.get('part_layouts',[])),'visual_lessons':len(visuals),'part_learning_maps':len(layout.get('part_layouts',[])),'internal_links_checked':links,'visual_forms':dict(collections.Counter(v['kind'] for v in visuals)),'self_checks':0 if atlas else checks,'exercises':0 if atlas else exercises,'code_units':0 if atlas else code,'intact_page_units':len(layout['units']),'text_fragments_checked':tested,'diagram_labels_checked':diagram_texts,'diagram_forms':dict(collections.Counter(d['kind'] for d in layout['diagram_layouts'])),'issues':issues}
    (ROOT/('atlas_quality_report.json' if atlas else ('preview_qa.json' if preview else 'quality_report.json'))).write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k!='issues'},indent=2));print('ISSUES:',len(issues));print(json.dumps(issues[:20],indent=2))
    return report
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--preview',action='store_true');p.add_argument('--atlas',action='store_true');a=p.parse_args();r=verify(a.preview,a.atlas);raise SystemExit(bool(r['issues']))
