"""Page-sized visual lessons. Semantic shapes and numeric scales are editable vectors."""
from pathlib import Path
import json, math, re, hashlib
from collections import Counter
from reportlab.platypus import Flowable, Paragraph
from reportlab.lib import colors

KINDS={'workspace','packet','snapshots','swimlane','matrix','ledger','evidence','fork','tree','bars','packing','faultmap','intervals'}
STATUS={'pass':('#247459','#EBF5EE','PASS'),'fail':('#A33B47','#FBEFF0','FAIL'),'wait':('#985A19','#FBF2E7','WAIT'),'allow':('#247459','#EBF5EE','ALLOW'),'deny':('#A33B47','#FBEFF0','DENY'),'review':('#985A19','#FBF2E7','REVIEW'),'unknown':('#705E86','#F3EFF8','UNKNOWN')}


def load_lessons(root,partial=False):
    bundles=[]
    for f in sorted((root/'visual_lessons').glob('*.json')):
        raw=f.read_bytes();bundle=json.loads(raw);bundle['_source_sha256']=hashlib.sha256(raw).hexdigest();bundles.append(bundle)
    errors=[]
    if not partial and [b['chapter'] for b in bundles]!=list(range(1,40)):errors.append('Need chapters 1-39')
    for b in bundles:
        ch=b['chapter'];ls=b['lessons'];raw=(root/'chapters'/f'{ch:02}.md').read_text();b['chapter_title']=raw.splitlines()[0][2:]
        research_file=root/'research_lessons'/f'{ch:02}.json'
        rr=research_file.read_bytes();r=json.loads(rr);b['_research_sha256']=hashlib.sha256(rr).hexdigest();b['research_source']=r['source'];ls.append(r['lesson'])
        if len(ls)!=3:errors.append(f'{ch}: needs three lessons')
        if len({l['kind'] for l in ls})<3:errors.append(f'{ch}: duplicate kinds')
        for j,l in enumerate(ls):
            prefix=l['id']
            def check(ok,msg):
                if not ok:errors.append(prefix+': '+msg)
            check(l['id']==f'{ch}{"ABC"[j]}','incorrect ID')
            check(l['kind'] in KINDS,'unknown kind')
            check(l['placement']==('after_analogy' if j==0 else 'before_heading'),'placement')
            if j:check('\n## '+l['anchor']+'\n' in raw,'heading missing')
            check(len(l['title'])<=58,'title length')
            for key,n in [('intro',40),('question',24),('answer',65),('takeaway',18),('assumption',24)]:check(len(l[key].split())<=n,key+' word limit')
            check(len(l['read'])==3 and all(len(x.split())<=18 for x in l['read']),'reading cues')
            d=l['data'];k=l['kind']
            if k=='ledger':
                balance=d['start'];check(balance>0 and len(d['entries'])==4,'ledger structure')
                for e in d['entries']:
                    balance+=e['delta'];check(-1e-8<=balance<=d['start']+1e-8,'ledger balance')
            if k=='packing':check(len(d['segments'])==4 and all(s['value']>0 for s in d['segments']) and abs(sum(s['value'] for s in d['segments'])-d['capacity'])<1e-6,'capacity mismatch')
            if k=='snapshots':check(len(d['frames'])==3 and all([f['key'] for f in fr['fields']]==[f['key'] for f in d['frames'][0]['fields']] for fr in d['frames']),'snapshot keys')
            if k=='evidence':check(sorted(e['claim'] for e in d['links'])==[0,1,2],'claim link coverage')
            if k=='intervals':
                for row in d['rows']:
                    n=row['n'];kk=row['k'];check(isinstance(n,int) and isinstance(kk,int) and n>0 and 0<=kk<=n,'invalid binomial counts')
                    pp=kk/n;z=1.96;den=1+z*z/n;cen=(pp+z*z/(2*n))/den;rad=z*math.sqrt(pp*(1-pp)/n+z*z/(4*n*n))/den
                    check(abs(pp-row['estimate'])<.0001 and abs(cen-rad-row['low'])<.0001 and abs(cen+rad-row['high'])<.0001,'Wilson calculation')
            if k=='faultmap':
                ids=[n['id'] for zone in d['zones'] for n in zone['nodes']]
                check(len(set(ids))==6 and len(d['edges'])==4,'faultmap structure')
                check(all(e['from'] in ids and e['to'] in ids for e in d['edges']),'unknown faultmap node')
    if errors:raise ValueError('\n'.join(errors))
    return bundles


