"""Futuristic editorial identity: covers, chapter architecture and learning maps."""
from reportlab.platypus import Flowable, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
import math

def install(book):
    global B
    B=book

class ChapterHeader(Flowable):
    def __init__(self,chapter,title):
        super().__init__();self.chapter=chapter;self.title=title
        self.title_p=Paragraph(B.inline(title),ParagraphStyle('chapter-title',fontName='Display',fontSize=25,leading=29,textColor=colors.HexColor(B.NAVY)))
        self.spaceAfter=20
    def wrap(self,w,h):
        _,self.th=self.title_p.wrap(B.CW-74,1000);self.height=max(70,self.th+22)+18;return B.CW,self.height
    def draw(self):
        q=B.Painter(self.canv,self.height)
        q.text(0,0,f'{self.chapter:02}',41,'Display','#673DC0',66,47)
        q.text(74,0,'AGENTIC AI ENGINEERING / CHAPTER',7.4,'Sans-Bold',B.TEAL,B.CW-74,10)
        self.title_p.drawOn(self.canv,74,self.height-20-self.th)
        q.line(0,self.height-2,B.CW,self.height-2,B.LINE,1)
        q.line(0,self.height-2,55,self.height-2,'#673DC0',3)
    def rendered_strings(self):return [f'{self.chapter:02}','AGENTIC AI ENGINEERING / CHAPTER',self.title]

class Cover(Flowable):
    def __init__(self,back=False):super().__init__();self.back=back
    def wrap(self,w,h):self.height=B.FH;return B.CW,B.FH
    def draw(self):
        c=self.canv;doc=c._doc_ref;doc.cover_pages.add(c.getPageNumber())
        c.saveState();c.translate(-B.M,-B.BOTTOM);q=B.Painter(c,B.H)
        q.rect(0,0,B.W,B.H,'#F4F9FE',None,0)
        asset=B.ROOT/'assets'/('back-art.png' if self.back else 'front-cover.png')
        if not asset.exists():raise FileNotFoundError('Cover asset missing: '+str(asset))
        c.drawImage(str(asset),0,0,width=B.W,height=B.H,mask='auto')
        c._fig_trace=[]
        if self.back:
            q.text(43,33,'AGENTIC AI ENGINEERING',9,'Display','#153F9E',454,13)
            q.text(42,77,'Make every decision, action\nand outcome visible.',26,'Display','#102B70',455,31)
            q.text(44,160,'An AI agent combines models, knowledge, state, permissions and tools. The engineering challenge is making those pieces work together reliably.',11.8,'Sans','#253D6C',449,16)
            q.text(44,214,'Follow the journey through simple explanations, connected analogies and visual lessons: turn retrieved knowledge into evidence, plans into controlled actions, and failures into recoverable work.',11.5,'Sans','#435779',449,16)
            items=[('UNDERSTAND','Models, context, memory and retrieval.'),('BUILD','Tools, workflows, agents and integration.'),('VERIFY','Security, reliability, evaluation and operations.')]
            for i,(title,detail) in enumerate(items):
                yy=282+i*31;q.line(44,yy,496,yy,'#C6D6EB',.65)
                q.text(44,yy+11,title,9.6,'Display','#174CB2',112,13)
                q.text(167,yy+11,detail,10.5,'Sans','#354C75',328,14)
            q.text(44,382,'39 CHAPTERS / 117 VISUAL LABS / ONE COMPLETE BOOK',9,'Sans-Bold','#174CB2',452,12)
        trace=[{**t,'text':B.p(t['text']).getPlainText()} for t in c._fig_trace];del c._fig_trace
        doc.cover_layouts.append({'kind':'back' if self.back else 'front','page':c.getPageNumber(),'width':B.W,'height':B.H,'text':trace});c.restoreState()

