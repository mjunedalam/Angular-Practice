"""Reading-order tags and text alternatives for the book's own flowables.

This supplies structural navigation, not a PDF/UA conformance certificate.
Tables have linear text alternatives; links have annotation relationships.
"""
import re
from contextlib import contextmanager
from reportlab.platypus import Flowable, Paragraph, Table
from pypdf.generic import (
    ArrayObject, BooleanObject, DictionaryObject, NameObject,
    NumberObject, TextStringObject,
)


def plain(value):
    if hasattr(value, 'getPlainText'):
        return value.getPlainText()
    if isinstance(value, (list, tuple)):
        return ' '.join(plain(x) for x in value)
    return str(value)


def describe(flowable):
    name = type(flowable).__name__
    if name == 'Cover':
        side = 'Back' if flowable.back else 'Front'
        return 'Figure', f'{side} cover. Agentic AI Engineering: From First Principles to Production, by Muhammed Juned Alam. Complete illustrated edition. Retrieve. Reason. Act. Verify. From Models and Knowledge to Reliable Autonomous Systems. A conceptual blueprint connects documents, embeddings, a vector store and retrieval to an AI agent, alongside a model, memory, planning, observation, policy and tools.'
    if isinstance(flowable, Paragraph):
        style = flowable.style.name
        return ({'h1': 'H1', 'h2': 'H2', 'h3': 'H3'}.get(style, 'P'), plain(flowable))
    if name == 'ChapterHeader':
        return 'H1', f'Chapter {flowable.chapter}. {flowable.title}'
    if name == 'Figure':
        return 'Figure', f'Figure {flowable.number}. {flowable.d["title"]}. {flowable.d.get("caption", "")} {flowable.d.get("insight", "")}'
    if name in ('VisualLesson', 'PartMap'):
        return 'Figure', ''  # Completed from the actual rendered, ordered labels.
    if name == 'Code':
        return 'Code', flowable.text
    if name == 'Card':
        return 'Note', ' '.join(plain(x) for x in flowable.parts)
    if isinstance(flowable, Table):
        return 'Table', ''
    if name in ('IndexColumns', 'TableOfContents'):
        return 'Div', ''
    return None


@contextmanager
def marked(canvas, role, text=''):
    doc = canvas._doc_ref
    page = canvas.getPageNumber()
    mcid = doc.semantic_counts.get(page, 0)
    doc.semantic_counts[page] = mcid + 1
    record = {'page': page, 'mcid': mcid, 'role': role, 'text': text}
    doc.semantic_records.append(record)
    canvas._code.append(f'/{role} <</MCID {mcid}>> BDC')
    try:
        yield record
    finally:
        canvas._code.append('EMC')


def install():
    if getattr(Flowable.drawOn, '_book_semantics', False):
        return
    original = Flowable.drawOn

    def draw_on(self, canvas, x, y, _sW=0):
        if not hasattr(canvas, '_doc_ref') or getattr(canvas, '_semantic_depth', 0):
            return original(self, canvas, x, y, _sW)
        description = describe(self)
        if description is None:
            return original(self, canvas, x, y, _sW)
        role, text = description
        canvas._semantic_depth = 1
        try:
            with marked(canvas, role, text) as record:
                result = original(self, canvas, x, y, _sW)
                if type(self).__name__ == 'Figure':
                    labels = canvas._doc_ref.diagram_layouts[-1]['text']
                    record['text'] += ' Diagram labels in reading order: ' + '; '.join(t['text'] for t in labels)
                elif type(self).__name__ in ('VisualLesson', 'PartMap'):
                    record['text'] = '. '.join(t['text'] for t in self.trace)
                elif type(self).__name__ == 'Cover' and self.back:
                    record['text'] = 'Back cover. ' + ' '.join(t['text'] for t in canvas._doc_ref.cover_layouts[-1]['text'])
                elif type(self).__name__ == 'IndexColumns':
                    record['text'] = '\n'.join(plain(p) for _, _, p, _, _ in self.placements)
                elif isinstance(self, Table):
                    record['rows'] = [[plain(cell) for cell in row] for row in self._cellvalues]
                    record['text'] = '\n'.join(' | '.join(row) for row in record['rows'])
                return result
        finally:
            canvas._semantic_depth = 0

    draw_on._book_semantics = True
    Flowable.drawOn = draw_on


