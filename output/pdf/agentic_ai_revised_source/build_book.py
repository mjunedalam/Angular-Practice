"""Build the revised book and its diagram atlas. All artwork is editable vector code.
Requires ReportLab. The manuscript, diagram specifications and examples are adjacent.
Usage: python build_book.py [--preview] [--atlas]
"""
from pathlib import Path
import argparse, re, html, json, math, textwrap
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Flowable,
    Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent
W,H=535.748031,697.322835
M=47; CW=W-2*M; BOTTOM=51; TOP=55; FH=H-TOP-BOTTOM
NAVY='#142D42'; TEAL='#007F82'; INK='#253D4C'; MUTED='#596E7C'; LINE='#DCE4E6'; PAPER='#FBFAF6'
ROLE={'model':NAVY,'runtime':TEAL,'policy':'#A33B47','action':'#985A19','success':'#247459','data':'#466CA1','external':'#705E86'}
TINT={'model':'#EFF2F6','runtime':'#EAF6F3','policy':'#FBEFF0','action':'#FBF2E7','success':'#EBF5EE','data':'#EFF4FB','external':'#F3EFF8'}
FONT_DIRS=[Path('/System/Library/Fonts/Supplemental'),ROOT/'fonts',Path('/usr/share/fonts/truetype/msttcorefonts')]
def fontfile(f):
    for d in FONT_DIRS:
        if (d/f).exists():return str(d/f)
    raise FileNotFoundError(f'Install Arial/Georgia or put {f} in fonts/')
for name,f in [('Sans','Arial.ttf'),('Sans-Bold','Arial Bold.ttf'),('Sans-Italic','Arial Italic.ttf'),('Sans-BoldItalic','Arial Bold Italic.ttf'),('Serif','Georgia.ttf'),('Serif-Bold','Georgia Bold.ttf'),('Serif-Italic','Georgia Italic.ttf'),('Serif-BoldItalic','Georgia Bold Italic.ttf')]:
    pdfmetrics.registerFont(TTFont(name,fontfile(f)))
