"""Build, regenerate the index, apply viewer page labels, and verify the edition."""
from pathlib import Path
import io,json,subprocess,sys,zipfile,hashlib
from pypdf import PdfReader,PdfWriter
import pdf_semantics as PS
ROOT=Path(__file__).resolve().parent

def run(name,*args):subprocess.run([sys.executable,str(ROOT/name),*args],check=True)
def signature():
    d=json.loads((ROOT/'layout_manifest.json').read_text())
    return [(c['key'],c['pdf_page'],c['printed_page']) for c in d['chapters']]

def companion_zip():
    buffer=io.BytesIO()
    with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as archive:
        for folder in ('examples','chapters'):
            for file in sorted((ROOT/folder).rglob('*')):
                if file.is_file() and '__pycache__' not in file.parts and file.suffix in ('.py','.md','.txt','.json','.sql'):
                    archive.write(file,str(file.relative_to(ROOT)))
        for name in ('publication.json','CHANGELOG.md','ERRATA.md','LICENSE_STATUS.txt'):
            archive.write(ROOT/name,name)
        metadata=json.loads((ROOT/'publication.json').read_text())
        archive.writestr('START_HERE.txt',f'Agentic AI Engineering - companion {metadata["version"]}\nPrepared {metadata["prepared_date"]}; publication review candidate.\nRead examples/README.md first. Keep examples/ beside chapters/; tests execute exact chapter listings. No model credentials or live business effects are required. Optional environments are documented per lab. Read LICENSE_STATUS.txt before reuse. Corrections: {metadata["corrections_email"]}\n')
    return buffer.getvalue()

def main():
    run('build_book.py','--without-index')
    for _ in range(3):
        before=signature();run('build_index.py');run('build_book.py')
        if signature()==before:break
    else:raise RuntimeError('Chapter/index pagination did not stabilize.')
    for filename,manifest,atlas in [('Agentic_AI_Engineering_complete.pdf','layout_manifest.json',False)]:
        path=ROOT.parent/filename;d=json.loads((ROOT/manifest).read_text())
        reader=PdfReader(str(path));writer=PdfWriter();writer.clone_document_from_reader(reader)
        writer.pdf_header='%PDF-1.7'
        PS.add_structure(writer,d['semantic_records'])
        companion=companion_zip()
        (ROOT.parent/'Agentic_AI_Engineering_companion.zip').write_bytes(companion)
        writer.add_attachment('Agentic_AI_Engineering_companion.zip',companion)
        start=d['body_start']-1
        if start:writer.set_page_label(0,start-1,style='/r',start=1)
        writer.set_page_label(start,len(reader.pages)-2,style='/D',start=1)
        writer.set_page_label(len(reader.pages)-1,len(reader.pages)-1,prefix='Back cover')
        metadata=json.loads((ROOT/'publication.json').read_text())
        writer.add_metadata({'/Title':'Agentic AI Engineering: From First Principles to Production - Complete Illustrated Edition','/Author':'Muhammed Juned Alam','/Subject':f'Publication review candidate {metadata["version"]}; 39 chapters, 117 visual labs, 10 learning maps and technical references','/Keywords':'Agentic AI, RAG, ML, visual learning, '+metadata['version']})
        temp=path.with_suffix('.tmp.pdf')
        with temp.open('wb') as f:writer.write(f)
        temp.replace(path)
        final=PdfReader(str(path))
        semantics=PS.check_structure(final,d['semantic_records'])
        assert final.attachments['Agentic_AI_Engineering_companion.zip'][0]==companion
        (ROOT/'accessibility_report.json').write_text(json.dumps(semantics,indent=2))
        (ROOT/'companion_report.json').write_text(json.dumps({'embedded_name':'Agentic_AI_Engineering_companion.zip','bytes':len(companion),'sha256':hashlib.sha256(companion).hexdigest(),'round_trip_verified':True},indent=2))
        run('verify_book.py',*(['--atlas'] if atlas else []))
        report=json.loads((ROOT/('atlas_quality_report.json' if atlas else 'quality_report.json')).read_text())
        if report['issues']:raise RuntimeError(f'Publication checks found {len(report["issues"])} issues.')
        print(f'Verified PDF: {path}')
if __name__=='__main__':main()