NODES={
1:('Model runtime','Separate generation from execution.'),2:('Agent anatomy','Give every responsibility an owner.'),3:('Control patterns','Choose how the next step is selected.'),4:('Instructions','Keep policy and task context distinct.'),
5:('The harness','Make the loop a controlled application.'),6:('Tools and actions','Validate intent before causing an effect.'),7:('State and checkpoints','Record enough to resume safely.'),8:('Context engineering','Give each step the evidence it needs.'),9:('Memory','Control what persists and why.'),10:('Reusable skills','Package a capability with a contract.'),11:('A working harness','Join the pieces in executable code.'),
12:('Retrieval foundations','Find evidence before composing an answer.'),13:('Agentic retrieval','Plan a search and decide when to stop.'),14:('MCP','Connect tools through explicit boundaries.'),15:('Remote agents','Track a remote task without losing control.'),
16:('Workflow graphs','Represent dependencies and completion.'),17:('Multiple agents','Delegate work without duplicating authority.'),18:('Human decisions','Bind approval to the action being reviewed.'),
19:('Security fundamentals','Treat untrusted content as data.'),20:('Identity and access','Check who can act on which resource.'),21:('Sandboxing','Contain execution and its escape routes.'),22:('Governance and privacy','Make policy observable and enforceable.'),
23:('Reliability','Recover without repeating a business effect.'),24:('Testing','Probe invariants and failure windows.'),25:('Evaluation','Measure the result with suitable evidence.'),
26:('Observability','Connect decisions to traces and outcomes.'),27:('AgentOps','Detect problems and control rollout.'),28:('Cost and latency','Spend budgets on successful work.'),
29:('Production platform','Assign durable responsibilities to services.'),30:('Model gateway','Handle provider contracts and constraints.'),31:('Framework mapping','Locate the runtime beneath each API.'),32:('Durable graphs','Make resumable work respect external effects.'),33:('Enterprise integration','Preserve event identity across systems.'),
34:('Specialized systems','Match the architecture to the task.'),35:('Senior design review','Challenge each boundary and assumption.'),
36:('AegisOps blueprint','Define a bounded incident-response system.'),37:('Phased implementation','Build and verify one responsibility at a time.'),38:('Hardening and game days','Test recovery under deliberate failure.'),39:('Further capstones','Transfer the principles to new settings.')}
OUTCOMES={1:'Explain what the model proposes and what your software must control.',5:'Build a small runtime with explicit state, tools and context.',12:'Connect evidence and capabilities while preserving trust boundaries.',16:'Coordinate tasks, agents and people with visible ownership.',19:'Define who may act, where execution occurs and what data may leave.',23:'Turn reliability and quality claims into testable evidence.',26:'Observe the system and operate within service and cost limits.',29:'Map the same engineering contracts onto different platforms.',34:'Choose a suitable architecture and defend it in a design review.',36:'Assemble a complete system, then challenge its assumptions.'}

class PartMap(Flowable):
    def __init__(self,start,end,num,title):
        super().__init__();self.start=start;self.end=end;self.num=num;self.title=title;self.height=B.FH-5;self.trace=[]
    def wrap(self,w,h):return B.CW,self.height
    def draw(self):
        c=self.canv;q=B.Painter(c,self.height);c._fig_trace=[]
        q.rect(0,0,B.CW,153,B.NAVY,None,3)
        # A non-data orbital motif echoes the cover without decorating the map paths.
        c.saveState();clip=c.beginPath();clip.rect(0,self.height-153,B.CW,153);c.clipPath(clip,stroke=0,fill=0);c.setStrokeColor(colors.HexColor('#36416A'));c.setLineWidth(.6)
        for r in [41,58,75]:c.circle(B.CW-25,self.height-36,r,stroke=1,fill=0)
        c.restoreState()
        q.text(20,18,'PART '+self.num+' / LEARNING MAP',8.5,'Sans-Bold','#72E7F3',B.CW-40,11)
        q.text(19,46,self.title,23,'Display','#FFFFFF',B.CW-38,27)
        q.text(0,170,'A READING ROUTE, NOT AN EXECUTION SEQUENCE',7.8,'Sans-Bold',B.TEAL,B.CW,10)
        n=self.end-self.start;step=min(63,307/max(1,n));starty=200
        q.line(18,starty+15,18,starty+(n-1)*step+15,'#B1B8D9',1.2)
        for i,ch in enumerate(range(self.start,self.end)):
            yy=starty+i*step;title,detail=NODES[ch];co='#673DC0' if i%2==0 else B.TEAL
            q.rect(1,yy,34,30,co,None,3);q.text(1,yy+8,f'{ch:02}',10,'Display','#FFFFFF',34,13,1)
            q.text(49,yy-1,title,11.3,'Display',B.NAVY,B.CW-61,14)
            q.text(49,yy+17,detail,9.5,'Sans',B.MUTED,B.CW-61,12)
        q.rect(0,532,B.CW,70,'#EAF6FA',None,3)
        q.text(13,543,'WHAT YOU CAN EXPLAIN OR BUILD',8,'Sans-Bold',B.TEAL,B.CW-26,11)
        q.text(13,562,OUTCOMES[self.start],11,'Sans',B.NAVY,B.CW-26,14)
        self.trace=[{**t,'text':B.p(t['text']).getPlainText()} for t in c._fig_trace];del c._fig_trace
        c._doc_ref.part_layouts.append({'id':'part-'+self.num,'figure':'part-'+self.num,'kind':'learning-map','page':c.getPageNumber(),'panel_height':self.height,'text':self.trace})
    def rendered_strings(self):return [t['text'] for t in self.trace]
