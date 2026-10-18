"""Build, regenerate the index, apply viewer page labels, and verify the edition."""
from pathlib import Path
import json,subprocess,sys
from pypdf import PdfReader,PdfWriter
ROOT=Path(__file__).resolve().parent

def run(name,*args):subprocess.run([sys.executable,str(ROOT/name),*args],check=True)
def signature():
    d=json.loads((ROOT/'layout_manifest.json').read_text())
    return [(c['key'],c['pdf_page'],c['printed_page']) for c in d['chapters']]

def main():
    run('build_book.py','--without-index')
    for _ in range(3):
        before=signature();run('build_index.py');run('build_book.py')
        if signature()==before:break
    else:raise RuntimeError('Chapter/index pagination did not stabilize.')
    run('build_book.py','--atlas')
    for filename,manifest,atlas in [('Agentic_AI_Engineering_visual_learning.pdf','layout_manifest.json',False),('Agentic_AI_Engineering_visual_atlas.pdf','atlas_layout.json',True)]:
        path=ROOT.parent/filename;d=json.loads((ROOT/manifest).read_text())
        reader=PdfReader(str(path));writer=PdfWriter();writer.clone_document_from_reader(reader)
        start=d['body_start']-1
        if start:writer.set_page_label(0,start-1,style='/r',start=1)
        writer.set_page_label(start,len(reader.pages)-1,style='/D',start=1)
        writer.add_metadata({'/Title':'Agentic AI Engineering: '+('Visual Atlas' if atlas else 'From First Principles to Production - Visual Learning Edition'),'/Author':'Muhammed Juned Alam','/Subject':'78 concrete visual lessons with reading cues, prediction questions and linked answers'})
        temp=path.with_suffix('.tmp.pdf')
        with temp.open('wb') as f:writer.write(f)
        temp.replace(path)
        run('verify_book.py',*(['--atlas'] if atlas else []))
        report=json.loads((ROOT/('atlas_quality_report.json' if atlas else 'quality_report.json')).read_text())
        if report['issues']:raise RuntimeError(f'Publication checks found {len(report["issues"])} issues.')
        print(f'Verified PDF: {path}')
if __name__=='__main__':main()