mono_candidates=[ROOT/'fonts/DejaVuSansMono.ttf',Path('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'),Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype/DejaVuSansMono.ttf']
pdfmetrics.registerFont(TTFont('Mono',str(next(p for p in mono_candidates if p.exists()))))
for f in ['Sans','Serif']:pdfmetrics.registerFontFamily(f,normal=f,bold=f+'-Bold',italic=f+'-Italic',boldItalic=f+'-BoldItalic')
S={
 'body':ParagraphStyle('body',fontName='Serif',fontSize=10.5,leading=15.2,textColor=colors.HexColor(INK),spaceAfter=9),
 'small':ParagraphStyle('small',fontName='Sans',fontSize=8.7,leading=12.6,textColor=colors.HexColor(MUTED),spaceAfter=8),
 'h1':ParagraphStyle('h1',fontName='Sans-Bold',fontSize=25,leading=29.5,textColor=colors.HexColor(NAVY),spaceAfter=20),
 'h2':ParagraphStyle('h2',fontName='Sans-Bold',fontSize=15,leading=19,textColor=colors.HexColor(NAVY),spaceBefore=12,spaceAfter=9),
 'h3':ParagraphStyle('h3',fontName='Sans-Bold',fontSize=11.8,leading=15,textColor=colors.HexColor(TEAL),spaceBefore=9,spaceAfter=7),
 'kicker':ParagraphStyle('kicker',fontName='Sans-Bold',fontSize=9,leading=12,textColor=colors.HexColor(TEAL),spaceBefore=7,spaceAfter=13),
 'code':ParagraphStyle('code',fontName='Mono',fontSize=8.0,leading=11,textColor=colors.HexColor(NAVY),spaceAfter=0),
 'list':ParagraphStyle('list',fontName='Serif',fontSize=10.3,leading=14.8,textColor=colors.HexColor(INK),spaceAfter=7,leftIndent=13,firstLineIndent=-13),
 'index':ParagraphStyle('index',fontName='Sans',fontSize=9,leading=12.6,textColor=colors.HexColor(INK),spaceAfter=5),
 'cell':ParagraphStyle('cell',fontName='Sans',fontSize=9,leading=12.8,textColor=colors.HexColor(INK)),
 'th':ParagraphStyle('th',fontName='Sans-Bold',fontSize=9,leading=12.8,textColor=colors.white),
}

def inline(s):
    s=s.replace('\u00ad','').replace('\u2011','-')
    toks={}
    def tok(v):
        k=f'ZZTOKEN{len(toks)}ZZ';toks[k]=v;return k
    s=re.sub(r'\[([^\]]+)\]\(([^\s)]+)\)',lambda m:tok(f'<a href="{html.escape(m[2],quote=True)}" color="{TEAL}">{html.escape(m[1])}</a>'),s)
    s=re.sub(r'`([^`]+)`',lambda m:tok('<font name="Mono" size="9">'+html.escape(m[1])+'</font>'),s)
    s=html.escape(s)
    s=re.sub(r'\b([Rr]isk)(?=[0-5]\b)',r'\1 ',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s)
    s=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<i>\1</i>',s)
    for k,v in toks.items():s=s.replace(k,v)
    return s

def p(s,style='body'):return Paragraph(inline(s),S[style])
def roman(n):
    a='';
    for v,t in [(1000,'m'),(900,'cm'),(500,'d'),(400,'cd'),(100,'c'),(90,'xc'),(50,'l'),(40,'xl'),(10,'x'),(9,'ix'),(5,'v'),(4,'iv'),(1,'i')]:
        while n>=v:a+=t;n-=v
    return a

class Painter:
    """Top-down coordinates on a vector canvas; no raster dependencies."""
    def __init__(self,c,height):self.c=c;self.h=height
    def rect(self,x,y,w,h,fill='#FFFFFF',stroke=LINE,r=8):
        c=self.c;c.setFillColor(colors.HexColor(fill));c.setStrokeColor(colors.HexColor(stroke or fill));c.setLineWidth(.65)
        c.roundRect(x,self.h-y-h,w,h,r,fill=1,stroke=bool(stroke))
    def line(self,x1,y1,x2,y2,color=LINE,width=1,dash=None):
        c=self.c;c.saveState();c.setStrokeColor(colors.HexColor(color));c.setLineWidth(width)
        if dash:c.setDash(*dash)
        c.line(x1,self.h-y1,x2,self.h-y2);c.restoreState()
    def arrow(self,pts,color=TEAL,dash=None):
        for (x1,y1),(x2,y2) in zip(pts,pts[1:]):self.line(x1,y1,x2,y2,color,1.2,dash)
        (a,b),(x,y)=pts[-2:];angle=math.atan2(y-b,x-a);c=self.c
        q=c.beginPath();q.moveTo(x,self.h-y)
        for d in [2.6,-2.6]:q.lineTo(x+5*math.cos(angle+d),self.h-y-5*math.sin(angle+d))
        q.close();c.setFillColor(colors.HexColor(color));c.drawPath(q,fill=1,stroke=0)
    def text(self,x,y,s,size=10,font='Sans',color=INK,w=None,leading=None,align=0):
        pp=Paragraph(inline(str(s)),ParagraphStyle('d',fontName=font,fontSize=size,leading=leading or size*1.3,textColor=colors.HexColor(color),alignment=align))
        _,hh=pp.wrap(w or CW-x,1000)
        if hasattr(self.c,'_fig_trace'):self.c._fig_trace.append({'x':x,'y':y,'width':w or CW-x,'height':hh,'text':str(s)})
        pp.drawOn(self.c,x,self.h-y-hh);return hh
    def dot(self,x,y,n,color=TEAL,r=9):
        c=self.c;c.setFillColor(colors.HexColor(color));c.circle(x,self.h-y,r,stroke=0,fill=1)
        c.setFont('Sans-Bold',8);c.setFillColor(colors.white);c.drawCentredString(x,self.h-y-2.8,str(n))
    def polygon(self,pts,fill,stroke=None):
        c=self.c;q=c.beginPath();q.moveTo(pts[0][0],self.h-pts[0][1])
        for x,y in pts[1:]:q.lineTo(x,self.h-y)
        q.close();c.setFillColor(colors.HexColor(fill));c.setStrokeColor(colors.HexColor(stroke or fill));c.setLineWidth(.7);c.drawPath(q,fill=1,stroke=bool(stroke))
    def icon(self,x,y,role):
        c=self.c;co=ROLE.get(role,TEAL);c.saveState();c.setStrokeColor(colors.HexColor(co));c.setLineWidth(1.25)
        if role=='model':
            c.circle(x,self.h-y,6,stroke=1,fill=0);c.circle(x,self.h-y,2,stroke=1,fill=0)
            for a in [0,math.pi/2,math.pi,3*math.pi/2]:self.line(x+7*math.cos(a),y+7*math.sin(a),x+10*math.cos(a),y+10*math.sin(a),co)
        elif role=='policy':
            pts=[(x-6,y-7),(x+6,y-7),(x+6,y+2),(x,y+8),(x-6,y+2)];self.polygon(pts,TINT['policy'],co);self.line(x-3,y,x-1,y+3,co);self.line(x-1,y+3,x+4,y-3,co)
        elif role=='data':
            c.ellipse(x-7,self.h-y+2,x+7,self.h-y+8,stroke=1,fill=0);self.line(x-7,y-5,x-7,y+6,co);self.line(x+7,y-5,x+7,y+6,co);c.arc(x-7,self.h-y-9,x+7,self.h-y-3,180,180)
        elif role=='success':self.line(x-7,y,x-2,y+5,co,2);self.line(x-2,y+5,x+8,y-6,co,2)
        elif role=='action':
            self.polygon([(x-2,y-8),(x+5,y-8),(x,y-1),(x+6,y-1),(x-4,y+9),(x-1,y+2),(x-6,y+2)],TINT['action'],co)
        else:
            c.roundRect(x-7,self.h-y-7,14,14,3,stroke=1,fill=0);self.line(x-4,y,x+4,y,co)
        c.restoreState()

class Figure(Flowable):
    def __init__(self,d,number):
        super().__init__();self.d=d;self.number=number;self.kind=d['kind'];self.width=CW
        self.title=p(f'FIGURE {number}  /  '+d['title'],'h3')
        self.caption=p(d.get('caption',''),'small')
        self.insight=p(d.get('insight',''),'small')
        self.panel_h=self.measure_panel()
    def measure_panel(self):
        d=self.d;n=len(d.get('nodes',[]));k=self.kind
        return {'flow':n*62+35,'boundary':n*63+67,'layers':n*65+32,'anatomy':n*48+60,
          'timeline':n*62+30,'state':n*65+30,'cycle':344,'network':344,
          'comparison':max(len(d.get('left',{}).get('items',[])),len(d.get('right',{}).get('items',[])))*52+70,
          'sequence':len(d.get('messages',[]))*44+68,'budget':len(d.get('segments',[]))*32+116}[k]
    def wrap(self,aW,aH):
        self.tw,self.th=self.title.wrap(CW,1000);_,self.ch=self.caption.wrap(CW-24,1000);_,self.ih=self.insight.wrap(CW-24,1000)
        self.height=self.th+7+self.panel_h+12+self.ch+6+self.ih+8
        if self.height>FH-24:raise ValueError(f'Oversize figure {self.number}: {self.height:.1f} / {FH}')
        return CW,self.height
    def draw(self):
        c=self.canv;self.title.drawOn(c,0,self.height-self.th)
        c.saveState();c.translate(0,self.height-self.th-7-self.panel_h);q=Painter(c,self.panel_h)
        q.rect(0,0,CW,self.panel_h,'#F5F8F8',LINE,10);c._fig_trace=[];getattr(self,'draw_'+self.kind)(q)
        trace=c._fig_trace;del c._fig_trace
        if hasattr(c,'_doc_ref'):c._doc_ref.diagram_layouts.append({'figure':self.number,'kind':self.kind,'page':c.getPageNumber(),'panel_height':self.panel_h,'text':trace})
        c.restoreState()
        base=self.height-self.th-7-self.panel_h-12
        self.caption.drawOn(c,12,base-self.ch)
        c.setStrokeColor(colors.HexColor(TEAL));c.setLineWidth(2);c.line(0,base-self.ch-7,0,base-self.ch-7-self.ih)
        self.insight.drawOn(c,12,base-self.ch-6-self.ih)
    def card(self,q,x,y,w,h,node,num=None):
        role=node.get('role','runtime');co=ROLE[role]
        q.rect(x,y,w,h,TINT[role],None,7)
        if num is not None:q.dot(x+17,y+19,num,co)
        else:q.icon(x+18,y+20,role)
        lh=q.text(x+34,y+8,node['label'],10.4,'Sans-Bold',co,w-43,12.5)
        q.text(x+34,y+10+lh,node.get('detail',''),9,'Sans',INK,w-45,11.8)
    def draw_flow(self,q):
        ns=self.d['nodes'];x=39;w=CW-75
        for i,n in enumerate(ns):
            y=16+i*62;self.card(q,x,y,w,51,n,i+1)
            if i<len(ns)-1:q.arrow([(x+w/2,y+51),(x+w/2,y+62)],MUTED)
        if self.d.get('loop_label'):
            q.arrow([(x+w,16+(len(ns)-1)*62+25),(CW-17,16+(len(ns)-1)*62+25),(CW-17,7),(x+w/2,7),(x+w/2,16)],TEAL,[3,2])
            q.text(18,self.panel_h-19,self.d['loop_label'],8,'Sans',TEAL,CW-36,10)
    def draw_boundary(self,q):
        ns=self.d['nodes'];g=self.d.get('gate_after',1);x=26;w=CW-52
        for i,n in enumerate(ns):
            y=14+i*63+(35 if i>g else 0);self.card(q,x,y,w,51,n,i+1)
            if i<len(ns)-1:
                if i==g:
                    by=y+64;q.line(13,by,CW-13,by,ROLE['policy'],1.1,[4,3]);q.rect(32,by-11,CW-64,22,'#FFFFFF',None,3);q.text(40,by-7,self.d.get('boundary_label','Authority boundary'),8.3,'Sans-Bold',ROLE['policy'],CW-80,10,1)
                    q.arrow([(CW/2,by+14),(CW/2,by+34)],ROLE['policy'])
                else:q.arrow([(CW/2,y+51),(CW/2,y+62)],MUTED)
    def draw_layers(self,q):
        ns=self.d['nodes'];x=24;sw=108
        for i,n in enumerate(ns):
            y=18+i*65;role=n.get('role','runtime');co=ROLE[role]
            q.polygon([(x,y+16),(x+sw-22,y),(x+sw+12,y+13),(x+34,y+30)],TINT[role],co)
            q.polygon([(x,y+16),(x+34,y+30),(x+sw+12,y+13),(x+sw+12,y+22),(x+34,y+39),(x,y+25)],'#E3EBED',co)
            q.dot(x+55,y+18,i+1,co,8)
            q.line(x+sw+16,y+18,x+sw+34,y+18,co)
            lh=q.text(169,y,n['label'],10.5,'Sans-Bold',co,CW-187,13)
            q.text(169,y+lh+5,n.get('detail',''),9,'Sans',INK,CW-189,12)
            if i<len(ns)-1:q.line(78,y+42,78,y+62,MUTED,.75,[2,3])
    def draw_anatomy(self,q):
        ns=self.d['nodes'];x=20;y=17;left=145
        q.rect(x,y,left,self.panel_h-34,'#FFFFFF',LINE,7)
        q.rect(x,y,left,30,NAVY,None,7);q.text(x+10,y+8,self.d.get('object_label','RECORD'),9,'Sans-Bold','#FFFFFF',left-20,11)
        for i,n in enumerate(ns):
            yy=59+i*48;role=n.get('role','data');co=ROLE[role]
            q.rect(x+8,yy,left-16,35,TINT[role],None,4);q.text(x+15,yy+7,n['label'],9.2,'Sans-Bold',co,left-32,11)
            q.line(x+left,yy+17,190,yy+17,co);q.dot(193,yy+17,i+1,co,8)
            q.text(210,yy+3,n.get('detail',''),9.3,'Sans',INK,CW-228,12)
    def draw_comparison(self,q):
        pw=(CW-48)/2
        for col,key in enumerate(['left','right']):
            d=self.d[key];x=16+col*(pw+16);co=NAVY if col==0 else TEAL
            q.rect(x,16,pw,self.panel_h-32,'#FFFFFF',LINE,7)
            q.rect(x,16,pw,42,co,None,7);q.text(x+12,26,d['title'],10.5,'Sans-Bold','#FFFFFF',pw-24,13)
            for i,t in enumerate(d.get('items',[])):
                y=73+i*52;q.dot(x+16,y+7,i+1,co,7);q.text(x+31,y,t,9.2,'Sans',INK,pw-44,12.3)
                if i<len(d['items'])-1:q.line(x+13,y+39,x+pw-13,y+39,LINE,.5)
    def draw_sequence(self,q):
        d=self.d;actors=d['actors'];ax=[60+i*(CW-120)/(len(actors)-1) for i in range(len(actors))]
        for i,a in enumerate(actors):
            x=ax[i];q.line(x,49,x,self.panel_h-17,LINE,1,[3,3]);q.rect(max(7,x-43),14,86,29,NAVY,None,5);q.text(max(7,x-43)+4,21,a,8.5,'Sans-Bold','#FFFFFF',78,10,1)
        for i,m in enumerate(d['messages']):
            y=79+i*44;a,b=ax[m['from']],ax[m['to']];co=ROLE.get(m.get('role','runtime'),TEAL)
            if a==b:
                q.arrow([(a,y),(a+26,y),(a+26,y+15),(a,y+15)],co);tx=max(14,a-115);tw=105
            else:
                q.arrow([(a,y+18),(b,y+18)],co);tx=min(a,b)+5;tw=abs(b-a)-10
            q.rect(15,y-9,CW-30,24,'#F5F8F8',None,2);q.text(20,y-7,f'{i+1}. '+m['label'],8.6,'Sans',co,CW-40,10.5,1)
    def draw_budget(self,q):
        ss=self.d['segments'];total=sum(s['value'] for s in ss)
        if any(s['value']<=0 for s in ss):raise ValueError('Budget values must be positive')
        if self.d.get('total') is not None and abs(total-self.d['total'])>1e-6:raise ValueError('Budget total mismatch')
        q.text(20,17,f'{total:g} '+self.d.get('unit','units')+'  /  TOTAL',11,'Sans-Bold',NAVY,CW-40)
        x=20;bw=CW-40
        for i,s in enumerate(ss):
            w=bw*s['value']/total;co=ROLE.get(s.get('role','runtime'),TEAL);q.rect(x,48,w,35,co,None,0)
            if w>22:q.text(x,59,str(i+1),9,'Sans-Bold','#FFFFFF',w,11,1)
            x+=w
            if i<len(ss)-1:q.line(x,48,x,83,'#FFFFFF',1.2)
        for i,s in enumerate(ss):
            y=107+i*32;co=ROLE.get(s.get('role','runtime'),TEAL);q.dot(30,y+7,i+1,co,8)
            q.text(48,y,s['label'],9.5,'Sans',INK,CW-172,12)
            q.text(CW-122,y,f'{s["value"]:g}  /  {s["value"]/total:.1%}',9.5,'Sans-Bold',co,99,12,2)
    def draw_timeline(self,q):
        ns=self.d['nodes'];q.line(37,35,37,self.panel_h-36,NAVY,2)
        for i,n in enumerate(ns):
            y=16+i*62;role=n.get('role','runtime');co=ROLE[role]
            q.dot(37,y+22,f'{i+1:02}',co,11)
            q.rect(64,y,CW-83,51,'#FFFFFF',None,6)
            lh=q.text(78,y+6,n['label'],10.5,'Sans-Bold',co,CW-112,13)
            q.text(78,y+lh+9,n.get('detail',''),9,'Sans',INK,CW-112,12)
    def draw_state(self,q):
        ns=self.d['nodes'];branches=sorted(self.d.get('branches',[]),key=lambda b:b['from']);w=210 if branches else CW-60
        for i,n in enumerate(ns):
            y=15+i*65;self.card(q,20,y,w,53,n,i+1)
            if i<len(ns)-1:q.arrow([(20+w/2,y+53),(20+w/2,y+64)],MUTED)
        ys=[]
        for b in branches:ys.append(max(15+b['from']*65,ys[-1]+70 if ys else 15))
        for j in range(len(ys)-1,-1,-1):ys[j]=min(ys[j],self.panel_h-74 if j==len(ys)-1 else ys[j+1]-70)
        for j,(b,y) in enumerate(zip(branches,ys)):
            co=ROLE.get(b.get('role','policy'),ROLE['policy']);sy=15+b['from']*65+26;bx=258
            q.arrow([(20+w,sy),(239+j*4,sy),(239+j*4,y+23),(bx-4,y+23)],co)
            q.rect(bx,y,CW-bx-13,63,TINT.get(b.get('role','policy'),TINT['policy']),None,5)
            lh=q.text(bx+8,y+5,b['label'],9.1,'Sans-Bold',co,CW-bx-29,11)
            q.text(bx+8,y+lh+9,b.get('detail',''),8.4,'Sans',INK,CW-bx-29,10.5)
    def radial(self,q,cycle):
        ns=self.d['nodes'];n=len(ns);cx=CW/2;cy=170;radx=143;rady=105
        card_w=120 if cycle else 134;half=card_w/2
        pos=[]
        for i in range(n):
            a=(-2*math.pi/3 if n==6 else -math.pi/2)+i*2*math.pi/n;pos.append((cx+radx*math.cos(a),cy+rady*math.sin(a)))
        for i,(x,y) in enumerate(pos):
            if cycle:
                nx,ny=pos[(i+1)%n];dx=nx-x;dy=ny-y;t=min((half+3)/abs(dx) if dx else 999,45/abs(dy) if dy else 999);q.arrow([(x+dx*t,y+dy*t),(nx-dx*t,ny-dy*t)],MUTED)
            else:q.line(cx,cy,x,y,LINE,1.2)
        q.rect(cx-51,cy-24,102,48,NAVY,None,10);q.text(cx-44,cy-13,self.d.get('center','FEEDBACK' if cycle else 'SYSTEM'),9,'Sans-Bold','#FFFFFF',88,12,1)
        for i,((x,y),node) in enumerate(zip(pos,ns)):
            role=node.get('role','runtime');co=ROLE[role];q.rect(x-half,y-42,card_w,84,'#FFFFFF',LINE,7);q.dot(x-half+12,y-30,i+1,co,7)
            lh=q.text(x-half+25,y-37,node['label'],9.1,'Sans-Bold',co,card_w-35,11)
            q.text(x-half+11,y-33+lh,node.get('detail',''),8.4,'Sans',INK,card_w-20,10.6)
    def draw_cycle(self,q):self.radial(q,True)
    def draw_network(self,q):self.radial(q,False)

class Card(Flowable):
    def __init__(self,title,body,kind='note',footer=None):
        super().__init__();self.title=title;self.body=body;self.kind=kind;self.footer=footer
        self.parts=[p(title,'h3')]+[p(t,'body') for t in body]
    def wrap(self,w,h):
        self.heights=[f.wrap(CW-36,1000)[1] for f in self.parts];self.height=26+sum(self.heights)+8*(len(self.parts)-1);return CW,self.height
    def draw(self):
        q=Painter(self.canv,self.height);fill='#F4F0E8' if self.kind=='analogy' else '#EBF5F2';co='#86643C' if self.kind=='analogy' else TEAL
        q.rect(0,0,CW,self.height,fill,None,8);q.rect(0,0,4,self.height,co,None,0)
        y=12
        for f,h in zip(self.parts,self.heights):f.drawOn(self.canv,18,self.height-y-h);y+=h+8

class Code(Flowable):
    def __init__(self,txt,language,source):
        super().__init__();self.text=txt;self.lang=language;self.source=source
        longest=max((pdfmetrics.stringWidth(l,'Mono',8.0) for l in txt.splitlines()),default=0)
        if longest>CW-26:raise ValueError(f'Code too wide in {source}: {longest:.1f} > {CW-26:.1f}')
        self.p=Preformatted(txt,S['code'],dedent=0)
    def wrap(self,w,h):
        _,self.ph=self.p.wrap(CW-26,1000);self.height=self.ph+34;return CW,self.height
    def draw(self):
        q=Painter(self.canv,self.height);q.rect(0,0,CW,self.height,'#EFF3F5',None,6)
        q.text(13,7,(self.lang or 'CODE').upper(),7.5,'Sans-Bold',MUTED,CW-26,9)
        self.p.drawOn(self.canv,13,10)

def rendered_strings(f):
    if isinstance(f,Paragraph):return [f.getPlainText()]
    if isinstance(f,Code):return [f.text]
    if isinstance(f,Card):return [t for child in f.parts for t in rendered_strings(child)]
    if isinstance(f,Figure):return [f.title.getPlainText(),f.caption.getPlainText(),f.insight.getPlainText()]
    if isinstance(f,IndexColumns):return [pp.getPlainText() for _,_,pp,_,_ in f.placements]
    if isinstance(f,Table):return [t for row in f._cellvalues for cell in row for child in (cell if isinstance(cell,(tuple,list)) else [cell]) for t in rendered_strings(child)]
    return []

class Unit(Flowable):
    def __init__(self,parts,uid,kind='paragraph',heading=None,chapter=None):
        super().__init__();self.parts=parts;self.uid=uid;self.kind=kind;self.heading=heading;self.chapter=chapter
        self.spaceAfter=5
    def wrap(self,w,h):
        self.metrics=[];total=0
        for f in self.parts:
            before=f.getSpaceBefore();after=f.getSpaceAfter();_,hh=f.wrap(CW,10000);self.metrics.append((before,hh,after));total+=before+hh+after
        self.height=total
        if total>FH+.01:raise ValueError(f'Unit too tall {self.uid} ({self.kind}): {total:.1f} > {FH:.1f}')
        return CW,total
    def draw(self):
        y=self.height
        for f,(before,h,after) in zip(self.parts,self.metrics):y-=before+h;f.drawOn(self.canv,0,y);y-=after
        a,b,c,d,e,f=self.canv._currentMatrix
        self.canv._doc_ref.units.append({'id':self.uid,'kind':self.kind,'page':self.canv.getPageNumber(),'x':e,'bottom':f,'top':f+self.height,'height':self.height,'text':[t for child in self.parts for t in rendered_strings(child)]})

class BookDoc(BaseDocTemplate):
    def __init__(self,path,preview=False):
        super().__init__(str(path),pagesize=(W,H),leftMargin=M,rightMargin=M,topMargin=TOP,bottomMargin=BOTTOM,title='Agentic AI Engineering: From First Principles to Production - Revised Learning Edition',author='Muhammed Juned Alam',allowSplitting=1)
        self.addPageTemplates(PageTemplate('book',[Frame(M,BOTTOM,CW,FH,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.start_page,onPageEnd=self.end_page))
        self.preview=preview
    def beforeDocument(self):
        self.units=[];self.chapters=[];self.diagram_layouts=[];self.running='A REVISED LEARNING EDITION';self.body_start=None;self.front='';self.canv._doc_ref=self
    def start_page(self,c,doc):c._doc_ref=self
    def end_page(self,c,doc):
        c.bookmarkPage(f'pdfpage-{self.page}')
        if self.page==1:return
        c.saveState();c.setFillColor(colors.HexColor(TEAL));c.setFont('Sans-Bold',7.2);c.drawString(M,H-29,'AGENTIC AI ENGINEERING')
        c.setFillColor(colors.HexColor(MUTED));c.setFont('Sans',7.2)
        label=self.running.upper()
        if pdfmetrics.stringWidth(label,'Sans',7.2)>CW-170:
            while pdfmetrics.stringWidth(label+'…','Sans',7.2)>CW-170:label=label.rsplit(' ',1)[0]
            label+='…'
        c.drawRightString(W-M,H-29,label);c.setStrokeColor(colors.HexColor(LINE));c.setLineWidth(.6);c.line(M,H-39,W-M,H-39)
        c.line(M,38,W-M,38);c.setFillColor(colors.HexColor(MUTED));c.setFont('Sans',7.4);c.drawString(M,25,'FROM FIRST PRINCIPLES TO PRODUCTION')
        c.setFont('Sans-Bold',8.5);c.setFillColor(colors.HexColor(TEAL));c.drawRightString(W-M,25,str(self.page-self.body_start+1) if self.body_start else roman(self.page))
        c.restoreState()
    def afterFlowable(self,f):
        if isinstance(f,Unit) and f.heading:
            title,key,level=f.heading
            if (key=='part-I' or f.chapter==1) and self.body_start is None:self.body_start=self.page
            if f.chapter:self.running=f'CHAPTER {f.chapter:02} / '+title.split('. ',1)[-1]
            else:self.running=title
            self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,level=level,closed=level>0)
            self.notify('TOCEntry',(level,title,self.page-self.body_start+1 if self.body_start else -self.page,key))
            self.chapters.append({'title':title,'key':key,'pdf_page':self.page,'printed_page':self.page-self.body_start+1 if self.body_start else roman(self.page)})

class Cover(Flowable):
    def wrap(self,w,h):self.height=FH;return CW,FH
    def draw(self):
        c=self.canv;c.saveState();c.translate(-M,-BOTTOM);q=Painter(c,H)
        q.rect(0,0,W,H,NAVY,None,0)
        q.text(44,39,'A REVISED LEARNING EDITION  /  2026',9,'Sans-Bold','#83D6CA',W-88,12)
        q.text(43,86,'AGENTIC AI',43,'Sans-Bold','#FFFFFF',W-86,48)
        q.text(43,139,'ENGINEERING',36,'Sans-Bold','#FFFFFF',W-86,44)
        q.text(46,204,'From First Principles\nto Production'.replace('\n',' '),16,'Serif','#E1E9E9',W-110,23)
        # A stylized, exploded runtime assembly with a visible execution gate.
        for i,(role,label) in enumerate([('model','PROPOSE'),('runtime','CONTROL'),('policy','AUTHORIZE'),('action','ACT'),('success','VERIFY')]):
            y=303+i*49;x=87+i*13;co=['#51728A','#4D9B9A','#C98586','#D5A361','#77AE95'][i]
            q.polygon([(x,y+23),(x+239,y-11),(x+304,y+20),(x+65,y+55)],co,'#A3B8C4')
            q.polygon([(x+65,y+55),(x+304,y+20),(x+304,y+29),(x+65,y+64)],'#28465B','#537184')
            q.text(x+68,y+14,label,10,'Sans-Bold','#FFFFFF',170,12)
        q.line(64,613,W-45,613,'#466476',.7)
        q.text(46,636,'MUHAMMED JUNED ALAM',12,'Sans-Bold','#FFFFFF',W-92,16)
        q.text(46,660,'Clear explanations. Connected analogies. Visible boundaries.',9,'Sans','#A9C5CA',W-92,12)
        c.restoreState()

PARTS={1:('I','Foundations & Mental Models'),5:('II','Core Agent Runtime / Harness'),12:('III','Knowledge, Capabilities & Interoperability'),16:('IV','Orchestration & Multi-Agent Systems'),19:('V','Security, Identity & Governance'),23:('VI','Reliability, Testing & Quality'),26:('VII','AgentOps, Observability & Economics'),29:('VIII','Production Platform & Framework Mapping'),34:('IX','Specialized Agents & Design Review'),36:('X','Capstone Projects')}
CHECKS=[];EXERCISES=[];FIGURES=[];COUNTS={}

def split_row(s):
    parts=[];current='';in_code=False;escaped=False
    for char in s.strip().strip('|'):
        if escaped:current+=char;escaped=False;continue
        if char=='\\':escaped=True;continue
        if char=='`':in_code=not in_code
        if char=='|' and not in_code:parts.append(current.strip());current=''
        else:current+=char
    parts.append(current.strip());return parts


def parse(path,chapter=0):
    lines=Path(path).read_text().splitlines();units=[];i=0;seq=0;fig=0;check=0;ex=0;pending=[];headmeta=None;figure_prefix='P'
    def add(parts,kind='paragraph'):
        nonlocal seq,pending,headmeta
        seq+=1;u=Unit(pending+parts,f'{Path(path).stem}-{seq:03}',kind,headmeta,chapter if headmeta else None);u.appendix=figure_prefix;units.append(u);pending=[];headmeta=None
    while i<len(lines):
        s=lines[i].strip()
        if not s:i+=1;continue
        if s.startswith('# '):
            if units:units.append(PageBreak())
            title=s[2:]
            if not chapter and re.match(r'^[A-E]\.',title):figure_prefix=title[0];fig=0
            pending=[p(f'CHAPTER {chapter:02}' if chapter else (f'APPENDIX {title[0]}' if re.match(r'^[A-E]\.',title) else 'THE LEARNING EDITION'),'kicker'),p(title.split('. ',1)[-1] if chapter or re.match(r'^[A-E]\.',title) else title,'h1')]
            key=f'ch-{chapter}' if chapter else (f'appendix-{title[0].lower()}' if re.match(r'^[A-E]\.',title) else re.sub('[^a-z0-9]+','-',title.lower()))
            headmeta=(title,key,1 if chapter else 0);i+=1;continue
        if s.startswith('## '):pending.append(p(s[3:],'h2'));i+=1;continue
        if s.startswith('### '):pending.append(p(s[4:],'h3'));i+=1;continue
        if s.startswith(':::'):
            hdr=s[3:].strip();typ=hdr.split(' ',1)[0];title=hdr[len(typ):].strip();buf=[];i+=1
            while i<len(lines) and lines[i].strip()!=':::':buf.append(lines[i]);i+=1
            if i==len(lines):raise ValueError(f'Unclosed block {path} {typ}')
            i+=1;body='\n'.join(buf).strip()
            if typ=='diagram':
                d=json.loads(body);fig+=1;num=f'{chapter}.{fig}' if chapter else f'{figure_prefix}.{fig}';FIGURES.append({'number':num,'chapter':chapter,**d});add([Figure(d,num)],'diagram')
            elif typ in ['analogy','note']:add([Card(('ANALOGY / ' if typ=='analogy' else '')+title,[re.sub(r'\s*\n\s*',' ',v) for v in re.split(r'\n\s*\n',body)],typ)],typ)
            elif typ=='check':
                d=json.loads(body);check+=1;num=f'{chapter}.{check}';CHECKS.append({'number':num,'chapter':chapter,**d});add([p(f'SELF-CHECK {num}','kicker'),p(d['question']),p('[Answer in Appendix G](#appendix-g).','small')],'check')
            elif typ=='exercise':
                d=json.loads(body);ex+=1;num=f'{chapter}.{ex}';EXERCISES.append({'number':num,'chapter':chapter,**d})
                parts=[p(f'EXERCISE {num} / '+d['title'],'h3'),p(d['task'])]+[p('• '+z,'list') for z in d.get('done_when',[])]+[p('[Solution guidance in Appendix F](#appendix-f).','small')];add(parts,'exercise')
            else:raise ValueError(f'Unknown block {typ}')
            continue
        if s.startswith('```'):
            lang=s[3:];buf=[];i+=1
            while i<len(lines) and not lines[i].strip().startswith('```'):buf.append(lines[i]);i+=1
            i+=1;add([Code('\n'.join(buf),lang,f'{path.name}:{i}')],'code');continue
        if s.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):rows.append(lines[i].strip());i+=1
            data=[split_row(rows[0])]+[split_row(z) for z in rows[2:]];n=len(data[0])
            if any(len(row)!=n for row in data):raise ValueError(f'Invalid table columns in {path}:{i}')
            # Two-column compact tables can stay whole. Longer records become complete cards.
            if n<=3 and len(data)<=6 and sum(len(c) for r in data for c in r)<1400:
                ww=[CW/n]*n;cells=[[p(t,'th' if j==0 else 'cell') for t in r] for j,r in enumerate(data)];tb=Table(cells,colWidths=ww,hAlign='LEFT')
                tb.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor(NAVY)),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#F0F5F4'),colors.white]),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor(LINE))]));add([tb],'table')
            else:
                for row in data[1:]:add([Card(row[0],[f'**{label}:** {val}' for label,val in zip(data[0][1:],row[1:])])],'table-record')
            continue
        if re.match(r'^(?:[-*+] |\d+\. )',s):
            buf=[s];i+=1
            while i<len(lines) and lines[i].startswith('  ') and lines[i].strip():buf.append(lines[i].strip());i+=1
            t=' '.join(buf);t=re.sub(r'^[-*+] ','• ',t);add([p(t,'list')],'list');continue
        buf=[s];i+=1
        while i<len(lines) and lines[i].strip() and not re.match(r'^(?:#{1,3} |:::|```|\||[-*+] |\d+\. )',lines[i].strip()):buf.append(lines[i].strip());i+=1
        text=' '.join(buf)
        if re.fullmatch(r'\*\*[^*]+\*\*',text):pending.append(p(text[2:-2],'h3'))
        else:add([p(text,'small' if text.startswith('Edition check:') else 'body')])
    if pending:add([],'heading')
    if chapter and len(units)>1:
        last=units[-1];previous=units[-2]
        is_sources=isinstance(last,Unit) and any(isinstance(f,Paragraph) and f.getPlainText()=='Edition sources' for f in last.parts)
        if is_sources and isinstance(previous,Unit) and previous.kind=='exercise':
            if previous.wrap(CW,FH)[1]+last.wrap(CW,FH)[1]+5<=FH:
                previous.parts += [Spacer(1,5)]+last.parts;units.pop()
    if Path(path).name=='appendices.md':
        grouped=[]
        for u in units:
            if isinstance(u,Unit) and getattr(u,'appendix','')=='C':
                starts_question=any(isinstance(f,Paragraph) and f.style.name=='h2' for f in u.parts)
                if starts_question:u.kind='interview'
                if not starts_question and not u.heading and grouped and isinstance(grouped[-1],Unit) and grouped[-1].kind=='interview':
                    grouped[-1].parts+=u.parts;continue
            grouped.append(u)
        questions=[i for i,u in enumerate(grouped) if isinstance(u,Unit) and u.kind=='interview']
        if len(questions)>1 and questions[-1]==questions[-2]+1:
            a,b=questions[-2:];previous,last=grouped[a],grouped[b]
            if previous.wrap(CW,FH)[1]+last.wrap(CW,FH)[1]+5<=FH:
                previous.parts += [Spacer(1,5)]+last.parts;grouped.pop(b)
        units=grouped
    if Path(path).name=='front_matter.md' and len(units)>1:
        units[-2].parts+=units[-1].parts;units.pop()
    COUNTS[str(chapter)]={'words':len(Path(path).read_text().split()),'figures':fig,'checks':check,'exercises':ex,'units':seq}
    return units