def install(book):
    """Use the established book fonts, frame and measured drawing primitives."""
    global B, CW, FH, TEAL, NAVY, INK, MUTED, LINE, ROLE, TINT
    B=book;CW=book.CW;FH=book.FH;TEAL=book.TEAL;NAVY=book.NAVY;INK=book.INK;MUTED=book.MUTED;LINE=book.LINE;ROLE=book.ROLE;TINT=book.TINT

class OffsetPainter:
    def __init__(self,q,x=0,y=0):self.q=q;self.x=x;self.y=y;self.c=q.c
    def text(self,x,y,*a,**kw):return self.q.text(x+self.x,y+self.y,*a,**kw)
    def rect(self,x,y,*a,**kw):return self.q.rect(x+self.x,y+self.y,*a,**kw)
    def line(self,x,y,xx,yy,*a,**kw):return self.q.line(x+self.x,y+self.y,xx+self.x,yy+self.y,*a,**kw)
    def arrow(self,pts,*a,**kw):return self.q.arrow([(x+self.x,y+self.y) for x,y in pts],*a,**kw)
    def polygon(self,pts,*a,**kw):return self.q.polygon([(x+self.x,y+self.y) for x,y in pts],*a,**kw)
    def dot(self,x,y,*a,**kw):return self.q.dot(x+self.x,y+self.y,*a,**kw)
    def icon(self,x,y,*a,**kw):return self.q.icon(x+self.x,y+self.y,*a,**kw)

