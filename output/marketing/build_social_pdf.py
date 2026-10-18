from pathlib import Path
import argparse

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'output/pdf/agentic_ai_complete_source'
parser = argparse.ArgumentParser()
parser.add_argument('--dark-open', action='store_true')
DARK_OPEN = parser.parse_args().dark_open
filename = ('Agentic_AI_Engineering_dark_open_book.pdf' if DARK_OPEN
            else 'Agentic_AI_Engineering_social_media.pdf')
OUT = ROOT / 'output/pdf' / filename
W, H = 720, 900
for name, file in [('Display', 'SpaceGrotesk-Bold.ttf'),
                   ('Medium', 'SpaceGrotesk-Medium.ttf'),
                   ('Body', 'SourceSans3-Regular.ttf'),
                   ('Semi', 'SourceSans3-Semibold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(SOURCE / 'fonts' / file)))

C = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
C.setTitle('Agentic AI Engineering | Complete Illustrated Edition')
C.setAuthor('Muhammed Juned Alam')
C.setSubject('A visual introduction to the complete book: models, retrieval, agents, and reliable systems')
C.setCreator('Agentic AI Engineering - promotional design')
NAVY = '#0B163E'
BLUE = '#254BEE'
CYAN = '#45DCE9'
MUTED = '#4B5C7B'
LIGHT = '#EDF3FF'


def rect(x, y, w, h, color, radius=0, stroke=None):
    C.setFillColor(HexColor(color))
    if stroke:
        C.setStrokeColor(HexColor(stroke))
    if radius:
        C.roundRect(x, H-y-h, w, h, radius, fill=1, stroke=int(bool(stroke)))
    else:
        C.rect(x, H-y-h, w, h, fill=1, stroke=int(bool(stroke)))


def text(s, x, y, size=12, font='Body', color=NAVY):
    t = C.beginText(x, H-y-size)
    t.setFillColor(HexColor(color))
    t.setFont(font, size)
    t.setCharSpace(0)
    t.textOut(s)
    C.drawText(t)


def spaced(s, x, y, size=9, color=MUTED, spacing=1.5):
    t = C.beginText(x, H-y-size)
    t.setFont('Semi', size)
    t.setFillColor(HexColor(color))
    t.setCharSpace(spacing)
    t.textOut(s)
    C.drawText(t)


def line(x1, y1, x2, y2, color, width=1):
    C.setStrokeColor(HexColor(color))
    C.setLineWidth(width)
    C.line(x1, H-y1, x2, H-y2)


def path(points, color, width=1, fill=None):
    p = C.beginPath()
    p.moveTo(points[0][0], H-points[0][1])
    for x, y in points[1:]:
        p.lineTo(x, H-y)
    C.setLineWidth(width)
    C.setStrokeColor(HexColor(color))
    if fill:
        p.close()
        C.setFillColor(HexColor(fill))
    C.drawPath(p, stroke=1, fill=bool(fill))


def circle(x, y, r, color, stroke=None):
    C.setFillColor(HexColor(color))
    if stroke:
        C.setStrokeColor(HexColor(stroke))
    C.circle(x, H-y, r, fill=1, stroke=bool(stroke))


def arrow(x1, y, x2, color):
    line(x1, y, x2, y, color, 1.2)
    path([(x2-4, y-3), (x2, y), (x2-4, y+3)], color, 1.2)


def cube(cx, cy, r=12):
    path([(cx, cy-r), (cx+r, cy-r/2), (cx, cy), (cx-r, cy-r/2)], BLUE, 1, '#E3E9FF')
    path([(cx-r, cy-r/2), (cx, cy), (cx, cy+r), (cx-r, cy+r/2)], BLUE, 1, '#C2CFFF')
    path([(cx, cy), (cx+r, cy-r/2), (cx+r, cy+r/2), (cx, cy+r)], BLUE, 1, '#9EBCFF')


if DARK_OPEN:
    # Dark variant: the open spread uses actual book pages 228 and 229 as references.
    rect(0, 0, W, H, '#080D1A')
    spaced('AGENTIC AI ENGINEERING', 44, 28, 10, '#E8F0FF', 1.25)
    spaced('COMPLETE ILLUSTRATED EDITION', 445, 29, 7.5, '#91A3C8', 0.75)
    line(44, 55, 676, 55, '#233451')
    text('Open the book.', 42, 70, 45, 'Display', '#F5F8FF')
    text('See the system.', 42, 118, 45, 'Display', '#65E0F3')
    text('From First Principles to Production', 45, 177, 17, 'Medium', '#A8BDE1')
    
    C.drawImage(str(ROOT / 'output/marketing/assets/book-3d-dark-open.png'),
                0, H-214-480, width=720, height=480, mask='auto')
    
    rect(44, 711, 632, 72, '#111C31', 12, '#2A3A58')
    for x in [254, 465]:
        line(x, 725, x, 769, '#2A3A58')
    for x, number, label in [(65, '39', 'CHAPTERS'), (276, '287', 'VISUALS'), (487, '892', 'PAGES')]:
        text(number, x, 718, 33, 'Display', '#65E0F3')
        spaced(label, x+88, 739, 9, '#B8C9E7', 1.0)
    text('Includes 117 visual labs, 156 self-checks, and 117 exercises.',
         46, 791, 11.2, 'Body', '#9FB2D5')
    
    line(44, 820, 676, 820, '#233451')
    text('Explore the complete illustrated book', 44, 830, 22, 'Display', '#F5F8FF')
    text('Simple explanations. Connected analogies. Runnable examples.',
         44, 862, 11.5, 'Body', '#A8BDE1')
    author = 'MUHAMMED JUNED ALAM'
    aw = pdfmetrics.stringWidth(author, 'Semi', 8.4)
    text(author, 676-aw, 883, 8.4, 'Semi', '#91A3C8')
else:
    # One-page advertisement with a photorealistic front-and-back product hero.
    rect(0, 0, W, H, '#F7FAFF')
    cube(56, 34, 10)
    spaced('AGENTIC AI ENGINEERING', 78, 27, 10, NAVY, 1.05)
    spaced('COMPLETE ILLUSTRATED EDITION', 445, 29, 7.5, MUTED, 0.75)
    line(44, 55, 676, 55, '#DCE5F5')
    
    text('See how AI agents work.', 42, 68, 40, 'Display')
    text('Learn how to engineer them.', 44, 119, 24, 'Medium', BLUE)
    text('Models, RAG, memory, tools, and reliable autonomous workflows.',
         45, 158, 13.5, 'Body', MUTED)
    
    # Unmodified generated product mockup: both covers, spine, hinges and page block.
    C.drawImage(str(ROOT / 'output/marketing/assets/book-3d-front-back.png'),
                0, H-189-480, width=720, height=480, mask='auto')
    
    rect(44, 683, 632, 76, '#FFFFFF', 13, '#DCE5F5')
    for x in [254, 465]:
        line(x, 699, x, 743, '#E1E8F4')
    for x, number, label in [(65, '39', 'CHAPTERS'), (276, '287', 'VISUALS'), (487, '892', 'PAGES')]:
        text(number, x, 690, 34, 'Display', BLUE)
        spaced(label, x+88, 711, 9.0, MUTED, 1.0)
    text('Includes 117 visual labs, 156 self-checks, and 117 exercises.',
         46, 767, 11.4, 'Body', MUTED)
    
    rect(0, 801, W, 99, NAVY)
    text('Clear explanations. Everyday analogies. Visual learning.',
         44, 814, 13.2, 'Semi', '#B9C9ED')
    text('Explore the complete illustrated book', 44, 839, 22, 'Display', '#FFFFFF')
    text('From First Principles to Production', 44, 875, 10.6, 'Body', '#B9C9ED')
    author = 'MUHAMMED JUNED ALAM'
    aw = pdfmetrics.stringWidth(author, 'Semi', 9.2)
    text(author, 676-aw, 875, 9.2, 'Semi', '#B9C9ED')

C.showPage()
C.save()
print(OUT)