def append_answers(kind,items,letter,title):
    out=[PageBreak()];last=None;first=True
    for d in items:
        if d['chapter']!=last:
            prefix=[p(f'APPENDIX {letter}','kicker'),p(title,'h1')] if first else []
            prefix+=[p('Chapter '+str(d['chapter']),'h2')];first=False;last=d['chapter']
        else:prefix=[]
        if kind=='exercise':parts=[p(f'{d["number"]}. '+d['title'],'h3'),p(d['solution'])]
        else:parts=[p(f'{d["number"]}. '+d['question'],'h3'),p(d['answer'])]
        meta=(f'{letter}. {title}',f'appendix-{letter.lower()}',0) if len(out)==1 else None
        out.append(Unit(prefix+parts,f'{kind}-answer-{d["number"]}','answer',meta))
    return out


class IndexColumns(Flowable):
    def __init__(self,placements,height):super().__init__();self.placements=placements;self.height=height
    def wrap(self,w,h):return CW,self.height
    def draw(self):
        for x,y,pp,hh,ww in self.placements:pp.drawOn(self.canv,x,self.height-y-hh)

def index_pages():
    data=json.loads((ROOT/'index_entries.json').read_text());cw=(CW-24)/2;blocks=[];letter=''
    for e in data:
        parts=[]
        if e['term'][0].upper()!=letter:letter=e['term'][0].upper();parts.append(p(letter,'h3'))
        refs=', '.join(f'[{r["page"]}](#pdfpage-{r["pdf_page"]})' for r in e['references'])
        parts.append(p('**'+e['term']+'**  '+refs,'index'));blocks.append(parts)
    first=[p('INDEX','kicker'),p('Find the concept','h1'),p('References lead to discussions in the revised text. When a concept uses plainer wording, begin with the referenced chapter. Page numbers are clickable.','small')]
    prefixheight=sum(f.getSpaceBefore()+f.wrap(CW,1000)[1]+f.getSpaceAfter() for f in first)
    pages=[];placement=[];column=0;y=0;capacity=FH-prefixheight;used=0
    def flush():
        nonlocal placement,column,y,capacity,first,used
        num=len(pages)+1;meta=('Index','index',0) if num==1 else None
        pages.append(Unit(first+[IndexColumns(placement,used)],f'index-{num}','index',meta))
        first=[];placement=[];column=0;y=0;capacity=FH;used=0
    for block in blocks:
        metrics=[(f,f.wrap(cw,1000)[1],f.getSpaceBefore(),f.getSpaceAfter()) for f in block];bh=sum(h+b+a for _,h,b,a in metrics)
        if y+bh>capacity:
            if column==0:column=1;y=0
            else:flush()
        for f,hh,b,a in metrics:
            y+=b;placement.append((column*(cw+24),y,f,hh,cw));y+=hh+a;used=max(used,y)
    if placement:flush()
    return [item for page in pages for item in [PageBreak(),page]]


