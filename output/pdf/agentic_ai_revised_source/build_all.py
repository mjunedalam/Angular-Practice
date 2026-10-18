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
    path=ROOT.parent/'Agentic_AI_Engineering_revised.pdf';d=json.loads((ROOT/'layout_manifest.json').read_text())
    reader=PdfReader(str(path));writer=PdfWriter();writer.clone_document_from_reader(reader)
    start=d['body_start']-1
    if start:writer.set_page_label(0,start-1,style='/r',start=1)
    writer.set_page_label(start,len(reader.pages)-1,style='/D',start=1)
    writer.add_metadata({'/Title':'Agentic AI Engineering: From First Principles to Production — Revised Learning Edition','/Author':'Muhammed Juned Alam','/Subject':'Clear explanations, connected analogies and vector diagrams for agent engineering'})
    temp=path.with_suffix('.tmp.pdf')
    with temp.open('wb') as f:writer.write(f)
    temp.replace(path)
    run('verify_book.py')
    report=json.loads((ROOT/'quality_report.json').read_text())
    if report['issues']:raise RuntimeError(f'Publication checks found {len(report["issues"])} issues.')
    print(f'Verified PDF: {path}')
if __name__=='__main__':main()
