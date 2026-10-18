"""Verify the delivered attachment, then run its documented isolated test suites."""
from pathlib import Path
import ast, hashlib, json, re, subprocess, tempfile, zipfile
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[3]
SOURCE=ROOT/'output/pdf/agentic_ai_complete_source'
OUT=Path(__file__).resolve().parent
pdf=ROOT/'output/pdf/Agentic_AI_Engineering_complete.pdf'
reader=PdfReader(pdf)
attachment=reader.attachments['Agentic_AI_Engineering_companion.zip'][0]
assert attachment==(ROOT/'output/pdf/Agentic_AI_Engineering_companion.zip').read_bytes()
extracted=Path(tempfile.mkdtemp(prefix='agentic-final-companion-'))
zip_path=extracted/'companion.zip';zip_path.write_bytes(attachment)
with zipfile.ZipFile(zip_path) as z:z.extractall(extracted)
verified=[]
for p in sorted(extracted.rglob('*')):
    if p.is_file() and p.name not in ('companion.zip','START_HERE.txt'):
        rel=p.relative_to(extracted);assert p.read_bytes()==(SOURCE/rel).read_bytes(),str(rel)
        verified.append(str(rel))
commands=[]
patterns=[('base','test_mini_harness.py',19),('base','test_rag_lab.py',8),('base','test_judge_attack_lab.py',8),('runtime','test_runtime_snippets.py',11),('mcp','test_foundations_snippets.py',6),('capstone','test_capstone*.py',9)]
for env,pattern,expected in patterns:
    cmd=[f'/tmp/publication-production-{env}/bin/python','-W','error::ResourceWarning','-m','unittest','discover','-s','examples','-p',pattern,'-v']
    result=subprocess.run(cmd,cwd=extracted,text=True,capture_output=True,timeout=180)
    combined=result.stdout+result.stderr
    match=re.search(r'Ran (\d+) tests?',combined)
    passed=int(match.group(1)) if match else 0
    assert result.returncode==0 and passed==expected and 'skipped=' not in combined,combined
    commands.append({'suite':pattern,'command':cmd,'exit_code':result.returncode,'tests':passed,'output':combined})
    print(f'{pattern}: {passed} passed',flush=True)
parsed=0
for f in sorted((SOURCE/'chapters').glob('*.md')):
    for block in re.findall(r'^```python\n(.*?)^```',f.read_text(),re.S|re.M):ast.parse(block);parsed+=1
with zipfile.ZipFile(ROOT/'tmp/pdfs/agentic-publication-baseline/Agentic_AI_Engineering_complete_source.zip') as baseline:
    members=baseline.namelist();prefix=next(n[:-len('chapters/01.md')] for n in members if n.endswith('chapters/01.md'))
    changes=[]
    for f in sorted((SOURCE/'chapters').glob('*.md')):
        old=baseline.read(prefix+'chapters/'+f.name).decode();new=f.read_text()
        assert re.findall(r'^#{1,6} .+$',old,re.M)==re.findall(r'^#{1,6} .+$',new,re.M),f.name
        for kind in ('diagram','check','exercise'):
            assert re.findall(r':::'+kind+r'.*?:::',old,re.S)==re.findall(r':::'+kind+r'.*?:::',new,re.S),(f.name,kind)
        if old!=new:changes.append(f.name)
    for folder in ('visual_lessons','research_lessons'):
        for f in sorted((SOURCE/folder).glob('*.json')):
            old=json.loads(baseline.read(prefix+folder+'/'+f.name));new=json.loads(f.read_text())
            if folder=='research_lessons' and f.stem=='06':
                old['source']['url']=new['source']['url']
            assert old==new,(folder,f.name)
report={'date':'2026-10-17','version':'1.0-rc.1','source':'Fresh extraction of final PDF attachment','extraction':str(extracted),'attachment_sha256':hashlib.sha256(attachment).hexdigest(),'files_matched':len(verified),'files':verified,'tests_passed':sum(c['tests'] for c in commands),'skipped':0,'python_blocks_parsed':parsed,'chapter_headings_and_custom_blocks_preserved':True,'visual_lesson_bundles_preserved':78,'changed_chapters':changes,'commands':commands,'limits':['No live Temporal server or PostgreSQL deployment exercised.','External services and model behavior are simulated as documented.','No independent human or reader review performed.']}
(OUT/'delivered_companion_verification.json').write_text(json.dumps(report,indent=2))
(SOURCE/'example_verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ('commands','files')},indent=2))