def build(preview=False,without_index=False):
    CHECKS.clear();EXERCISES.clear();FIGURES.clear();COUNTS.clear()
    dest=OUT/('Agentic_AI_Engineering_layout_preview.pdf' if preview else 'Agentic_AI_Engineering_revised.pdf')
    story=[Cover(),PageBreak()]
    story.append(Unit([p('Agentic AI Engineering','h1'),p('From First Principles to Production','h2'),p('Muhammed Juned Alam'),Spacer(1,24),p('Revised learning edition · 13 October 2026','kicker'),p('Copyright © 2026 Muhammed Juned Alam. This edition revises the supplied manuscript for clarity, connected explanations, diagram design and page layout. The original author and book identity are preserved.'),p('The ShopAssist and AegisOps systems and the case studies are teaching scenarios. Code examples state their intended scope. Provider interfaces and framework contracts change; use the linked official documentation and the edition date when adapting them.'),p('Vector figures remain sharp when zoomed or printed. Each paragraph, analogy, diagram with its caption, code unit and question is typeset as an intact block. Additional white space at a page foot keeps those units together.'),p('Editable chapter manuscripts, diagram specifications, the build script and the complete mini-harness example accompany this PDF.','small')],'copyright','front'))
    story += [PageBreak(),Unit([p('CONTENTS','kicker'),p('Your route through the book','h1')],'toc-title','front')]
    toc=TableOfContents();toc.levelStyles=[ParagraphStyle('toc0',fontName='Sans-Bold',fontSize=10,leading=14.5,textColor=colors.HexColor(NAVY),spaceBefore=7,rightIndent=20),ParagraphStyle('toc1',fontName='Sans',fontSize=9,leading=13,textColor=colors.HexColor(MUTED),leftIndent=12,spaceBefore=4)];toc.dotsMinLevel=0;toc.formatter=lambda n: roman(-n) if n<0 else str(n);story.append(toc)
    story += [PageBreak()]+parse(ROOT/'front_matter.md')
    files=sorted((ROOT/'chapters').glob('*.md'))
    if not preview and len(files)!=39:raise ValueError(f'Full build requires39 chapters; have{len(files)}')
    for file in files:
        ch=int(file.stem);story.append(PageBreak())
        if ch in PARTS:
            num,title=PARTS[ch]
            intro=[p(f'PART {num}','kicker'),p(title,'h1'),Spacer(1,15),p('A new layer of responsibility','h3')]
            explanations={1:'Start with what a model can propose and what the application must control. These distinctions make every later design decision easier to explain.',5:'Turn the mental model into a runtime. Give context, tools, state, memory and reusable capabilities an explicit owner, then build a small working harness.',12:'Connect the runtime to knowledge and remote capabilities. Preserve evidence, identity and uncertainty as information crosses system boundaries.',16:'Choose how work moves. Fixed graphs, delegated tasks and human decisions need clear ownership and a visible route to completion.',19:'Make authority explicit. Protect identities, resources and data at each boundary, including the operations that appear to be read-only.',23:'Show that the system works when something goes wrong. Recovery, tests and evaluations turn design claims into evidence.',26:'Operate with visibility and limits. Trace what happened, respond to incidents and manage the real cost of successful work.',29:'Map the architecture to platforms and frameworks. Keep durable state, execution authority and provider-specific contracts visible beneath the APIs.',34:'Choose an architecture that fits the task. Specialized systems and design reviews expose where additional autonomy earns its complexity.',36:'Build and challenge complete systems. The AegisOps capstone connects earlier decisions to a phased implementation and deliberate failure testing.'}
            intro.append(p(explanations[ch]));intro.append(Spacer(1,18))
            next_part=min([n for n in PARTS if n>ch]+[40])
            for f2 in files:
                n2=int(f2.stem)
                if ch<=n2<next_part:
                    chapter_title=f2.read_text().splitlines()[0][2:]
                    intro.append(p(chapter_title,'h3'))
            story.append(Unit(intro,f'part-{num}','part',(f'Part {num}. {title}',f'part-{num}',0)))
            story.append(PageBreak())
        story+=parse(file,ch)
    if (ROOT/'appendices.md').exists():story += [PageBreak()]+parse(ROOT/'appendices.md',0)
    story+=append_answers('exercise',EXERCISES,'F','Exercise solution guidance')
    story+=append_answers('check',CHECKS,'G','Self-check answers')
    if (ROOT/'author_note.md').exists():story += [PageBreak()]+parse(ROOT/'author_note.md')
    if not preview and not without_index and (ROOT/'index_entries.json').exists():story += index_pages()
    doc=BookDoc(dest,preview);doc.multiBuild(story,maxPasses=5)
    (ROOT/('preview_layout.json' if preview else 'layout_manifest.json')).write_text(json.dumps({'page_size':[W,H],'frame':[M,BOTTOM,CW,FH],'pages':doc.page,'body_start':doc.body_start,'chapters':doc.chapters,'units':doc.units,'diagram_layouts':doc.diagram_layouts,'counts':COUNTS,'figures':FIGURES},indent=2))
    print(json.dumps({'pdf':str(dest),'pages':doc.page,'units':len(doc.units),'chapters':len(files),'figures':len(FIGURES)}))


def atlas():
    ds=[]
    for path in [ROOT/'front_matter.md']+sorted((ROOT/'chapters').glob('*.md')):
        for m in re.finditer(r':::diagram\s*\n(.*?)\n:::',path.read_text(),re.S):ds.append(json.loads(m[1]))
    seen={}
    for d in ds:
        if d['kind'] not in seen or len(json.dumps(d))>len(json.dumps(seen[d['kind']])):seen[d['kind']]=d
    dest=OUT/'Agentic_AI_Engineering_diagram_atlas.pdf';c=canvas.Canvas(str(dest),pagesize=(W,H))
    for i,(kind,d) in enumerate(seen.items()):
        q=Painter(c,H);q.text(M,30,'DIAGRAM DESIGN / '+kind.upper(),9,'Sans-Bold',TEAL,CW,12)
        f=Figure(d,f'S{i+1}');_,hh=f.wrap(CW,FH);f.canv=c;f.drawOn(c,M,H-75-hh);c.showPage()
    c.save();print(str(dest))

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--atlas',action='store_true');ap.add_argument('--without-index',action='store_true');args=ap.parse_args();atlas() if args.atlas else build(args.preview,args.without_index)
