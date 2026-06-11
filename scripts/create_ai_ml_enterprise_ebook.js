const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sourceHtml = "/Users/junedalam/Downloads/ai_ml_roadmap_v2.html";
const outHtml = path.join(root, "AI_ML_Agentic_AI_Enterprise_eBook.html");

const source = fs.readFileSync(sourceHtml, "utf8");
const match = source.match(/const data = ([\s\S]*?);\s*\n\s*let opened/);

if (!match) {
  throw new Error("Could not extract roadmap data from source HTML.");
}

const sandbox = {};
vm.runInNewContext(`data = ${match[1]}`, sandbox);
const tracks = sandbox.data;

const additions = [
  {
    track: "Missing Enterprise Foundations Added",
    topics: [
      {
        level: "beginner",
        icon: "🧮",
        title: "NumPy, SciPy & Scientific Computing",
        sub: "Array thinking, vectorization, numerical stability",
        duration: "2-3 weeks",
        topics: [
          "Broadcasting, vectorization, memory layout",
          "Numerical precision and floating point traps",
          "SciPy optimization, sparse matrices, signal/stat modules",
          "Reusable notebook-to-package workflow"
        ],
        libs: ["NumPy", "SciPy", "Jupyter", "pytest"],
        capstone: {
          title: "Scientific Computing Lab",
          desc: "Implement vectorized distance search, sparse matrix operations, and an optimization routine; benchmark loop vs vectorized implementations and publish a performance note."
        }
      },
      {
        level: "intermediate",
        icon: "🗄️",
        title: "SQL & Data Engineering for AI",
        sub: "Reliable data pipelines before model pipelines",
        duration: "4-6 weeks",
        topics: [
          "SQL joins, windows, CTEs, indexing basics",
          "Batch pipelines, orchestration, data contracts",
          "Feature stores and offline/online consistency",
          "Data validation, lineage, and schema evolution"
        ],
        libs: ["PostgreSQL", "DuckDB", "Airflow", "dbt", "Great Expectations", "Feast"],
        capstone: {
          title: "Production Feature Pipeline",
          desc: "Build a SQL + Python feature pipeline with validation gates, reproducible snapshots, and a feature table consumed by both sklearn training and FastAPI inference."
        }
      },
      {
        level: "advanced",
        icon: "🧪",
        title: "AI Evaluation & Testing",
        sub: "Regression tests for models, prompts, RAG and agents",
        duration: "3-4 weeks",
        topics: [
          "Golden datasets and offline evals",
          "Prompt regression tests and adversarial cases",
          "RAG faithfulness, answer relevance, retrieval recall",
          "Agent trajectory evaluation and tool-call correctness"
        ],
        libs: ["OpenAI Evals", "DeepEval", "RAGAS", "pytest", "LangSmith", "MLflow"],
        capstone: {
          title: "AI Quality Gate",
          desc: "Create an automated eval suite that blocks deployment when model quality, hallucination rate, latency, or cost exceeds defined thresholds."
        }
      },
      {
        level: "enterprise",
        icon: "🔭",
        title: "Observability & Reliability",
        sub: "Operate AI systems with traces, alerts and runbooks",
        duration: "3-4 weeks",
        topics: [
          "Structured logs, traces, metrics and audit events",
          "Latency, cost, token usage and error budgets",
          "Data drift, model drift and feedback loops",
          "Incident response and rollback playbooks"
        ],
        libs: ["OpenTelemetry", "Prometheus", "Grafana", "Sentry", "Langfuse", "Helicone"],
        capstone: {
          title: "AI Observability Dashboard",
          desc: "Instrument an LLM/RAG API with traces, token/cost tracking, quality scores, error alerts, and a runbook for degraded retrieval or model outages."
        }
      },
      {
        level: "enterprise",
        icon: "🔌",
        title: "MCP, Tools & Integration Protocols",
        sub: "Connect agents safely to enterprise tools",
        duration: "2-3 weeks",
        topics: [
          "Tool schemas, authentication, authorization",
          "Model Context Protocol server concepts",
          "Connector safety, least privilege, approval gates",
          "Tool result validation and sandboxing"
        ],
        libs: ["MCP", "FastAPI", "Pydantic", "OAuth2", "OpenAPI"],
        capstone: {
          title: "Secure Tool Server",
          desc: "Build a small MCP-style tool server that exposes read-only database/document tools with auth, input validation, logging, and human approval for sensitive actions."
        }
      },
      {
        level: "advanced",
        icon: "🎙️",
        title: "Multimodal AI",
        sub: "Vision, documents, audio and speech with LLMs",
        duration: "4-6 weeks",
        topics: [
          "Vision-language models and document understanding",
          "OCR, layout extraction and multimodal retrieval",
          "Speech-to-text, text-to-speech and voice agents",
          "Evaluation for image, document and audio outputs"
        ],
        libs: ["OpenAI Vision/Audio", "Whisper", "Tesseract", "LayoutLM", "CLIP", "Pydub"],
        capstone: {
          title: "Multimodal Document Analyst",
          desc: "Ingest PDFs with charts/images, extract text and layout, answer questions with citations, and optionally generate an audio briefing."
        }
      },
      {
        level: "enterprise",
        icon: "🛡️",
        title: "Security, Privacy & Compliance",
        sub: "Production controls for sensitive AI workloads",
        duration: "Ongoing",
        topics: [
          "PII detection, masking and retention policies",
          "Prompt injection and data exfiltration defenses",
          "Secrets management and workload identity",
          "Auditability, access control and compliance review"
        ],
        libs: ["Presidio", "Vault", "OPA", "Guardrails AI", "Garak", "OWASP LLM Top 10"],
        capstone: {
          title: "Secure RAG Review",
          desc: "Threat-model a RAG system, add PII redaction, prompt-injection tests, allowlisted tools, audit logs, and a compliance-ready risk report."
        }
      },
      {
        level: "enterprise",
        icon: "☸️",
        title: "Kubernetes & Platform Engineering",
        sub: "Scale APIs, workers and model services",
        duration: "4-6 weeks",
        topics: [
          "Containers, images, registries and runtime limits",
          "Kubernetes deployments, services, jobs and autoscaling",
          "GPU scheduling, queue workers and async inference",
          "Blue/green and canary deployments"
        ],
        libs: ["Docker", "Kubernetes", "Helm", "KServe", "Ray Serve", "Argo Workflows"],
        capstone: {
          title: "Scalable AI Service",
          desc: "Deploy a RAG or model inference API with separate worker queues, autoscaling, health checks, canary rollout, and dashboarded SLOs."
        }
      },
      {
        level: "enterprise",
        icon: "📦",
        title: "AI Product & Portfolio",
        sub: "Turn technical projects into business outcomes",
        duration: "Ongoing",
        topics: [
          "Problem framing and success metrics",
          "Cost, latency, quality and risk tradeoffs",
          "User feedback loops and human workflow design",
          "Portfolio storytelling, READMEs, model cards and demos"
        ],
        libs: ["ADR", "Model Cards", "PRDs", "User Journey Maps"],
        capstone: {
          title: "Enterprise AI Case Study",
          desc: "Write a polished case study for your final platform: business problem, architecture, metrics, risks, tradeoffs, screenshots, and roadmap."
        }
      }
    ]
  }
];