def add_structure(writer, records):
    """Connect recorded page MCIDs to a flat, ordered document structure."""
    def obj(**values):
        return DictionaryObject({NameObject('/' + key): value for key, value in values.items()})

    structure = obj(Type=NameObject('/StructTreeRoot'), K=ArrayObject())
    root_ref = writer._add_object(structure)
    document = obj(Type=NameObject('/StructElem'), S=NameObject('/Document'), P=root_ref, K=ArrayObject())
    document_ref = writer._add_object(document)
    structure['/K'].append(document_ref)
    page_parents = {}
    page_elements = {}
    for record in records:
        page_index = record['page'] - 1
        page = writer.pages[page_index]
        element = obj(Type=NameObject('/StructElem'), S=NameObject('/' + record['role']), P=document_ref,
                      Pg=page.indirect_reference, K=NumberObject(record['mcid']))
        text = record.get('text', '')
        if record['role'] == 'Figure':
            element[NameObject('/Alt')] = TextStringObject(text)
        elif record['role'] in ('Code', 'Note', 'Div', 'H1') and text:
            element[NameObject('/ActualText')] = TextStringObject(text)
        if record['role'] == 'Table':
            # Preserve row/column meaning in a linear alternative. Semantic
            # cell reconstruction is intentionally not claimed here.
            element[NameObject('/ActualText')] = TextStringObject(text)
        ref = writer._add_object(element)
        document['/K'].append(ref)
        page_parents.setdefault(page_index, []).append(ref)
        page_elements.setdefault(page_index, []).append((record, ref))
    nums = ArrayObject()
    for page_index, refs in sorted(page_parents.items()):
        writer.pages[page_index][NameObject('/StructParents')] = NumberObject(page_index)
        writer.pages[page_index][NameObject('/Tabs')] = NameObject('/S')
        nums.extend([NumberObject(page_index), ArrayObject(refs)])
    next_key = len(writer.pages)
    for page_index, page in enumerate(writer.pages):
        for annotation_ref in page.get('/Annots', []):
            annotation = annotation_ref.get_object()
            if annotation.get('/Subtype') != '/Link':
                continue
            action = annotation.get('/A', {})
            label = str(action.get('/URI', 'Internal book navigation'))
            link = obj(Type=NameObject('/StructElem'), S=NameObject('/Link'), P=document_ref,
                       Pg=page.indirect_reference, Alt=TextStringObject(label),
                       K=obj(Type=NameObject('/OBJR'), Obj=annotation_ref, Pg=page.indirect_reference))
            ref = writer._add_object(link)
            # Place navigation links beside the content of their page.
            page_refs = [r for _, r in page_elements.get(page_index, [])]
            insert_at = max((document['/K'].index(r) for r in page_refs), default=len(document['/K']) - 1) + 1
            document['/K'].insert(insert_at, ref)
            annotation[NameObject('/StructParent')] = NumberObject(next_key)
            annotation[NameObject('/Contents')] = TextStringObject(label)
            nums.extend([NumberObject(next_key), ref])
            next_key += 1
    structure[NameObject('/ParentTree')] = writer._add_object(obj(Nums=nums))
    structure[NameObject('/ParentTreeNextKey')] = NumberObject(next_key)
    writer.root_object[NameObject('/StructTreeRoot')] = root_ref
    writer.root_object[NameObject('/MarkInfo')] = obj(Marked=BooleanObject(True))
    writer.root_object[NameObject('/Lang')] = TextStringObject('en-US')


def check_structure(reader, expected):
    """Validate bidirectional MCID references and nonempty figure alternatives."""
    root = reader.trailer['/Root']
    assert root['/MarkInfo']['/Marked']
    assert root['/Lang'] == 'en-US'
    structure = root['/StructTreeRoot']
    document = structure['/K'][0].get_object()
    by_page = {}
    for record in expected:
        by_page.setdefault(record['page'] - 1, []).append(record)
    nums = structure['/ParentTree']['/Nums']
    parents = {int(nums[i]): nums[i + 1].get_object() for i in range(0, len(nums), 2)}
    figures = 0
    for page_index, records in by_page.items():
        stream = reader.pages[page_index].get_contents().get_data()
        mcids = [int(x) for x in re.findall(rb'/MCID\s+(\d+)', stream)]
        assert mcids == list(range(len(records))), (page_index, mcids)
        assert len(parents[page_index]) == len(records)
        for record, ref in zip(records, parents[page_index]):
            element = ref.get_object()
            assert element['/K'] == record['mcid']
            assert element['/Pg'].indirect_reference == reader.pages[page_index].indirect_reference
            if record['role'] == 'Figure':
                assert element['/Alt'].strip()
                figures += 1
    return {'marked_blocks': len(expected), 'figure_alternatives': figures,
            'structure_children': len(document['/K']),
            'conformance': 'Basic structural checks; PDF/UA and assistive-reader behavior not certified.'}
