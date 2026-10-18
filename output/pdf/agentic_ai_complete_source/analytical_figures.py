"""Original quantitative figures used by the worked retrieval explanations."""
import math


def cosine(a, b):
    if len(a) != 2 or len(b) != 2:
        raise ValueError('The teaching plot requires two-dimensional vectors.')
    norm_a = math.hypot(*a)
    norm_b = math.hypot(*b)
    if not norm_a or not norm_b:
        raise ValueError('Cosine is undefined for a zero vector.')
    return sum(x * y for x, y in zip(a, b)) / (norm_a * norm_b)


def panel_height(data):
    if data['kind'] == 'vectors':
        return 316
    return len(data['items']) * 40 + 150


def draw_vectors(fig, q, book):
    data = fig.d
    query = data['query']
    items = data['items']
    if not 1 <= len(items) <= 3:
        raise ValueError('Use one to three documents in the vector plot.')
    if any(not 1 <= len(item['label']) <= 2 for item in items):
        raise ValueError('Vector point IDs must be one or two characters.')
    cx, cy, radius = 119, 153, 89
    q.text(17, 16, 'DIRECTIONS IN A TOY SPACE', 8.5, 'Sans-Bold', book.NAVY, 216)
    q.text(245, 16, 'COMPARE WITH THE QUERY', 8.5, 'Sans-Bold', book.NAVY, 186)
    c = q.c
    c.saveState()
    c.setStrokeColor(book.colors.HexColor(book.LINE))
    c.circle(cx, q.h - cy, radius, stroke=1, fill=0)
    c.restoreState()
    q.line(cx - radius - 6, cy, cx + radius + 6, cy, book.LINE)
    q.line(cx, cy - radius - 6, cx, cy + radius + 6, book.LINE)
    q.text(18, 161, '-1', 8, 'Sans', book.MUTED, 20)
    q.text(204, 161, '+1', 8, 'Sans', book.MUTED, 25)
    q.text(126, 51, '+1', 8, 'Sans', book.MUTED, 25)
    q.text(126, 245, '-1', 8, 'Sans', book.MUTED, 25)
    entries = [('Q', query, book.NAVY)] + [
        (item['label'], item['vector'], color)
        for item, color in zip(items, [book.TEAL, '#673DC0', '#B13257'])
    ]
    for i, (label, vector, color) in enumerate(entries):
        cosine(query, vector)
        magnitude = math.hypot(*vector)
        x = cx + radius * vector[0] / magnitude
        y = cy - radius * vector[1] / magnitude
        q.arrow([(cx, cy), (x, y)], color)
        q.dot(x, y, label, color, 9)
        row = 49 + i * 51
        q.dot(254, row + 10, label, color, 9)
        coords = ', '.join(f'{v:g}' for v in vector)
        q.text(271, row, f'{label} = ({coords})', 9.8, 'Sans-Bold', color, 157, 12)
        detail = 'Reference query' if i == 0 else f'Cosine with Q: {cosine(query, vector):.2f}'
        q.text(271, row + 19, detail, 9, 'Sans', book.INK, 157, 12)
    q.text(18, 276, 'cosine = dot product / (query length x document length)', 9.2, 'Sans-Bold', book.NAVY, book.CW - 36, 12)
    q.text(18, 294, 'Arrows show unit directions. Coordinate axes have no literal topic names.', 8.5, 'Sans', book.MUTED, book.CW - 36, 11)


def draw_ranking(fig, q, book):
    data = fig.d
    items = data['items']
    k = data['k']
    relevant = data['total_relevant']
    if not 1 <= k <= len(items) <= 6 or relevant < 1:
        raise ValueError('Ranking figure needs 1..6 rows, a valid k and relevant count.')
    if any(item['relevance'] not in (0, 1) for item in items):
        raise ValueError('This worked figure uses binary relevance.')
    if sum(item['relevance'] for item in items) > relevant:
        raise ValueError('Total relevant count is smaller than displayed relevant items.')
    q.text(18, 14, f'BINARY RELEVANCE / CUT-OFF k = {k}', 9, 'Sans-Bold', book.NAVY, book.CW - 36)
    columns = [(20, 36, 'Rank'), (65, 100, 'Document'), (174, 73, 'Relevant?'), (260, 80, 'DCG gain'), (349, 80, 'Included?')]
    for x, w, label in columns:
        q.text(x, 40, label, 8.4, 'Sans-Bold', book.MUTED, w, 11)
    for i, item in enumerate(items, 1):
        y = 62 + (i - 1) * 40
        active = i <= k
        q.rect(13, y - 5, book.CW - 26, 35, '#E8F6EF' if active else '#FFFFFF', None, 4)
        gain = item['relevance'] / math.log2(i + 1)
        values = [str(i), item['label'], 'Yes' if item['relevance'] else 'No', f'{gain:.3f}', 'Yes' if active else 'Outside k']
        for (x, w, _), value in zip(columns, values):
            q.text(x, y + 3, value, 9.2, 'Sans', book.INK, w, 12)
    selected = items[:k]
    hits = sum(item['relevance'] for item in selected)
    dcg = sum(item['relevance'] / math.log2(i + 1) for i, item in enumerate(selected, 1))
    ideal = sum(1 / math.log2(i + 1) for i in range(1, min(k, relevant) + 1))
    first = next((i for i, item in enumerate(selected, 1) if item['relevance']), None)
    rr = 0 if first is None else 1 / first
    y = 72 + len(items) * 40
    q.text(18, y, f'Recall@{k}: {hits}/{relevant} = {hits/relevant:.3f}  |  RR@{k}: {rr:.3f}', 10, 'Sans-Bold', book.NAVY, book.CW - 36, 13)
    q.text(18, y + 23, f'nDCG@{k}: {dcg:.3f} / {ideal:.3f} = {dcg/ideal:.3f}', 10, 'Sans-Bold', book.TEAL, book.CW - 36, 13)
    q.text(18, y + 45, 'MRR averages reciprocal rank over multiple queries.', 8.8, 'Sans', book.MUTED, book.CW - 36, 11)