const allTracks = [...tracks, ...additions];
const levelColor = {
  beginner: "#1D9E75",
  intermediate: "#7F77DD",
  advanced: "#D85A30",
  enterprise: "#BA7517",
  capstone: "#378ADD"
};

const levelBg = {
  beginner: "#E1F5EE",
  intermediate: "#EEEDFE",
  advanced: "#FAECE7",
  enterprise: "#FAEEDA",
  capstone: "#E6F1FB"
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const topicCount = allTracks.reduce((sum, track) => sum + track.topics.length, 0);
const totalWeeks = "12-18 months";

const genericDatasets = {
  beginner: ["Kaggle beginner datasets", "UCI Machine Learning Repository", "public CSV exports"],
  intermediate: ["Kaggle competitions", "OpenML datasets", "Hugging Face Datasets"],
  advanced: ["domain-specific corpora", "research paper datasets", "synthetic evaluation sets"],
  enterprise: ["internal-style mock data", "privacy-safe sampled data", "production logs and telemetry samples"]
};

const genericEnterpriseNote = {
  beginner: "Start using professional habits early: README, reproducible environment, testable scripts, and clear folder structure.",
  intermediate: "Move from notebooks to repeatable pipelines with validation, metrics, and versioned artifacts.",
  advanced: "Add evaluation, error analysis, failure-mode documentation, and explicit tradeoff decisions.",
  enterprise: "Design for auditability, security, reliability, cost control, monitoring, and operational ownership."
};

const detailOverrides = {
  "Python for AI": {
    outcomes: ["Write clean Python modules instead of only notebooks", "Use virtual environments and package dependencies safely", "Read/write data files and handle errors predictably"],
    labs: ["Refactor a notebook into a CLI script", "Add logging and exception handling to a data loader", "Write pytest tests for 5 utility functions"],
    datasets: ["Kaggle sales data", "CSV/JSON files from data.gov", "synthetic messy customer data"],
    rubric: ["CLI runs from a fresh environment", "Code has functions, tests, and README", "Outputs are reproducible from raw input"]
  },
  "Math for AI": {
    outcomes: ["Explain dot product, gradients, probability and loss functions intuitively", "Implement gradient descent from scratch", "Connect math notation to working NumPy code"],
    labs: ["Visualize vector projections", "Derive and code MSE gradient", "Simulate Bayes rule with synthetic data"],
    datasets: ["synthetic regression data", "Iris numeric features", "Boston/California housing style data"],
    rubric: ["Loss decreases correctly", "Manual implementation matches sklearn within tolerance", "Math derivation is included in project notes"]
  },
  "Data Science & Pandas": {
    outcomes: ["Clean messy tables and detect data quality issues", "Use groupby, merge, pivot and time series operations", "Create features without leakage"],
    labs: ["Profile missingness and outliers", "Join 3 related tables", "Create train/test split after leakage review"],
    datasets: ["Airbnb listings", "Titanic", "NYC taxi samples"],
    rubric: ["Data quality report exists", "Feature logic is documented", "Charts answer real business questions"]
  },
  "ML Fundamentals": {
    outcomes: ["Train baseline models and compare them fairly", "Choose metrics based on business risk", "Use train/validation/test splits correctly"],
    labs: ["Build regression and classification baselines", "Compare confusion matrix vs ROC-AUC vs F1", "Save and reload model with joblib"],
    datasets: ["Telco churn", "credit risk", "Titanic"],
    rubric: ["Baseline and tuned model compared", "Leakage checklist completed", "Model has a simple demo UI or API"]
  },
  "Advanced ML & Tuning": {
    outcomes: ["Build robust sklearn pipelines", "Tune models without overfitting validation data", "Explain model behavior with SHAP/LIME"],
    labs: ["Create ColumnTransformer pipeline", "Run Optuna study", "Generate SHAP plots for top features"],
    datasets: ["Kaggle House Prices", "Home Credit", "insurance claim severity"],
    rubric: ["Search space is justified", "Leaderboard/holdout improvement shown", "Explanation report is understandable"]
  },
  "Deep Learning Basics": {
    outcomes: ["Build PyTorch datasets, dataloaders and training loops", "Diagnose overfitting and underfitting", "Use checkpoints and TensorBoard"],
    labs: ["Implement MLP then CNN", "Add dropout/batch norm comparison", "Resume training from checkpoint"],
    datasets: ["MNIST", "Fashion-MNIST", "CIFAR-10"],
    rubric: ["Training is reproducible", "Curves and confusion matrix are included", "Model export path is tested"]
  },
  "Prompt Engineering & RAG": {
    outcomes: ["Design prompts with structured outputs", "Build retrieval pipelines with chunking and reranking", "Evaluate answer faithfulness and retrieval quality"],
    labs: ["Compare chunk sizes", "Add metadata filters", "Create 50-question eval set"],
    datasets: ["company handbook PDFs", "research papers", "product documentation"],
    rubric: ["Answers include citations", "Faithfulness and relevance are measured", "Failure cases are documented"]
  },
  "AI Agents": {
    outcomes: ["Design controlled tool-using workflows", "Separate planning, acting, memory and approval", "Avoid unsafe autonomous loops"],
    labs: ["Build a calculator/search/file tool", "Add human approval before write actions", "Trace every tool call"],
    datasets: ["web research tasks", "local documents", "mock CRM/ticket data"],
    rubric: ["Agent has bounded steps", "Tool inputs/outputs are validated", "Trace shows why each action happened"]
  },
  "MLOps": {
    outcomes: ["Package models behind APIs", "Track experiments and register artifacts", "Automate testing and deployment checks"],
    labs: ["Create FastAPI predict endpoint", "Track model in MLflow", "Build Docker image and CI test"],
    datasets: ["any prior ML project dataset", "drifted synthetic data", "batch scoring sample"],
    rubric: ["API has health and prediction tests", "Model version is logged", "Rollback plan exists"]
  },
  "AI Evaluation & Testing": {
    outcomes: ["Build eval sets for ML, RAG and agents", "Create quality gates for deployment", "Track regressions over time"],
    labs: ["Write prompt regression tests", "Score RAG faithfulness", "Evaluate agent tool-call accuracy"],
    datasets: ["golden Q&A pairs", "adversarial prompts", "known-bad retrieval examples"],
    rubric: ["CI can fail on eval regression", "Metrics have thresholds", "Human review notes are captured"]
  },
  "Security, Privacy & Compliance": {
    outcomes: ["Identify sensitive data paths", "Mitigate prompt injection and data exfiltration", "Create audit-ready controls"],
    labs: ["Run PII detection/redaction", "Create prompt-injection test suite", "Add allowlisted tool permissions"],
    datasets: ["synthetic PII records", "OWASP-style attack prompts", "mock internal documents"],
    rubric: ["Threat model is written", "PII never appears in logs", "Security tests are repeatable"]
  }
};

function enrichedDetails(topic) {
  const override = detailOverrides[topic.title] || {};
  const level = topic.level;
  return {
    outcomes: override.outcomes || [
      `Apply ${topic.title} concepts in a working project`,
      "Explain the key design choices and tradeoffs",
      "Convert experiments into a reproducible artifact"
    ],
    labs: override.labs || [
      `Build a minimal ${topic.title} prototype`,
      "Add tests, metrics, and error analysis",
      "Refactor the work into a reusable project structure"
    ],
    datasets: override.datasets || genericDatasets[level] || genericDatasets.advanced,
    rubric: override.rubric || [
      "Project runs from a clean setup",
      "Metrics and failure cases are documented",
      "README explains assumptions, limitations, and next steps"
    ],
    enterpriseNote: override.enterpriseNote || genericEnterpriseNote[level]
  };
}

const topicBreakdowns = {
  "Variables, loops, functions, OOP": ["variables and primitive types", "if/else and loop control", "function parameters and return values", "classes, objects and simple inheritance"],
  "List/dict comprehensions": ["list comprehensions", "dict/set comprehensions", "filtering and mapping patterns", "readability vs cleverness tradeoffs"],
  "File I/O & error handling": ["read/write text and CSV files", "path handling", "try/except/finally", "custom error messages and logging"],
  "Virtual environments & pip": ["venv creation", "requirements files", "dependency pinning", "project isolation"],
  "Vectors, matrices, dot products": ["vector notation", "matrix multiplication", "dot product geometry", "cosine similarity"],
  "Derivatives & gradients": ["slope intuition", "partial derivatives", "chain rule", "gradient descent updates"],
  "Probability & Bayes' theorem": ["events and conditional probability", "Bayes rule", "distributions", "uncertainty in predictions"],
  "Descriptive & inferential statistics": ["mean/median/std", "sampling", "confidence intervals", "hypothesis tests"],
  "DataFrame operations (merge, groupby, pivot)": ["select/filter/sort", "groupby aggregations", "joins and keys", "pivot tables"],
  "Handling missing values & outliers": ["missingness patterns", "imputation strategies", "IQR/z-score checks", "outlier impact on models"],
  "Feature engineering basics": ["numeric transformations", "categorical encoding", "date/time features", "leakage checks"],
  "Train/test splits & cross-validation": ["holdout split", "stratified split", "k-fold CV", "time-aware validation"],
  "Linear & logistic regression": ["linear model assumptions", "loss functions", "classification threshold", "regularization"],
  "Decision trees & random forests": ["tree splits", "overfitting", "bagging", "feature importance"],
  "K-means & DBSCAN clustering": ["distance metrics", "choosing k", "density-based clusters", "cluster validation"],
  "Model evaluation: accuracy, F1, AUC": ["confusion matrix", "precision/recall", "ROC-AUC", "business metric selection"],
  "XGBoost, LightGBM, CatBoost": ["boosting intuition", "tree depth and learning rate", "categorical handling", "overfitting controls"],
  "Hyperparameter tuning with Optuna": ["search spaces", "objective functions", "pruning", "study tracking"],
  "Scikit-learn Pipeline & ColumnTransformer": ["preprocessing pipelines", "numeric/categorical branches", "fit vs transform", "serialization"],
  "SHAP & LIME explainability": ["global explanations", "local explanations", "feature attribution limits", "stakeholder reporting"],
  "Perceptrons & multilayer networks": ["neurons and activations", "layers", "forward pass", "capacity and nonlinearity"],
  "Backpropagation step-by-step": ["computational graphs", "loss gradients", "autograd", "manual gradient checks"],
  "Batch norm, dropout, weight init": ["stabilizing training", "regularization", "initialization schemes", "train vs eval mode"],
  "Learning rate schedulers": ["LR choice", "warmup", "step/cosine schedules", "early stopping"],
  "ResNet, EfficientNet, ViT": ["residual connections", "compound scaling", "patch embeddings", "model selection"],
  "Transfer learning & fine-tuning": ["frozen backbone", "classifier heads", "layer unfreezing", "data augmentation"],
  "Object detection: YOLO, DETR": ["bounding boxes", "IoU", "mAP", "real-time inference tradeoffs"],
  "Albumentations augmentation": ["image transforms", "label-safe transforms", "augmentation policies", "validation without augmentation"],
  "Word2Vec, GloVe, FastText": ["distributional semantics", "embedding training", "subword embeddings", "similarity search"],
  "LSTM & GRU architectures": ["sequence state", "gates", "vanishing gradients", "sequence classification"],
  "Attention mechanism internals": ["query/key/value", "attention weights", "masking", "interpretation limits"],
  "Tokenization: BPE, WordPiece": ["subword vocabulary", "unknown tokens", "token length", "cost implications"],
  "Scaled dot-product attention": ["Q/K/V matrices", "scaling factor", "softmax weights", "attention masking"],
  "Multi-head attention & FFN": ["parallel attention heads", "projection layers", "feed-forward blocks", "residual + layer norm"],
  "Positional encodings: RoPE, ALiBi": ["why position matters", "absolute vs relative position", "RoPE intuition", "long-context tradeoffs"],
  "GPT vs BERT vs T5 tradeoffs": ["decoder-only", "encoder-only", "encoder-decoder", "task fit"],
  "LoRA & QLoRA fine-tuning": ["adapter concept", "rank and alpha", "quantized training", "merge vs serve adapters"],
  "GPTQ & GGUF quantization": ["weight quantization", "quality vs memory", "local inference formats", "hardware constraints"],
  "Knowledge distillation": ["teacher/student models", "soft labels", "compression", "evaluation"],
  "Inference optimization (vLLM, TGI)": ["batching", "KV cache", "throughput vs latency", "serving metrics"],
  "Zero-shot, few-shot, chain-of-thought": ["instruction clarity", "examples", "reasoning prompts", "when not to expose reasoning"],
  "RAG: chunking, retrieval, reranking": ["chunk size", "metadata", "embedding retrieval", "cross-encoder rerankers"],
  "Structured outputs & tool calling": ["JSON schemas", "function definitions", "validation", "retry on invalid output"],
  "LLM eval frameworks (RAGAS, DeepEval)": ["faithfulness", "answer relevance", "context precision", "regression tests"],
  "ReAct & Reflexion patterns": ["reason-act-observe loop", "reflection", "bounded iterations", "failure recovery"],
  "Function / tool calling APIs": ["tool schema design", "input validation", "tool result handling", "security boundaries"],
  "Short-term vs long-term memory": ["conversation state", "summaries", "vector memory", "forgetting policies"],
  "LangGraph stateful agents": ["state schema", "nodes and edges", "conditional routing", "checkpointing"],
  "Agent roles & specialization": ["planner role", "researcher role", "critic role", "handoffs"],
  "AutoGen / CrewAI patterns": ["multi-agent conversations", "supervisor patterns", "task delegation", "termination rules"],
  "Inter-agent messaging": ["message contracts", "shared state", "conflict handling", "traceability"],
  "Supervisor + worker hierarchies": ["orchestrator design", "worker tools", "approval gates", "fallback routes"],
  "MLflow experiment tracking": ["runs and params", "metrics and artifacts", "model registry", "comparison"],
  "Model packaging with FastAPI + Docker": ["predict endpoint", "schema validation", "container build", "health checks"],
  "DVC for data versioning": ["data remotes", "pipeline stages", "reproducibility", "large-file workflow"],
  "GitHub Actions ML pipeline": ["test jobs", "lint/type checks", "build image", "deployment gates"],
  "Bias auditing: Fairlearn, AIF360": ["sensitive attributes", "group metrics", "mitigation", "audit reporting"],
  "Explainability: SHAP, LIME": ["model-agnostic explanations", "tree explanations", "local examples", "limitations"],
  "EU AI Act & model cards": ["risk classification", "model documentation", "intended use", "limitations"],
  "Red-teaming & adversarial prompts": ["attack prompts", "jailbreak tests", "policy checks", "mitigation backlog"],
  "Prompt versioning with PromptLayer": ["prompt IDs", "version history", "rollback", "experiment comparison"],
  "A/B testing LLM responses": ["variant design", "quality metrics", "human preference", "statistical confidence"],
  "Guardrails & content filtering": ["input validation", "output validation", "policy filters", "safe fallback"],
  "Token cost & latency SLAs": ["token accounting", "latency budgets", "provider routing", "cost dashboards"]
};

function breakdownFor(item) {
  if (topicBreakdowns[item]) {
    return topicBreakdowns[item];
  }
  return [
    `core concept: ${item}`,
    "small implementation exercise",
    "common failure mode",
    "mini-checkpoint and notes"
  ];
}

function toc() {
  return `
    <section class="page toc">
      <div class="eyebrow">Index</div>
      <h1>Table of Contents</h1>
      <ol class="toc-list">
        <li><a href="#executive-map">Executive Learning Map</a></li>
        <li><a href="#timeline">Recommended Timeline</a></li>
        ${allTracks.map((track) => `<li><a href="#${slug(track.track)}">${escapeHtml(track.track)}</a></li>`).join("")}
        <li><a href="#mega-project">Final eBook Project: AutoResearch AI</a></li>
        <li><a href="#assessment">Assessment Framework</a></li>
        <li><a href="#artifact-template">Project Artifact Template</a></li>
        <li><a href="#portfolio">Portfolio Checklist</a></li>
        <li><a href="#references">References</a></li>
      </ol>
    </section>
  `;
}

function timeline() {
  const items = [
    ["Months 1-2", "Python, Math, NumPy, pandas, SQL", "Foundation"],
    ["Months 3-4", "Classical ML, statistics, sklearn pipelines", "Machine Learning"],
    ["Months 5-7", "PyTorch, computer vision, NLP, deep learning", "Deep Learning"],
    ["Months 8-10", "Transformers, LLMs, RAG, fine-tuning, evals", "LLMs & Transformers"],
    ["Months 11-12", "Agents, multi-agent systems, tool use, memory", "Agentic AI"],
    ["Months 13-18", "MLOps, LLMOps, cloud, governance, final platform", "Enterprise"]
  ];
  return `
    <section class="page" id="timeline">
      <div class="eyebrow">Roadmap</div>
      <h1>Recommended Timeline</h1>
      <p class="lead">Use this as a serious beginner-to-enterprise plan. At 10-12 focused hours per week, expect 12-18 months. At 20+ hours per week, a disciplined learner can compress it to 8-10 months.</p>
      <div class="timeline">
        ${items.map((item, index) => `
          <div class="timeline-row">
            <div class="timeline-index">${index + 1}</div>
            <div>
              <div class="timeline-date">${item[0]}</div>
              <h3>${item[1]}</h3>
              <p>${item[2]}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function executiveMap() {
  return `
    <section class="page" id="executive-map">
      <div class="eyebrow">Overview</div>
      <h1>Beginner to Enterprise AI Engineer Path</h1>
      <p class="lead">This eBook converts the interactive roadmap into a printable, project-first curriculum. Every major topic has a project, and the final project combines data engineering, ML, DL, LLMs, RAG, agents, MLOps, observability and governance.</p>
      <div class="stat-grid">
        <div class="stat"><span>${allTracks.length}</span><label>Learning Tracks</label></div>
        <div class="stat"><span>${topicCount}</span><label>Project Modules</label></div>
        <div class="stat"><span>${totalWeeks}</span><label>Suggested Duration</label></div>
        <div class="stat"><span>1</span><label>Enterprise Capstone</label></div>
      </div>
      <div class="legend">
        ${Object.entries(levelColor).map(([level, color]) => `<span><i style="background:${color}"></i>${level}</span>`).join("")}
      </div>
      <div class="callout">
        <strong>How to use this eBook:</strong> finish each module by shipping the capstone project, not by only watching videos. Keep each project in GitHub with README, screenshots, metrics, and a short architecture note.
      </div>
    </section>
  `;
}

function topicCard(topic, index) {
  const details = enrichedDetails(topic);
  return `
    <article class="topic-card ${topic.level}">
      <div class="topic-head">
        <div class="icon-wrap" style="background:${levelBg[topic.level]}; color:${levelColor[topic.level]}">${topic.icon}</div>
        <div>
          <div class="module-number">Module ${index}</div>
          <h3>${escapeHtml(topic.title)}</h3>
          <p>${escapeHtml(topic.sub)}</p>
        </div>
        <span class="badge" style="background:${levelBg[topic.level]}; color:${levelColor[topic.level]}">${escapeHtml(topic.level)}</span>
      </div>
      <div class="duration">Duration: ${escapeHtml(topic.duration)}</div>
      <div class="columns">
        <div>
          <h4>What to learn</h4>
          <ul>${topic.topics.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>Libraries & tools</h4>
          <div class="tags">${topic.libs.map((lib) => `<span>${escapeHtml(lib)}</span>`).join("")}</div>
        </div>
      </div>
      <div class="breakdown-box">
        <h4>Granular learning breakdown</h4>
        ${topic.topics.map((item) => `
          <div class="breakdown-item">
            <strong>${escapeHtml(item)}</strong>
            <div>${breakdownFor(item).map((part) => `<span>${escapeHtml(part)}</span>`).join("")}</div>
          </div>
        `).join("")}
      </div>
      <div class="granular-grid">
        <div>
          <h4>Learning outcomes</h4>
          <ul>${details.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>Hands-on labs</h4>
          <ul>${details.labs.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>Datasets / practice inputs</h4>
          <ul>${details.datasets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>Success rubric</h4>
          <ul>${details.rubric.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="project-box">
        <div class="project-label">Module Project</div>
        <strong>${escapeHtml(topic.capstone.title)}</strong>
        <p>${escapeHtml(topic.capstone.desc)}</p>
      </div>
      <div class="enterprise-note">
        <strong>Enterprise habit:</strong> ${escapeHtml(details.enterpriseNote)}
      </div>
    </article>
  `;
}

function trackSection(track, startIndex) {
  let index = startIndex;
  const cards = track.topics.map((topic) => topicCard(topic, index++)).join("");
  return {
    html: `
      <section class="page track" id="${slug(track.track)}">
        <div class="eyebrow">Learning Track</div>
        <h1>${escapeHtml(track.track)}</h1>
        <div class="track-grid">${cards}</div>
      </section>
    `,
    nextIndex: index
  };
}

function megaProject() {
  return `
    <section class="page mega" id="mega-project">
      <div class="eyebrow">Final Project</div>
      <h1>AutoResearch AI — Enterprise Agentic Intelligence Platform</h1>
      <p class="lead">A production-grade multi-agent system that researches, analyzes, writes reports, and deploys insights end-to-end.</p>
      <div class="mega-hero">
        <div class="mega-icon">🌐</div>
        <div>
          <h2>What it does</h2>
          <p>A user submits a research query. The platform creates a plan, retrieves documents through RAG, analyzes structured data with ML models, writes a report with an LLM, reviews it with a critic agent, and serves results through a FastAPI dashboard with streaming and traceability.</p>
        </div>
      </div>
      <h2>Architecture Layers</h2>
      <div class="layers">
        <div><strong>UI Layer</strong><span>Streamlit or React dashboard, FastAPI REST, WebSocket streaming.</span></div>
        <div><strong>Agent Layer</strong><span>LangGraph state machine, planner, researcher, analyst, writer, critic.</span></div>
        <div><strong>RAG Layer</strong><span>FAISS or vector DB, hybrid retrieval, reranking, citations.</span></div>
        <div><strong>ML Layer</strong><span>pandas, sklearn analytics, PyTorch sentiment/classifier model.</span></div>
        <div><strong>LLM Layer</strong><span>Structured outputs, prompt versions, optional LoRA-tuned writer.</span></div>
        <div><strong>Ops Layer</strong><span>MLflow, Docker, CI/CD, observability, evals, guardrails.</span></div>
      </div>
      <h2>12-Week Build Plan</h2>
      <div class="milestones">
        <div><b>Weeks 1-2</b><span>Data ingestion, EDA, document parser, vector index.</span></div>
        <div><b>Weeks 3-4</b><span>sklearn analytics model and PyTorch classifier.</span></div>
        <div><b>Weeks 5-6</b><span>RAG pipeline, prompt design, structured outputs, eval set.</span></div>
        <div><b>Weeks 7-8</b><span>Multi-agent orchestration, tools, memory, human approval.</span></div>
        <div><b>Weeks 9-10</b><span>FastAPI backend, dashboard, streaming, auth assumptions.</span></div>
        <div><b>Weeks 11-12</b><span>Docker, CI/CD, MLflow, monitoring, safety review, final demo.</span></div>
      </div>
      <h2>Definition of Done</h2>
      <ul class="done-list">
        <li>Answers include citations, uncertainty notes and tool traces.</li>
        <li>At least three tools are used: retrieval, SQL/data, ML inference or calculator.</li>
        <li>Model, prompt and data versions are logged for every run.</li>
        <li>Offline evals test retrieval quality, answer quality, safety and cost.</li>
        <li>README includes architecture, setup, risks, screenshots, and runbook.</li>
      </ul>
    </section>
  `;
}

function assessmentFramework() {
  const rows = [
    ["Concept mastery", "Can explain the idea without notes, derive or sketch the mechanism, and identify where it fails."],
    ["Implementation", "Can build the core workflow from scratch or with standard libraries and keep it reproducible."],
    ["Evaluation", "Defines the right metrics, creates test/eval examples, analyzes errors, and compares baselines."],
    ["Engineering quality", "Uses clean structure, tests, configuration, logging, versioning and automation."],
    ["Enterprise readiness", "Documents security, privacy, observability, cost, rollback and governance assumptions."]
  ];
  return `
    <section class="page" id="assessment">
      <div class="eyebrow">Assessment</div>
      <h1>How to Judge Progress</h1>
      <p class="lead">Do not mark a module complete because you watched a course. Mark it complete when the project survives this review checklist.</p>
      <div class="assessment-grid">
        ${rows.map(([title, desc]) => `
          <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(desc)}</span>
          </div>
        `).join("")}
      </div>
      <h2>Scoring Rule</h2>
      <div class="score-box">
        <div><b>0</b><span>Not attempted</span></div>
        <div><b>1</b><span>Followed tutorial only</span></div>
        <div><b>2</b><span>Built independently with gaps</span></div>
        <div><b>3</b><span>Reproducible, evaluated, documented</span></div>
        <div><b>4</b><span>Production-minded, tested, observable</span></div>
      </div>
      <div class="callout"><strong>Promotion rule:</strong> move to the next major track only when your average score is at least 3 across concept, implementation and evaluation.</div>
    </section>
  `;
}

function artifactTemplate() {
  const sections = [
    ["README", "Problem, dataset, setup, run commands, screenshots, architecture, metrics and limitations."],
    ["Source code", "src package, notebooks only for exploration, tests, configs, Makefile or task runner."],
    ["Data notes", "Data source, schema, cleaning rules, leakage review, privacy considerations."],
    ["Evaluation", "Baseline, metrics, failure cases, confusion matrix or qualitative examples."],
    ["Deployment", "API or app, Dockerfile, environment variables, health check and rollback note."],
    ["Governance", "Model card, risk register, cost estimate, monitoring plan and owner/runbook."]
  ];
  return `
    <section class="page" id="artifact-template">
      <div class="eyebrow">Portfolio Standard</div>
      <h1>Project Artifact Template</h1>
      <p class="lead">Use this same artifact structure for every module. It makes your portfolio feel like real engineering work, not a folder of disconnected notebooks.</p>
      <div class="layers">
        ${sections.map(([title, desc]) => `<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span></div>`).join("")}
      </div>
      <h2>Recommended Repository Layout</h2>
      <pre class="repo-tree">project-name/
  README.md
  pyproject.toml or requirements.txt
  data/README.md
  notebooks/01_exploration.ipynb
  src/
  tests/
  configs/
  scripts/
  app/ or api/
  reports/
  model_card.md
  risk_register.md</pre>
    </section>
  `;
}

function portfolio() {
  return `
    <section class="page" id="portfolio">
      <div class="eyebrow">Checklist</div>
      <h1>Enterprise Portfolio Checklist</h1>
      <div class="check-grid">
        ${[
          "Every project has a README, setup command, screenshots and metrics.",
          "Every ML project has baseline, validation strategy and error analysis.",
          "Every LLM/RAG project has eval examples and failure cases.",
          "Every deployed service has tests, logs, health check and rollback notes.",
          "Every enterprise project has security, privacy and governance assumptions.",
          "The final capstone has an architecture diagram, model card and runbook."
        ].map((item) => `<div class="check">✓ ${escapeHtml(item)}</div>`).join("")}
      </div>
    </section>
  `;
}

function references() {
  const refs = [
    ["Python Tutorial", "https://docs.python.org/3/tutorial/"],
    ["pandas Getting Started", "https://pandas.pydata.org/docs/getting_started/index.html"],
    ["scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html"],
    ["PyTorch Tutorials", "https://docs.pytorch.org/tutorials/"],
    ["Hugging Face Transformers", "https://huggingface.co/docs/transformers/index"],
    ["LangChain / LangGraph Docs", "https://docs.langchain.com/"],
    ["OpenAI Agents, Retrieval, Evals, Safety", "https://platform.openai.com/docs/"],
    ["MLflow Documentation", "https://mlflow.org/docs/latest/index.html"]
  ];
  return `
    <section class="page" id="references">
      <div class="eyebrow">References</div>
      <h1>Official References</h1>
      <p class="lead">Use official documentation for syntax, APIs and current platform behavior. Libraries move quickly; verify versions before starting each project.</p>
      <ol class="refs">${refs.map(([name, url]) => `<li><strong>${escapeHtml(name)}</strong><br><a href="${url}">${url}</a></li>`).join("")}</ol>
    </section>
  `;
}

let moduleIndex = 1;
const trackPages = allTracks.map((track) => {
  const section = trackSection(track, moduleIndex);
  moduleIndex = section.nextIndex;
  return section.html;
}).join("");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI ML Agentic AI Enterprise eBook</title>
  <style>
    @page { size: A4; margin: 16mm 15mm; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      color: #132033;
      background: #edf4fb;
      line-height: 1.45;
    }
    a { color: #2367a5; text-decoration: none; }
    .cover {
      min-height: 100vh;
      padding: 64px 52px;
      color: white;
      background:
        radial-gradient(circle at 12% 18%, rgba(92, 190, 255, .35), transparent 28%),
        radial-gradient(circle at 88% 12%, rgba(255, 188, 96, .22), transparent 24%),
        linear-gradient(135deg, #071a33 0%, #0a3159 48%, #123f64 100%);
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .cover:after {
      content: "";
      position: absolute;
      width: 520px;
      height: 520px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 50%;
      right: -180px;
      bottom: -210px;
    }
    .cover-kicker {
      display: inline-block;
      padding: 7px 13px;
      border: 1px solid rgba(255,255,255,.35);
      border-radius: 999px;
      color: #cfe8ff;
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .cover h1 {
      max-width: 760px;
      margin: 42px 0 20px;
      color: #ffffff;
      font-size: 54px;
      line-height: 1.03;
      letter-spacing: -.05em;
      text-shadow: 0 10px 34px rgba(0, 0, 0, .22);
    }
    .cover p {
      max-width: 720px;
      color: #d7ecff;
      font-size: 18px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 56px;
    }
    .cover-card {
      padding: 18px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 18px;
      background: rgba(255,255,255,.08);
      backdrop-filter: blur(12px);
    }
    .cover-card b { display: block; font-size: 26px; }
    .cover-card span { color: #b8d7f3; font-size: 12px; }
    .page {
      min-height: 100vh;
      padding: 26px 0 18px;
      page-break-after: always;
    }
    .eyebrow {
      color: #BA7517;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .12em;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 16px;
      color: #09264a;
      font-size: 34px;
      line-height: 1.12;
      letter-spacing: -.035em;
    }
    h2 {
      margin: 22px 0 12px;
      color: #0b315d;
      font-size: 21px;
    }
    h3 { margin: 0 0 4px; color: #0b315d; font-size: 17px; }
    h4 { margin: 0 0 7px; color: #42526b; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
    .lead {
      max-width: 840px;
      color: #42526b;
      font-size: 15px;
      margin: 0 0 18px;
    }
    .toc-list {
      columns: 2;
      column-gap: 44px;
      padding-left: 22px;
      font-size: 15px;
    }
    .toc-list li {
      break-inside: avoid;
      margin: 0 0 12px;
      padding-left: 6px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 28px 0;
    }
    .stat {
      padding: 18px;
      border-radius: 18px;
      background: white;
      border: 1px solid #cfe0ef;
      box-shadow: 0 12px 30px rgba(16, 49, 84, .08);
    }
    .stat span { display: block; color: #0b6dad; font-size: 34px; font-weight: 800; }
    .stat label { color: #52657a; font-size: 12px; }
    .legend {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 16px 0 26px;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 11px;
      border-radius: 999px;
      background: white;
      border: 1px solid #d8e5f0;
      color: #42526b;
      font-size: 12px;
      text-transform: capitalize;
    }
    .legend i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .callout {
      padding: 18px 20px;
      border-left: 5px solid #1D9E75;
      background: white;
      border-radius: 14px;
      color: #30445d;
      box-shadow: 0 10px 24px rgba(16, 49, 84, .06);
    }
    .timeline {
      display: grid;
      gap: 12px;
      margin-top: 22px;
    }
    .timeline-row {
      display: grid;
      grid-template-columns: 58px 1fr;
      gap: 14px;
      padding: 16px;
      background: white;
      border: 1px solid #d8e5f0;
      border-radius: 18px;
      page-break-inside: avoid;
    }
    .timeline-index {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      color: white;
      font-weight: 800;
      background: linear-gradient(135deg, #1D9E75, #378ADD);
    }
    .timeline-date {
      color: #BA7517;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .timeline-row p { margin: 0; color: #52657a; }
    .track-grid {
      display: grid;
      gap: 16px;
    }
    .topic-card {
      background: white;
      border-radius: 20px;
      padding: 18px;
      border: 1px solid #d7e5f2;
      box-shadow: 0 10px 26px rgba(16, 49, 84, .07);
      page-break-inside: auto;
      break-inside: auto;
      position: relative;
      overflow: hidden;
    }
    .topic-card:before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 6px;
      background: #378ADD;
    }
    .topic-card.beginner:before { background: #1D9E75; }
    .topic-card.intermediate:before { background: #7F77DD; }
    .topic-card.advanced:before { background: #D85A30; }
    .topic-card.enterprise:before { background: #BA7517; }
    .topic-head {
      display: grid;
      grid-template-columns: 54px 1fr auto;
      gap: 13px;
      align-items: start;
      margin-bottom: 12px;
    }
    .icon-wrap {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      font-size: 24px;
    }
    .module-number {
      color: #7a8aa0;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 3px;
    }
    .topic-head p { margin: 0; color: #52657a; font-size: 13px; }
    .badge {
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .duration {
      display: inline-block;
      margin-bottom: 13px;
      color: #445b75;
      font-size: 12px;
      font-weight: 700;
    }
    .columns {
      display: grid;
      grid-template-columns: 1.2fr .8fr;
      gap: 20px;
      margin: 8px 0 14px;
    }
    .granular-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 10px 0 14px;
    }
    .granular-grid > div {
      padding: 11px 12px;
      border-radius: 14px;
      background: #fbfdff;
      border: 1px solid #dce9f4;
    }
    .breakdown-box {
      margin: 10px 0 14px;
      padding: 12px;
      border-radius: 15px;
      background: #f8fbfe;
      border: 1px solid #dce9f4;
    }
    .breakdown-item {
      display: grid;
      grid-template-columns: 1fr 1.45fr;
      gap: 12px;
      padding: 8px 0;
      border-top: 1px solid #e6eef6;
    }
    .breakdown-item:first-of-type { border-top: 0; }
    .breakdown-item strong {
      color: #0b315d;
      font-size: 12px;
    }
    .breakdown-item div {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .breakdown-item span {
      padding: 3px 7px;
      border-radius: 999px;
      background: white;
      border: 1px solid #d6e5f2;
      color: #42526b;
      font-size: 10.5px;
    }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 4px; color: #2d3d50; }
    .tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tags span {
      padding: 5px 8px;
      border-radius: 999px;
      background: #eef5fb;
      color: #34506d;
      font-size: 11px;
      border: 1px solid #d8e5f0;
    }
    .project-box {
      padding: 13px 15px;
      border-radius: 15px;
      background: linear-gradient(135deg, #f7fbff, #eef6ff);
      border: 1px solid #cfe0ef;
    }
    .project-label {
      color: #BA7517;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .1em;
      margin-bottom: 4px;
    }
    .project-box p { margin: 5px 0 0; color: #42526b; font-size: 12.5px; }
    .enterprise-note {
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 13px;
      background: #fffaf2;
      border: 1px solid #f1d7ac;
      color: #4b3a21;
      font-size: 12.5px;
    }
    .enterprise-note strong { color: #8a540f; }
    .mega-hero {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 18px;
      padding: 22px;
      border-radius: 22px;
      background: linear-gradient(135deg, #e6f1fb, #eeedfe);
      border: 1px solid #cadff2;
      margin: 20px 0;
    }
    .mega-icon {
      width: 58px;
      height: 58px;
      border-radius: 19px;
      background: #0b315d;
      display: grid;
      place-items: center;
      color: white;
      font-size: 30px;
    }
    .mega-hero p { margin: 0; color: #334961; }
    .layers, .milestones, .check-grid {
      display: grid;
      gap: 10px;
    }
    .layers div, .milestones div, .check, .assessment-grid div, .score-box div {
      padding: 13px 15px;
      border-radius: 15px;
      background: white;
      border: 1px solid #d8e5f0;
      page-break-inside: avoid;
    }
    .layers strong, .milestones b, .assessment-grid strong {
      display: block;
      color: #0b315d;
      margin-bottom: 3px;
    }
    .layers span, .milestones span, .assessment-grid span { color: #52657a; }
    .assessment-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 16px 0 20px;
    }
    .score-box {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin: 12px 0 18px;
    }
    .score-box b {
      display: block;
      color: #0b6dad;
      font-size: 28px;
      line-height: 1;
      margin-bottom: 6px;
    }
    .score-box span { color: #52657a; font-size: 11px; }
    .repo-tree {
      padding: 14px 16px;
      border-radius: 16px;
      background: #0b1f36;
      color: #d9edff;
      font-size: 10.5px;
      line-height: 1.34;
      overflow: hidden;
    }
    .done-list li { margin-bottom: 8px; }
    .refs li {
      margin: 0 0 13px;
      color: #30445d;
      overflow-wrap: anywhere;
    }
    @media print {
      body { background: white; }
      .page { min-height: auto; }
    }
  </style>
</head>
<body>
  <section class="cover">
    <div class="cover-kicker">AI Learning eBook</div>
    <h1>AI, ML, Deep Learning, Agentic AI & Enterprise Engineering</h1>
    <p>A project-first roadmap from beginner foundations to production-grade enterprise AI systems, generated from your roadmap and expanded with missing real-world engineering layers.</p>
    <div class="cover-grid">
      <div class="cover-card"><b>${allTracks.length}</b><span>Tracks</span></div>
      <div class="cover-card"><b>${topicCount}</b><span>Modules</span></div>
      <div class="cover-card"><b>30+</b><span>Projects</span></div>
      <div class="cover-card"><b>1</b><span>Final platform</span></div>
    </div>
  </section>
  ${toc()}
  ${executiveMap()}
  ${timeline()}
  ${trackPages}
  ${megaProject()}
  ${assessmentFramework()}
  ${artifactTemplate()}
  ${portfolio()}
  ${references()}
</body>
</html>`;

fs.writeFileSync(outHtml, html);
console.log(outHtml);