class VisualLesson(Flowable):
    def __init__(self,lesson,chapter_title,atlas=False):
        super().__init__();self.lesson=lesson;self.chapter_title=chapter_title;self.atlas=atlas;self.width=CW;self.height=FH-5;self.trace=[]
    def wrap(self,w,h):return self.width,self.height
    def draw(self):
        c=self.canv;q=B.Painter(c,self.height);l=self.lesson;c._fig_trace=[]
        
        if self.atlas and l['id'].endswith('A'):
            c.addOutlineEntry(self.chapter_title,'atlas-ch-'+l['id'],level=0,closed=True);c.bookmarkPage('atlas-ch-'+l['id'])
        if self.atlas and hasattr(c,'_doc_ref'):
            c._doc_ref.running=self.chapter_title
            if c._doc_ref.body_start is None:c._doc_ref.body_start=c.getPageNumber()
        c.bookmarkPage('visual-'+l['id']);c.addOutlineEntry('Visual '+l['id']+': '+l['title'],'visual-'+l['id'],level=1 if self.atlas else 2,closed=True)
        q.text(0,0,'VISUAL LAB '+l['id']+'  /  SEE · TRACE · PREDICT',8.5,'Sans-Bold',TEAL,CW,11)
        q.text(0,20,l['title'],19.5,'Display',NAVY,CW,22.8)
        q.text(0,69,l['intro'],9.5,'Serif',INK,CW,12.2)
        q.rect(0,112,CW,280,'#F3F5FC',LINE,3)
        getattr(self,'draw_'+l['kind'])(OffsetPainter(q,0,112),l['data'])
        for i,t in enumerate(l['read']):
            yy=403+i*21;q.dot(7,yy+5,i+1,TEAL,6.5);q.text(21,yy-1,t,8.7,'Sans',INK,CW-21,10.6)
        q.rect(0,470,CW,46,NAVY,None,7)
        q.text(12,477,'PREDICT',8,'Sans-Bold','#72E7F3',55,10)
        q.text(72,477,l['question'],9.3,'Sans','#FFFFFF',CW-84,11.7)
        q.text(0,524,l['takeaway'],9.5,'Sans-Bold',TEAL,CW,12)
        q.text(0,552,l['assumption'],8,'Sans',MUTED,CW,10.2)
        q.text(0,574,'[Check your prediction](#answer-'+l['id']+')',7.7,'Sans',TEAL,CW,10)
        if l.get('source_key'):q.text(0,591,'['+l['source_key']+' / '+l['source_label']+'](#ref-'+l['source_key']+')',7.7,'Sans',MUTED,CW,10)
        self.trace=[{**t,'text':B.p(t['text']).getPlainText()} for t in c._fig_trace];del c._fig_trace
        if hasattr(c,'_doc_ref'):
            doc=c._doc_ref
            doc.visual_layouts.append({'id':l['id'],'kind':l['kind'],'page':c.getPageNumber(),'panel_height':self.height,'text':self.trace})
    def status(self,q,x,y,w,s):
        co,tint,word=STATUS[s];q.rect(x,y,w,20,tint,None,3)
        # A distinct symbol plus a literal status survives monochrome printing.
        if s in ['pass','allow']:
            q.line(x+7,y+10,x+10,y+13,co,1.5);q.line(x+10,y+13,x+15,y+6,co,1.5)
        elif s in ['fail','deny']:
            q.line(x+7,y+6,x+14,y+13,co,1.5);q.line(x+14,y+6,x+7,y+13,co,1.5)
        elif s in ['wait','review']:
            q.line(x+8,y+6,x+8,y+14,co,2);q.line(x+13,y+6,x+13,y+14,co,2)
        else:q.text(x+6,y+3,'?',9,'Sans-Bold',co,12,12)
        q.text(x+21,y+5,word,7.5,'Sans-Bold',co,w-25,9)
    def bottom(self,q,text,y=242):
        q.line(14,y-7,CW-14,y-7,LINE,.7);q.text(14,y,text,9,'Sans-Bold',NAVY,CW-28,11.8)
    def draw_workspace(self,q,d):
        w=(CW-44)/3
        for i,z in enumerate(d['zones']):
            x=12+i*(w+10);role=z['role'];co=ROLE[role];obj=z['object']
            q.rect(x,26,w,172,'#FFFFFF',LINE,5)
            if obj=='folder':q.rect(x,14,w*.52,17,TINT[role],co,3)
            elif obj=='window':
                q.rect(x,14,w,19,co,None,4)
                for j in range(3):q.dot(x+10+j*11,23,'', '#FFFFFF',2)
            elif obj=='vault':
                q.rect(x+5,18,w-10,12,TINT[role],co,2);q.line(x+w-16,34,x+w-16,58,co,3)
            elif obj=='server':
                for j in range(3):q.line(x+6,18+j*5,x+w-6,18+j*5,co,1)
            elif obj=='queue':
                for j in range(3):q.rect(x+5+j*7,16-j*3,w-22,10,TINT[role],co,1)
            else:q.polygon([(x+w/2-15,15),(x+w/2+15,15),(x+w/2+12,30),(x+w/2,39),(x+w/2-12,30)],TINT[role],co)
            q.text(x+8,43,z['title'],10,'Sans-Bold',co,w-16,12.5)
            for j,t in enumerate(z['items']):
                yy=78+j*28;q.line(x+8,yy-4,x+w-8,yy-4,LINE,.6);q.text(x+8,yy,t,8.4,'Sans',INK,w-16,10.6)
        for i,t in enumerate(d['relations']):q.dot(19,220+i*28,i+1,TEAL,7);q.text(34,213+i*28,t,9,'Sans',INK,CW-49,12)
    def draw_packet(self,q,d):
        x=14;w=190;q.rect(x,17,w,204,'#FFFFFF',LINE,5)
        q.polygon([(x,17),(x+w/2,48),(x+w,17)],'#E4ECEE',LINE)
        q.text(x+10,54,d['name'],10,'Sans-Bold',NAVY,w-20,12)
        for i,f in enumerate(d['fields']):
            yy=87+i*31;q.text(x+10,yy,f['key'],8,'Sans',MUTED,72,10)
            q.text(x+85,yy,f['value'],8.5,'Sans-Bold',NAVY,w-95,10.5)
            q.line(x+10,yy+25,x+w-10,yy+25,LINE,.5)
        for i,ch in enumerate(d['checks']):
            yy=17+i*69;q.rect(218,yy,CW-232,62,'#FFFFFF',LINE,5)
            q.text(228,yy+7,ch['label'],9,'Sans-Bold',NAVY,CW-315,11)
            self.status(q,CW-76,yy+5,52,ch['status'])
            q.text(228,yy+29,ch['detail'],8.6,'Sans',INK,CW-252,11)
        co,tint,_=STATUS[d['result_status']];q.rect(14,234,CW-28,34,tint,None,5);q.text(25,242,d['result'],9.2,'Sans-Bold',co,CW-50,11.5)
    def draw_snapshots(self,q,d):
        w=(CW-52)/3
        for i,f in enumerate(d['frames']):
            x=12+i*(w+14);q.rect(x,14,w,210,'#FFFFFF',LINE,5)
            q.rect(x,14,w,30,NAVY,None,5);q.text(x+8,22,f['title'],9,'Sans-Bold','#FFFFFF',w-16,11)
            q.text(x+8,54,f['event'],8.2,'Sans',MUTED,w-16,10.5)
            for j,field in enumerate(f['fields']):
                yy=90+j*42;changed=field['changed'];q.rect(x+6,yy,w-12,37,'#E1F2EA' if changed else '#F2F4F4',None,3)
                if changed:q.rect(x+6,yy,3,37,TEAL,None,0)
                q.text(x+12,yy+4,field['key'],7.8,'Sans',MUTED,w-24,9)
                q.text(x+12,yy+18,field['value'],8.5,'Sans-Bold',TEAL if changed else INK,w-24,10.3)
            if i<2:q.arrow([(x+w+1,121),(x+w+12,121)],MUTED)
        self.bottom(q,d['invariant'],240)
        q.text(14,267,'Green edge = changed field; gray = retained field.',7,'Sans',MUTED,CW-28,9)
    def draw_swimlane(self,q,d):
        left=96;step=(CW-left-19)/5;xs=[left+(i+.5)*step for i in range(5)];ys=[68,125,182]
        for j,lane in enumerate(d['lanes']):
            y=44+j*57;q.rect(12,y,CW-24,53,'#FFFFFF' if j%2==0 else '#ECF2F2',None,3);q.text(20,y+17,lane.replace('/', ' / '),9,'Sans-Bold',NAVY,70,11.5)
        for i,s in enumerate(d['steps']):
            x=xs[i];y=ys[s['lane']];q.text(x-step/2,16,s['time'],8,'Sans-Bold',TEAL,step,10,1)
            q.line(x,35,x,213,LINE,.7,[2,3]);q.dot(x,y-9,i+1,TEAL,7)
            q.text(x-step/2+4,y+3,s['label'],8,'Sans',INK,step-8,10,1)
            if i<4:
                ny=ys[d['steps'][i+1]['lane']];mid=(x+xs[i+1])/2;q.arrow([(x+9,y-9),(mid,y-9),(mid,ny-9),(xs[i+1]-9,ny-9)],'#739A98')
        if 'wait_after' in d:
            x=(xs[d['wait_after']]+xs[d['wait_after']+1])/2;q.line(x,37,x,214,ROLE['action'],1.5,[3,2]);q.text(14,224,'WAIT: '+d['wait_label'],8.3,'Sans-Bold',ROLE['action'],CW-28,10)
        q.text(14,242,d['result'],8.7,'Sans-Bold',NAVY,CW-28,11)
        q.text(14,268,'Event positions show order, not elapsed duration.',7,'Sans',MUTED,CW-28,9)
    def draw_matrix(self,q,d):
        left=140;cw=(CW-left-14)/3
        for j,t in enumerate(d['columns']):q.text(left+j*cw+5,17,t,9,'Sans-Bold',NAVY,cw-10,11.5,1)
        for i,row in enumerate(d['rows']):
            yy=57+i*41;q.rect(12,yy,CW-24,37,'#FFFFFF',None,3);q.text(21,yy+8,row['label'],9,'Sans-Bold',INK,left-31,11)
            for j,s in enumerate(row['cells']):self.status(q,left+j*cw+4,yy+8,cw-8,s)
        self.bottom(q,d['rule'],239)
    def draw_ledger(self,q,d):
        q.text(14,15,'AVAILABLE AT START',8,'Sans-Bold',MUTED,230,10)
        q.text(14,31,f'{d["start"]:g} {d["unit"]}',19,'Sans-Bold',NAVY,CW-28,23)
        q.text(14,69,'EVENT / CHANGE',7.5,'Sans-Bold',MUTED,230,10);q.text(275,69,'BALANCE AFTER EVENT',7.5,'Sans-Bold',MUTED,152,10)
        balance=d['start']
        for i,e in enumerate(d['entries']):
            yy=88+i*35;balance+=e['delta'];q.text(14,yy,e['label'],8.5,'Sans',INK,184,10.5)
            q.text(202,yy,f'{e["delta"]:+g}',9,'Sans-Bold',ROLE['action'] if e['delta']<0 else TEAL,58,11,2)
            q.rect(278,yy+14,142,8,'#DDE7E7',None,0)
            if balance:q.rect(278,yy+14,142*balance/d['start'],8,TEAL,None,0)
            q.text(278,yy,f'{balance:g} {d["unit"]}',8.3,'Sans-Bold',TEAL,142,10,2)
        self.bottom(q,d['rule'],244)
    def draw_evidence(self,q,d):
        rels={'supports':('#247459','SUPPORTS'),'conflicts':('#A33B47','CONFLICTS'),'insufficient':('#985A19','INSUFFICIENT')}
        q.text(14,13,'CLAIMS',8,'Sans-Bold',MUTED,170,10);q.text(246,13,'PASSAGES',8,'Sans-Bold',MUTED,180,10)
        for i,(cl,src) in enumerate(zip(d['claims'],d['sources'])):
            yy=34+i*58;q.rect(14,yy,171,50,'#FFFFFF',LINE,3);q.text(22,yy+5,cl['id'],7.5,'Sans-Bold',TEAL,28,9);q.text(52,yy+5,cl['text'],8.3,'Sans',INK,126,10.2)
            q.rect(246,yy,181,50,'#FFFDF6',LINE,3);q.text(254,yy+5,src['id'],7.5,'Sans-Bold',ROLE['action'],25,9);q.text(282,yy+5,src['text'],8.1,'Sans',INK,137,10.1)
        for i,e in enumerate(d['links']):
            co,word=rels[e['relation']];y1=59+e['claim']*58;y2=59+e['source']*58;q.arrow([(186,y1),(244,y2)],co);q.dot(215,(y1+y2)/2,i+1,co,7)
            xx=14+i*141;q.dot(xx+7,224,i+1,co,6);q.text(xx+19,218,word,7.6,'Sans-Bold',co,119,10)
        self.bottom(q,d['verdict'],248)
    def draw_fork(self,q,d):
        q.rect(14,12,CW-28,37,NAVY,None,4);q.text(24,21,d['input'],9,'Sans-Bold','#FFFFFF',CW-48,11.5)
        pw=(CW-42)/2
        for i,key in enumerate(['left','right']):
            b=d[key];x=14+i*(pw+14);co,tint,_=STATUS[b['status']];q.arrow([(CW/2,50),(x+pw/2,64)],co);q.text(x+5,70,b['title'],10,'Sans-Bold',co,pw-10,12)
            for j,t in enumerate(b['steps']):
                yy=102+j*34;q.dot(x+8,yy+7,j+1,co,6);q.text(x+22,yy,t,8.6,'Sans',INK,pw-28,11)
                if j<2:q.line(x+8,yy+14,x+8,yy+31,co,.7)
            q.rect(x,212,pw,53,tint,None,5);q.text(x+9,220,b['result'],9,'Sans-Bold',co,pw-18,11.3)
    def draw_tree(self,q,d):
        q.rect(72,12,CW-144,34,NAVY,None,5);q.text(82,21,d['root'],9,'Sans-Bold','#FFFFFF',CW-164,11,1)
        bw=(CW-42)/2
        for i,b in enumerate(d['branches']):
            x=14+i*(bw+14);cx=x+bw/2;q.arrow([(CW/2,47),(cx,76)],TEAL);q.rect(cx-51,53,102,17,'#F5F8F8',None,0);q.text(cx-49,55,b['edge'],8,'Sans-Bold',TEAL,98,10,1)
            q.polygon([(x+14,80),(x+bw-14,80),(x+bw,107),(x+bw-14,134),(x+14,134),(x,107)],'#E9F4F1',TEAL);q.text(x+22,96,b['question'],8.7,'Sans-Bold',NAVY,bw-44,11,1)
            for j,key in enumerate(['yes','no']):
                leaf=b[key];lw=(bw-9)/2;xx=x+j*(lw+9);cc,tint,_=STATUS[leaf['role']];q.arrow([(cx,135),(xx+lw/2,177)],cc);q.text(xx,151,key.upper(),7.5,'Sans-Bold',cc,lw,10,1);q.rect(xx,180,lw,82,tint,None,5);q.text(xx+7,192,leaf['label'],8.6,'Sans-Bold',cc,lw-14,11,1)
    def draw_bars(self,q,d):
        mx=max(i['value'] for i in d['items']) or 1;start=171;ww=CW-start-24
        q.text(start,13,'0',8,'Sans',MUTED,50,10);q.text(start+ww-100,13,f'{mx:g} {d["unit"]}',8,'Sans',MUTED,100,10,2)
        for j in range(5):q.line(start+ww*j/4,31,start+ww*j/4,222,LINE,.6,[2,3])
        for i,item in enumerate(d['items']):
            yy=40+i*46;co=ROLE[item['role']];q.text(14,yy+3,item['label'],9,'Sans-Bold',INK,146,11.5)
            length=ww*item['value']/mx
            if length:q.rect(start,yy,length,17,co,None,0)
            q.text(start,yy+21,f'{item["value"]:g} {d["unit"]}',8.3,'Sans-Bold',co,ww,10)
        self.bottom(q,d['rule'],247)
    def draw_packing(self,q,d):
        q.text(14,13,f'CAPACITY  /  {d["capacity"]:g} {d["unit"]}',11,'Sans-Bold',NAVY,CW-28,14)
        x=14;ww=CW-28
        for i,s in enumerate(d['segments']):
            sw=ww*s['value']/d['capacity'];q.rect(x,42,sw,35,ROLE[s['role']],None,0)
            if sw>15:q.text(x,54,str(i+1),8,'Sans-Bold','#FFFFFF',sw,10,1)
            x+=sw
            if i<3:q.line(x,42,x,77,'#FFFFFF',1)
        for i,s in enumerate(d['segments']):
            yy=92+i*25;co=ROLE[s['role']];q.dot(22,yy+5,i+1,co,6);q.text(36,yy-1,s['label'],9,'Sans',INK,250,11);q.text(291,yy-1,f'{s["value"]:g} {d["unit"]}',9,'Sans-Bold',co,134,11,2)
        q.text(14,203,'LEFT OUT OF THIS CALL',7.8,'Sans-Bold',ROLE['policy'],CW-28,10)
        for i,e in enumerate(d['excluded']):
            x=14+i*(CW/2-7);w=CW/2-21;q.rect(x,221,w,47,'#FFFFFF',LINE,3);q.text(x+8,227,e['label'],8.4,'Sans-Bold',ROLE['policy'],w-16,10);q.text(x+8,241,e['reason'],8,'Sans',INK,w-16,10)
    def draw_faultmap(self,q,d):
        # Three ownership strips. Edges are keyed to a separate route log to keep labels legible.
        pos={};w=(CW-48)/3
        for i,z in enumerate(d['zones']):
            x=12+i*(w+12);q.rect(x,13,w,143,['#F3EFF8','#EAF6F3','#FBF2E7'][i],LINE,6);q.text(x+7,23,z['title'],9,'Sans-Bold',NAVY,w-14,11)
            for j,n in enumerate(z['nodes']):
                yy=56+j*52;co=ROLE[n['role']];q.rect(x+10,yy,w-20,36,'#FFFFFF',co,4);q.text(x+16,yy+7,n['label'],8.5,'Sans-Bold',co,w-32,10.5);pos[n['id']]=(x+10,yy,w-20,36)
        for i,e in enumerate(d['edges']):
            a=pos[e['from']];b=pos[e['to']];co=STATUS[e['status']][0];right=b[0]>a[0];x1=a[0]+(a[2] if right else 0);x2=b[0]+(0 if right else b[2]);y1=a[1]+a[3]/2;y2=b[1]+b[3]/2
            if abs(a[0]-b[0])<1:
                x1=a[0]+a[2]/2;x2=b[0]+b[2]/2;y1=a[1]+(a[3] if b[1]>a[1] else 0);y2=b[1]+(0 if b[1]>a[1] else b[3])
            nonadjacent=abs(a[0]-b[0])>1.5*(w+12)
            if nonadjacent:
                direction=1 if right else -1;endx=x2 if e['status']=='allow' else x2-direction*8
                route=[(x1,y1),(x1+direction*6,y1),(x1+direction*6,100),(x2-direction*8,100),(x2-direction*8,y2),(endx,y2)]
                marker=((x1+x2)/2,100)
            elif abs(a[0]-b[0])>1:
                offset=-5 if i%2==0 else 5;y1+=offset;y2+=offset;mid=(x1+x2)/2+offset
                direction=1 if right else -1;endx=x2 if e['status']=='allow' else x2-direction*7
                route=[(x1,y1),(mid,y1),(mid,y2),(endx,y2)];marker=(mid,(y1+y2)/2)
            else:
                route=[(x1,y1),(x2,y2)];marker=((x1+x2)/2,(y1+y2)/2)
                if e['status']=='deny':route[-1]=(x1+(x2-x1)*.72,y1+(y2-y1)*.72)
            if e['status']=='allow':q.arrow(route,co)
            else:
                for aa,bb in zip(route,route[1:]):q.line(*aa,*bb,co,1.3,[3,2])
                xx,yy=route[-1];q.polygon([(xx-3,yy-3),(xx+3,yy-3),(xx+3,yy+3),(xx-3,yy+3)],co)
            q.dot(*marker,i+1,co,5.8)
            yy=171+i*24;q.dot(20,yy+5,i+1,co,6);q.text(34,yy-1,e['label'],8.5,'Sans',INK,CW-130,10.5);q.text(CW-88,yy,e['status'].upper(),7.5,'Sans-Bold',co,72,10,2)
    def draw_intervals(self,q,d):
        x0=159;ww=CW-x0-23
        for j in range(5):
            x=x0+ww*j/4;q.line(x,39,x,219,LINE,.7);q.text(x-18,18,f'{j*25}%',8,'Sans',MUTED,36,10,1)
        if 'threshold' in d:
            x=x0+ww*d['threshold'];q.line(x,36,x,219,ROLE['policy'],1.4,[3,3])
        for i,r in enumerate(d['rows']):
            yy=57+i*44;q.text(14,yy-7,r['label'],8.6,'Sans-Bold',NAVY,133,10.5);q.text(14,yy+7,f'Count: {r["k"]} / {r["n"]}',7.8,'Sans',MUTED,133,10)
            lo=x0+r['low']*ww;hi=x0+r['high']*ww;est=x0+r['estimate']*ww;q.line(lo,yy,hi,yy,TEAL,2.3);q.line(lo,yy-5,lo,yy+5,TEAL,1.2);q.line(hi,yy-5,hi,yy+5,TEAL,1.2);q.dot(est,yy,'',TEAL,3.5)
            q.text(14,yy+20,f'{r["estimate"]:.1%}  [{r["low"]:.1%}, {r["high"]:.1%}]',7.4,'Sans',TEAL,133,9.5)
        if 'threshold' in d:q.text(14,232,f'Dashed gate: {d["threshold"]:.0%}',8,'Sans-Bold',ROLE['policy'],CW-28,10)
        q.text(14,249,d['method'],8.3,'Sans',INK,CW-28,11)
