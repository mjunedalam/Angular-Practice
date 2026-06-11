from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from textwrap import wrap


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "AI_ML_Agentic_AI_Enterprise_Learning_Roadmap.pdf"


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


@dataclass
class Page:
    width: int = 612
    height: int = 792
    commands: list[str] = field(default_factory=list)


class Pdf:
    def __init__(self) -> None:
        self.pages: list[Page] = []
        self.page = Page()
        self.pages.append(self.page)

    def add_page(self) -> None:
        self.page = Page()
        self.pages.append(self.page)

    def cmd(self, command: str) -> None:
        self.page.commands.append(command)

    def rect(self, x: float, y: float, w: float, h: float, stroke=(0, 0, 0), fill=None, lw=1) -> None:
        self.cmd(f"{lw} w")
        if fill:
            self.cmd(f"{fill[0]:.3f} {fill[1]:.3f} {fill[2]:.3f} rg")
        self.cmd(f"{stroke[0]:.3f} {stroke[1]:.3f} {stroke[2]:.3f} RG")
        self.cmd(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {'B' if fill else 'S'}")

    def line(self, x1: float, y1: float, x2: float, y2: float, color=(0, 0, 0), lw=1) -> None:
        self.cmd(f"{lw} w")
        self.cmd(f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} RG")
        self.cmd(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def text(self, x: float, y: float, text: str, size=10, font="F1", color=(0, 0, 0)) -> None:
        self.cmd(f"BT /{font} {size} Tf {color[0]:.3f} {color[1]:.3f} {color[2]:.3f} rg {x:.2f} {y:.2f} Td ({esc(text)}) Tj ET")

    def write(self, path: Path) -> None:
        objects: list[bytes] = []

        def add_obj(body: str | bytes) -> int:
            objects.append(body.encode("latin-1") if isinstance(body, str) else body)
            return len(objects)

        font_regular = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font_bold = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        font_mono = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

        page_ids: list[int] = []
        content_ids: list[int] = []
        for page in self.pages:
            stream = "\n".join(page.commands).encode("latin-1", "replace")
            content_ids.append(add_obj(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream"))
            page_ids.append(0)

        pages_id = len(objects) + len(self.pages) + 1
        for idx, page in enumerate(self.pages):
            body = (
                f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {page.width} {page.height}] "
                f"/Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R /F3 {font_mono} 0 R >> >> "
                f"/Contents {content_ids[idx]} 0 R >>"
            )
            page_ids[idx] = add_obj(body)

        kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
        pages_obj_id = add_obj(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog_id = add_obj(f"<< /Type /Catalog /Pages {pages_obj_id} 0 R >>")

        data = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        xref: list[int] = [0]
        for idx, body in enumerate(objects, start=1):
            xref.append(len(data))
            data.extend(f"{idx} 0 obj\n".encode())
            data.extend(body)
            data.extend(b"\nendobj\n")
        xref_start = len(data)
        data.extend(f"xref\n0 {len(objects) + 1}\n".encode())
        data.extend(b"0000000000 65535 f \n")
        for offset in xref[1:]:
            data.extend(f"{offset:010d} 00000 n \n".encode())
        data.extend(
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode()
        )
        path.write_bytes(data)


class Layout:
    def __init__(self, pdf: Pdf) -> None:
        self.pdf = pdf
        self.x = 48
        self.y = 742
        self.bottom = 54
        self.width = 516

    def new_page(self, title: str | None = None) -> None:
        self.pdf.add_page()
        self.y = 742
        if title:
            self.heading(title)

    def ensure(self, h: float) -> None:
        if self.y - h < self.bottom:
            self.new_page()

    def heading(self, text: str) -> None:
        self.ensure(42)
        self.pdf.text(self.x, self.y, text, 18, "F2", (0.05, 0.16, 0.34))
        self.pdf.line(self.x, self.y - 8, self.x + self.width, self.y - 8, (0.18, 0.45, 0.76), 1.5)
        self.y -= 34

    def subheading(self, text: str) -> None:
        self.ensure(28)
        self.pdf.text(self.x, self.y, text, 12, "F2", (0.10, 0.28, 0.46))
        self.y -= 18

    def para(self, text: str, size=9.5, leading=13, indent=0, width_chars=96) -> None:
        lines = wrap(text, width_chars)
        self.ensure(len(lines) * leading + 8)
        for line in lines:
            self.pdf.text(self.x + indent, self.y, line, size, "F1", (0.12, 0.12, 0.12))
            self.y -= leading
        self.y -= 4

    def bullet(self, text: str) -> None:
        lines = wrap(text, 88)
        self.ensure(len(lines) * 12 + 4)
        self.pdf.text(self.x + 4, self.y, "-", 9.5, "F2", (0.18, 0.45, 0.76))
        for i, line in enumerate(lines):
            self.pdf.text(self.x + 18, self.y - (i * 12), line, 9.2, "F1", (0.12, 0.12, 0.12))
        self.y -= len(lines) * 12 + 3

    def card(self, title: str, lines: list[str], color=(0.93, 0.97, 1.0)) -> None:
        wrapped: list[str] = []
        for line in lines:
            wrapped.extend(wrap(line, 88))
        h = 32 + 11 * len(wrapped)
        self.ensure(h + 8)
        y0 = self.y - h + 8
        self.pdf.rect(self.x, y0, self.width, h, stroke=(0.70, 0.80, 0.90), fill=color, lw=0.8)
        self.pdf.text(self.x + 12, self.y - 10, title, 11, "F2", (0.04, 0.22, 0.38))
        yy = self.y - 25
        for line in wrapped:
            self.pdf.text(self.x + 14, yy, line, 8.6, "F1", (0.14, 0.14, 0.14))
            yy -= 11
        self.y = y0 - 10

    def checklist(self, items: list[str]) -> None:
        for item in items:
            lines = wrap(item, 86)
            self.ensure(15 + 11 * (len(lines) - 1))
            self.pdf.rect(self.x + 2, self.y - 7, 7, 7, stroke=(0.2, 0.2, 0.2), fill=None, lw=0.7)
            for i, line in enumerate(lines):
                self.pdf.text(self.x + 18, self.y - (i * 11), line, 8.8, "F1", (0.12, 0.12, 0.12))
            self.y -= 15 + 11 * (len(lines) - 1)


PHASES = [
    ("1", "Weeks 1-4", "Python + tooling", "Syntax, functions, files, OOP basics, venv, Git, notebooks, clean code."),
    ("2", "Weeks 5-8", "Math for ML", "Linear algebra, calculus intuition, probability, statistics, optimization."),
    ("3", "Weeks 9-12", "Data stack", "NumPy, pandas, visualization, SQL, EDA, feature quality."),
    ("4", "Weeks 13-20", "Classical ML", "Supervised/unsupervised ML, sklearn pipelines, validation, metrics."),
    ("5", "Weeks 21-30", "Deep learning", "PyTorch tensors, autograd, training loops, CNNs, sequence models, tuning."),
    ("6", "Weeks 31-38", "LLMs + RAG", "Transformers, embeddings, vector search, prompt engineering, evals, safety."),
    ("7", "Weeks 39-46", "Agentic AI", "Tool use, memory, orchestration, LangChain/LangGraph/OpenAI Agents, MCP basics."),
    ("8", "Weeks 47-52", "Enterprise AI", "MLOps/LLMOps, MLflow, FastAPI, Docker, CI/CD, monitoring, governance, capstone."),
]

MODULES = [
    ("Module 1: Python Engineering Foundations", "2 weeks", [
        "Learn: Python syntax, functions, modules, exceptions, typing, file I/O, virtual environments, Git, pytest basics.",
        "Project: CLI data-cleaning utility that reads messy CSV/JSON, validates schema, logs errors, and writes clean output.",
        "Exit: write small packages, use type hints, run tests, and explain code structure."
    ]),
    ("Module 2: Math For AI/ML", "3 weeks", [
        "Learn: vectors/matrices, dot products, derivatives, gradients, probability distributions, Bayes rule, loss functions.",
        "Project: implement linear regression and logistic regression from scratch using only Python/NumPy.",
        "Exit: understand why gradient descent, regularization, and metrics work."
    ]),
    ("Module 3: NumPy, pandas, Visualization, SQL", "3 weeks", [
        "Learn: arrays, DataFrames, joins, groupby, time series, missing data, plotting, basic SQL joins/windows.",
        "Project: end-to-end exploratory data analysis report with data quality checks and business recommendations.",
        "Exit: turn raw tabular data into reliable features and clear insights."
    ]),
    ("Module 4: Statistics + Experimentation", "2 weeks", [
        "Learn: sampling, confidence intervals, hypothesis tests, A/B tests, leakage, bias, correlation vs causation.",
        "Project: design and analyze an A/B experiment with simulated product metrics.",
        "Exit: avoid common statistical traps in model and product decisions."
    ]),
    ("Module 5: Classical Machine Learning With scikit-learn", "5 weeks", [
        "Learn: regression, classification, clustering, preprocessing, pipelines, cross-validation, grid/random search.",
        "Project: customer churn or credit-risk model with sklearn Pipeline, model card, and reproducible notebook.",
        "Exit: choose metrics, compare baselines, prevent leakage, and serialize a model."
    ]),
    ("Module 6: Feature Engineering + Model Interpretation", "3 weeks", [
        "Learn: categorical encoding, scaling, imbalance, text features, SHAP/permutation importance, fairness checks.",
        "Project: interpretable fraud or anomaly model with feature importance dashboard.",
        "Exit: explain model behavior to technical and non-technical stakeholders."
    ]),
    ("Module 7: PyTorch Deep Learning Foundations", "5 weeks", [
        "Learn: tensors, autograd, datasets/dataloaders, training loops, optimizers, schedulers, GPU basics.",
        "Project: image classifier or tabular neural net with custom training loop, checkpointing, and metrics.",
        "Exit: debug loss curves, overfitting, underfitting, device issues, and batch pipelines."
    ]),
    ("Module 8: Computer Vision + NLP Deep Learning", "5 weeks", [
        "Learn: CNNs, transfer learning, tokenization, embeddings, sequence models, attention intuition.",
        "Project: document/image classifier plus text sentiment/topic classifier using pretrained backbones.",
        "Exit: use transfer learning pragmatically instead of training large models from scratch."
    ]),
    ("Module 9: Transformers + LLM Foundations", "4 weeks", [
        "Learn: transformer architecture, tokenization, embeddings, inference, generation controls, prompt design.",
        "Project: LLM-powered document summarizer with structured outputs and regression test prompts.",
        "Exit: know when to use prompting, RAG, fine-tuning, or classical ML."
    ]),
    ("Module 10: Retrieval-Augmented Generation", "4 weeks", [
        "Learn: chunking, embeddings, vector DBs, hybrid retrieval, reranking, citations, hallucination controls.",
        "Project: private knowledge-base Q&A bot with source citations, eval dataset, and failure analysis.",
        "Exit: build RAG systems that can be measured and improved."
    ]),
    ("Module 11: Fine-tuning + Evaluation", "3 weeks", [
        "Learn: supervised fine-tuning concepts, LoRA/PEFT, preference data, eval design, red teaming, safety checks.",
        "Project: fine-tune or adapter-train a small open model for a domain task and compare against prompting/RAG.",
        "Exit: justify customization with evidence, cost, latency, and risk tradeoffs."
    ]),
    ("Module 12: Agentic AI", "4 weeks", [
        "Learn: tools/function calling, planning, memory, multi-step workflows, human-in-the-loop, guardrails.",
        "Project: research assistant agent that searches, reads files, calls tools, writes a report, and logs traces.",
        "Exit: design agents as controlled workflows, not magic loops."
    ]),
    ("Module 13: MLOps + LLMOps", "4 weeks", [
        "Learn: experiment tracking, model registry, data/version control, MLflow, CI/CD, Docker, FastAPI, monitoring.",
        "Project: deploy a model API with tracking, tests, containerization, rollback plan, and drift dashboard.",
        "Exit: move from notebook to repeatable, observable production system."
    ]),
    ("Module 14: Enterprise AI Architecture", "4 weeks", [
        "Learn: security, IAM, secrets, data privacy, audit logs, governance, cost controls, SLAs, incident response.",
        "Project: architecture decision record and risk register for an enterprise AI application.",
        "Exit: discuss AI systems like an engineer accountable for production outcomes."
    ]),
]

CAPSTONE = [
    "Problem: Enterprise AI Decision Assistant for a business domain such as operations, finance, maintenance, HR, or energy.",
    "Data: structured tables, PDFs/docs, logs, and optional image/text data.",
    "ML: pandas feature pipelines, sklearn baseline, PyTorch deep model where justified.",
    "LLM/RAG: document ingestion, embeddings, vector search, citation-backed answers, structured JSON outputs.",
    "Agent: tool-calling workflow that can retrieve docs, query SQL, run model inference, summarize evidence, and ask for human approval.",
    "MLOps/LLMOps: MLflow tracking, eval suite, prompt/model versioning, Dockerized FastAPI service, CI tests, monitoring plan.",
    "Enterprise controls: authentication assumptions, secrets handling, PII policy, rate limits, fallback behavior, audit logs, model card, runbook.",
]

SOURCES = [
    ("Python Tutorial", "https://docs.python.org/3/tutorial/"),
    ("pandas Getting Started", "https://pandas.pydata.org/docs/getting_started/index.html"),
    ("scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html"),
    ("PyTorch Tutorials", "https://docs.pytorch.org/tutorials/"),
    ("Hugging Face Transformers", "https://huggingface.co/docs/transformers/index"),
    ("LangChain / LangGraph docs", "https://docs.langchain.com/oss/python/langchain/overview"),
    ("OpenAI Agents / Evals / Retrieval / Safety docs", "https://platform.openai.com/docs/"),
    ("MLflow documentation", "https://mlflow.org/docs/latest/index.html"),
]


def cover(pdf: Pdf, layout: Layout) -> None:
    pdf.rect(0, 0, 612, 792, stroke=(0.05, 0.16, 0.34), fill=(0.05, 0.16, 0.34), lw=0)
    pdf.rect(48, 560, 516, 128, stroke=(0.35, 0.65, 0.92), fill=(0.08, 0.23, 0.44), lw=1)
    pdf.text(70, 650, "AI, ML, Deep Learning", 26, "F2", (1, 1, 1))
    pdf.text(70, 616, "Agentic AI & Enterprise Roadmap", 24, "F2", (1, 1, 1))
    pdf.text(70, 585, "Beginner -> Advanced -> Enterprise", 13, "F1", (0.76, 0.90, 1))
    pdf.text(70, 522, "12-month practical timeline with projects in every module", 12, "F2", (1, 1, 1))
    pdf.text(70, 500, "Includes Python, Math, pandas, scikit-learn, PyTorch, LLMs, RAG, agents, MLOps and governance", 9.5, "F1", (0.86, 0.93, 1))
    y = 430
    for label, value in [
        ("Pace", "10-12 hours/week; compress to 6 months at 20+ hours/week"),
        ("Outcome", "Portfolio strong enough for applied ML/AI engineer conversations"),
        ("Style", "Every module ships a working project, not just notes"),
        ("Final build", "One enterprise-grade AI system combining all major technologies"),
    ]:
        pdf.rect(70, y - 8, 472, 34, stroke=(0.30, 0.54, 0.78), fill=(0.09, 0.28, 0.52), lw=0.8)
        pdf.text(84, y + 9, label, 10, "F2", (0.76, 0.90, 1))
        pdf.text(160, y + 9, value, 9.5, "F1", (1, 1, 1))
        y -= 48
    pdf.text(70, 96, "Generated locally by Codex | Updated with current official ecosystem references", 8.5, "F1", (0.72, 0.84, 0.94))
    layout.new_page("Roadmap Overview")


def draw_timeline(pdf: Pdf, layout: Layout) -> None:
    layout.para("Use this as a practical path from fundamentals to production. The sequence is intentional: Python and math first, then data and classical ML, then deep learning, LLM systems, agents, and finally enterprise operations.")
    start_x = layout.x
    bar_w = layout.width
    row_h = 42
    colors = [(0.22, 0.55, 0.82), (0.18, 0.67, 0.55), (0.95, 0.63, 0.25), (0.78, 0.39, 0.52)]
    layout.ensure(row_h * len(PHASES) + 20)
    for i, (num, weeks, title, desc) in enumerate(PHASES):
        y = layout.y - row_h
        c = colors[i % len(colors)]
        pdf.rect(start_x, y + 8, 48, 28, stroke=c, fill=c, lw=0)
        pdf.text(start_x + 17, y + 18, num, 12, "F2", (1, 1, 1))
        pdf.rect(start_x + 58, y + 8, bar_w - 58, 28, stroke=(0.78, 0.84, 0.90), fill=(0.96, 0.98, 1), lw=0.7)
        pdf.text(start_x + 70, y + 22, weeks, 8.8, "F2", (0.12, 0.22, 0.34))
        pdf.text(start_x + 150, y + 22, title, 9.4, "F2", (0.05, 0.16, 0.34))
        pdf.text(start_x + 150, y + 11, desc[:94], 7.8, "F1", (0.18, 0.18, 0.18))
        layout.y -= row_h
    layout.y -= 12


def module_pages(layout: Layout) -> None:
    layout.heading("Module Timeline With Projects")
    for index, (title, duration, lines) in enumerate(MODULES, start=1):
        if index in {6, 10, 13}:
            layout.new_page("Module Timeline With Projects")
        layout.card(f"{index}. {title} ({duration})", lines)


def checklists(layout: Layout) -> None:
    layout.new_page("Skill Checklists")
    layout.subheading("Core Technical Checklist")
    layout.checklist([
        "Python package structure, type hints, logging, testing, environment management.",
        "Math intuition for gradients, probability, statistics, matrix operations, optimization.",
        "pandas/SQL data preparation, joins, time series, missing values, text cleaning, plotting.",
        "scikit-learn pipelines, cross-validation, model selection, metrics, model persistence.",
        "PyTorch training loops, datasets, dataloaders, GPU/device handling, checkpointing.",
        "Transformers, embeddings, RAG, prompt design, structured output, citations, hallucination controls.",
        "Agent tool calling, state, memory, workflow orchestration, human approval, observability.",
        "MLOps/LLMOps: MLflow, CI/CD, model registry, deployment, monitoring, cost controls.",
    ])
    layout.subheading("Topics Often Missed But Needed For Enterprise")
    layout.checklist([
        "SQL and data modeling: AI engineers spend more time on data correctness than model code.",
        "Software engineering: APIs, tests, Docker, Git workflows, code review, clean architecture.",
        "Security: secrets management, least privilege, audit logging, prompt-injection defenses.",
        "Evaluation: offline eval sets, golden examples, regression tests, human review, red teaming.",
        "Observability: traces, latency, token/cost tracking, drift, quality dashboards, incident playbooks.",
        "Governance: model cards, data lineage, approval gates, privacy review, compliance sign-off.",
        "Product thinking: user workflows, success metrics, failure modes, escalation paths.",
    ])


def capstone(layout: Layout) -> None:
    layout.new_page("Final Enterprise Capstone")
    layout.para("Build one integrated system that demonstrates real-world AI engineering rather than isolated notebooks.")
    layout.card("Capstone: Enterprise AI Decision Assistant", CAPSTONE, color=(0.95, 0.98, 0.94))
    layout.subheading("Suggested Architecture")
    architecture = [
        "Frontend or notebook demo -> FastAPI backend -> Auth/session layer -> Agent orchestrator.",
        "Agent tools -> SQL query tool, document retriever, ML inference endpoint, calculator, report writer.",
        "Data layer -> PostgreSQL or SQLite, object storage folder, vector database, feature pipeline.",
        "Model layer -> sklearn baseline, optional PyTorch model, LLM API/open model, embedding model.",
        "Ops layer -> MLflow tracking, eval suite, Docker, CI tests, logs/traces, cost dashboard.",
    ]
    for item in architecture:
        layout.bullet(item)
    layout.subheading("Final Demo Requirements")
    layout.checklist([
        "A user asks a business question and gets an answer with citations, model outputs, and clear confidence/risk notes.",
        "The system calls at least three tools: retrieval, SQL/data, and ML inference or calculator.",
        "Every answer is logged with prompt/model version, latency, token/cost estimate, and evaluation outcome.",
        "There is a fallback path when retrieval is weak or the model is uncertain.",
        "A short README explains setup, architecture, risks, and how to operate the system.",
    ])


def weekly_operating_model(layout: Layout) -> None:
    layout.new_page("Weekly Operating Model")
    layout.card("Recommended Weekly Rhythm", [
        "2 hours theory: math, algorithms, system design, or papers/docs.",
        "3 hours implementation: code the concept from scratch or with core libraries.",
        "3 hours project work: make a portfolio artifact that runs end-to-end.",
        "1 hour testing/evaluation: add metrics, tests, error analysis, or eval examples.",
        "1 hour writing: README, model card, architecture notes, lessons learned.",
    ], color=(1, 0.98, 0.92))
    layout.subheading("Portfolio Milestones")
    for item in [
        "Month 1: Python CLI package with tests.",
        "Month 2: math-from-scratch ML notebook.",
        "Month 3: polished EDA/data quality report.",
        "Month 5: sklearn production-style pipeline.",
        "Month 7: PyTorch deep learning project.",
        "Month 9: RAG app with citations and evals.",
        "Month 10: tool-using agent with traces.",
        "Month 12: enterprise capstone with deployment and governance artifacts.",
    ]:
        layout.bullet(item)
    layout.subheading("Reference Sources Used")
    for name, url in SOURCES:
        layout.bullet(f"{name}: {url}")


def build() -> None:
    pdf = Pdf()
    layout = Layout(pdf)
    cover(pdf, layout)
    draw_timeline(pdf, layout)
    module_pages(layout)
    checklists(layout)
    capstone(layout)
    weekly_operating_model(layout)
    pdf.write(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
