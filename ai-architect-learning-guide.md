# AI Architect Master Roadmap 2026
### Restructured Learning Guide — Based on Habibi Technology Solutions Handbook
**17 Phases · 50+ Modules · 1000+ Topics · 200+ Q&As · 80+ Projects**

---

## HOW TO USE THIS GUIDE

Each phase contains: **Modules → Chapters → Topics → Subtopics → Concepts**

For every topic you get:
- Hands-On Labs
- Framework references
- Interview Q&A
- Projects with Industry Use Cases
- Assessment criteria

> **Rule:** Read the chapter overview → watch/read resources → do the labs → build the mini project → pass the assessment before moving on.
> **Mindset:** Build, break, fix, repeat. Depth beats breadth. One solid project > ten half-built tutorials.
> **From Day 1:** Maintain a GitHub portfolio. Document your thinking. Pick a domain early (finance / healthcare / legal) — specialization is a moat.

---

## CAREER PATHS & SALARIES

| Role | Phases Required | Salary (USD) | Core Focus |
|------|----------------|--------------|-----------|
| AI Engineer | P0–P7 | $120K–$180K | Build and deploy ML/DL models |
| LLM Engineer | P0–P9 | $150K–$220K | RAG, fine-tuning, LLM APIs |
| Agent Developer | P0–P12 | $140K–$200K | Agentic AI, coding agents |
| MLOps Engineer | P0–P13 | $130K–$190K | Production ML pipelines |
| AI Product Manager | P0–P10 | $130K–$200K | AI product strategy & roadmap |
| AI Architect | P0–P15 | $180K–$280K | End-to-end AI system design |

**Full timeline:** 12–18 months part-time · 6–9 months full-time

---

## ROLE-BASED LEARNING PATHS

### Path 1 — AI Engineer `P0→P7`
`CS Foundation → Python → Data → Math → ML → Deep Learning → CV → NLP`

### Path 2 — LLM Engineer `P0→P9`
`CS → Python → Data → Math → Deep Learning → NLP → GenAI → RAG`

### Path 3 — Agent Developer `P0→P12`
`CS → Python → GenAI → RAG → Agentic AI → Frameworks → Coding Agents`

### Path 4 — MLOps Engineer `P0→P13`
`CS → Python → Data → ML → Deep Learning → MLOps`

### Path 5 — AI Product Manager `P0→P10`
`CS (concepts) → GenAI (concepts) → RAG → Agentic AI`

### Path 6 — AI Architect `P0→P16`
`All Phases — Full roadmap required`

---

## PREREQUISITES CHECKLIST

**Development Environment**
- [ ] Python 3.11+ installed
- [ ] VS Code or Cursor IDE
- [ ] Git & GitHub account
- [ ] Docker Desktop
- [ ] Ubuntu/WSL2 (Windows) or Homebrew (Mac)

**Cloud & AI Accounts**
- [ ] OpenAI API account
- [ ] Anthropic Claude API account
- [ ] Google Colab (free GPU)
- [ ] Hugging Face account
- [ ] AWS Free Tier account
- [ ] GitHub Copilot

**Learning Resources**
- [ ] fast.ai (free deep learning)
- [ ] 3Blue1Brown (math videos)
- [ ] Andrej Karpathy YouTube
- [ ] HuggingFace Course (free)
- [ ] DeepLearning.AI Short Courses
- [ ] Papers With Code

---

## CERTIFICATION ROADMAP

| Certification | Phase | Provider | Notes |
|--------------|-------|----------|-------|
| AWS Certified ML Specialty | P4–5 + P13 | AWS | Top enterprise credential |
| Google Professional ML Engineer | P4–5 + P13 | GCP | Strong for GCP shops |
| DeepLearning.AI Specializations | P3–P5 | Coursera | Andrew Ng's courses |
| HuggingFace Certification | P7–P8 | HF Hub | Free, respected in NLP |
| LangChain & LangGraph Courses | P9–P11 | DeepLearning.AI | Agentic AI focus |
| Kubernetes CKA | P13–P15 | CNCF | MLOps infrastructure |

---

---

# PILLAR 1 — FOUNDATION
> Phases 0–3 · ~18–19 Weeks

---

## PHASE 0 — COMPUTER SCIENCE FOUNDATION
**Duration:** 3–4 Weeks
**Goal:** Build the bedrock every AI engineer must own: systems, OS, networking

### Module 0.1 — Computer Fundamentals

**Topics map:** CPU/Memory · Linux OS · Shell Scripts · Networking · HTTP/REST · WebSockets

---

#### Chapter 1: Introduction to Computing

**What is a Computer**
- Von Neumann Architecture, Harvard Architecture, System Bus
- Fetch-Decode-Execute cycle, Instruction Set Architecture (ISA), Clock speed & GHz
- **Lab:** Use Python `psutil` to read CPU, RAM, disk stats; Write a system info reporter

**CPU Architecture**
- Cores & Threads, Cache Hierarchy (L1/L2/L3), Branch Prediction, Pipelining
- SIMD instructions, Hyper-threading, TDP & thermal limits, GPU vs CPU
- **Lab:** Benchmark single-core vs multi-core Python; Measure L1/L2 cache miss impact
- **Frameworks:** `multiprocessing`, `concurrent.futures`, `numba`

> **Interview Q:** Why is a GPU better than a CPU for deep learning?
> **A:** GPUs have thousands of smaller cores optimized for SIMD parallel arithmetic (matrix multiply). A100 GPU: 6912 CUDA cores, 80GB HBM3 with 2TB/s bandwidth. DL workloads are embarrassingly parallel — same operation on millions of values simultaneously.

**Memory & Storage Hierarchy**
- RAM (DRAM, DDR5), Storage (NVMe SSD, HDD), Virtual Memory & Swap, Memory-Mapped Files
- Latency hierarchy: registers < L1 < L2 < L3 < RAM < SSD < HDD
- **Lab:** Measure memory access latency at each level; Load 5GB CSV with memory mapping vs standard
- **Frameworks:** `mmap`, `numpy.memmap`, `zarr`

> **Interview Q:** What causes slow data loading in ML training?
> **A:** CPU bottleneck (DataLoader workers insufficient), I/O bottleneck (data on HDD not SSD), preprocessing not parallelized. Fix: `pin_memory=True`, `num_workers=4-8`, prefetch to RAM, use LMDB or WebDataset.

**Chapter Project:** System Resource Monitor Dashboard
- Build real-time terminal dashboard: CPU, RAM, disk, network, GPU metrics
- Tools: `psutil`, `rich`, `curses`
- Assessment: Refreshes every second without memory leaks; detects >80% RAM usage

---

#### Chapter 2: Operating Systems Deep Dive

**Linux Fundamentals**
- File System Hierarchy (/etc, /var, /home, /proc), Permissions (chmod, chown, ACL)
- Users & Groups, Package Management (apt, yum)
- Concepts: Everything is a file, Inode structure, Hard vs symbolic links, Filesystem types (ext4, xfs, btrfs)
- **Lab:** Navigate filesystem; Set up Python venv with correct permissions; Create systemd service

> **Interview Q:** What is the difference between hard and soft links?
> **A:** Hard link: another directory entry pointing to the same inode. If original deleted, hard link still works. Soft link (symlink): pointer to a path — breaks if target deleted. Symlinks used for Python version management.

**Processes & Services**
- Process lifecycle (fork, exec, wait, exit), Zombie & Orphan processes
- Signals (SIGTERM, SIGKILL, SIGUSR1), Systemd services, Cron jobs
- Concepts: PID/PPID/UID, Namespaces & cgroups (Docker foundation), Nice values & CPU priority
- **Frameworks:** `supervisord`, `systemd`, `cron`, `tmux`

> **Interview Q:** How do containers (Docker) use Linux primitives?
> **A:** Docker uses namespaces (PID, network, mount, UTS, IPC) for isolation. cgroups for resource limits. Union file system (overlayfs) for layered images. No full OS — shares host kernel.

**Shell Scripting & Automation**
- Variables, arrays, loops, functions, subshells, pipes & redirection
- `grep`, `awk`, `sed`, `xargs & parallel`
- Concepts: POSIX compatibility, $PATH/$PYTHONPATH, Here documents, Exit codes & error handling
- **Frameworks:** `bash`, `python-dotenv`, `direnv`

> **Interview Q:** How do you pass secrets to a production ML service?
> **A:** Never hardcode — use environment variables from `.env` (dev) or secrets managers (AWS Secrets Manager, HashiCorp Vault, K8s Secrets) in production.

**Chapter Project:** Automated ML Data Pipeline Bash System
- Build bash + Python pipeline: download datasets → preprocess → validate → notify
- Tools: `bash`, `cron`, `Python`, `mailutils`

---

#### Chapter 2b: Git & Version Control

**Git Internals & Workflow**
- Working tree, staging area (index), object store (.git/objects)
- Git objects: blob, tree, commit, tag; SHA-1 content addressing
- Branches as pointers, HEAD, detached HEAD state
- Merge strategies: fast-forward, recursive (3-way), octopus
- Rebase vs merge: linear history vs preserve topology
- Interactive rebase: squash, fixup, reorder, edit commits
- Cherry-pick, stash, reflog — recovery from mistakes
- Concepts: Directed Acyclic Graph (DAG), Content-addressable storage, Pack files & delta compression, Shallow clones
- **Lab:** Resolve complex merge conflict in ML config files; Rebase feature branch onto main; Recover deleted branch with reflog
- **Frameworks:** `git`, `pre-commit`, `commitizen`, `husky`

> **Interview Q:** Merge vs rebase — when to use each?
> **A:** Merge: preserves history topology, safe for shared branches, creates merge commit. Rebase: rewrites commit history, creates linear log, NEVER on shared branches. Workflow: rebase locally to clean up feature branch, merge to main via PR. Squash merge: single commit per feature — clean main history.

**Git for ML Projects**
- Large file storage: Git LFS, DVC (data versioning)
- `.gitignore` patterns for ML: `*.pt`, `*.pkl`, `data/`, `__pycache__/`
- Branching strategy: `main`, `develop`, `feature/*`, `experiment/*`
- Semantic versioning for models (v1.0.0 = major architecture, v1.1.0 = retrained, v1.0.1 = config fix)
- GitHub Actions basics for ML CI
- Concepts: Monorepo vs polyrepo for ML, Git hooks for code quality, Signed commits
- **Lab:** Set up pre-commit hooks (black, ruff, mypy); DVC pipeline with Git; Tag model release v1.0.0

---

#### Chapter 2c: Docker & Containerization

**Docker Fundamentals**
- Images, containers, layers (union filesystem), registries (DockerHub, ECR, GCR)
- `Dockerfile` instructions: `FROM`, `RUN`, `COPY`, `ENV`, `EXPOSE`, `CMD`, `ENTRYPOINT`
- Multi-stage builds: builder stage (dev deps) → runtime stage (lean image)
- Build cache optimization: order layers from least to most frequently changing
- `.dockerignore`, `docker build`, `docker run`, `docker exec`, `docker logs`
- Concepts: Copy-on-write layers, Image vs container, Port binding, Volume mounts, Network modes (bridge, host, overlay)
- **Lab:** Multi-stage Dockerfile for FastAPI ML service (1GB → 200MB); Docker Compose: API + Postgres + Redis + Qdrant; Layer cache analysis

> **Interview Q:** How do you minimize Docker image size for ML services?
> **A:** Multi-stage build: heavy build stage (gcc, git, dev headers) → slim runtime. Use `python:3.11-slim` not full image. Install only runtime deps in final stage. Combine RUN commands to reduce layers. Use `.dockerignore` to exclude `.git`, `tests/`, `*.md`. Pin exact versions. Target: <500MB for ML API (vs 2GB+ naive image).

**Docker Compose & NVIDIA Docker**
- `docker-compose.yml`: services, networks, volumes, depends_on, health checks
- NVIDIA Container Toolkit: GPU access in containers (`--gpus all`)
- Docker Compose for ML stacks: Jupyter + MLflow + Qdrant + Postgres
- Resource limits: `--memory`, `--cpus`, `--gpus`
- Concepts: Service discovery via DNS, Named volumes vs bind mounts, GPU memory isolation between containers
- **Lab:** Full ML dev stack with Docker Compose (GPU-enabled); Health check for FastAPI container; Resource limits per service

> **Interview Q:** How does NVIDIA Docker enable GPU access in containers?
> **A:** NVIDIA Container Toolkit installs a runtime that intercepts container creation, mounts CUDA libraries from host, and exposes GPU devices. `--gpus all` or `--gpus '"device=0,1"'` for specific GPUs. Container sees GPUs as `/dev/nvidia*`. CUDA version in container must be ≤ host driver version (forward compatible).

**Chapter Project:** Containerized ML Training & Serving Stack
- GPU-enabled training container + quantized model serving container + FastAPI gateway
- Docker Compose with health checks, volume mounts for model artifacts
- Assessment: Image <300MB; GPU training container achieves same throughput as bare metal

---

#### Chapter 2d: Data Formats & Serialization

**Structured Data Formats**
- CSV: delimiter, quoting, encoding (UTF-8/Latin-1), streaming large files
- JSON: nested objects, arrays, null handling; JSONL (newline-delimited for streaming)
- Parquet: columnar storage, predicate pushdown, schema evolution, compression (Snappy, ZSTD)
- Apache Arrow: in-memory columnar format, zero-copy reads, IPC format, Flight protocol
- Avro: schema evolution, binary encoding, Kafka integration
- Protocol Buffers (Protobuf): `.proto` schema, binary encoding, `protoc` compiler, gRPC wire format
- MessagePack: compact binary JSON alternative
- HDF5 / NetCDF: hierarchical data for scientific/ML datasets
- Concepts: Row vs columnar storage, Schema-on-read vs schema-on-write, Serialization overhead, Compression ratio vs speed
- **Lab:** Benchmark CSV vs Parquet vs Arrow for 1GB ML dataset (read speed, memory); Implement Protobuf schema for ML inference request/response
- **Frameworks:** `pyarrow`, `polars`, `avro-python3`, `protobuf`, `h5py`

> **Interview Q:** Why use Parquet instead of CSV for ML datasets?
> **A:** Parquet: columnar storage → only read needed columns (3-10× faster). Predicate pushdown → filter before reading into memory. Efficient compression per column type (int columns compress 10× better than strings). Schema embedded → no type inference. For 1GB CSV: 5s to load, 1GB RAM. Same data as Parquet: 0.5s, 150MB RAM.

---

#### Chapter 3: Networking for AI Engineers

**Network Fundamentals**
- OSI Model (7 layers), IP addressing & CIDR notation, TCP vs UDP, DNS resolution, NAT & firewalls
- Latency vs throughput, CDN & edge caching
- **Frameworks:** `socket`, `requests`, `httpx`, `scapy`

> **Interview Q:** Why does network latency matter for LLM inference?
> **A:** Each LLM API call incurs DNS lookup (~1ms), TCP handshake (~3×RTT), TLS negotiation (~1–2×RTT), then inference. For streaming, first-token latency = network overhead + TTFT. Choosing nearest API region cuts P99 latency by 50–200ms.

**HTTP & REST APIs**
- HTTP/1.1 vs HTTP/2 vs HTTP/3, Methods, Status codes, Auth (Bearer, API keys, OAuth2)
- Rate limiting & backoff, Idempotency, Content negotiation, CORS, Connection pooling
- **Lab:** Build REST API wrapper for OpenAI with retry; Implement SSE streaming with FastAPI
- **Frameworks:** `FastAPI`, `httpx`, `uvicorn`

> **Interview Q:** What is SSE and why is it used for LLM streaming?
> **A:** Server-Sent Events: HTTP response that stays open, server pushes data chunks. No WebSocket overhead. LLMs stream tokens as `data: {token}\n\n` lines. Works through proxies and CDNs.

**WebSockets & gRPC**
- WebSocket handshake, Bidirectional streaming, gRPC (HTTP/2 + Protobuf), Protocol Buffers
- Load balancing, Backpressure, Service mesh (Istio basics)
- **Frameworks:** `websockets`, `grpcio`, `protobuf`, `nginx`

> **Interview Q:** When would you use gRPC over REST for AI services?
> **A:** gRPC for internal microservice communication: binary Protobuf (3–10× smaller than JSON), HTTP/2 multiplexing, strongly-typed contracts, built-in streaming. REST for public APIs. Rule: gRPC internally, REST externally.

**Chapter Project:** Streaming LLM API Server
- FastAPI server proxying LLM calls with SSE streaming, connection pooling, retry logic, rate limiting

---

**MODULE CHEAT SHEET — Linux & Networking**
```bash
ps aux | grep python          # find Python processes
kill -9 <pid>                 # force kill | kill -15 = graceful
chmod 755 script.sh           # rwxr-xr-x
df -h / du -sh *              # disk usage
ss -tlnp                      # open TCP ports
curl -v https://api.openai.com  # debug HTTP headers
tcpdump -i eth0 port 80       # capture packets
htop / btop                   # real-time process monitor
journalctl -u myservice -f    # follow service logs
crontab -e                    # edit cron jobs
```

---

## PHASE 1 — PYTHON ENGINEERING
**Duration:** 6 Weeks
**Goal:** Master Python from fundamentals to production-grade packages

### Module 1.1 — Python Fundamentals

**Topics map:** Types & Collections · Functions & FP · OOP & Patterns · Async · Pydantic · Testing

---

#### Chapter 1: Variables & Data Types

**Numbers, Strings & Booleans**
- `int`, `float`, `complex`, string methods & f-strings, Boolean algebra, type conversion
- Concepts: Python memory model, Object identity (`id()`), Integer caching (-5 to 256), String interning

> **Interview Q:** What is the difference between `==` and `is`?
> **A:** `==` checks value equality; `is` checks identity (same object in memory). Small integers (-5 to 256) and short strings are cached by CPython. Never use `is` for value comparison — only for `None`, `True`, `False`.

**Collections Deep Dive**
- `list`, `tuple`, `set`, `dict`, `frozenset`, `deque` (O(1) both ends), `Counter`, `defaultdict`, `OrderedDict`, `heapq`
- Concepts: Hash table internals, Amortized O(1) list append, Dict ordering (Python 3.7+)
- **Lab:** LRU cache with OrderedDict; Token frequency counter with Counter; Priority queue with heapq
- **Frameworks:** `collections`, `heapq`, `sortedcontainers`

> **Interview Q:** What is the time complexity of dict lookup?
> **A:** O(1) average, O(n) worst case (hash collisions, rare). Python dicts use open addressing, resizes at 2/3 capacity. Size doubles on resize, amortizing to O(1) insertions.

**Chapter Project:** Type-Safe Data Validation & Normalization Utility
- Tools: `Python builtins`, `dataclasses`, `Pydantic`
- Assessment: Process 100K records in <5 seconds; descriptive error messages with field names

---

#### Chapter 2: Functions & Functional Programming

**Functions & Closures**
- `*args`, `**kwargs`, default arguments (mutable default pitfall), lambda, closures, LEGB scope
- Concepts: First-class functions, Higher-order functions, Partial application, Currying
- **Lab:** `@retry` decorator with exponential backoff; Function pipeline composer; Memoized Fibonacci

> **Interview Q:** Explain the mutable default argument pitfall.
> **A:** `def fn(items=[]):` — the list is created once at function definition. Subsequent calls share the same object. Fix: use `None` as default and initialize inside. Critical bug in ML feature extractors.

**Generators & Iterators**
- `yield`, `yield from`, generator expressions, iterator protocol (`__iter__`, `__next__`)
- Concepts: Lazy evaluation, Memory efficiency, Coroutines vs generators
- **Lab:** Streaming dataset reader; Batch generator for mini-batch ML training; Sliding window for time-series
- **Frameworks:** `itertools`, `more-itertools`

> **Interview Q:** How do generators save memory in data loading?
> **A:** A generator yields one item at a time. For a 10GB dataset: list = 10GB RAM; generator = ~few KB. PyTorch DataLoader uses generator protocol internally.

**Chapter Project:** Streaming Data Processing Pipeline
- Generator-based pipeline for large CSV → lazy transformations → output
- Assessment: Memory under 500MB for 10GB input; throughput >500K rows/second

---

#### Chapter 3: OOP & Design Patterns

**Classes & Inheritance**
- `__init__`, `__repr__`, `__str__`, `__eq__`, Inheritance & `super()`, MRO (C3 linearization)
- Abstract Base Classes, `@property`, `@classmethod`, `@staticmethod`
- Concepts: SOLID principles, Composition over inheritance, Duck typing, Protocol
- **Lab:** Agent ABC with abstract methods; Observer pattern; Pluggable provider system (OpenAI/Anthropic)

> **Interview Q:** When should you use composition instead of inheritance?
> **A:** Use composition ('has-a') when: behaviors need to be swapped at runtime, you need multiple unrelated behaviors, or combining >2 behaviors. In AI agents: don't subclass Tool — compose agents with tool lists.

**Advanced OOP & Metaclasses**
- Decorators (function & class-based), Context managers (`__enter__`/`__exit__`), Descriptors, Metaclasses
- `__slots__` for memory optimization, Decorator stacking, Weak references, Class registry pattern
- **Frameworks:** `contextlib`, `wrapt`, `tenacity`

> **Interview Q:** How does a descriptor work in Python?
> **A:** A descriptor defines `__get__`, `__set__`, and/or `__delete__` and is assigned as a class attribute. When accessed on an instance, Python calls the descriptor methods. Used by `@property`, SQLAlchemy columns, Django model fields.

**Chapter Project:** Pluggable LLM Provider Abstraction Layer
- OOP provider system with ABC unifying OpenAI, Anthropic, Ollama
- Tools: `abc`, `dataclasses`, `httpx`, `tenacity`

---

#### Chapter 4: Async Python & Production Tooling

**Async/Await & Concurrency**
- `async def`, `await`, coroutines, asyncio event loop, `asyncio.gather`, `asyncio.wait`
- Semaphore for rate limiting, `aiohttp`, background tasks
- Concepts: Concurrency vs parallelism, GIL impact, Task vs Thread vs Process, Async generators
- **Lab:** Async batch processor for 100 embedding API calls; Async web scraper with semaphore
- **Frameworks:** `asyncio`, `aiohttp`, `httpx`, `anyio`

> **Interview Q:** Explain Python's GIL and how to work around it.
> **A:** GIL: only one thread executes Python bytecode at a time. For CPU-bound: use `multiprocessing` or C extensions (NumPy, PyTorch release GIL). For I/O-bound: async/await or threads are both effective.

**Type System & Pydantic**
- Type hints (PEP 484), `Optional`, `Union`, `Literal`, `TypeVar`, Generic classes, Protocol
- Pydantic v2: `BaseModel`, `model_validator`, `field_validator`, JSON schema generation
- Concepts: Runtime vs static type checking, `TypedDict`, `Annotated` for metadata
- **Frameworks:** `pydantic`, `mypy`, `pyright`, `beartype`

> **Interview Q:** Why is Pydantic essential in AI engineering?
> **A:** LLM outputs are strings needing parsing into structured data. Pydantic: validates JSON against schemas, provides clear error messages, generates JSON Schema for function calling, enforces types at runtime.

**Testing & Code Quality**
- pytest (fixtures, parametrize, marks), Mocking (`unittest.mock`, `respx`), Coverage
- Property-based testing (Hypothesis), Black, Ruff, Mypy, Pre-commit hooks, Poetry & uv
- Concepts: AAA pattern (Arrange-Act-Assert), Test pyramid, TDD red-green-refactor
- **Frameworks:** `pytest`, `black`, `ruff`, `mypy`, `poetry`, `uv`

> **Interview Q:** How do you test code that calls an LLM API without paying per test?
> **A:** Mock the HTTP client: use `respx` (for httpx) or `responses` (for requests) to intercept calls. Record real responses once with VCR.py cassettes. Test: prompt construction, response parsing, error handling, retry logic.

**Chapter Project:** Production AI Python Package
- Build and publish `ai-utils` package: async LLM client, Pydantic schemas, retry logic, cost tracking
- Tools: `Poetry`, `pytest`, `Pydantic`, `httpx`, `GitHub Actions`
- Assessment: `mypy --strict` passes; test coverage >90%; CI pipeline on every PR

---

**MODULE CHEAT SHEET — Python Production**
```python
async def fn(): ...  # coroutine (requires await)
await asyncio.gather(*[fn(x) for x in items])  # parallel
async with asyncio.Semaphore(10):  # rate limit 10 concurrent
@functools.lru_cache(maxsize=128)  # memoize pure function
from pydantic import BaseModel, Field, model_validator
model.model_dump_json()  # serialize | .model_validate() deserialize
pytest -x --cov=src --cov-report=html tests/  # test + coverage
ruff check . --fix && mypy src/ --strict  # lint + type check
poetry add --group dev pytest ruff mypy  # dev dependencies
uv pip install -r requirements.txt  # 10× faster than pip
```

---

## PHASE 2 — DATA ANALYSIS STACK
**Duration:** 4 Weeks
**Goal:** NumPy, Pandas, and visualization — the data engineering trifecta

### Module 2.1 — NumPy & Scientific Computing

---

#### Chapter 1: NumPy Arrays & Vectorization

**Array Fundamentals**
- ndarray creation, dtype system (float32, int64, bool), Shape, strides & memory layout (C/Fortran order)
- Concepts: Contiguous memory, Cache locality, SIMD vectorization, Broadcasting rules
- **Lab:** Vectorize pairwise distance function; Implement sliding window with stride tricks; Build image batch tensor (N, C, H, W)

> **Interview Q:** Explain NumPy broadcasting with an example.
> **A:** Broadcasting: arrays with compatible shapes undergo element-wise operations without copying. Shape (1000,1) + shape (1,768) → (1000,768) — adds 768 biases to 1000 embedding vectors. Critical for batch operations: (B,seq,d_model) + (1,seq,d_model) adds positional encodings.

**Linear Algebra with NumPy**
- Matrix multiply (`@`, `np.dot`, `np.einsum`), Transpose, inverse, pseudo-inverse
- Eigenvalue decomposition, SVD (`np.linalg.svd`), Norms (L1, L2, Frobenius)
- Concepts: Rank & null space, Condition number, Orthogonality, Low-rank approximation
- **Lab:** PCA from scratch using SVD; Cosine similarity matrix for 10K embeddings; Solve Ax=b

> **Interview Q:** How is SVD used in LLM training?
> **A:** SVD underpins LoRA: instead of fine-tuning full weight matrix W (d×d), LoRA approximates ΔW = A×B where A is (d×r) and B is (r×d). The low-rank assumption: weight updates live in a low-dimensional subspace, so r=8–64 captures most fine-tuning signal.

**Chapter Project:** High-Speed Embedding Search Engine
- NumPy-based cosine similarity search over 1M embeddings with batched matrix multiply
- Tools: `numpy`, `faiss-cpu`, `matplotlib`
- Assessment: Top-10 search over 1M vectors in <100ms

---

#### Chapter 2: Pandas Deep Dive

**DataFrame & Series Fundamentals**
- `pd.Series`, `pd.DataFrame`, Index types (RangeIndex, Int64Index, MultiIndex, DatetimeIndex)
- Creating DataFrames: from dict, from list of dicts, from NumPy, `pd.read_csv`, `pd.read_json`, `pd.read_parquet`, `pd.read_sql`
- `df.info()`, `df.describe()`, `df.dtypes`, `df.shape`, `df.head()`, `df.sample()`
- Selection: `loc` (label), `iloc` (integer), boolean indexing, `.at`, `.iat` for scalar access
- Concepts: Copy vs view problem (`SettingWithCopyWarning`), Block consolidation, Arrow-backed dtypes (pandas 2.0)
- **Lab:** Load 1M row CSV with `pd.read_csv(chunksize=50000)`; Convert float64 columns to float32 to halve memory
- **Frameworks:** `pandas`, `pyarrow`, `fastparquet`

> **Interview Q:** Why does `df['col'][0] = 5` sometimes not work?
> **A:** Chained indexing creates a temporary copy. `df['col'][0]` = `df.__getitem__('col').__setitem__(0, 5)`. Python may modify the copy, not the original. Correct: `df.loc[0, 'col'] = 5` (single setitem call). Pandas 3.0 will error on chained assignment.

**Data Cleaning & Transformation**
- Missing values: `df.isnull()`, `df.dropna()`, `df.fillna()`, `df.interpolate()`, forward-fill/back-fill
- String operations: `df['col'].str.lower()`, `.str.contains()`, `.str.extract()`, `.str.replace()`
- Type casting: `astype()`, `pd.to_datetime()`, `pd.to_numeric(errors='coerce')`
- Apply, map, applymap (elementwise): when to use vs vectorized operations (avoid apply in hot paths)
- `pd.cut()`, `pd.qcut()`: binning continuous variables into categories
- Concepts: Vectorized string operations vs `.apply(lambda)` (10–100× slower), Copy-on-Write in pandas 2.x
- **Lab:** Clean messy survey dataset: fix dtypes, handle nulls, standardize strings, parse dates; Build feature transformation pipeline using method chaining

> **Interview Q:** When should you avoid `.apply()` in Pandas?
> **A:** `.apply()` is Python-level loop → slow. Replace with: vectorized string ops for strings, numpy operations for math, `pd.cut`/`pd.qcut` for binning, `.mask()`/`.where()` for conditional ops. Rule: if there's a vectorized Pandas/NumPy method, use it. Only `.apply()` when genuinely no vectorized alternative.

**GroupBy & Aggregation**
- `df.groupby()`: single key, multiple keys, named aggregations (`agg({'col': ['mean','sum','count']})`)
- `transform()` vs `agg()`: transform returns same-size result (good for adding group stats back to original)
- `filter()`: keep only groups matching condition
- Pivot tables: `pd.pivot_table()`, `df.unstack()`, `df.stack()`
- Window functions: `rolling()`, `expanding()`, `ewm()` (exponential weighted)
- Multi-level index (MultiIndex): `xs()`, `swaplevel()`, `droplevel()`
- Concepts: Split-apply-combine paradigm, Group key memory overhead, Named aggregation (`pd.NamedAgg`)
- **Lab:** Revenue trends by customer segment with rolling 30-day mean; User cohort analysis with groupby + transform; Pivot table of model accuracy across hyperparameter combinations

> **Interview Q:** What is the difference between `.agg()` and `.transform()` in groupby?
> **A:** `.agg()` reduces groups to single scalar per group → output has one row per group. `.transform()` maps group statistics back to original index → output same shape as input, useful to add group mean/std back for normalization, z-score per group.

**Merge, Join & Reshape**
- `pd.merge()`: inner, left, right, outer, cross; `on=`, `left_on=`, `right_on=`, `suffixes=`
- `df.join()` (index-based), `pd.concat()` (axis=0 row-stack, axis=1 column-bind)
- `melt()`, `pivot()`, `wide_to_long()`, `explode()`
- Merge validation: `validate='one_to_one'`, `indicator=True` to debug join mismatches
- Concepts: Hash join, Sort-merge join, Broadcast join for small tables
- **Lab:** Join customer, transaction, and product tables into ML feature set; Melt wide sensor data to long format; Detect many-to-many merge issues with `indicator`

> **Interview Q:** How do you optimize a large DataFrame merge?
> **A:** Sort both DataFrames on join key before merge (enables sort-merge). Use `pd.merge` with `sort=False` if already sorted. For very large: use Polars or DuckDB for out-of-core. Index-based merge (`df.set_index('id').join(df2.set_index('id'))`) is faster than merge. Profile with `%timeit`.

**Time-Series with Pandas**
- `DatetimeIndex`: `pd.date_range()`, frequency aliases (B, D, H, T, S), time zones (`tz_localize`, `tz_convert`)
- Resampling: `df.resample('1H').mean()`, `ohlc()`, `ffill()`
- Rolling statistics: `rolling(window='7D')`, `expanding()`, `shift()`, `diff()`
- Time offsets: `pd.DateOffset`, `pd.Timedelta`, business days
- Concepts: Upsampling vs downsampling, Irregular vs regular time series, Leakage via future data
- **Lab:** Resample 1-minute stock prices to daily OHLC; Compute 7-day and 30-day moving averages; Build lag features for ML (t-1, t-7, t-30 days)

> **Interview Q:** How do you prevent data leakage in time-series features?
> **A:** All features for time t must use only data from t-δ (exclusive). Shift all lag features by ≥1 period. Rolling windows: use `min_periods=1`, closed='left' or closed='right' carefully. In train/test split: temporal split — never shuffle time series. Use `sklearn.model_selection.TimeSeriesSplit`.

**Memory Optimization & Large DataFrames**
- `dtype` optimization: `uint8` vs `int64`, `float32` vs `float64`, `pd.CategoricalDtype`
- `pd.read_csv(dtype=...)`, `usecols=[...]` — skip unused columns at load time
- Chunking: `pd.read_csv(chunksize=50000)` → iterate and process per chunk
- Sparse DataFrames: `pd.arrays.SparseArray` for mostly-zero data
- Concepts: Pandas memory model (block storage), Arrow vs NumPy backend, Memory profiling with `memory_profiler`
- **Lab:** Reduce 1GB DataFrame to 200MB with dtype casting; Process 10GB CSV with chunking; Profile memory before/after optimization

> **Interview Q:** How would you process a 100GB CSV file with Pandas?
> **A:** Don't load it all. Options: (1) Chunking with `chunksize`, filter/aggregate each chunk, accumulate results. (2) Convert to Parquet with Spark/Polars first, then use Pandas on partitions. (3) Use Polars (lazy evaluation, out-of-core), DuckDB (SQL on CSV without loading), or Dask (parallel Pandas-compatible API). Best: DuckDB for ad-hoc queries, Polars for transformation pipelines.

**Chapter Project:** ML Feature Engineering Pipeline
- Build a complete feature engineering pipeline on 5M row transaction dataset
- GroupBy aggregations, rolling window features, categorical encoding, missing value imputation
- Tools: `pandas`, `pyarrow`, `sklearn.pipeline`, `optuna`
- Assessment: Pipeline under 60s; zero data leakage; feature importance analysis with SHAP

---

#### Chapter 3: Polars & DuckDB (Modern Data Stack)

**Polars — Faster DataFrame Library**
- Polars vs Pandas: Rust-based, no GIL, lazy evaluation, true parallelism
- Lazy API: `pl.scan_parquet()`, `pl.scan_csv()` → build expression graph → `.collect()` for execution
- Expression API: `pl.col('a').filter(pl.col('b') > 0).alias('c')`
- GroupBy, join, window functions — Polars API syntax differences from Pandas
- Streaming mode: `collect(streaming=True)` for larger-than-RAM datasets
- Concepts: Columnar in-memory (Apache Arrow), Predicate pushdown, Projection pushdown, Parallel scan
- **Lab:** Rewrite Pandas ETL pipeline in Polars — measure speedup (typically 5-20×); Polars lazy query plan inspection; Streaming 10GB Parquet file

> **Interview Q:** When would you choose Polars over Pandas?
> **A:** Polars: 5–20× faster on multi-core, true lazy evaluation (plans before executing), excellent for >1GB DataFrames, consistent API with no `.copy()` gotchas. Pandas: richer ecosystem, mature, better for small datasets and interactive exploration. In production ML pipelines processing GB+ data → Polars. For Jupyter exploration of small data → Pandas.

**DuckDB — In-Process Analytics SQL**
- `duckdb.sql()` — run SQL directly on Pandas/Polars DataFrames, Parquet files, CSV
- OLAP extensions: `QUALIFY`, window functions, nested data (STRUCT, LIST, MAP)
- Reading remote files: S3 Parquet, HTTPS CSV
- Persistent database: `.db` file with read/write
- Concepts: Vectorized execution engine, Columnar query processing, Pushdown into Parquet
- **Lab:** Query 5GB Parquet file with DuckDB SQL in <5s; Join CSV and Parquet without loading to memory; Compute feature statistics with window functions

> **Interview Q:** Why would you use DuckDB instead of Pandas for feature engineering?
> **A:** DuckDB: SQL syntax (familiar), vectorized columnar engine, scans Parquet/CSV directly from disk (no load to memory), runs multi-threaded automatically, handles 100GB+ on laptop. Pandas: requires all data in RAM. DuckDB is a drop-in for Pandas analytics when data > a few GB or when SQL is more natural.

**Dask & Distributed Computing**
- `dask.dataframe`: Pandas-compatible API, partitioned DataFrames, lazy graphs
- `dask.array`: chunked NumPy arrays
- `dask.delayed`: parallelize any Python function
- Dask scheduler: synchronous, threaded, multiprocessing, distributed (Dask Distributed)
- Concepts: Task graph, Partition, Lazy evaluation, Scatter/gather, Worker memory management
- **Lab:** Parallelize 100GB Parquet processing with Dask; Compare Dask vs Polars performance on 10GB groupby

---

#### Chapter 4: Data Visualization for AI/ML

**Matplotlib Fundamentals**
- Figure and Axes architecture: `fig, ax = plt.subplots()`
- Line plots, scatter plots, bar charts, histograms, heatmaps, box plots, violin plots
- Customization: titles, labels, ticks, legends, colors, fonts, `rcParams`
- Multi-panel: `subplot2grid`, `GridSpec`, `tight_layout()`
- Saving: `savefig(dpi=300, bbox_inches='tight')` for publication quality
- Concepts: Backend selection (Agg, TkAgg, inline for Jupyter), Vector vs raster output, Color maps (perceptually uniform: viridis, plasma)
- **Lab:** Training curves with dual y-axes (loss + accuracy); Confusion matrix heatmap; Multi-panel model comparison figure

**Seaborn — Statistical Visualization**
- Distribution plots: `sns.histplot`, `sns.kdeplot`, `sns.ecdfplot`, `sns.rugplot`
- Categorical plots: `sns.boxplot`, `sns.violinplot`, `sns.stripplot`, `sns.swarmplot`, `sns.barplot`
- Relationship plots: `sns.scatterplot`, `sns.lineplot`, `sns.regplot`, `sns.pairplot`
- Matrix plots: `sns.heatmap`, `sns.clustermap`
- FacetGrid: `sns.FacetGrid`, `sns.relplot`, `sns.catplot` for faceted/grouped visualizations
- Concepts: Long-form vs wide-form data for seaborn, Tidy data principle, Confidence intervals in seaborn plots
- **Lab:** Feature correlation heatmap; Distribution of residuals by model; Pairplot of top SHAP features

**Plotly & Interactive Dashboards**
- `plotly.express`: one-line interactive charts (`px.scatter`, `px.line`, `px.bar`, `px.histogram`)
- `plotly.graph_objects`: low-level control, 3D plots, subplots
- Animations: `px.scatter(animation_frame='epoch')` for training progress
- Dash: reactive web dashboards from Python; Callbacks (`@app.callback`), Inputs, Outputs
- Concepts: JSON-based figure representation, WebGL rendering for large datasets, Streaming updates
- **Lab:** Interactive t-SNE/UMAP visualization of embeddings; Live training loss dashboard with Dash; 3D loss surface for optimizer comparison

**ML-Specific Visualizations**
- Learning curves (training vs validation loss over epochs)
- Confusion matrix, ROC curve, Precision-Recall curve
- SHAP summary plots, SHAP force plots, SHAP waterfall plots
- Calibration curves (`sklearn.calibration.calibration_curve`)
- t-SNE and UMAP for high-dimensional embedding visualization
- Attention visualization for Transformer models
- Gradient visualization (saliency maps, GradCAM for CNNs)
- Concepts: Overplotting mitigation (alpha, hexbin, density), Log scale for loss, Normalization for confusion matrices
- **Lab:** End-to-end model evaluation dashboard: confusion matrix + ROC + PR curve + calibration + SHAP for XGBoost classifier

> **Interview Q:** How do you visualize the quality of embeddings?
> **A:** Project to 2D/3D with t-SNE (local structure preserved) or UMAP (preserves global + local). Color by ground-truth label — good embeddings show tight clusters with clear separation. Check overlap between similar classes. For retrieval models: visualize nearest neighbors for a query. Beware t-SNE hyperparameter sensitivity (perplexity 5–50).

**Chapter Project:** Interactive ML Model Dashboard
- Dash app showing: dataset EDA, model training progress, evaluation metrics, SHAP explanations, embedding visualization
- Tools: `plotly`, `dash`, `shap`, `umap-learn`, `pandas`, `sklearn`
- Assessment: Dashboard loads in <3s; all charts interactive; exportable reports

---

**MODULE CHEAT SHEET — NumPy & Pandas**
```python
np.einsum('ij,kj->ik', A, B)         # batched dot product
np.linalg.svd(A, full_matrices=False) # compact SVD
A[mask]                               # boolean indexing

# Pandas
pd.read_parquet('data.parquet')       # columnar, fast
df.groupby('user_id').agg({'spend': ['mean','sum','count']})
df.merge(df2, on='id', how='left')
df['col'].rolling(window=7, min_periods=1).mean()  # 7-day MA
df.query('revenue > 1000 & status == "active"')
df.astype({'col': 'float32'})         # halve memory vs float64
df.loc[mask, 'col'] = value           # safe assignment (no chaining)
df['cat_col'] = df['cat_col'].astype('category')  # save 90% memory

# Polars
import polars as pl
df = pl.scan_parquet('huge.parquet').filter(pl.col('a') > 0).collect()

# DuckDB
import duckdb
duckdb.sql("SELECT col, AVG(val) FROM 'data.parquet' GROUP BY col").df()

# Visualization
fig, ax = plt.subplots(figsize=(10,6))
px.scatter(df, x='tsne_x', y='tsne_y', color='label', hover_data=['text'])
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm')
```

---

## PHASE 3 — MATHEMATICS FOR AI
**Duration:** 5 Weeks
**Goal:** Mathematical intuition behind every AI algorithm

### Module 3.1 — Linear Algebra, Calculus & Probability

---

#### Chapter 1: Linear Algebra for AI

**Vectors, Matrices & Tensors**
- Dot product & cosine similarity, Matrix operations, Tensor algebra, Eigenvalues, SVD, PCA
- Concepts: Column space & null space, Basis & span, Orthogonality & projections, Low-rank approximation
- **Lab:** Scaled dot-product attention (Q, K, V); PCA from scratch with SVD on MNIST; Derive positional encodings

> **Interview Q:** Why does attention scale by sqrt(d_k)?
> **A:** Dot products Q·K^T grow in magnitude with dimension d_k. Large magnitudes push softmax into saturation regions (near-zero gradients). Dividing by sqrt(d_k) normalizes variance back to ~1, keeping gradients healthy. Without scaling, deep transformers fail to train.

---

#### Chapter 2: Calculus & Backpropagation

**Calculus & Backpropagation**
- Partial derivatives & gradient vector, Chain rule, Jacobian & Hessian, Gradient descent variants, Convexity
- Concepts: Vanishing/exploding gradients, Saddle points in high-dim loss landscapes, Gradient clipping
- **Lab:** Implement autograd from scratch; Derive backprop for 2-layer MLP by hand; Visualize 3D loss landscape
- **Frameworks:** `pytorch (autograd)`, `jax`, `sympy`

> **Interview Q:** What is the vanishing gradient problem and how is it solved?
> **A:** In deep networks, gradients are multiplied through many layers. Sigmoid saturates at 0/1 with derivative ~0 → gradients vanish in early layers. Solutions: ReLU, residual connections (skip connections), batch normalization, proper initialization (Xavier/Kaiming).

---

#### Chapter 3: Probability & Statistics

**Probability & Statistics**
- Probability distributions (Gaussian, Bernoulli, Categorical), Bayes' theorem, MLE
- KL divergence & entropy, Hypothesis testing & confidence intervals
- Concepts: Frequentist vs Bayesian, Monte Carlo methods, Calibration
- **Frameworks:** `scipy.stats`, `statsmodels`, `pymc`

> **Interview Q:** What is KL divergence and where is it used in ML?
> **A:** KL(P||Q) = sum(P * log(P/Q)) — measures how much P diverges from Q. Asymmetric. Used in: VAE (reconstruction + KL penalty), RLHF (KL from reference policy prevents reward hacking), knowledge distillation, language model training (cross-entropy = forward KL minimization).

#### Chapter 4: Information Theory

**Entropy, Mutual Information & Divergences**
- Shannon entropy: H(X) = -Σ p(x) log₂ p(x) — uncertainty in a distribution
- Joint entropy H(X,Y), Conditional entropy H(Y|X), Mutual information I(X;Y) = H(X) - H(X|Y)
- Cross-entropy loss = entropy + KL divergence: CE(p,q) = -Σ p(x) log q(x)
- KL divergence: KL(P||Q) — asymmetric, measures P approximated by Q
- Jensen-Shannon divergence: symmetric version of KL, basis of GAN loss
- Perplexity: 2^H(X) — measures how surprised a language model is; lower = better
- Concepts: Maximum entropy principle, Minimum description length (MDL), Channel capacity
- **Lab:** Compute perplexity of GPT-2 vs GPT-4 on same corpus; Feature selection with mutual information (`sklearn.feature_selection.mutual_info_classif`); Derive cross-entropy loss from maximum likelihood
- **Frameworks:** `scipy.stats.entropy`, `sklearn.feature_selection`

> **Interview Q:** Why is cross-entropy used as the loss function for language models?
> **A:** Language modeling = predicting next token = categorical distribution. Cross-entropy = negative log-likelihood of true token under predicted distribution. Minimizing CE = maximizing log P(target|context). CE also equals KL(true||pred) + H(true), but H(true) is constant, so minimizing CE ≡ minimizing KL. Perplexity = 2^CE — interpretable: PP=10 means model is as uncertain as uniform over 10 choices.

**Fourier Analysis**
- Discrete Fourier Transform (DFT), FFT algorithm, Frequency domain representation
- Power spectral density, Filter design (low-pass, high-pass, band-pass)
- Convolution theorem: convolution in time = multiplication in frequency domain
- Applications in ML: Audio features (MFCC = FFT basis), Positional encodings, Convolutional layer analysis
- Concepts: Nyquist-Shannon sampling theorem, Aliasing, Windowing (Hann, Hamming), Phase vs magnitude
- **Lab:** Extract MFCC features for audio classification; Analyze frequency content of time-series anomalies

> **Interview Q:** How are convolutions related to FFT?
> **A:** Convolution theorem: (f * g) = IFFT(FFT(f) · FFT(g)). Large kernel convolution: O(n²) naive → O(n log n) via FFT. CNNs learn frequency filters — early layers learn low-frequency (edges), later layers high-frequency (textures). FlashAttention exploits similar structure.

---

#### Chapter 5: Optimization Theory

**Convex Optimization**
- Convex sets and functions: Jensen's inequality, first/second order conditions
- Constrained optimization: Lagrangian, KKT conditions, duality
- Unconstrained optimization: Gradient descent, Newton's method, L-BFGS
- Stochastic optimization: SGD, Mini-batch SGD, variance reduction (SVRG, SARAH)
- Concepts: Global vs local minima, Saddle points in high-dimensional spaces, Convex relaxation
- **Lab:** Implement L-BFGS from scratch; Solve SVM optimization as quadratic program; Visualize loss landscape of 2-layer MLP

**Adaptive Optimizers**
- Momentum: accumulate gradient history, dampens oscillations
- RMSprop: per-parameter learning rate scaled by gradient variance
- Adam: combines momentum (m) + RMSprop (v), bias correction, AdamW (decoupled weight decay)
- AdaGrad: accumulates squared gradients → vanishing learning rate problem
- Lion, Sophia, Adan: newer optimizers for LLM training
- Learning rate schedules: constant, step decay, cosine annealing, OneCycleLR, warmup
- Concepts: Gradient noise scale, Learning rate warmup (why: Adam m/v estimates unstable early), Decoupled weight decay vs L2
- **Lab:** Compare Adam vs AdamW vs Lion on GPT-2 fine-tuning; Implement cosine annealing with warmup; Learning rate finder (lr_range_test)

> **Interview Q:** Why does AdamW perform better than Adam for LLM training?
> **A:** Adam with L2 regularization: weight decay multiplied by learning rate (adaptive). AdamW: weight decay applied independently of gradient → consistent regularization strength regardless of gradient magnitude. In Adam, parameters with large gradients get small effective weight decay; AdamW fixes this. Better generalization in transformers.

---

#### Chapter 6: Monte Carlo Methods & Numerical Stability

**Monte Carlo Sampling**
- Monte Carlo integration, Importance sampling, Rejection sampling
- Markov Chain Monte Carlo (MCMC): Metropolis-Hastings, Gibbs sampling
- Bootstrap: confidence intervals without distributional assumptions
- Monte Carlo simulation for uncertainty estimation in ML
- Concepts: Law of large numbers, Central limit theorem, Sample efficiency, Variance reduction
- **Lab:** MC estimate of π; Bootstrap confidence intervals for model accuracy; Bayesian linear regression with MCMC (PyMC)

**Numerical Stability**
- Floating-point representation: IEEE 754, machine epsilon, catastrophic cancellation
- Log-sum-exp trick for numerical stability of softmax
- Mixed precision: float32 vs float16 vs bfloat16 — precision tradeoffs
- Gradient clipping: prevents exploding gradients in RNN/Transformer training
- Concepts: Condition number, Backward stability, Kahan summation, Underflow/overflow
- **Lab:** Implement numerically stable softmax; Identify cancellation error in naive attention score computation; Training stability analysis with gradient norm monitoring

> **Interview Q:** What is the log-sum-exp trick and why is it important?
> **A:** softmax(x_i) = exp(x_i) / Σexp(x_j). For large x (common in attention with high temperature), exp overflows float32. Trick: subtract max before exp — log(Σexp(x_i)) = max(x) + log(Σexp(x_i - max(x))). Result is mathematically identical but numerically stable. FlashAttention uses this online to avoid materializing full attention matrix.

**Chapter Project:** Gradient Descent Visualizer & Optimizer Comparison
- Interactive visualizer: SGD, Momentum, RMSprop, Adam on 3D loss surfaces
- All 5 optimizers implemented from scratch (no torch.optim)
- Numerical stability: compare naive softmax vs log-sum-exp trick on large inputs
- Tools: `numpy`, `matplotlib`, `plotly`, `ipywidgets`, `pymc`

---

**MODULE CHEAT SHEET — Math for AI**
```
Attention: softmax(QK^T / √d_k) × V
Cosine sim: a·b / (|a| × |b|)  → range [-1, 1]
Gradient descent: w ← w − η∇L
Adam: m=β1m+(1-β1)g, v=β2v+(1-β2)g², w-=η·m̂/√v̂+ε
Cross-entropy: L = -Σ y_i log(ŷ_i)  → classification
KL divergence: Σ P log(P/Q)  → distribution distance
Bayes: P(θ|D) ∝ P(D|θ) × P(θ)  → posterior
SVD: A = UΣV^T  → LoRA uses low-rank ΔW = A×B
MLE: θ* = argmax Σ log P(xᵢ|θ)
```

---

---

# PILLAR 2 — MODELLING
> Phases 4–7 · ~28 Weeks

---

## PHASE 4 — MACHINE LEARNING
**Duration:** 8 Weeks
**Goal:** Classical ML mastery: supervised, unsupervised, ensemble methods, rigorous evaluation

### Module 4.1 — Supervised, Ensemble & Unsupervised Learning

---

#### Chapter 1: Regression, Classification & Evaluation

**Linear & Logistic Regression**
- OLS, Ridge (L2), Lasso (L1), ElasticNet, Logistic regression & sigmoid, Softmax for multi-class
- Concepts: Bias-variance tradeoff, Overfitting vs underfitting, Feature scaling, Multicollinearity
- **Lab:** Customer churn prediction; Ridge regression for house prices
- **Frameworks:** `scikit-learn`, `statsmodels`

> **Interview Q:** When L1 vs L2 regularization?
> **A:** L1 (Lasso): produces sparse weights → feature selection. L2 (Ridge): shrinks all weights proportionally → handles multicollinearity. ElasticNet combines both. In NLP/high-dim features: L1 for sparsity. In dense tabular: L2 for stability.

**Tree-Based & Ensemble Methods**
- Decision Trees (Gini, entropy, max_depth), Random Forest (bagging)
- XGBoost (boosting), LightGBM (leaf-wise), CatBoost (categorical), SHAP for interpretability
- Concepts: Bagging vs boosting, Feature importance (MDI, SHAP), Early stopping, Out-of-bag score
- **Lab:** Fraud detection with XGBoost + SHAP; Hyperparameter tuning with Optuna
- **Frameworks:** `xgboost`, `lightgbm`, `catboost`, `shap`, `optuna`

> **Interview Q:** How does XGBoost differ from Random Forest?
> **A:** RF: parallel trees via bagging, averages predictions, reduces variance. XGBoost: sequential boosting, each tree corrects residuals of previous ensemble, adds L1/L2 regularization, handles missing values. XGBoost typically more accurate; RF less prone to overfitting.

**Support Vector Machines (SVM)**
- Linear SVM: maximum margin hyperplane, support vectors, soft margin (C parameter)
- Kernel trick: map to higher dimension implicitly — polynomial kernel, RBF kernel, sigmoid kernel
- Kernel function K(x,y) = φ(x)·φ(y) without computing φ explicitly
- SVR (Support Vector Regression): epsilon-insensitive loss
- Multi-class SVM: one-vs-one, one-vs-rest
- Concepts: Margin, Dual formulation (Lagrange multipliers), Mercer's condition for valid kernels, Curse of dimensionality (kernel SVM doesn't suffer as badly)
- **Lab:** Text classification with TF-IDF + linear SVM (often beats neural nets on small data); RBF SVM on non-linearly-separable 2D data; Grid search for C and gamma
- **Frameworks:** `sklearn.svm.SVC`, `sklearn.svm.SVR`, `libsvm`

> **Interview Q:** Why use the kernel trick instead of just transforming the data?
> **A:** Direct feature transformation to d=1000-dimensional space: compute φ(x) is O(d) memory per sample. Kernel trick: K(x,y) = φ(x)·φ(y) computed directly — O(1) per pair. RBF kernel maps to infinite-dimensional Hilbert space — impossible to compute φ explicitly. Training cost: O(n²) to O(n³) in n samples. Still excellent for small datasets (<100K samples), text classification, bioinformatics.

**Naive Bayes Classifiers**
- Bayes theorem: P(y|x) ∝ P(x|y) · P(y)
- Gaussian Naive Bayes: features continuous, assume Gaussian per class
- Multinomial Naive Bayes: count-based features (word counts for text)
- Bernoulli Naive Bayes: binary features (word presence/absence)
- Complement Naive Bayes: better for imbalanced text classification
- Laplace smoothing: add-one smoothing to prevent zero probability
- Concepts: Conditional independence assumption (naive), Log-probability for numerical stability, Prior vs likelihood vs posterior
- **Lab:** Spam filter with Multinomial NB + TF-IDF; Sentiment analysis comparison: NB vs Logistic Regression; Learning curve analysis for NB on small data

> **Interview Q:** When would you choose Naive Bayes over Logistic Regression?
> **A:** NB advantages: works well with small training data (less data to estimate), very fast training O(n·d), handles missing features naturally, good baseline for text. NB disadvantages: conditional independence assumption rarely true → overconfident probabilities. For text classification with <1000 samples: NB often wins. With >10K samples: logistic regression or SVM usually better. NB = excellent fast baseline.

**k-Nearest Neighbors (k-NN)**
- k-NN classification: majority vote of k nearest neighbors by Euclidean, Manhattan, Cosine distance
- k-NN regression: average of k neighbors
- Curse of dimensionality: distance concentration in high-dim (all points become equidistant)
- Data structures: brute force O(nd), KD-tree O(d·n·log(n)) build O(k·d·log(n)) query, Ball tree
- Approximate nearest neighbor (ANN): FAISS, HNSW, ScaNN — sublinear query time
- Concepts: Parametric vs non-parametric methods, Distance functions, Dimension reduction before k-NN (PCA, UMAP)
- **Lab:** Build k-NN from scratch with cosine similarity; Compare exact vs ANN (FAISS IVF-Flat) on 1M embeddings; Feature scaling impact on k-NN performance

> **Interview Q:** Why does k-NN fail in high-dimensional spaces?
> **A:** Concentration of measure: as d→∞, ratio max_dist/min_dist → 1 (all points equidistant). k-NN relies on "nearby" meaning "similar" — this breaks down in >100 dimensions. Solution: reduce dimensionality with PCA/UMAP before k-NN, or use semantic embeddings (which encode similarity in lower-dimensional manifold). Modern vector databases use ANN (HNSW, IVF) to avoid brute-force search.

**Feature Engineering**
- Numerical features: binning (`pd.cut`), log transform (right-skewed), Box-Cox transform, polynomial features, interaction terms
- Categorical features: one-hot encoding, ordinal encoding, target encoding (mean target per category), frequency encoding, binary encoding
- Text features: Bag-of-Words, TF-IDF, n-grams, character n-grams
- Temporal features: hour of day, day of week, month, year, is_weekend, time since event, seasonality
- Interaction features: `PolynomialFeatures`, product of two numeric cols, ratio features
- Missing value strategies: mean/median/mode imputation, model-based imputation (IterativeImputer), indicator column for missingness
- Dimensionality reduction: PCA, TruncatedSVD (for sparse), UMAP, autoencoders
- Feature selection: correlation filter, mutual information, SHAP importance, Recursive Feature Elimination (RFE)
- Concepts: Leakage (using future data, target in features), Data normalization (MinMax vs Standard), Calibrated target encoding
- **Lab:** Build feature pipeline for Kaggle tabular competition: numeric + categorical + temporal features; Detect leakage in feature set; Compare model performance with/without feature engineering

> **Interview Q:** What is target encoding and when can it cause leakage?
> **A:** Target encoding: replace category with mean of target variable. Leakage risk: if you compute mean target from entire dataset including test, you've leaked test labels. Fix: (1) compute target encoding only on training set, apply to test; (2) use k-fold cross-fitting (train-fold mean applied to val-fold); (3) add Gaussian noise or smoothing to reduce overfit. `category_encoders.TargetEncoder` with `smoothing` parameter handles this.

**Time-Series Machine Learning**
- Feature extraction from time series: lag features, rolling statistics, exponential smoothing features
- ARIMA: AR(p) + I(d) + MA(q); Box-Jenkins methodology; `statsmodels.tsa.arima`
- SARIMA: seasonal ARIMA, seasonal differencing
- Prophet: additive model with trend + seasonality + holidays; `prophet` library
- Gradient Boosting on time-series: LightGBM with lag features (winning Kaggle approach)
- DeepAR, N-BEATS, TFT (Temporal Fusion Transformer): neural forecasting models
- Evaluation: MAE, RMSE, MAPE, SMAPE, MASE; Walk-forward validation
- Concepts: Stationarity (ADF test), Autocorrelation (ACF/PACF plots), Seasonality decomposition (STL)
- **Lab:** Demand forecasting with LightGBM + lag features; Prophet on electricity demand with holiday effects; STL decomposition of time-series; Walk-forward backtest

> **Interview Q:** How do you create features for time-series ML models like LightGBM?
> **A:** Lag features: y(t-1), y(t-7), y(t-14), y(t-28) — past values. Rolling stats: rolling mean, std, min, max over 7/14/30 days. Calendar: hour, day_of_week, month, is_holiday. Exponential weighted mean (EWM) with varying alpha. Difference from same period last year (year-over-year). Target encode category-time interactions. Key: ensure all features computable without future data — shift by at least 1 step.

**Unsupervised & Evaluation**
- K-Means: Lloyd's algorithm, elbow method, silhouette score, mini-batch K-Means for scale
- DBSCAN: density-based clustering, noise points, epsilon and min_samples
- HDBSCAN: hierarchical DBSCAN, varying density, cluster persistence
- Gaussian Mixture Models (GMM): soft clustering, EM algorithm, BIC for component selection
- PCA: principal components, explained variance ratio, scree plot
- t-SNE: perplexity, learning rate, non-linear manifold, no distance meaning between clusters
- UMAP: faster than t-SNE, preserves global structure, `n_neighbors`, `min_dist`
- Anomaly detection: IsolationForest, LOF (Local Outlier Factor), OneClassSVM, Autoencoder-based
- Evaluation: Precision, Recall, F1, ROC-AUC, PR-AUC, Cross-validation (stratified, time-series), Calibration
- Class imbalance: SMOTE (synthetic oversampling), class_weight='balanced', threshold tuning
- Concepts: Silhouette score, Davies-Bouldin index, Adjusted Rand Index, Statistical significance tests
- **Lab:** Customer segmentation with HDBSCAN; Anomaly detection on sensor data with IsolationForest; Calibration curve for XGBoost probability outputs

> **Interview Q:** Precision vs recall — when to prioritize each?
> **A:** Precision (TP/(TP+FP)): minimize false positives — when FP is costly (spam filter). Recall (TP/(TP+FN)): minimize false negatives — when FN is costly (cancer screening, fraud detection). PR-AUC better than ROC-AUC for imbalanced datasets.

**AutoML**
- Hyperparameter optimization: Grid search, Random search, Bayesian optimization (Optuna, HyperOpt)
- Neural Architecture Search (NAS): DARTS, ProxylessNAS
- Pipeline optimization: Auto-sklearn, AutoGluon, H2O AutoML, TPOT
- Feature selection automation: Boruta, RFECV
- Concepts: No-free-lunch theorem, Overfitting the optimization process, Multi-fidelity methods (successive halving)
- **Lab:** AutoGluon on tabular Kaggle dataset — beat manual baseline; Optuna study for XGBoost with pruning; Early stopping with successive halving (Hyperband)

> **Interview Q:** When should you use Bayesian optimization over random search?
> **A:** Bayesian optimization (Optuna, HyperOpt): uses surrogate model (Gaussian process or TPE) to model objective vs hyperparameters, samples next trial in region likely to improve. Better than random when: (1) evaluation is expensive (>5 min/trial), (2) fewer than 200 trials budget, (3) hyperparameters have strong interactions. For cheap evals with >500 trials → random search equivalent.

**Chapter Project:** End-to-End ML Pipeline
- Kaggle tabular competition: EDA → feature engineering → XGBoost + SVM ensemble → Optuna tuning → SHAP analysis
- Time-series component: ARIMA baseline vs LightGBM with lag features
- Tools: `sklearn`, `xgboost`, `lightgbm`, `shap`, `optuna`, `statsmodels`, `prophet`
- Assessment: Top 20% Kaggle leaderboard; documented feature importance; model card with limitations

**Chapter Project:** End-to-End ML System: Fraud Detection
- Full pipeline: data ingestion → EDA → feature engineering → XGBoost → SHAP → FastAPI
- Tools: `pandas`, `xgboost`, `shap`, `mlflow`, `fastapi`, `optuna`
- Assessment: AUC-PR > 0.85; FastAPI endpoint responds in <50ms

---

**MODULE CHEAT SHEET — sklearn & Boosting**
```python
Pipeline([('scaler', SS()), ('model', XGB())])  # no leakage
GridSearchCV(pipe, params, cv=StratifiedKFold(5), scoring='roc_auc')
XGBClassifier(n_estimators=500, learning_rate=0.05, subsample=0.8)
shap.TreeExplainer(model).shap_values(X)  # feature attribution
optuna.create_study(direction='maximize').optimize(obj, n_trials=100)
UMAP(n_components=2, metric='cosine').fit_transform(embeddings)
IsolationForest(contamination=0.01).fit_predict(X)  # -1=anomaly
cross_val_score(model, X, y, cv=TimeSeriesSplit())  # no leakage
```

---

## PHASE 5 — DEEP LEARNING
**Duration:** 8 Weeks
**Goal:** PyTorch mastery: tensors, autograd, neural architectures, production training

### Module 5.1 — PyTorch, Neural Networks & Training

---

#### Chapter 1: PyTorch & Neural Architectures

**PyTorch Core**
- Tensor operations & device management, Autograd & computational graph
- Dataset, DataLoader, Sampler, `nn.Module`, `forward()`, `parameters()`
- Optimizers (Adam, AdamW, SGD), LR Schedulers (Cosine, OneCycleLR, WarmupDecay)
- Concepts: Dynamic graphs, In-place ops & autograd, Mixed precision (fp16/bf16), Gradient accumulation
- **Lab:** Custom Dataset for tabular + image; Mixed precision training (30% speedup); Gradient checkpointing
- **Frameworks:** `pytorch`, `pytorch-lightning`, `torchvision`, `timm`

> **Interview Q:** Why AdamW over Adam?
> **A:** Adam's L2 regularization applies weight decay to the gradient update (wrong). AdamW applies weight decay directly to weights: `w = (1-wd)*w - lr*update`. Particularly important for transformers — pure Adam often overfits; AdamW with `wd=0.01–0.1` is standard.

**Architectures & Training Techniques**
- MLP, Activations (ReLU, GELU, SiLU), BatchNorm vs LayerNorm vs RMSNorm
- Dropout, DropPath, Residual connections, Transfer learning, Knowledge distillation
- Concepts: Covariate shift, Dead ReLU problem, Pre-norm vs post-norm transformers, Lottery ticket hypothesis
- **Lab:** ResNet from scratch with ablations; Fine-tune ViT for custom classification; Student-teacher distillation

> **Interview Q:** Why LayerNorm instead of BatchNorm in transformers?
> **A:** BatchNorm normalizes across batch dimension → requires large batch sizes, breaks with batch_size=1, problematic for variable-length sequences. LayerNorm normalizes across feature dimension per sample — works with any batch size. RMSNorm (no mean centering) is even faster — used in Llama.

**Multi-GPU Training**
- Data parallelism: `torch.nn.DataParallel` (deprecated), `DistributedDataParallel` (DDP) — preferred
- DDP: process-per-GPU, gradient synchronization via all-reduce (NCCL), `torchrun` launcher
- Model parallelism: tensor parallelism (split layers across GPUs), pipeline parallelism (split layers sequentially)
- Fully Sharded Data Parallel (FSDP): shard parameters + gradients + optimizer states across GPUs
- DeepSpeed: ZeRO Stage 1/2/3 (partition optimizer states → gradients → parameters), Offload to CPU/NVMe
- Gradient accumulation: simulate larger batch size without extra GPU memory
- Concepts: Collective operations (all-reduce, all-gather, scatter), Gradient buckets, Communication overhead, Effective batch size
- **Lab:** DDP on 2×A100 training ResNet — measure linear scaling; FSDP for LLM fine-tuning (Llama-7B); DeepSpeed ZeRO-3 integration with HuggingFace Trainer
- **Frameworks:** `torch.distributed`, `deepspeed`, `accelerate`, `fairscale`

> **Interview Q:** When do you use FSDP vs DDP for LLM fine-tuning?
> **A:** DDP: each GPU holds full model copy — only works if model fits in one GPU. For 7B model (14GB in float16): need 16GB GPU + optimizer states (56GB with Adam) → doesn't fit on A10G. FSDP ZeRO-3: shards parameters + gradients + optimizer across N GPUs — 7B model on 4×24GB GPUs is feasible. DeepSpeed ZeRO-3 + CPU offload: even 70B on 8×40GB with reduced throughput.

**Model Compression & Efficient Inference**
- Quantization: Post-Training Quantization (PTQ) — INT8, INT4; Quantization-Aware Training (QAT)
- GPTQ: weight quantization with optimal second-order compensation; AWQ: activation-aware weight quantization
- Pruning: unstructured (individual weights), structured (heads, channels, layers)
- Knowledge distillation: teacher-student, hint layers, contrastive distillation
- Speculative decoding: small draft model generates tokens; large model verifies in parallel (3-5× speedup)
- FlashAttention: fused kernel for memory-efficient attention, O(n) memory, faster wall-clock
- Concepts: Quantization error, Perplexity degradation vs compression ratio, Weight vs activation quantization
- **Lab:** Quantize Llama-3-8B with GPTQ 4-bit; Compare perplexity: float16 vs INT8 vs INT4; Implement speculative decoding with Llama 70B + 8B draft
- **Frameworks:** `bitsandbytes`, `auto-gptq`, `autoawq`, `onnxruntime`, `flash-attn`

> **Interview Q:** What is the difference between GPTQ and AWQ quantization?
> **A:** Both are 4-bit weight quantization. GPTQ: uses second-order Hessian info to minimize quantization error per layer, one-shot, requires calibration data. AWQ: activation-aware — observes which weights are most salient (high activation magnitude), protects those weights from quantization. AWQ generally better perplexity at same bit-width. Both outperform naive INT4.

**RNNs, LSTMs & GRUs**
- Vanilla RNN: hidden state h_t = tanh(Wx_t + Uh_{t-1} + b); vanishing gradient over long sequences
- LSTM: cell state c_t (long-term memory) + hidden state h_t; gates: forget, input, output
  - Forget gate: f_t = σ(W_f[h_{t-1}, x_t]) — what to discard from cell state
  - Input gate: i_t = σ(W_i[h_{t-1}, x_t]); candidate: g_t = tanh(W_g[h_{t-1}, x_t])
  - Output gate: o_t = σ(W_o[h_{t-1}, x_t]); h_t = o_t * tanh(c_t)
- GRU: simpler than LSTM (2 gates vs 3), update gate + reset gate, no separate cell state
- Bidirectional RNN/LSTM: forward + backward pass → capture past and future context
- Stacked LSTM: multiple layers, deeper temporal representation
- BPTT (Backpropagation Through Time): unroll RNN through time, compute gradients
- Applications: sequence tagging (NER, POS), language modeling (pre-Transformer), time-series, music generation
- Concepts: Vanishing gradient in vanilla RNN (solved by LSTM gates), Gradient clipping for BPTT, Stateful vs stateless batching, Packed sequences for variable-length inputs (`pack_padded_sequence`)
- **Lab:** LSTM character-level language model from scratch; Stacked BiLSTM for NER; LSTM vs GRU comparison on time-series forecasting; Implement packed sequence batching for variable-length text
- **Frameworks:** `torch.nn.LSTM`, `torch.nn.GRU`, `torchnlp`

> **Interview Q:** How does LSTM solve the vanishing gradient problem of vanilla RNNs?
> **A:** Vanilla RNN: gradient = ∏ W * tanh'(h) — product of many small values → vanishes. LSTM cell state has additive update (c_t = f*c_{t-1} + i*g) — gradient flows through addition, not multiplication. Forget gate ≈1 allows gradient to flow unchanged over many steps. Think of cell state as a "gradient highway." Still limited to ~100-200 steps before Transformers replaced them.

**Generative Models: GANs, VAEs & Diffusion**
- Variational Autoencoder (VAE):
  - Encoder: x → μ, σ² (latent distribution parameters)
  - Reparameterization trick: z = μ + σ * ε, ε ~ N(0,I) (allows backprop through sampling)
  - Decoder: z → x_reconstructed
  - ELBO loss = reconstruction loss + KL(q(z|x)||p(z))
  - β-VAE: β > 1 forces disentangled latent space
  - Applications: data generation, anomaly detection, latent space interpolation, drug discovery
- Generative Adversarial Network (GAN):
  - Generator G: random noise z → fake data
  - Discriminator D: real vs fake binary classifier
  - Min-max game: min_G max_D [log D(x) + log(1 - D(G(z)))]
  - GAN variants: DCGAN (CNN-based), WGAN (Wasserstein distance, stable training), StyleGAN2/3 (face generation), CycleGAN (unpaired image translation), Pix2Pix (paired)
  - Training challenges: mode collapse (G generates limited variety), vanishing gradients in D, non-convergence
  - WGAN fix: Lipschitz constraint (gradient penalty), better convergence
  - Conditional GAN (cGAN): condition G and D on label y
- Diffusion Models:
  - Forward process: gradually add Gaussian noise over T steps (Markov chain)
  - Reverse process: learn to denoise step-by-step with neural network ε_θ
  - DDPM: Denoising Diffusion Probabilistic Models — sampling speed: O(T) = ~1000 steps
  - DDIM: non-Markovian sampling, 10-50 steps (much faster)
  - Guidance: classifier guidance, classifier-free guidance (CFG) — scale trade-offs quality vs diversity
  - Architecture: U-Net with attention + sinusoidal timestep embeddings
  - Applications: image generation (Stable Diffusion), audio (WaveGrad), protein structure (RFDiffusion)
- Concepts: Latent space, Mode collapse, Frechet Inception Distance (FID) for GAN evaluation, CLIP score for text-image alignment, Bits-per-dimension (BPD) for likelihood models
- **Lab:** Train DCGAN on MNIST; Implement VAE for anomaly detection on industrial images; Fine-tune Stable Diffusion with DreamBooth (5 images → personalized model)
- **Frameworks:** `diffusers`, `torchvision.models`, `pytorch-fid`

> **Interview Q:** Why did diffusion models replace GANs for image generation?
> **A:** GANs: training unstable (min-max game can diverge), mode collapse, hard to cover full data distribution. Diffusion: stable training (simple MSE loss on noise prediction), excellent coverage of distribution, supports exact likelihood computation (flow-based variant). Trade-off: diffusion requires 50-1000 denoising steps vs GAN single forward pass — solved by DDIM, consistency models, distillation. Diffusion FID: <2 vs GAN best: ~4.

**Chapter Project:** Image Classifier with Full Training Pipeline
- ResNet50 fine-tuning, mixed precision, GradCAM visualization
- LSTM-based baseline comparison for sequential tabular data
- VAE for anomaly detection on manufacturing quality data
- Tools: `pytorch`, `lightning`, `albumentations`, `mlflow`, `timm`, `diffusers`
- Assessment: Top-1 accuracy >90% on CIFAR-10; Training <5 minutes with mixed precision; VAE anomaly detector AUC > 0.90

---

**MODULE CHEAT SHEET — PyTorch**
```python
x = torch.randn(B, C, H, W, device='cuda', dtype=torch.bfloat16)
with torch.autocast('cuda'): loss = model(x)  # mixed precision
torch.compile(model)   # 2× speedup (PyTorch 2.0+)
model.train() / model.eval()  # toggle BN & Dropout
nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
torch.save({'model': model.state_dict(), 'opt': opt.state_dict()}, 'ckpt.pt')
timm.create_model('vit_base_patch16_224', pretrained=True, num_classes=10)
DataLoader(ds, batch_size=32, num_workers=8, pin_memory=True, persistent_workers=True)
```

---

## PHASE 6 — COMPUTER VISION
**Duration:** 6 Weeks
**Goal:** From pixels to predictions: CNNs, object detection, segmentation, ViT, multimodal

### Module 6.1 — CV Pipeline: Detection to Multimodal

---

#### Chapter 1: OpenCV, CNNs, YOLO & Vision Transformers

**Image Processing & CNNs**
- Color spaces (BGR, RGB, HSV, LAB), Morphological ops, Convolution (kernel, stride, padding)
- Receptive field, Depthwise separable convolutions, Data augmentation (Albumentations)
- Concepts: Spatial hierarchy of features, Feature maps & channels, Global Average Pooling, GradCAM
- **Lab:** Real-time edge detection; GradCAM visualization for EfficientNet; Custom augmentation pipeline
- **Frameworks:** `opencv`, `albumentations`, `timm`, `torchvision`

> **Interview Q:** Conv vs FC layers?
> **A:** Conv uses weight sharing: O(k²×C_in×C_out) parameters regardless of image size. FC has unique weights per connection: O(H×W×C_in×C_out). Conv captures spatial patterns, is translation invariant, vastly fewer parameters. Modern CV: conv backbone + FC head.

**Object Detection & Segmentation**
- YOLO v8/v11 architecture, Anchor-free detection (FCOS, CenterNet)
- IoU, NMS, Soft-NMS, Semantic segmentation (DeepLab), Instance segmentation (Mask R-CNN)
- SAM (Segment Anything), ViT & Swin Transformer, CLIP zero-shot classification
- Concepts: mAP@50, mAP@50:95, Two-stage vs one-stage detectors, Vision-language alignment (CLIP contrastive loss)
- **Lab:** Train YOLOv11 on custom dataset; SAM zero-shot segmentation; CLIP zero-shot classifier for 1000 classes
- **Frameworks:** `ultralytics`, `detectron2`, `segment-anything`, `openclip`

> **Interview Q:** What is Non-Maximum Suppression?
> **A:** NMS removes duplicate bounding boxes: sort by confidence → keep highest → suppress all boxes with IoU > threshold → repeat. Soft-NMS decays scores by IoU instead of hard suppression (better for occluded objects). Standard threshold: 0.45–0.6.

**Video Understanding**
- Video representations: T×H×W×C tensors, frame sampling strategies (uniform, random, dense)
- 2D CNN on frames (ResNet applied per-frame): fast but ignores temporal relations
- 3D CNN: joint spatial-temporal convolutions — C3D, I3D (Inflated 3D ConvNet)
- SlowFast Networks: Slow pathway (spatial detail, low FPS) + Fast pathway (temporal motion, high FPS)
- Video Transformers: TimeSformer (divided space-time attention), ViViT (video ViT), VideoMAE (masked autoencoding)
- Optical flow: dense motion vectors between frames; PWC-Net, RAFT; used for action recognition
- Action recognition datasets: Kinetics-400/700, Something-Something v2, UCF-101
- Video object detection: tracking by detection (SORT, ByteTrack, BoT-SORT), tracking by embedding (DeepSORT)
- Concepts: Temporal stride, Clip vs full video processing, Temporal augmentation (random clip, speed jitter), Temporal consistency
- **Lab:** Action recognition with VideoMAE on UCF-101; Multi-object tracking pipeline with ByteTrack; Extract optical flow features for anomaly detection in factory video
- **Frameworks:** `pytorchvideo`, `ultralytics (tracking)`, `mmaction2`, `raft-pytorch`

> **Interview Q:** What is the SlowFast architecture and why is it effective?
> **A:** Dual pathway: Slow (8 frames/clip, high spatial res) captures appearance; Fast (32 frames/clip, low spatial res) captures motion. Channels: Slow (64) >> Fast (8) — Fast is computationally cheap. Lateral connections fuse information. Outperforms single-pathway models because spatial semantics (objects) and temporal semantics (motion speed) require different resolutions. I3D baseline: 74% Kinetics, SlowFast: 79%+.

**Self-Supervised Computer Vision**
- Contrastive learning: SimCLR — augmented pair of same image → maximize agreement, push apart different images
- Momentum contrast: MoCo — queue of negative samples, momentum-updated encoder
- Bootstrap Your Own Latent (BYOL): no negative samples, uses online + target network, prediction head avoids collapse
- DINO: self-distillation with no labels; Vision Transformer trained with self-supervised on ImageNet; discovers semantic segmentation patches
- MAE (Masked Autoencoder): mask 75% of image patches → reconstruct pixel values; ViT encoder + lightweight decoder
- DINOv2: improved DINO with curated data curation; features transfer to dense prediction without fine-tuning
- Applications: Pre-train on unlabeled data, then fine-tune with few labels; Medical imaging (scarce labels)
- Concepts: Augmentation invariance, Representation collapse prevention, Linear probe vs full fine-tuning evaluation
- **Lab:** Fine-tune DINOv2 features with linear probe on 1% of ImageNet; Train SimCLR on custom unlabeled dataset; k-NN evaluation of learned representations
- **Frameworks:** `dino`, `mae`, `vissl`, `lightly`

> **Interview Q:** How does DINO learn without any labels?
> **A:** Teacher-student distillation. Two identical ViT networks: student (updated by gradient) + teacher (exponential moving average of student). Same image → different crops → student and teacher should produce same output distribution. Cross-entropy between student/teacher outputs (with teacher softmax temperature). No negative pairs needed. Teacher is more stable than student — targets are "soft" pseudo-labels. The attention maps in final layer discover objects without any supervision.

**Generative Computer Vision**
- Stable Diffusion architecture: CLIP text encoder → UNet denoiser → VAE decoder
- Latent diffusion: operate in compressed latent space (4× downsampled), not pixel space
- ControlNet: add spatial conditioning (depth, edges, pose) to Stable Diffusion with zero-conv layers
- IP-Adapter: image prompt adapter for style transfer and composition
- DreamBooth: fine-tune diffusion with 3-5 subject images + "regularization" images
- LoRA for diffusion: low-rank adaptation of UNet attention weights
- Inpainting & outpainting: mask-conditioned generation
- Image-to-image (img2img): strength parameter controls how much noise to add before denoising
- Evaluation: FID (Fréchet Inception Distance), CLIP score, LPIPS, SSIM
- Concepts: CFG (classifier-free guidance scale), Negative prompt, SDXL turbo / LCM / consistency models (1-4 step)
- **Lab:** ControlNet depth-conditioned generation; DreamBooth fine-tune on 5 product photos; IP-Adapter style transfer; Deploy with FastAPI + diffusers
- **Frameworks:** `diffusers`, `controlnet`, `ip-adapter`, `kohya-ss`

**Depth Estimation & 3D Vision**
- Monocular depth estimation: MiDaS, DPT, Depth Anything v2
- Stereo depth: disparity map, structured light (RealSense)
- NeRF (Neural Radiance Fields): implicit 3D scene representation, novel view synthesis
- 3D Gaussian Splatting: faster NeRF alternative, explicit Gaussians
- Point cloud processing: PointNet, PointNet++, Open3D
- Concepts: Intrinsic/extrinsic camera parameters, Epipolar geometry, SfM (Structure from Motion), SLAM
- **Lab:** Depth Anything v2 monocular depth for robot navigation; Simple NeRF training on 30-image turntable dataset

**Chapter Project:** Real-Time Traffic Detection & OCR System
- YOLOv11 vehicles + ByteTrack tracking + PaddleOCR license plates
- VideoMAE action recognition for traffic violation detection
- Tools: `ultralytics`, `bytetrack`, `paddleocr`, `fastapi`, `streamlit`, `pytorchvideo`
- Assessment: >20 FPS; mAP@50 > 0.80; OCR accuracy >85%

---

## PHASE 7 — NATURAL LANGUAGE PROCESSING
**Duration:** 6 Weeks
**Goal:** Text as tensors: from tokenization to transformer fine-tuning and production NLP

### Module 7.1 — Text Processing, Embeddings & Transformers

---

#### Chapter 1: Tokenization, Embeddings & Transformer Architecture

**Tokenization & Text Processing**
- BPE (Byte-Pair Encoding), WordPiece & SentencePiece, Vocabulary & OOV handling
- Text normalization (unicode, lowercasing), spaCy pipeline (tokenizer, NER, POS, DEP)
- Concepts: Subword tokenization rationale, Special tokens ([CLS], [SEP], [PAD]), Attention masking, Context window limits
- **Lab:** Tokenize code with CodeBERT tokenizer; Train custom BPE tokenizer; Build NER pipeline with spaCy
- **Frameworks:** `spacy`, `nltk`, `tokenizers (HuggingFace)`

> **Interview Q:** Why BPE over word-level tokenization?
> **A:** Word tokenization: infinite vocabulary (new words → OOV). BPE: bounded vocabulary (50K typical), rare/new words decomposed into known subwords ('tokenization' → 'token', '##ization'). No OOV. Language-agnostic. Code: 'calculate_distance' → 'calculate', '_', 'distance' — meaningful decomposition.

**Transformer Architecture & Fine-tuning**
- Self-attention (Q, K, V), Multi-head attention, Positional encoding (sinusoidal, RoPE, ALiBi)
- Encoder-only (BERT), Decoder-only (GPT), Encoder-decoder (T5, BART), KV cache, Flash Attention 2
- Concepts: O(n²) attention complexity, Causal masking, Cross-attention, Mixture of Experts (MoE)
- **Lab:** Self-attention from scratch; Fine-tune BERT for QA with Trainer API; Measure KV cache memory savings
- **Frameworks:** `transformers`, `peft`, `trl`, `sentence-transformers`

> **Interview Q:** What is KV cache and why is it crucial for inference?
> **A:** Without KV cache: recompute K,V for all past tokens per step → O(n²) total compute. With KV cache: store K,V per layer for past tokens → O(n) per step. 10× faster for 512-token sequences. Trade-off: GPU memory increases linearly with sequence length × layers × heads.

---

#### Chapter 2: Named Entity Recognition & Information Extraction

**NER Deep Dive**
- NER task: classify each token as entity type (PER, ORG, LOC, DATE, MISC, custom)
- Annotation schemes: IOB (Inside-Outside-Beginning), BIOES (adds End, Single)
- BERT-based NER: token classification head over [CLS]...[SEP] outputs; handle subword tokenization
- CRF layer: Conditional Random Field captures transition probabilities between labels (improves boundary detection)
- Nested NER: entities within entities (e.g., "Bank of New York" inside "Bank of New York Mellon")
- Zero-shot NER: GLiNER, UniversalNER — generalize to unseen entity types
- Domain-specific NER: medical (BERT-based BioBERT, clinical notes), legal, financial
- Concepts: Subword alignment (wordpiece splits "London" → "London", handles in NER by taking first subword label), Class imbalance (mostly 'O' tokens), CoNLL-2003 benchmark
- **Lab:** Fine-tune BERT-NER on custom entity schema; CRF-BiLSTM from scratch; Medical NER with BioBERT; Zero-shot NER with GLiNER
- **Frameworks:** `spacy`, `seqeval`, `transformers`, `gliner`

> **Interview Q:** How do you handle subword tokenization in BERT-based NER?
> **A:** BERT tokenizes "New York" → ["New", "York"]. Prediction: only the first subword's label counts; subsequent subwords get "X" or are ignored in loss/eval. Alignment strategy: map token predictions back to original words using `word_ids()` from HuggingFace tokenizer — take first subword prediction per word. Evaluation uses `seqeval` on word-level labels.

**Relation Extraction**
- Task: extract (subject, relation, object) triples from text — "Elon Musk [founded] Tesla"
- Approaches: pipeline (NER first, then RE), joint (end-to-end)
- BERT for RE: concatenate entity markers [E1] entity [/E1] ... [E2] entity [/E2], classify relation
- Distant supervision: align knowledge base triples with text (Freebase + Wikipedia → training data)
- OpenIE: open-domain relation extraction (no predefined schema)
- Knowledge graph construction pipeline: NER → RE → Coreference resolution → Entity linking → KG storage
- Concepts: Coreference resolution (pronouns → entities), Entity linking (mention → KB entity), Schema-based vs open extraction
- **Lab:** RE pipeline on news articles; Build company knowledge graph from earnings call transcripts; Entity linking to Wikidata

---

#### Chapter 3: Text Classification & Sentiment Analysis

**Text Classification Architecture**
- Feature-based: TF-IDF + logistic regression (strong baseline, <1K samples)
- CNN for text: 1D convolution on word embeddings, max-over-time pooling (TextCNN)
- LSTM/BiLSTM: sequential, captures position; good for short-medium text
- BERT fine-tuning: [CLS] token → classification head; best accuracy, heavier
- Multi-label vs multi-class: sigmoid (multi-label, outputs independent probabilities) vs softmax (multi-class, mutually exclusive)
- Hierarchical classification: classify at high level then sub-level (news taxonomy)
- Data augmentation: back-translation, synonym replacement, EDA (Easy Data Augmentation)
- Concepts: Imbalanced classes (weighted loss, oversampling), Threshold tuning for multi-label, Label smoothing
- **Lab:** Twitter sentiment fine-tuned on DistilBERT; Product category multi-label classification; Few-shot classification with SetFit (Sentence Transformer + logistic regression on few examples)

> **Interview Q:** When would you use a fine-tuned BERT vs TF-IDF + logistic regression for classification?
> **A:** TF-IDF + LR: <5s training, interpretable, excellent on keyword-heavy tasks, <1000 samples. BERT: needs >1000 samples to beat TF-IDF (for short text), requires GPU, black-box. Use TF-IDF baseline first — if it reaches 85%+ F1, BERT likely adds only 2-5%. Use BERT when: semantic understanding needed, long context, cross-lingual, or benchmark accuracy critical. SetFit: BERT-quality with 8-16 examples per class.

**Sentiment Analysis**
- Polarity classification: positive/negative/neutral (sentence-level, aspect-level)
- Aspect-Based Sentiment Analysis (ABSA): extract (aspect, sentiment) pairs — "The food was great but service was slow"
- Emotion detection: joy, anger, fear, sadness, surprise, disgust (multi-label or multi-class)
- Lexicon-based approaches: VADER, SentiWordNet — no training needed, rule-based
- Concepts: Negation handling ("not good"), Sarcasm detection, Multilingual sentiment (mBERT, XLM-R)
- **Lab:** Aspect-based sentiment on restaurant reviews with InstructABSA; Multilingual sentiment with XLM-RoBERTa; Real-time Twitter sentiment dashboard

---

#### Chapter 4: Machine Translation & Cross-Lingual NLP

**Neural Machine Translation**
- Seq2Seq with attention: encoder LSTM → attention mechanism → decoder LSTM
- Transformer MT: encoder-decoder architecture, cross-attention connects encoder to decoder
- BLEU score: n-gram precision with brevity penalty (0–1); standard MT evaluation
- Beam search: keep top-B hypotheses at each decoding step; greedy search is beam=1
- Modern models: MarianMT (HuggingFace), NLLB-200 (200 languages, Meta), M2M-100, mBART
- Back-translation: translate monolingual target data to source → augment parallel training data
- Low-resource MT: pivot languages, multilingual models, transfer learning from high-resource
- Concepts: Teacher forcing, Exposure bias (gap between train/inference), Coverage penalty, Length penalty
- **Lab:** Fine-tune MarianMT for English-Arabic technical domain; BLEU evaluation pipeline; Multilingual NLLB-200 for low-resource translation

> **Interview Q:** What is beam search and why not always use large beam size?
> **A:** Beam search: at each step, keep top-k token sequences. Beam=1 = greedy (fastest but suboptimal). Beam=5: usually optimal for quality/speed. Larger beam: more candidates, marginally better BLEU, but O(beam) slower. Also: very large beam can degrade quality ("length curse" — longer sequences dominate). Nucleus sampling (top-p) better for open-ended generation; beam search for factual/structured output.

**Cross-Lingual NLP**
- Multilingual models: mBERT (104 languages), XLM-RoBERTa (100 languages, 2.5TB training data)
- Zero-shot cross-lingual transfer: fine-tune on English, evaluate on other languages
- Cross-lingual sentence embeddings: LaBSE (Language-agnostic BERT Sentence Embeddings), multilingual E5
- Translation-based approaches: translate everything to English, run English model
- Code-switching: mixed language text (common in social media)
- Concepts: Language-neutral representations, Alignment in multilingual space, Language tag tokens
- **Lab:** Zero-shot Arabic NER with XLM-R fine-tuned on English CoNLL; Cross-lingual semantic search with LaBSE; Compare translate-first vs multilingual-model approaches

---

#### Chapter 5: Text Summarization

**Extractive Summarization**
- Select most important sentences/phrases from document
- Graph-based: TextRank (PageRank on sentence similarity graph), LexRank
- ML-based: sentence scoring with classifier, then selection with diversity constraint (MMR — Maximal Marginal Relevance)
- **Lab:** News article summarization with TextRank; Legal document section extraction

**Abstractive Summarization**
- Seq2Seq with attention (pointer networks for copying rare words)
- T5: "summarize: {text}" → fine-tuned on CNN/DailyMail, XSum
- BART: denoising pretraining (corrupted input → reconstructed text), strong for summarization
- Pegasus: gap-sentence generation pretraining — masked complete sentences, learns to reconstruct
- Long document summarization: BigBird/Longformer for >512 tokens, hierarchical summarization, chunked approach
- Factual consistency: models hallucinate — entity-level consistency check, FactCC evaluation
- ROUGE evaluation: ROUGE-1 (unigrams), ROUGE-2 (bigrams), ROUGE-L (LCS)
- Concepts: Abstractive vs extractive continuum, Faithfulness vs abstractness, Multi-document summarization
- **Lab:** Fine-tune BART on scientific paper → abstract; Long legal document summarization with hierarchical approach; Factual consistency scoring with AlignScore
- **Frameworks:** `transformers`, `rouge-score`, `alignscore`

> **Interview Q:** How do you evaluate whether a summary is factually consistent?
> **A:** ROUGE measures n-gram overlap — doesn't detect hallucinations. Factual consistency: (1) AlignScore: natural language inference model checks if summary sentence is entailed by source. (2) QA-based: generate questions from summary → answer from source → match. (3) Entity overlap: check named entities in summary appear in source. (4) LLM judge: ask GPT-4 to rate consistency 1-5. Combine multiple signals.

**Chapter Project:** Domain QA System with Fine-tuned BERT
- Fine-tune BERT on domain Q&A, build RAG QA pipeline, deploy with FastAPI
- NER pipeline for entity extraction from responses
- Summarization of retrieved documents before LLM generation
- Tools: `transformers`, `peft`, `faiss`, `fastapi`, `rouge-score`
- Assessment: EM > 60% and F1 > 75%; RAGAS faithfulness score > 0.85; Summary ROUGE-L > 0.40

---

**MODULE CHEAT SHEET — NLP & Transformers**
```python
AutoTokenizer.from_pretrained('bert-base-uncased')
AutoModelForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)
trainer = Trainer(model, args, train_dataset, eval_dataset, compute_metrics)
SentenceTransformer('all-MiniLM-L6-v2').encode(sentences, batch_size=64)
pipeline('ner', model='dslim/bert-base-NER')  # fast NER inference
tokenizer(text, max_length=512, truncation=True, return_tensors='pt')
outputs.last_hidden_state[:,0,:]  # [CLS] embedding for classification
LoRA config: r=16, alpha=32, target=['q_proj', 'v_proj']  # efficient FT
```

---

---

# PILLAR 3 — GENERATIVE AI
> Phases 8–9 · ~12 Weeks

---

## PHASE 8 — GENERATIVE AI
**Duration:** 6 Weeks
**Goal:** Prompt engineering, context engineering, fine-tuning LLMs, high-throughput inference

### Module 8.1 — LLM Engineering: Prompting to Fine-Tuning to Serving

---

#### Chapter 1: Prompt & Context Engineering

**Prompt Engineering Techniques**
- Zero-shot, few-shot, one-shot, Chain-of-Thought (CoT) & Tree-of-Thoughts (ToT)
- Structured output (JSON mode, function calling), System prompts & personas, ReAct prompting
- Constitutional prompting, Adversarial prompting & defense
- Concepts: Temperature & top-p sampling, Logit bias & token constraints, Prompt injection, Jailbreak patterns
- **Lab:** Build prompt template library with Jinja2; CoT for multi-step math reasoning (+30% acc); Function calling for structured data extraction
- **Frameworks:** `openai sdk`, `anthropic sdk`, `instructor`, `guidance`

> **Interview Q:** When does Chain-of-Thought NOT help?
> **A:** CoT helps: multi-step arithmetic, logical reasoning, code generation, planning. CoT hurts: simple factual retrieval (adding steps adds noise), classification (direct answer better). Also: small models (<7B) often fail to follow CoT structure.

---

#### Chapter 2: Fine-Tuning & PEFT

**Fine-Tuning & PEFT**
- SFT (Supervised Fine-Tuning), LoRA & QLoRA theory and practice
- PEFT library (LoRA, IA³, prefix tuning), DPO (Direct Preference Optimization)
- Unsloth 2× faster training, Quantization (GPTQ, GGUF, AWQ, BitsAndBytes)
- vLLM (PagedAttention, continuous batching), Ollama for local inference
- Concepts: RLHF pipeline, Instruction tuning vs chat fine-tuning, Catastrophic forgetting, Merge & unload adapters
- **Lab:** QLoRA fine-tune Llama 3.1 8B on domain data; Deploy quantized model with vLLM; Benchmark full FT vs LoRA vs QLoRA
- **Frameworks:** `peft`, `trl`, `unsloth`, `vllm`, `ollama`, `bitsandbytes`

> **Interview Q:** Explain LoRA mathematically.
> **A:** Full fine-tuning: update W (d×d = d² params). LoRA: freeze W, learn ΔW = A×B where A∈(d×r), B∈(r×d), rank r << d. Parameters: 2dr vs d². For GPT-3 (d=12288, r=16): 393K vs 150M. After training: merge W' = W + BA (no inference overhead). r=8–64 typically recovers 90–98% of full FT quality.

---

#### Chapter 3: LLM Architecture Families

**Open-Source LLM Landscape**
- Llama 3.x family (Meta): 8B, 70B, 405B; RoPE positional encoding, GQA (Grouped Query Attention), SwiGLU activation, RMSNorm
- Mistral family: Mistral 7B (sliding window attention), Mixtral 8×7B (Sparse MoE), Mistral Nemo 12B
- Gemma family (Google): Gemma 2B/7B/9B/27B; Knowledge distillation from Gemini, multi-query attention
- Phi-3 family (Microsoft): Phi-3-mini (3.8B), Phi-3-small (7B), Phi-3-medium (14B); trained on high-quality synthetic data
- Qwen family (Alibaba): Qwen2.5 7B/14B/32B/72B; strong code and multilingual, 128K context
- DeepSeek family: DeepSeek-V3, DeepSeek-R1 (reasoning model); MLA (Multi-head Latent Attention) for KV cache compression
- Command R / R+ (Cohere): optimized for RAG and tool use
- Model card analysis: training data, context length, license (Apache-2.0 vs Llama license vs MIT)
- Concepts: GQA vs MHA vs MQA (tradeoff: memory vs quality), SwiGLU vs GELU activation (SwiGLU: gated, better loss), RoPE vs ALiBi (context length extrapolation)
- **Lab:** Side-by-side benchmark: Llama 3.1 8B vs Mistral 7B vs Phi-3-mini on domain tasks; Analyze model card for compliance; Local serving with Ollama

> **Interview Q:** What is Grouped Query Attention (GQA) and why does it matter?
> **A:** MHA: each head has own K,V — H×d_kv KV cache per layer. MQA: all heads share single K,V — 1×d_kv. GQA: G groups, each with one K,V shared by H/G heads. GQA trades off: between MHA quality and MQA memory efficiency. Llama-3 uses GQA with G=8 heads per KV group. For 70B model: MHA KV cache 80 heads = 40GB for 32K context; GQA (G=8) = 5GB.

**Multi-Modal LLMs**
- Vision-Language Models: GPT-4V, Claude 3, LLaVA, InternVL, Qwen-VL, PaliGemma
- Architecture: vision encoder (CLIP ViT) + projection layer (MLP/Perceiver) + LLM decoder
- Visual tokens: patchify image (e.g., 14×14 patches → 256 tokens), add to text token sequence
- Image understanding tasks: OCR, visual QA, document understanding, chart analysis
- Video-language models: Video-LLaVA, InternVideo2, Gemini 1.5 Pro (1M context, video)
- Audio models: Whisper (ASR), AudioPaLM, Gemini 1.5 (native audio)
- Medical multi-modal: LLaVA-Med, BiomedGPT
- Concepts: Token budget for images (high-res = many tokens), Visual grounding, Cross-modal alignment, Hallucination in VLMs (object existence errors)
- **Lab:** LLaVA for invoice data extraction (image → structured JSON); InternVL for chart QA; Benchmark VLM hallucination with POPE metric; Build multi-modal RAG (images + text)
- **Frameworks:** `transformers`, `lmdeploy`, `SGLang`

> **Interview Q:** How does LLaVA connect a vision encoder to an LLM?
> **A:** CLIP vision encoder (ViT-L) → 256 patch embeddings (768 dim). Linear projection: 768 → 4096 (LLM embed dim). Concatenate projected visual tokens with text tokens → standard causal LM forward pass. Training: freeze CLIP + LLM, train only projection (Stage 1: align vision-language). Then fine-tune projection + LLM on instruction data (Stage 2). LLaVA-1.5 adds MLP projection and higher-res support.

**RLHF, DPO & Alignment**
- RLHF pipeline: SFT → Reward Model → PPO fine-tuning
  - Step 1: Supervised Fine-Tuning (SFT) on curated instruction data
  - Step 2: Reward Model (RM): Bradley-Terry model trained on human preference pairs; RM(y_win) - RM(y_lose) → sigmoid loss
  - Step 3: PPO (Proximal Policy Optimization): maximize expected RM score while KL-penalizing from SFT policy
  - KL penalty: prevents model from exploiting RM (reward hacking)
- DPO (Direct Preference Optimization): closed-form solution to RLHF; directly optimizes preference pairs without RM
  - DPO loss = -E[log σ(β(log π_θ(y_w)/π_ref(y_w) - log π_θ(y_l)/π_ref(y_l)))]
  - No separate RM, no PPO; simpler, more stable, competitive quality
- IPO (Identity Preference Optimization): regularization variant of DPO; prevents overfitting to hard preferences
- KTO (Kahneman-Tversky Optimization): uses non-paired preferences (good/bad, no need for pairs)
- ORPO (Odds Ratio Preference Optimization): single-stage SFT + alignment; no reference model needed
- SimPO (Simple Preference Optimization): removes reference model dependency, better length normalization
- Constitutional AI: Claude's approach — AI feedback (critique + revision) + RL from AI Feedback (RLAIF)
- Concepts: Reward hacking, Distribution shift, Alignment tax (RLHF may reduce capabilities), Human vs AI feedback
- **Lab:** Full DPO pipeline on Llama 3 with TRL DPOTrainer; Compare SFT vs DPO vs ORPO responses; Reward model training on preference dataset (TRL RewardTrainer)
- **Frameworks:** `trl`, `peft`, `axolotl`, `unsloth`

> **Interview Q:** Why does DPO not need a reward model?
> **A:** RLHF: train RM → use RM as reward signal in PPO. Two-stage, unstable PPO training, separate RM. DPO insight: the optimal policy under RLHF objective has a closed-form relationship to the reference policy — don't need explicit RM. DPO directly defines a loss over preference pairs using the ratio of policy logprobs. β controls KL from reference: high β = stay close to SFT, low β = more aligned. Simpler, no RL loop, less GPU memory.

**Mixture of Experts (MoE)**
- MoE architecture: replace FFN layer with N expert FFN layers; router selects top-k experts per token
- Router: linear layer → softmax over N experts → select top-k; load balancing loss to prevent expert collapse
- Sparse MoE: only k (typically 2) of N experts active per token → similar FLOPs to dense but more parameters
- Switch Transformer: k=1 (single expert), better load balance with capacity factor
- Mixtral 8×7B: 8 experts, k=2; 46.7B total params but 12.9B active per token — speed of 13B, quality of 70B
- DeepSeek-V3: 256 experts, k=8; fine-grained MoE with shared experts
- Concepts: Expert collapse, Load imbalance, Auxiliary balancing loss, Expert routing patterns, Communication overhead in distributed MoE
- **Lab:** Analyze Mixtral 8×7B expert routing patterns with visualization; Compare throughput: dense 13B vs Mixtral 8×7B on same hardware; Load balancing loss impact on MoE training

> **Interview Q:** What is the main challenge in training MoE models?
> **A:** Expert collapse: router over-favors few experts → unbalanced compute, wasted parameters. Fix: auxiliary load balancing loss penalizes imbalanced routing — L_balance = α × Σ f_i × P_i (fraction of tokens routed to expert × router probability). Jitter noise during training prevents deterministic routing collapse. Capacity factor: each expert processes at most C × T/N tokens per batch — overflow tokens skip expert (dropped).

**LLM Evaluation Benchmarks**
- MMLU (Massive Multitask Language Understanding): 57 subjects, 4-choice; tests knowledge breadth
- HumanEval: 164 Python coding problems; pass@k metric
- GSM8K: 8500 grade school math problems; tests multi-step arithmetic reasoning
- MATH: harder math (AMC, AIME level); tests symbolic manipulation
- HellaSwag: commonsense NLI, completing scenarios plausibly
- TruthfulQA: tests factual truthfulness vs confident incorrect answers
- ARC (AI2 Reasoning Challenge): Easy + Challenge science questions
- WinoGrande: Winograd schema, commonsense coreference
- MT-Bench: 80 multi-turn conversation questions; GPT-4 judged
- Arena (Chatbot Arena / LMSYS): human preference ELO ratings via blind A/B testing
- BigBench Hard: harder subset of BigBench, requires multi-step reasoning
- GPQA: Graduate-level questions that stump Google searches
- SWE-bench: real GitHub issues requiring code fixes; tests software engineering ability
- Concepts: Multiple-choice accuracy vs generation quality, Contamination (test data in pretraining), Self-reported vs third-party benchmarks, ELO rating system
- **Lab:** Evaluate fine-tuned model on GSM8K and HumanEval; Set up LMEval Harness for reproducible benchmarking; Compare MMLU scores before/after RLHF alignment
- **Frameworks:** `lm-evaluation-harness`, `evalplus`, `deepeval`, `inspect-ai`

> **Interview Q:** What is the contamination problem in LLM benchmarks?
> **A:** Modern LLMs train on massive web scrapes — test sets from MMLU, GSM8K, HumanEval may appear in pretraining data. Contaminated models score higher without truly understanding. Mitigation: (1) use newer test sets not in training, (2) contamination analysis (N-gram overlap with training data), (3) held-out private test sets (GPQA Diamond), (4) measure on post-cutoff data. OpenAI uses decontamination during training.

**Speculative Decoding**
- Bottleneck: autoregressive decoding is memory-bandwidth bound (GPU waits on KV cache loads, not FLOPs)
- Speculative decoding: small draft model generates K tokens fast → large target model verifies all K in parallel (one forward pass)
- Acceptance criterion: if draft_token matches target distribution probabilistically → accept; else reject and sample from target
- Speedup: 2-5× wall-clock without quality loss; optimal when draft and target agree often
- Draft models: same architecture smaller size (Llama 3 70B + Llama 3 8B draft), or Medusa heads (parallel FFN heads on base model)
- Speculative decoding variants: Medusa (multiple prediction heads), Eagle (auto-regressive draft heads), SambaNova speculative streaming
- Concepts: Token acceptance rate, Memory-bandwidth bottleneck vs compute bottleneck, Batch size interaction (large batch → compute-bound → less benefit)
- **Lab:** Implement speculative decoding with Llama 70B + 8B draft; Measure token acceptance rate vs speedup tradeoff; Medusa heads fine-tuning

> **Interview Q:** Why does speculative decoding maintain exact quality?
> **A:** The acceptance criterion uses rejection sampling to ensure output tokens come from the exact target model distribution. For each draft token: compute P_target(x) and P_draft(x). Accept with probability min(1, P_target/P_draft). If rejected: sample from corrected distribution (P_target - P_draft)_+. Expected output is identical to sequential target sampling. Only speedup, no quality degradation — unlike approximate methods.

**Chapter Project:** Domain-Specific Fine-Tuned LLM + Serving API
- QLoRA fine-tune Llama 3.1 8B on legal/medical/code dataset → quantize → vLLM deploy
- DPO alignment training on human preference data
- Benchmark against base model on GSM8K and domain-specific eval
- Tools: `unsloth`, `trl`, `vllm`, `peft`, `openai sdk`, `lm-evaluation-harness`
- Assessment: Domain BLEU/ROUGE >0.65 (vs base 0.40); >100 tokens/sec on A10 GPU; DPO improves preference rate by 15%+

---

**MODULE CHEAT SHEET — Generative AI**
```python
LoraConfig(r=16, lora_alpha=32, target_modules=['q_proj','v_proj'])
BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16)
SFTTrainer(model, dataset, peft_config=lora_cfg, max_seq_length=2048)
model.merge_and_unload()  # fuse LoRA weights into base model
# vllm serve meta-llama/Llama-3.1-8B-Instruct --dtype bfloat16 --port 8000
# ollama run llama3.1:8b  # local inference (CPU/GPU auto)
Temperature=0.0  # deterministic | top_p=0.9 = diverse
instructor.from_openai(client).chat.completions.create(response_model=MyModel)
```

---

## PHASE 9 — RAG ENGINEERING
**Duration:** 6 Weeks
**Goal:** Production RAG: chunking strategies, vector DBs, hybrid search, GraphRAG, evaluation

### Module 9.1 — RAG Pipeline: Ingest to Evaluate

---

#### Chapter 1: Embeddings, Chunking, Vector DBs & Advanced RAG

**Embeddings & Vector Databases**
- Embedding models (text-embedding-3-large, BGE-M3, E5-mistral)
- Chunking: fixed, semantic, recursive, hierarchical, late chunking; Chunk size & overlap tuning
- Vector DB: Qdrant, Pinecone, Weaviate, Chroma, pgvector; HNSW indexing; IVF+PQ quantization
- Metadata filtering & hybrid collections, Multi-vector retrieval (ColBERT late interaction)
- **Lab:** Ingest 500-page PDF with hierarchical chunking; Benchmark Qdrant vs pgvector at 1M vectors
- **Frameworks:** `qdrant-client`, `pinecone`, `llama-index`, `langchain`

> **Interview Q:** What chunking strategy for legal contracts?
> **A:** Hierarchical: Document → Section → Clause → Paragraph. Preserve structure with parent-child retrieval (store small chunks for retrieval, large chunks for context). Use 512-1024 token chunks. Add rich metadata: document type, date, party names, section number, clause references.

**Advanced RAG & Evaluation**
- Hybrid search (dense + BM25, RRF fusion), Reranking (Cohere Rerank, BGE-Reranker, FlashRank)
- HyDE (Hypothetical Document Embeddings), Query rewriting & decomposition
- GraphRAG (knowledge graph + community summaries), Agentic RAG, RAPTOR (recursive tree summarization)
- RAGAS evaluation (faithfulness, relevance, recall)
- Concepts: Reciprocal Rank Fusion (RRF), Late interaction (ColBERT), Semantic caching (GPTCache), Multi-hop reasoning
- **Lab:** Hybrid search with BM25 + Qdrant + RRF; GraphRAG on company knowledge base; Full RAGAS eval pipeline
- **Frameworks:** `langchain`, `llama-index`, `haystack`, `ragas`, `graphrag`

> **Interview Q:** Why hybrid search beats pure vector search?
> **A:** Dense vectors: good at semantic similarity, poor at exact keyword/entity matches (product IDs, names, dates). BM25: exact keyword match, handles rare terms. Production systems need both. RRF fusion: rank(dense) + rank(sparse), no weight tuning needed. Typical improvement: 15-30% recall@10.

---

#### Chapter 2: Document Parsing & Multi-Modal RAG

**PDF & Document Parsing Deep Dive**
- PDF parsing hierarchy: text-based → scanned → complex layout (tables, columns, figures)
- Text-based PDFs: PyMuPDF (fitz, fastest), pdfplumber (best for tables), pypdf (simple), PDFMiner
  - PyMuPDF: `doc = fitz.open("file.pdf"); page.get_text("dict")` — preserves layout, coordinates
  - pdfplumber: `with pdfplumber.open("file.pdf") as pdf: pdf.pages[0].extract_table()`
- OCR pipeline: Tesseract (open-source), EasyOCR (deep learning, multi-lang), PaddleOCR (best accuracy)
  - Preprocessing: deskew (cv2.warpAffine), binarize (Otsu), denoise (cv2.fastNlMeans), scale to 300 DPI
  - Tesseract: `pytesseract.image_to_string(img, lang='eng', config='--psm 6')`
  - Layout-aware OCR: LayoutLMv3, Donut (OCR-free), Nougat (academic papers → Markdown)
- Docling (IBM): universal document parser — PDF, DOCX, PPTX → DoclingDocument → JSON/Markdown
  - Preserves heading hierarchy, tables, figures; extracts bounding boxes
- Table extraction: camelot (lattice/stream), tabula-py, pdfplumber.extract_table(), Unstructured
  - `camelot.read_pdf("file.pdf", flavor="lattice")` for bordered tables
  - `camelot.read_pdf("file.pdf", flavor="stream")` for whitespace-separated tables
- Unstructured.io: universal ingest (PDF, HTML, PPTX, DOCX, email) → Element objects (Title, NarrativeText, Table, Image)
  - `partition_pdf("file.pdf", strategy="hi_res", infer_table_structure=True)`
- DOCX: `python-docx` — preserve paragraph styles, heading levels, table structure
- HTML parsing: BeautifulSoup4, Trafilatura (web article extraction), Newspaper3k
- Concepts: Layout detection (YOLO-based), Reading order correction, Header/footer exclusion, Column detection
- **Lab:** Compare PyMuPDF vs pdfplumber vs Docling on complex financial PDF with tables; OCR pipeline for scanned contracts; Unstructured + Qdrant full ingest pipeline; Table extraction accuracy benchmark

> **Interview Q:** How do you extract tables from a scanned PDF reliably?
> **A:** Step 1: OCR with PaddleOCR (best for tables, handles complex layouts). Step 2: Layout analysis — LayoutLMv3 identifies table regions (bounding boxes). Step 3: For bordered tables — camelot lattice mode detects cell lines. Step 4: For borderless — camelot stream mode uses whitespace. Step 5: Validate extracted data — row/column count consistency, data type checks. Step 6: Fallback to Nougat for academic papers. Always compare: ground-truth manual extraction on 20 sample pages.

**Multi-Modal RAG (Images + Text)**
- Image indexing: CLIP embeddings for images (ViT-B/32 → 512-dim), image captioning then embed caption
- Document images: extract figures → generate caption with LLaVA → embed caption → store image path in metadata
- Retrieval: text query → CLIP image embeddings → image retrieval; or text query → caption embeddings
- Multi-modal RAG pipeline: question → retrieve relevant text chunks + images → feed both to GPT-4V/LLaVA
- ColPali (2024): vision-language model that embeds document page images directly (no text extraction needed)
  - Treats each PDF page as image, late interaction (like ColBERT but for images), state-of-the-art on DocVQA
- Concepts: Cross-modal retrieval, Image reranking, Visual grounding in answers, Token budget for images
- **Lab:** Build product catalog RAG with image+text search using CLIP; ColPali for PDF Q&A without OCR; Multi-modal eval with VQA metrics

**Conversational RAG & Memory**
- History-aware retrieval: reformulate question with conversation history before retrieving
  - `create_history_aware_retriever(llm, retriever, contextualize_prompt)` — LLM rewrites question
- Conversation buffer memory: store last N turns, inject into retrieval context
- Session-based memory: Redis / PostgreSQL to persist conversation across requests
- User-specific memory: mem0 (auto-extract entities/facts), Zep (temporal memory graphs)
- Multi-turn patterns: clarification ("What do you mean by X?"), follow-up ("Tell me more about Y"), contradiction handling
- Follow-up question detection: Is it a standalone question or continuation? LLM classification
- Concepts: Context window budget (history + context + answer must fit), Memory summarization for long sessions, Sliding window vs summarization
- **Lab:** Conversational RAG with LangChain RunnableWithMessageHistory; Persistent sessions with Redis; 20-turn stress test conversation flow

> **Interview Q:** How do you handle follow-up questions in RAG ("What else does he say about it?")?
> **A:** Standalone check: classify if question can be understood alone → if yes, retrieve normally. If no (contains "he/she/it/this"), run history-aware reformulation: feed last 3-5 turns to LLM → generate new standalone question → retrieve with reformulated question. Then answer with context. Example: "What else does he say about it?" + history "discussing BERT's attention" → "What else does Vaswani say about attention mechanisms in BERT?" → retrieve → answer.

**Self-RAG & Corrective RAG**
- Self-RAG: model decides when to retrieve (retrieval token), grades own output (relevance/support/utility tokens)
  - Four special tokens: [Retrieve], [ISREL], [ISSUP], [ISUSE]
  - Trained to generate both answer and self-critique in one pass
  - Benefit: avoids unnecessary retrieval for factual / memorized knowledge
- CRAG (Corrective RAG): evaluates retrieved documents for relevance → if low, trigger web search
  - Evaluator scores each retrieved chunk: Correct / Ambiguous / Incorrect
  - If Incorrect → discard + fallback to Tavily web search → re-retrieve
  - Knowledge refinement: strip irrelevant sentences from Correct chunks
- Adaptive RAG: classifies query complexity → route to: no retrieval / single-step / multi-step RAG
- Modular RAG patterns: retrieval-read, retrieval-rewrite-read, retrieve-read-verify, iterative retrieval
- **Lab:** Implement CRAG with LangGraph (evaluator node → decision edge); Self-RAG inference with pretrained model; Adaptive RAG routing: simple factual vs complex multi-hop

> **Interview Q:** When would you use CRAG vs standard RAG?
> **A:** Standard RAG: retrieves and answers regardless of chunk quality — hallucination risk when chunks are irrelevant. CRAG: adds evaluation step — is retrieved context relevant? If relevance score < 0.5 → trigger web search fallback. Use CRAG when: (1) document corpus has gaps, (2) questions may be out-of-scope, (3) freshness matters (recent events). Cost: extra LLM call for evaluation. Benefit: 20-30% hallucination reduction vs blind retrieval.

**RAG vs Fine-Tuning Decision Framework**
- RAG advantages: dynamic knowledge (no retraining), source attribution, interpretable retrieval, low cost for knowledge updates, production-proven
- Fine-tuning advantages: style/format learning (tone, output structure), specialized vocabulary integration, implicit reasoning patterns, faster inference (no retrieval latency), behavior modification
- When to use RAG: large knowledge bases (>10K documents), frequently updated facts, need citations, general-purpose assistants
- When to fine-tune: domain-specific style (legal brief format, medical report structure), consistent persona, specialized syntax (code style, domain abbreviations), task-specific instruction following
- When to combine: RAG for facts + fine-tune for style + format (most production systems)
- Fine-tuning anti-patterns: using it to inject facts (model memorization is unreliable), fine-tuning for tasks it already does well, fine-tuning with small datasets (<1K examples for LLMs)
- RAG anti-patterns: using RAG when question has no answer in docs (hallucination), poor chunking (critical context split across chunks), missing metadata filtering (retrieving wrong-tenant data)
- Cost comparison: RAG = embedding cost + vector DB + retrieval latency; fine-tuning = GPU training + larger model serving
- **Lab:** Side-by-side comparison: base GPT-4o vs RAG vs fine-tuned model on domain Q&A; Cost analysis spreadsheet

**Chapter Project:** Enterprise Knowledge Platform with Hybrid RAG
- Multi-format ingestion: PDF (PyMuPDF + Docling), DOCX, HTML with Unstructured
- Hierarchical chunking, Qdrant + BM25 + Cohere reranking
- Conversational multi-turn support with Redis session memory
- CRAG with web search fallback for out-of-scope queries
- Tools: `qdrant`, `cohere`, `langchain`, `ragas`, `streamlit`, `redis`, `docling`, `unstructured`
- Assessment: Context Recall >0.85 and Faithfulness >0.90; E2E latency <3s P95; Handles 10-turn conversation correctly

---

**MODULE CHEAT SHEET — RAG**
```python
QdrantClient(url='http://localhost:6333')
client.upsert(collection, points=[PointStruct(id, vector, payload)])
client.search(collection, query_vector=emb, limit=10, with_payload=True)
RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
BM25Retriever.from_documents(docs)  # sparse retrieval
EnsembleRetriever([dense_retriever, sparse_retriever], weights=[0.5, 0.5])
CohereRerank(model='rerank-english-v3.0', top_n=5)  # rerank
ragas.evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_recall])
graphrag.index --root ./ragtest  # build knowledge graph
```

---

---

# PILLAR 4 — AGENTIC AI ⭐ (CONSOLIDATED)
> Phases 10–12 · ~13 Weeks
> *Content from Phases 10, 11, 12 unified here. Enterprise agent protocols from Phase 15 also included.*

---

## PHASE 10 — AGENTIC AI FOUNDATIONS
**Duration:** 5 Weeks
**Goal:** Autonomous AI agents: reasoning loops, planning, memory systems, tool calling

---

### AGENTIC AI VISUAL TIMELINE

```
1. OBSERVE → Perceive state from environment/tools
2. THINK   → ReAct/ToT: Reason, plan, decompose task
3. ACT     → Tool Calls: Execute tools, APIs, code
4. OBSERVE → Parse output, extract facts
5. REFLECT → Self-Critique: Evaluate quality, correct errors
6. RESPOND → Return answer OR loop back to step 1

■ LOOP until goal achieved or max_iterations reached ■
```

**Reasoning Patterns:**

| Pattern | Flow | Best For |
|---------|------|---------|
| ReAct | Reason→Act→Observe→Repeat | Tool-heavy tasks where each step informs next |
| Plan-Execute | Plan all steps → Execute → Verify | Structured multi-step workflows |
| Reflection | Act → Critique → Revise → Final | Writing, code gen where quality matters |
| Tree of Thoughts | Branch N paths → Evaluate → Prune | Complex reasoning with multiple solutions |

---

### Module 10.1 — Agent Architecture & Patterns

#### Chapter 1: Core Agent Patterns & Memory

**Agent Reasoning Patterns**
- ReAct (Reason+Act) loop, Plan-and-Execute, Reflection & self-critique, Tree of Thoughts (ToT)
- MCTS for planning, Agent state management
- Concepts: Emergent behavior, Grounding vs hallucination in agents, Tool selection strategies
- Agent topology: sequential, parallel, hierarchical, supervisor
- **Lab:** Build ReAct agent from scratch (no framework); Reflection loop: agent reviews & improves its own output; Multi-step research agent with planning
- **Frameworks:** `langgraph`, `crewai`, `openai agents sdk`

> **Interview Q:** How do you prevent agent infinite loops?
> **A:** Defense in depth: (1) `max_iterations` limit (typically 10–25). (2) Loop detector: hash action+observation pairs; if seen before → abort. (3) Timeout per step and total budget. (4) Circuit breaker: if same tool called 3× with same params → escalate to human. (5) LangGraph: explicit state machine with terminal states.

**Agent Memory Types**

| # | Type | Description | Storage |
|---|------|-------------|---------|
| 1 | Sensory | Current input (image, text, audio) | In-context |
| 2 | Short-Term | Conversation context window (~128K tokens) | In-context |
| 3 | Long-Term | Semantic facts | Vector DB (Qdrant, Pinecone, pgvector) |
| 4 | Episodic | Past task logs & sessions | mem0, Zep |
| 5 | Procedural | Skills & tool schemas | System prompt |

**Memory & Tool Calling**
- Memory types: sensory, short-term (context), long-term (vector store), episodic
- Tool specification (OpenAI function calling format), Tool validation & error handling
- Human-in-the-loop (HITL) patterns, Parallel tool calling, Agent evaluation (AgentBench, GAIA)
- Concepts: Semantic memory vs episodic memory, Tool schema design, Agentic feedback loops
- **Lab:** Agent with semantic memory (Qdrant); Parallel tool calling: search + calculate + write; HITL agent: interrupt for approval before irreversible actions
- **Frameworks:** `langgraph`, `mem0`, `zep`

> **Interview Q:** What is the difference between short-term and long-term agent memory?
> **A:** Short-term: conversation context window — immediate history, temporary, lost on session end. Long-term: persistent storage (vector DB, SQL) — cross-session facts, user preferences, past task summaries. For enterprise agents: short-term (last 20 messages in context), long-term (Qdrant for past decisions + Redis for session state + SQL for structured facts).

---

#### Chapter 2: Tool Design Principles & Agent Safety

**Tool Design Principles**
- Atomic: each tool does exactly one thing (not "search and summarize" — two separate tools)
- Idempotent: calling same tool twice with same params = same result (especially for write operations)
- Self-describing: tool name + docstring must be clear enough for LLM to select correctly without examples
- Typed: use Pydantic schemas for all tool inputs — prevents invalid params being sent to external APIs
- Error-informative: return structured errors, not exceptions; LLM must understand what went wrong
- Tool schema anatomy: name (verb_noun), description (what it does, when to use), parameters (typed + described)
- Anti-patterns: tools with ambiguous names ("process_data"), tools that return too much data (truncate!), tools that have side effects without warning, tools that require sequential ordering
- Tool validation: validate all inputs inside the tool before external call; return error dict not raise exception
- Tool output size: LLMs have limited context — truncate web page content, paginate results, return summaries
- **Lab:** Design tool suite for a financial analysis agent (10 tools); Validate tool set via GPT-4 tool selection test; Refactor bad tool design (anti-patterns → fixed)

```python
from pydantic import BaseModel, Field
class SearchInput(BaseModel):
    query: str = Field(..., description="Search query, max 200 chars, English only")
    max_results: int = Field(5, ge=1, le=20, description="Number of results")

@tool(args_schema=SearchInput)
def web_search(query: str, max_results: int = 5) -> dict:
    """Search the web for recent information. Use for: news, current events, facts not in training data. Do NOT use for: code questions, math, well-known facts."""
    try:
        results = tavily.search(query, max_results=max_results)
        return {"results": results[:max_results], "count": len(results)}
    except Exception as e:
        return {"error": str(e), "results": []}
```

> **Interview Q:** Why must agent tools be idempotent?
> **A:** Agents retry on failure (network errors, parsing errors, timeout). Non-idempotent tools create duplicates: "create_calendar_event" called twice → two events. Fix: check-then-create pattern (search → if exists return existing, else create). Or use idempotency keys passed by agent. Database writes: upsert (INSERT ... ON CONFLICT UPDATE) instead of INSERT. Email sends: store message_id in DB, check before sending. Agents are unreliable callers — tools must be defensive.

**Agent Evaluation Frameworks**
- AgentBench: 8 environment benchmark (OS, DB, knowledge graph, web browsing); measures success rate
- GAIA (General AI Assistants): real-world tasks requiring multi-step tool use; Level 1-3 difficulty
- WebArena: web task automation (shopping, Reddit, GitLab, Wikipedia); measures task completion %
- SWE-bench: 2294 real GitHub issues; measures % of issues resolved (pass@1 with tests)
- AgentEval: custom evaluations — define metrics, rubrics, run LLM-as-judge
- HumanEval-like for agents: define canonical solutions + test suites, auto-grade agent output
- Agent-specific metrics: task completion rate, steps-to-success, tool call accuracy, hallucination rate, cost per task
- Evaluation traps: overfitting to benchmark environments, data contamination, judged by weak evaluator LLM
- **Lab:** Run ReAct agent on GAIA Level 1 tasks; Track per-step tool accuracy; Cost analysis per successful task; Build custom domain eval with LLM judge

> **Interview Q:** How do you evaluate an agent that answers open-ended questions?
> **A:** Multi-dimensional rubric: (1) Tool use accuracy — did it call right tools with right params? Log and verify. (2) Final answer quality — LLM-as-judge (GPT-4) scores on correctness, completeness, format (1-5). (3) Intermediate reasoning — are intermediate steps sound? (4) Human evaluation on sample of 50 queries (Cohen's kappa for inter-rater agreement). (5) Business metric: downstream task success (e.g., user accepted recommendation?). Single metric is insufficient for agents.

**Agent Safety Patterns**
- HITL (Human-in-the-Loop): interrupt before irreversible actions (delete files, send emails, charge cards)
  - LangGraph: `interrupt_before=["send_email_node"]` — pause + return to human
- Guardrails: input filtering (Llama Guard, Nemo Guardrails, custom classifiers), output validation
  - Llama Guard: trained to classify safe/unsafe content across 14 harm categories
  - Nemo Guardrails: programmable rules in Colang language; topical / input / output rails
- Sandboxing: E2B (code execution in secure cloud container), Docker sandbox (isolated, network-limited)
- Scope limits: deny-list of tool patterns (no `rm -rf`, no prod DB writes, no external billing APIs)
- Audit logging: every tool call, args, output, timestamp → immutable log (for compliance + debugging)
- Rate limiting: max N tool calls per session, max cost per session, daily budget alerts
- Principle of least privilege: agent gets only tools it needs for its role (research agent ≠ DB write access)
- **Lab:** Add LlamaGuard input filter to customer service agent; Implement HITL for payment confirmation; Audit log all tool calls to PostgreSQL with rollback capability

**Context Management Strategies**
- Context window budget: prompt (tokens) + history (tokens) + tool results (tokens) + max output = model limit
- Summarization compression: when history > threshold → LLM summarize → replace raw history with summary
- Sliding window: keep last N messages; drop oldest
- Entity extraction: from long tool outputs extract only relevant facts (key-value) before adding to context
- Semantic compression (MemGPT/letta): page old context to vector DB (archival memory) + retrieve on-demand
- Token counting: `tiktoken` for OpenAI models; always count before each LLM call; raise before limit
- Context prioritization: system prompt (immutable) > recent messages > old messages > tool results (most truncatable)
- **Lab:** Build context manager with summarization fallback; Implement MemGPT-style archival memory; Measure context utilization across 50-turn conversation

**Chapter Project:** Research & Synthesis Agent
- Autonomous agent: plans research → searches web + arXiv → reads papers → synthesizes → HITL checkpoint
- Tool suite: web_search (Tavily), arxiv_search, pdf_reader, summarize, write_report (with approval gate)
- Context management: summarize after 15 turns; entity memory in Qdrant
- Guardrails: LlamaGuard for harmful topic detection
- Tools: `langgraph`, `tavily`, `arxiv`, `anthropic sdk`, `mem0`, `llamaguard`
- Assessment: 1500-word report with 10+ citations in <3 minutes; human raters score >4/5; all tool calls logged

---

**MODULE CHEAT SHEET — Agents**
```python
@tool  # LangChain tool decorator (docstring = tool description)
AgentExecutor(agent, tools, max_iterations=15, handle_parsing_errors=True)
StateGraph(AgentState).add_node('agent', agent_fn)  # LangGraph
graph.add_conditional_edges('agent', should_continue, {'continue':'tools', 'end': END})
MemorySaver()  # persistent checkpoints | InMemorySaver for testing
graph.stream(input, config, stream_mode='values')  # observe each step
interrupt_before=['sensitive_action']  # HITL approval gate
from mem0 import Memory; memory.add(messages, user_id=user_id)  # long-term
graph.get_state(config)  # inspect current agent state
```

---

## PHASE 11 — AGENT FRAMEWORKS
**Duration:** 5 Weeks
**Goal:** Master LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, and Google ADK

### Module 11.1 — Framework Deep Dives

---

#### Chapter 1: LangChain/LangGraph & Multi-Framework Mastery

**LangChain & LangGraph**
- LCEL (`|`) operator & Runnable protocol, Chain composition (sequential, parallel, routing)
- Memory: ConversationBuffer, ConversationSummary, VectorStore
- LangGraph: StateGraph, nodes, edges, reducers, Checkpointing & persistence
- Supervisor pattern, Subgraphs & map-reduce
- Concepts: Runnable interface (invoke/stream/batch), Reducer functions for state merge, Interrupt & breakpoints, Cross-thread memory
- **Lab:** LCEL chain: `prompt | llm | parser | validator`; Supervisor-worker with 3 specialists; Persistent customer service agent

> **Interview Q:** LangGraph vs simple ReAct loop?
> **A:** Simple ReAct: no state persistence, no error recovery, no branching, no parallelism, no HITL. LangGraph: explicit state machine → debuggable. Checkpointing → resume after failure. Conditional edges → dynamic routing. Parallel nodes → concurrent tool calls. Interrupt → human approval. For toy demos: ReAct loop fine. For production: LangGraph necessary.

**CrewAI, AutoGen, OpenAI SDK & Google ADK**
- **CrewAI:** Agents (role, goal, backstory), Tasks, Crews, Flows; role-based agent specialization
- **AutoGen:** ConversableAgent, GroupChat, Swarm; multi-agent conversations; code execution
- **OpenAI Agents SDK:** agents, tools, handoffs, guardrails, streaming
- **Google ADK:** Agent Runtime, tools, session management, Workflows, Vertex AI deployment
- **Lab:** Content creation crew (researcher + writer + editor); AutoGen code review; OpenAI SDK customer triage with handoffs

> **Interview Q:** CrewAI vs LangGraph — when each?
> **A:** CrewAI: declarative, role-based, business-user friendly — great for autonomous agent teams with clear job descriptions (marketing crew, research crew). 5 lines to define an agent. LangGraph: programmatic, state machine, fine-grained control, complex branching, cycles, HITL. Use CrewAI for: content pipelines, business workflow automation. Use LangGraph for: complex reasoning, RAG + agent hybrid, production systems needing full observability.

**Framework Comparison**

| Feature | LangGraph | CrewAI | AutoGen | OpenAI SDK | Google ADK |
|---------|-----------|--------|---------|------------|------------|
| Control | High | Medium | Medium | Medium | Medium |
| Learning curve | Steep | Low | Medium | Low | Medium |
| Multi-agent | Excellent | Good | Good | Good | Good |
| State mgmt | Excellent | Basic | Basic | Basic | Basic |
| Best for | Complex state machines | Role-play teams | Code-heavy | OpenAI users | Google stack |
| Deployment | LangGraph Platform | CrewAI Cloud | Azure Container Apps | OpenAI | Vertex AI |

---

#### Chapter 2: Advanced Frameworks — Semantic Kernel, LlamaIndex, Memory Systems

**Semantic Kernel (Microsoft)**
- Architecture: Kernel (orchestrator), Plugins (tool collections), Planners (auto-generate execution plans), Memory (vector store integration)
- Languages: Python and C# (first-class support) — only major agent framework with C# SDK
- Plugins: native functions (Python/C#) + semantic functions (LLM prompts); decorated with `@kernel_function`
- Planners: SequentialPlanner (step-by-step), FunctionCallingStepwisePlanner (tool-calling loop), Handlebars planner
- Kernel Events: `pre_invocation` / `post_invocation` hooks for logging and filtering
- Memory: `SemanticTextMemory` with vector store backends (Azure AI Search, Qdrant, ChromaDB)
- Azure integration: Azure OpenAI, Azure AI Foundry, Azure AI Search — first-class enterprise support
- Use when: Microsoft tech stack (Azure, C#, Office 365), enterprise workflows, copilot experiences in Microsoft products
- **Lab:** SK plugin suite for Office automation (read email, calendar, draft reply); SequentialPlanner for multi-step data analysis; Enterprise SK + Azure deployment

```python
from semantic_kernel import Kernel
from semantic_kernel.functions import kernel_function
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion

kernel = Kernel()
kernel.add_service(OpenAIChatCompletion(service_id="gpt4", ai_model_id="gpt-4o"))

class EmailPlugin:
    @kernel_function(description="Send an email to a recipient")
    async def send_email(self, to: str, subject: str, body: str) -> str:
        # implementation
        return f"Email sent to {to}"
```

> **Interview Q:** When would you choose Semantic Kernel over LangGraph?
> **A:** Semantic Kernel excels in Microsoft ecosystem: Azure OpenAI, Azure AI Search, Office 365 integration, C# requirements. LangGraph excels in: Python-first teams, complex state machines, multi-agent coordination with fine-grained control, LangSmith observability. If client is Microsoft stack + enterprise (SharePoint, Teams, Azure) → Semantic Kernel. If startup or Python team building complex agentic workflows → LangGraph.

**LlamaIndex Agents & Workflows**
- LlamaIndex Agents: ReActAgent, OpenAIAgent, FunctionCallingAgent over LlamaIndex tools
- Tools: QueryEngineTool (RAG), FunctionTool (arbitrary Python), ToolRetriever (dynamic tool selection)
- LlamaIndex Workflows: event-driven DAG for complex pipelines; `@step` decorator, `StartEvent`/`StopEvent`
  - Unlike LangGraph (state machine), LlamaIndex Workflows are event-driven: steps emit events → other steps consume
- Document agents: specialized agents per document; orchestrator selects which doc-agent to query
- RAG + Agent: QueryPipeline for advanced RAG; Router + SubQuestion for multi-step QA
- Integration: LlamaHub (500+ data connectors), `llama-index-readers-*` packages
- **Lab:** Document agent over 50 PDFs (each gets own vector store + agent); Multi-step QA: "Compare Q3 revenue from PDF1 vs PDF2"; Workflow for report generation

```python
from llama_index.core.workflow import Workflow, step, StartEvent, StopEvent

class ResearchWorkflow(Workflow):
    @step
    async def search(self, ev: StartEvent) -> SearchResultEvent:
        results = await self.search_tool(ev.query)
        return SearchResultEvent(results=results)

    @step
    async def synthesize(self, ev: SearchResultEvent) -> StopEvent:
        answer = await self.llm.apredict(f"Synthesize: {ev.results}")
        return StopEvent(result=answer)
```

**Memory Systems — mem0 & Zep**
- mem0 architecture: LLM-based memory extraction from conversation → vector + graph + key-value storage
  - `memory.add(messages, user_id=user_id)` — auto-extracts facts ("User prefers Python over JS")
  - `memory.search(query, user_id=user_id)` — semantic search over past memories
  - `memory.update(memory_id, data)` — correct outdated facts
  - Memory types: user preferences, past interactions, entity facts, procedural knowledge
  - Hosted (cloud) or self-hosted (open-source: `mem0ai/mem0`)
- Zep (temporal knowledge graph): stores memories with timestamps → temporal reasoning
  - Builds user knowledge graph; relationships with temporal context
  - `zep_client.memory.add_session(session_id, messages)` 
  - Retrieves by semantic + temporal relevance ("what did we discuss last week?")
  - Integrates with LangChain, LlamaIndex, CrewAI
- MemGPT / Letta: manages hierarchical memory (in-context vs archival); LLM manages its own memory
  - Archival memory: past context paged to vector DB; LLM queries archival via tool calls
  - Core memory: limited character-count personality + user profile in main context
- When to use mem0 vs Zep vs MemGPT: mem0 = simple fact extraction (cheapest); Zep = temporal + relational memory; MemGPT = complex long-running agents with rich memory management
- **Lab:** Personal assistant with mem0 (remembers preferences across 10 sessions); Temporal Q&A with Zep ("What tasks were pending from Monday?"); Compare memory retrieval accuracy

**LangGraph Platform (Deployment)**
- LangGraph Studio: visual debugger for graph; step through nodes, inspect state, replay from checkpoint
- LangGraph Server: FastAPI-compatible REST API for deployed graphs; streaming SSE support
- LangGraph Cloud: managed deployment (LangChain Inc.); automatic scaling, persistence, monitoring
- Deployment model: `langgraph.json` config → Docker image → LangGraph Cloud OR self-hosted
  - `langgraph.json`: `{"graphs": {"my_agent": "agent.py:graph"}, "dependencies": [...]}`
- Thread management: each user conversation = thread; `thread_id` for continuation
- Subgraph patterns: reusable agent subgraphs across multiple parent graphs
- Testing: `InMemoryStore` for unit tests; assert on state after each node
- **Lab:** Deploy customer service agent to LangGraph Cloud; Multi-tenant thread isolation; Graph visualization in Studio; Performance testing at 100 concurrent threads

**Agency Swarm & Specialized Frameworks**
- Agency Swarm: hierarchical agent teams; CEO agent → specialized department agents → worker agents
  - Agents use shared tools, communicate via Threads API (OpenAI)
  - Focus: business process automation with specialized roles
- Phidata (now Agno): `Agent(model, tools, storage, memory)` — batteries-included agent framework
  - Built-in: PDF reader, web search, SQL, Yahoo Finance, GitHub — no custom tooling needed
  - `Agent(tools=[YFinanceTools(), DuckDuckGo()])` — 3 lines to a financial agent
- Haystack 2.0: pipeline-based, component architecture; strong for RAG + NLP pipelines
- OpenAgents: plugin-based, supports 200+ plugins, strong web browsing
- **Lab:** Agency Swarm for HR onboarding (HR agent + IT agent + Finance agent); Phidata financial analyst agent

**Chapter Project:** Multi-Agent Content & Research Pipeline
- Phase 1 (LangGraph): Research orchestrator → parallel tool calls (Tavily + arXiv + LinkedIn)
- Phase 2 (CrewAI): Research Agent → Writer Agent → Editor Agent → SEO Agent → Publisher
- Phase 3 (mem0): User preference memory (tone, length, domain) across sessions
- Phase 4: Deploy to LangGraph Cloud with full LangSmith observability
- Tools: `langgraph`, `crewai`, `langsmith`, `anthropic`, `mem0`, `tavily`
- Assessment: Publication-quality article in <5 min; Full LangSmith trace; Cost per article <$0.10; Memory personalization tested across 5 sessions

---

**MODULE CHEAT SHEET — Frameworks**
```python
# LCEL
chain = prompt | llm | StrOutputParser() | validator
chain.invoke({'topic':'AI'}) / chain.stream(...) / chain.batch([...])

# LangGraph
graph = StateGraph(MyState); graph.add_node; graph.compile(checkpointer=MemorySaver())

# CrewAI
crew = Crew(agents=[r,w,e], tasks=[t1,t2,t3], process=Process.sequential)
crew.kickoff(inputs={'topic': 'AI trends 2026'})

# AutoGen
agent = ConversableAgent(name, llm_config, system_message)
GroupChat(agents=[a1,a2,a3], messages=[], max_round=10)

# OpenAI SDK
from agents import Agent, Runner
runner = Runner.run_sync(agent, prompt)
handoff = Handoff(agent=specialist, tool_name='escalate_to_specialist')

# Google ADK
adk_agent = Agent(name, model, tools, instructions)
```

---

## PHASE 12 — CODING AGENTS
**Duration:** 3 Weeks
**Goal:** AI-powered coding: Claude Code, Cursor, Windsurf, browser automation

### Module 12.1 — AI Coding Tools & Browser Automation

---

#### Chapter 1: Coding Agent Ecosystem

**Coding Agents**
- Claude Code (CLI, CLAUDE.md, compact mode)
- Cursor (Composer, agent mode, .cursorrules)
- Windsurf (Cascade, flows)
- Gemini CLI & Codex CLI, Computer Use API
- MCP server integration in IDEs
- Concepts: Agentic code generation vs copilot autocomplete, Multi-file refactoring, Test-driven agent loops
- **Lab:** Generate FastAPI microservice with Claude Code; Automated test generation with Cursor Composer; Multi-file refactoring: Python 2 → 3

> **Interview Q:** Claude Code vs GitHub Copilot — key differences?
> **A:** Copilot: inline completions, single-file context, reactive. Claude Code: autonomous agent, reads entire codebase, plans changes across multiple files, runs bash commands, executes tests, reads output, iterates. 'Add authentication to this API' → Copilot suggests one line; Claude Code creates auth module, adds middleware, writes tests, updates README.

**Browser Automation & Computer Use**
- Playwright: `page.goto`, `click`, `fill`, `screenshot`, Page Object Model pattern
- Test generation with `playwright codegen`, Network interception (`page.route`)
- Anthropic Computer Use API, Agent + browser: web research, form filling, data extraction
- Concepts: Selector strategies (CSS, XPath, aria-label, text), Async Playwright patterns, Visual testing & snapshots
- **Lab:** E2E test suite for RAG chat UI; Browser agent: research competitor prices; Computer use: fill complex forms
- **Frameworks:** `playwright`, `selenium`, `puppeteer`, `anthropic computer use`

> **Interview Q:** How do you make Playwright tests reliable (not flaky)?
> **A:** Use auto-waiting selectors (not arbitrary sleeps). Prefer aria roles and labels over CSS selectors (stable across UI changes). `page.wait_for_selector()` not `time.sleep()`. Use `page.wait_for_load_state('networkidle')` after navigation. Mock external APIs with `page.route()` for deterministic tests. Run with `--retries=2` in CI.

---

#### Chapter 2: Advanced Coding Agent Patterns & Evaluation

**E2B Code Sandbox**
- E2B: cloud-based secure code execution sandbox; each session = isolated Linux container (Firecracker microVM)
- Use cases: agent code execution (LLM writes code → E2B runs it → returns output), interactive data analysis, test runners
- SDK: `e2b.CodeInterpreter` — `sandbox.notebook.exec_cell(code)` → returns stdout, stderr, rich outputs (matplotlib plots as base64)
- Lifecycle: `sandbox = await AsyncSandbox.create()` → `result = await sandbox.run_code(code)` → `await sandbox.kill()`
- Features: pre-installed data science stack (pandas, numpy, sklearn, matplotlib), file uploads, port forwarding for servers
- Security: network-isolated (no outbound internet by default), CPU/memory limits, 60s timeout per cell
- vs Docker: E2B = managed cloud, 300ms cold start, per-second billing; Docker = self-managed, full control, no network isolation by default
- **Lab:** LLM → E2B data analysis pipeline (CSV → analysis → charts); Code debugging loop (agent writes → runs → reads error → fixes → runs again); Automated test execution

```python
from e2b_code_interpreter import AsyncSandbox

async def execute_agent_code(code: str) -> dict:
    async with AsyncSandbox() as sandbox:
        execution = await sandbox.run_code(code)
        return {
            "stdout": execution.logs.stdout,
            "stderr": execution.logs.stderr,
            "results": [r.text for r in execution.results],
            "error": execution.error
        }
```

> **Interview Q:** Why use E2B instead of running `exec()` in the same process?
> **A:** `exec()` in-process: (1) No isolation — malicious code accesses all memory, env vars, files. (2) No timeout enforcement. (3) One crash kills the server. (4) State pollution between sessions. E2B: VM-level isolation (Firecracker), network isolated, hard kill on timeout, fresh environment per session. For agent code execution with untrusted LLM-generated code: always sandbox. E2B or Docker — never exec() in production.

**SWE-bench & Coding Agent Evaluation**
- SWE-bench: 2294 real GitHub issues from popular Python repos (Django, Scikit-learn, Flask, etc.)
  - Agent receives: issue description + codebase → must produce git patch that makes tests pass
  - SWE-bench Verified: 500 manually validated issues (harder, more reliable)
  - Current SOTA: 50%+ with best agents (Claude 3.7 Sonnet with extended thinking)
- Evaluation methodology: run provided test suite after applying agent patch → pass/fail
- SWE-agent: Princeton paper; shell tool agent (bash, vim editor) that navigates repos; pioneered the format
- Failure modes: wrong file edited, test not in training set, dependency conflicts, over-engineering simple fix
- Cost analysis: average successful SWE-bench solve costs $0.50–$2.00 in API calls
- HumanEval & EvalPlus: Python function generation; `pass@1` metric (first attempt success); EvalPlus adds harder test cases that expose solutions memorized without understanding
- MBPP (Mostly Basic Python Problems): 374 crowd-sourced problems; simpler than HumanEval
- **Lab:** Run LangGraph-based SWE agent on SWE-bench Lite (300 issues); Measure pass@1; Cost-per-solve analysis; Error categorization

**Aider (Git-Integrated Coding)**
- Aider: CLI coding agent that reads full git repo → makes changes across files → commits with meaningful messages
- Commands: `aider file1.py file2.py` → chat to make changes; `--watch` mode monitors files; `/test` runs tests in loop
- Architect mode: planning LLM (Claude Opus) + editing LLM (Claude Haiku) — higher quality + lower cost
- `.aider.conf.yml`: configure model, auto-commits, test command, file ignore patterns
- Git integration: auto-commits each change with descriptive message; `--no-auto-commits` for review
- Repo map: builds compressed map of all classes/functions in repo → passes to LLM as context
- Use cases: autonomous PR review + implementation, codebase-wide refactoring, test generation
- **Lab:** Aider on Python project: add type hints to entire codebase; Fix 5 failing tests autonomously; Architect mode: design + implement a REST API endpoint

**GitHub Copilot Workspace & Devin Patterns**
- GitHub Copilot Workspace: web-based; issue → brainstorm → plan → implement → PR workflow; still LLM writes, human approves
- Devin (Cognition AI): fully autonomous software engineer agent; long-horizon planning, web browsing, shell access
  - Devin's approach: maintains working memory (scratchpad), plans before acting, verifies each step
  - SWE-bench score: pioneered >10% resolution (now surpassed by many models)
- SWE-agent (Princeton): open-source Devin-like; ACI (Agent-Computer Interface) — bash + file editor tools
  - `create` (make file), `open` (view file), `edit` (make change), `search_dir/file` (find code)
- OpenHands (formerly OpenDevin): open-source; runtime sandbox + agent; active development, plugin system
- Windsurf Cascade: deep codebase understanding, "Flows" (multi-step automated sequences), background agents
- Cursor Agent Mode: spawns sub-agents per file change, applies all changes atomically
- Patterns shared across coding agents: repo map, command execution, state tracking, loop until tests pass
- **Lab:** OpenHands: implement a full CRUD FastAPI endpoint from spec; Compare Claude Code vs Cursor vs Aider on same task; Measure time-to-working-code

**MCP (Model Context Protocol)**
- MCP: Anthropic-designed standard for connecting AI models to external data sources and tools
- Architecture: MCP Host (Claude, Cursor, etc.) ↔ MCP Server (data/tools) via JSON-RPC 2.0
- Server types: local (stdio), remote (HTTP SSE)
- Resources: expose data (files, database rows, API responses) to LLM as context
- Tools: expose functions LLM can call (same as OpenAI function calling but standardized)
- Prompts: reusable prompt templates with arguments
- Official MCP servers: filesystem, GitHub, PostgreSQL, Slack, Google Drive, Puppeteer, Brave Search
- Building MCP server: `@mcp.tool()` decorator; runs as subprocess called by host via stdio
- Use case: VS Code + Cursor + Claude all share the same MCP server for project tools
- **Lab:** Build MCP server for internal company API (tools: search_employees, get_project, create_ticket); Test in Claude Desktop, Cursor, and custom host; Build filesystem MCP server with read/write/search tools

```python
from mcp.server import FastMCP

mcp = FastMCP("Company Tools")

@mcp.tool()
async def search_employees(query: str, department: str = "") -> list[dict]:
    """Search employee directory. Use when asked about people or teams."""
    results = await db.query_employees(query, department)
    return [{"name": r.name, "email": r.email, "dept": r.dept} for r in results]

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

**Chapter Project:** Automated Code Review & Documentation Agent
- Input: GitHub PR URL → fetch diff via GitHub API → analyze with Claude
- Tool suite: read_file, search_codebase, run_tests (E2B), check_types (mypy via E2B), search_docs
- Output: structured review (bugs CRITICAL/HIGH/MED/LOW + improvements) → GitHub comment via API
- Bonus: auto-generate docstrings for changed functions + create unit tests
- MCP server: expose GitHub tools via MCP so agent can use in Claude Code / Cursor
- Tools: `claude-code`, `e2b`, `github api`, `pygments`, `mcp`
- Assessment: Identifies bugs in 80%+ of seeded test cases; >70% branch coverage; Review posted to GitHub in <60s

---

**MODULE CHEAT SHEET — Coding Agents**
```bash
claude               # start Claude Code (reads CLAUDE.md)
cursor .             # open project | Cmd+I = Compose
playwright codegen http://localhost:3000  # record user actions
```
```python
await page.goto(url)
await page.click('button[aria-label="Submit"]')
await page.fill('#email', 'test@example.com')
await page.screenshot(path='debug.png', full_page=True)
await page.wait_for_selector('.response', state='visible')
await page.route('**/api/**', lambda r: r.fulfill(json=mock_data))
page.evaluate('() => document.title')  # run JS in page
```

---

---

# PILLAR 5 — PRODUCTION
> Phases 13–15 · ~14 Weeks

---

## PHASE 13 — MLOPS
**Duration:** 5 Weeks
**Goal:** Production ML: experiment tracking, versioning, pipelines, feature stores, monitoring

### Module 13.1 — MLOps Stack: Track → Deploy → Monitor

---

#### Chapter 1: Experiment Tracking, Pipelines & Monitoring

**Experiment Tracking & Model Registry**
- MLflow: runs, experiments, artifacts, registry; Weights & Biases: sweeps, reports
- DVC: data versioning, pipeline DAGs; Git + DVC for reproducible ML
- Model registry: staging → production → archived; Model lineage & audit trail
- Concepts: Reproducibility requirements, Model versioning semantics, Artifact storage (S3, GCS, Azure Blob)
- **Lab:** Log XGBoost experiment with MLflow; W&B hyperparameter sweep (Bayesian optimization); DVC pipeline

> **Interview Q:** What is training-serving skew and how do you prevent it?
> **A:** Training-serving skew: features computed differently offline (training) vs online (inference) → model performs worse in production. Prevention: (1) Feature store (Feast): single code for offline + online. (2) Log production features → compare distribution to training. (3) Reuse exact preprocessing pipeline saved with model. (4) Shadow mode testing.

**Pipelines, Feature Stores & Monitoring**
- Apache Airflow: DAGs, operators, sensors, hooks; Kubeflow Pipelines: containerized steps
- Feature store (Feast): offline/online stores; Model drift detection (Evidently, Alibi Detect)
- Data quality monitoring (Great Expectations), A/B testing, Canary releases, Blue-green deployments
- Concepts: CI/CD for ML (CML), Training trigger strategies, Feature freshness, Champion/challenger pattern
- **Lab:** Airflow DAG nightly retraining; Evidently feature drift dashboard; Feast: register → serve online in <10ms
- **Frameworks:** `airflow`, `kubeflow`, `feast`, `evidently`, `great-expectations`

> **Interview Q:** Feature store vs data warehouse — what's the difference?
> **A:** Data warehouse: OLAP, batch analytical queries, hourly/daily updates (Snowflake, BigQuery). Feature store: ML-specific, dual stores: offline (batch training, Parquet/Hive) + online (low-latency inference, Redis/DynamoDB). Key property: same feature code for both → no training-serving skew. Tools: Feast, Tecton, Hopsworks.

---

#### Chapter 2: Model Serving Infrastructure

**Triton Inference Server (NVIDIA)**
- Triton: high-performance model serving for GPU/CPU; supports TensorRT, ONNX, PyTorch, TensorFlow, Python backends
- Model repository: file-system layout: `model_repo/{model_name}/{version}/model.onnx` + `config.pbtxt`
- `config.pbtxt`: define input/output tensors, max batch size, dynamic batching, instance groups
- Dynamic batching: accumulate requests up to `preferred_batch_size` or `max_queue_delay_microseconds` → single GPU forward pass
- Concurrent model execution: multiple model instances per GPU (e.g., 2 copies of bert-base → 2× throughput)
- Backends: TensorRT (fastest, NVIDIA-specific), ONNX Runtime, PyTorch TorchScript, Python (custom logic)
- gRPC + REST API: clients send inference requests; gRPC for performance, REST for compatibility
- Performance analysis: `perf_analyzer` tool — measures throughput vs latency at various concurrency levels
- Ensemble models: chain models in Triton (preprocessing → inference → postprocessing in single request)
- **Lab:** Export BERT to ONNX → convert to TensorRT → serve on Triton → benchmark vs FastAPI; Dynamic batching: measure throughput improvement; Ensemble pipeline: tokenizer + BERT + classifier

```
# config.pbtxt for TensorRT backend
name: "bert_classifier"
backend: "tensorrt"
max_batch_size: 32
dynamic_batching { preferred_batch_size: [8, 16, 32] }
instance_group [{ count: 2; kind: KIND_GPU }]
input [{ name: "input_ids"; data_type: TYPE_INT32; dims: [128] }]
output [{ name: "logits"; data_type: TYPE_FP32; dims: [2] }]
```

> **Interview Q:** How does Triton's dynamic batching improve GPU utilization?
> **A:** Without batching: each request = one GPU forward pass → GPU underutilized (batch=1, GPU runs at 5% FLOP utilization). Dynamic batching: accumulate requests for `max_queue_delay_microseconds` (e.g., 2ms) → group into batch → single forward pass. For BERT: batch=32 uses 30× more GPU FLOPs but wall-clock time only 1.5× longer → 20× throughput improvement. Triton auto-tunes preferred_batch_size based on measured latency.

**BentoML**
- BentoML: Python-native model serving framework; packages model + code + dependencies into "Bento" (deployable artifact)
- Service definition: `@bentoml.service` decorator; `@bentoml.api` for endpoints; type hints = request/response schema
- Runners: model execution units; async, batching-enabled; isolate model from API server (separate processes)
- Bento: `bentoml build` → OCI-compatible container with all dependencies; `bentoml serve` → development server
- Deployment: BentoCloud (managed), Kubernetes with Helm chart, AWS Lambda, GCP Cloud Run
- Adaptive batching: BentoML auto-batches concurrent requests; configurable `max_batch_size`, `max_latency_ms`
- Use case: simpler than Triton; Python models (sklearn, XGBoost, Transformers); less config overhead
- **Lab:** BentoML service for HuggingFace sentiment model; Adaptive batching benchmark; Deploy to AWS ECS

```python
import bentoml
from bentoml.io import JSON, Text

sentiment_runner = bentoml.transformers.get("sentiment-model:latest").to_runner()

@bentoml.service(runners=[sentiment_runner])
class SentimentService:
    @bentoml.api(input=Text(), output=JSON())
    async def analyze(self, text: str) -> dict:
        result = await sentiment_runner.async_run(text)
        return {"label": result[0]["label"], "score": result[0]["score"]}
```

**Ray Serve**
- Ray Serve: distributed model serving on Ray cluster; designed for complex pipelines and model composition
- Deployment: `@serve.deployment` decorator; `handle = deployment.bind()`; `serve.run(handle)` 
- Composability: chain deployments — `Router.bind(ModelA.bind(), ModelB.bind())` → microservice DAG
- Autoscaling: `num_replicas`, `min_replicas`, `max_replicas`; scale based on request queue depth
- Resource allocation: `ray_actor_options={"num_gpus": 1}` per deployment; fractional GPU sharing
- Integration: LangChain, LlamaIndex, FastAPI — serve LLM + RAG pipeline as distributed service
- Multi-model serving: A/B testing, canary deployments, model ensembles — all first-class in Ray Serve
- **Lab:** RAG pipeline as Ray Serve deployment (embedder + retriever + LLM separate deployments); Autoscaling load test

**Kubernetes for ML (GPU Workloads)**
- GPU node pools: separate node pool with GPU-enabled instances (g4dn.xlarge, a2-highgpu, Standard_NC6s_v3)
  - Taints: `kubectl taint nodes gpu-node-1 nvidia.com/gpu=true:NoSchedule` → only GPU pods scheduled
  - Node selectors: `nodeSelector: {"cloud.google.com/gke-accelerator": "nvidia-tesla-a100"}`
- NVIDIA Device Plugin: DaemonSet that exposes GPU resources to K8s scheduler
  - `kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.1/nvidia-device-plugin.yml`
  - Pod requests: `resources: {limits: {"nvidia.com/gpu": 1}}`
- GPU sharing: NVIDIA MIG (Multi-Instance GPU) — partition A100 into 7 instances; Time-slicing for dev workloads
- Horizontal Pod Autoscaler (HPA) for inference: custom metrics (queue depth, GPU utilization) via KEDA
- KEDA (K8s Event-Driven Autoscaling): scale based on Kafka lag, SQS depth, Redis length — perfect for inference queues
- Vertical Pod Autoscaler (VPA): auto-set CPU/memory requests based on actual usage
- CI/CD for ML: GitHub Actions → train on K8s Job → register in MLflow → deploy new version → canary → promote
- CML (Continuous Machine Learning by DVC): ML-specific CI — add metrics + plots as GitHub PR comments
- **Lab:** K8s GPU Job for model training; KEDA-based autoscaling inference service; Rolling update with zero-downtime; CML integration for PR-based model evaluation

**Shadow Deployment & Canary Patterns**
- Shadow deployment: new model receives copy of live traffic; responses discarded; compare outputs to current model
  - Validates new model on real distribution without user impact; catches latency regressions
- Canary release: route N% of traffic to new model; monitor error rate, latency, business metric → promote or rollback
- Blue-green: maintain two identical deployments; switch traffic (DNS/LB level) atomically; instant rollback
- Multi-armed bandit (A/B/n): Thompson sampling assigns traffic based on real-time reward signals; auto-promotes
- Shadow testing implementation: Istio traffic mirroring (`mirror:` policy); or application-level dual-write
- Rollback trigger: error rate > 1%, latency P99 > 2s, business metric drop > 5% → auto-rollback via K8s HPA
- **Lab:** Istio traffic mirroring for shadow mode; Canary with Argo Rollouts (5% → 25% → 100% over 30 min); Multi-armed bandit with Vowpal Wabbit

**Chapter Project:** Production MLOps Pipeline for Churn Prediction
- DVC data versioning → Feast feature store → Airflow retraining DAG → MLflow registry → Triton serving → Grafana monitoring
- Canary deployment: old model → 90%, new model → 10% → monitor → promote
- GPU K8s Job for training; KEDA autoscaling for inference
- Tools: `dvc`, `feast`, `airflow`, `mlflow`, `triton`, `evidently`, `keda`
- Assessment: Retraining triggers automatically when data drift PSI > 0.2; Feature pipeline serves <10ms online; Canary promotion automated

---

**MODULE CHEAT SHEET — MLOps**
```python
mlflow.start_run(run_name='xgb-v3')
mlflow.log_params({'lr':0.05,'depth':6}); mlflow.log_metric('auc',0.92)
mlflow.xgboost.log_model(model, 'model')  # save with schema
# mlflow models serve -m 'models:/fraud/Production' -p 8000
# dvc run -n train -d data/ -o models/ python train.py
# dvc push  # push data/models to S3/GCS remote
feast apply  # register feature definitions
store.get_online_features(features, entity_rows)  # serve <10ms
evidently.Report([DataDriftPreset()]).run(reference, current)
```

---

## PHASE 14 — LLMOPS
**Duration:** 4 Weeks
**Goal:** LLM observability, tracing, evaluation frameworks, and guardrails for production

### Module 14.1 — LLMOps Stack

---

#### Chapter 1: Tracing, Evaluation & Guardrails

**Observability & Tracing**
- LangSmith: traces, datasets, evaluators, prompt hub
- LangFuse: open-source self-hosted alternative; Phoenix (Arize): LLM observability
- OpenTelemetry for LLMs, Token cost tracking, Latency breakdown (TTFT, total), Session replay
- Concepts: Distributed tracing for multi-agent, Span hierarchy (agent → chain → LLM call), PII scrubbing in traces
- **Lab:** LangSmith tracing for full RAG pipeline; LangFuse self-hosted on Docker; Cost dashboard

> **Interview Q:** How do you debug a RAG pipeline that gives wrong answers?
> **A:** LangSmith trace: (1) Check retrieved chunks — relevant? If not → chunking/embedding problem. (2) Check reranking — good chunks filtered? → reranker calibration. (3) Check prompt → LLM input — context well-formatted? (4) Check LLM output — answer faithful to context or hallucinated? (5) RAGAS per-question metrics → identify systematic failure patterns.

**Evaluation & Guardrails**
- LLM-as-judge evaluation; DeepEval metrics (answer relevancy, hallucination, toxicity, bias)
- Golden dataset construction; Prompt versioning & regression testing
- Guardrails AI: input/output validators; NeMo Guardrails: dialogue rails
- PII detection & redaction; Content policy enforcement
- Concepts: Evaluation dataset curation, Inter-rater reliability, Prompt regression testing
- **Lab:** DeepEval test suite for QA system; LLM-as-judge scoring; Guardrails AI: detect & block PII
- **Frameworks:** `deepeval`, `guardrails-ai`, `nemo-guardrails`, `ragas`

> **Interview Q:** How do you scale LLM evaluation to thousands of test cases?
> **A:** LLM-as-judge: use GPT-4o/Claude as evaluator. Batch API calls (50% discount on OpenAI). Run nightly eval pipeline (Airflow/GitHub Actions). Track metric trends in LangSmith/LangFuse. For 10K evals: GPT-4o-mini at $0.15/1M tokens → ~$1.50 per full eval run. Human eval for calibration weekly (20 samples).

**Chapter Project:** LLMOps Observability Platform
- LangFuse tracing → DeepEval test suite → Guardrails AI → cost dashboard → Slack alerts
- Tools: `langfuse`, `deepeval`, `guardrails-ai`, `airflow`, `slack sdk`
- Assessment: Every LLM call traced with cost & latency; Guardrails block 100% of PII in test injection; Slack alert fires within 5 minutes of quality metric dropping 10%

---

**MODULE CHEAT SHEET — LLMOps**
```python
# env: LANGCHAIN_TRACING_V2=true; LANGCHAIN_API_KEY=...
langfuse = Langfuse()
trace = langfuse.trace(name='rag-query', input=query, output=response)
langfuse.generation(trace_id, model, input_tokens, output_tokens, cost)

test_case = LLMTestCase(input, actual_output, expected_output, context)
assert_test(test_case, [AnswerRelevancyMetric(0.8), HallucinationMetric(0.5)])

guard = Guard().use(DetectPII, on_fail='fix')
guard.validate(llm_output)  # validate & fix output

phoenix.launch_app()  # local observability UI
```

---

## PHASE 15 — ENTERPRISE AI ARCHITECTURE
**Duration:** 5 Weeks
**Goal:** MCP, A2A, security, governance, and production-grade enterprise AI system architecture

### Module 15.1 — Enterprise AI: MCP, A2A, Security & Scale

---

#### Chapter 1: MCP, A2A Protocols & Enterprise Architecture

**MCP & A2A Protocols**
- MCP (Model Context Protocol): architecture, server types (local, remote), stdio & SSE transport
- Tool schemas, Resource URIs, Prompt templates; MCP client integration (Claude, IDEs, agents)
- A2A (Agent-to-Agent) protocol by Google: Task objects, agent cards, capability discovery, agent delegation
- Concepts: Protocol negotiation, Capability advertising, Sandboxed tool execution, MCP server security model
- **Lab:** Build MCP server for internal Postgres database; A2A agent that accepts delegated tasks; Connect Claude to custom MCP tools
- **Frameworks:** `mcp sdk (anthropic)`, `a2a-sdk`, `fastapi (mcp server)`

> **Interview Q:** What is MCP and why is it important?
> **A:** MCP (Model Context Protocol): Anthropic's open standard for connecting AI models to external tools and data. Like USB-C for AI integrations — one protocol, many connections. Before MCP: each integration required custom code. With MCP: write server once → any MCP-compatible host (Claude, Cursor, VS Code) can use it. Growing ecosystem: 1000+ MCP servers. For enterprises: write MCP server for internal systems → accessible to all AI tools immediately.

**Security, Governance & Scaling**
- AI security threats: prompt injection, data exfiltration, model inversion
- Zero-trust architecture for AI agents, PII detection & redaction (Presidio)
- Authentication: API keys, OAuth2, mTLS; NIST AI Risk Management Framework; EU AI Act basics
- AI Gateway pattern (LiteLLM, Portkey), Multi-model routing (cost vs quality vs latency)
- Semantic caching, Horizontal scaling (vLLM cluster, K8s), Multi-region AI deployment
- Concepts: Least privilege for agents, Audit trail requirements, Model cards & datasheets, Red-teaming AI systems
- **Lab:** Set up LiteLLM as AI gateway with cost routing; Implement prompt injection detector; Design multi-region AI architecture on AWS
- **Frameworks:** `litellm`, `portkey`, `presidio`, `aws bedrock guardrails`

> **Interview Q:** How do you handle 1M LLM API requests per day cost-efficiently?
> **A:** Semantic cache (GPTCache/Redis): cache similar queries, 30–60% hit rate. Model routing: GPT-4o-mini for simple queries ($0.15/1M), Claude Opus for complex — route by query classification. Async batching: OpenAI Batch API (50% discount). Prompt compression (LLMLingua: 4× shorter context). Self-hosted vLLM for predictable workloads. Result: 70–80% cost reduction.

**Chapter Project:** Enterprise AI Platform Architecture
- AI Gateway (LiteLLM) → MCP server suite (DB, search, calendar) → multi-agent orchestration → LangFuse → Presidio PII → K8s
- Tools: `litellm`, `mcp sdk`, `langgraph`, `langfuse`, `presidio`, `k8s`
- Assessment: Gateway routes to cheapest model satisfying quality threshold; Semantic cache achieves 40%+ hit rate; 100% PII detection in test injection

---

**MODULE CHEAT SHEET — Enterprise AI**
```python
@mcp.tool()  # expose function as MCP tool (auto schema generation)
mcp.run(transport='stdio')   # run MCP server (Claude Desktop local)
mcp.run(transport='sse', port=8080)  # remote MCP server

litellm.completion('gpt-4o-mini', messages)  # unified API
litellm.Router(model_list=[...], routing_strategy='cost-based')
# Portkey AI Gateway: load balancing + fallbacks + observability

from presidio_analyzer import AnalyzerEngine
engine = AnalyzerEngine()
engine.analyze(text, language='en')  # find PII entities

# NIST AI RMF: GOVERN → MAP → MEASURE → MANAGE lifecycle
```

---

---

# PILLAR 5 — CAPSTONE
> Phase 16 · 6 Weeks

---

## PHASE 16 — CAPSTONE SYSTEMS
**Duration:** 6 Weeks
**Goal:** Integrate everything: design, build, deploy, and present production-grade AI systems

### Module 16.1 — Capstone Projects

---

#### Chapter 1: AI System Design Methodology

**AI System Design**
- Requirements → constraints → trade-offs framework
- Architecture Decision Records (ADRs), C4 Model for AI system diagrams
- Cost estimation model (tokens × price × volume), MVP vs production architecture trade-offs
- Concepts: Non-functional requirements (latency, throughput, cost, availability), SLA/SLO/SLI, Production readiness checklist
- **Lab:** Design doc for enterprise RAG system (1-pager); Cost model spreadsheet LLM API vs self-hosted; C4 architecture diagram for multi-agent system
- **Frameworks:** `draw.io`, `mermaid`, `notion`, `confluence`

> **Interview Q:** Design an enterprise RAG system for 10K employees.
> **A:** Requirements: <3s latency, 99.9% uptime, 10K users, GDPR compliant. Architecture: (1) Ingestion: multi-format parser → chunker → embedder → Qdrant cluster. (2) Retrieval: hybrid search + Cohere rerank → top-5 chunks. (3) Generation: LiteLLM gateway → Claude/GPT-4o. (4) Infra: K8s on AWS, semantic cache (Redis), CDN. (5) Observability: LangFuse, Grafana, PagerDuty. (6) Security: SSO (Okta), PII redaction, tenant isolation.

---

### CHOOSE YOUR CAPSTONE PROJECT

Build ONE as your portfolio centerpiece:

| Option | Stack | Key Showcase |
|--------|-------|-------------|
| Enterprise RAG Knowledge Platform | Qdrant + LangChain + LiteLLM + LangFuse | Full RAG pipeline with hybrid search, evaluation |
| Agentic Research & Report Synthesis | LangGraph + Tavily + arXiv + mem0 | Multi-step agent, HITL, long-term memory |
| Multi-Agent Customer Service | CrewAI + LangGraph + OpenAI SDK | Escalation, handoffs, supervisor pattern |
| MLOps Platform: AutoML + Monitoring | MLflow + Airflow + Feast + Evidently | Full model lifecycle, drift detection |
| AI-Powered Code Review Bot | Claude Code + GitHub API + Playwright | Coding agents, browser automation |

**Assessment Criteria (applies to all):**
- [ ] Live demo works end-to-end without crashes for 10-minute presentation
- [ ] Architecture diagram explains design decisions (not just what, but why)
- [ ] README covers: problem, solution, architecture, how to run, results
- [ ] Eval metrics show the system actually works (not just 'it runs')
- [ ] Cost analysis: estimated production cost per month
- [ ] At least one failed approach documented — shows real engineering judgment

---

### AI ARCHITECT PRODUCTION CHECKLIST

```
✓ Data:         ingest → validate → chunk → embed → index
✓ Retrieval:    hybrid search → rerank → top-k context
✓ Generation:   gateway → prompt → LLM → parse → validate
✓ Agents:       state machine → tools → memory → HITL gates
✓ Observability: traces + metrics + cost + evals
✓ Security:     auth + PII + guardrails + audit log
✓ Testing:      unit + integration + eval + load test
✓ CI/CD:        lint → test → build → deploy → monitor
✓ Cost:         cache + async + batch + model routing
✓ Docs:         README + ADR + API docs + runbook
```

---

---

# QUICK REFERENCE

## Full Phase Timeline

| Phase | Topic | Duration |
|-------|-------|---------|
| 0 | Computer Science Foundation | 3–4 Weeks |
| 1 | Python Engineering | 6 Weeks |
| 2 | Data Analysis Stack | 4 Weeks |
| 3 | Mathematics for AI | 5 Weeks |
| 4 | Machine Learning | 8 Weeks |
| 5 | Deep Learning | 8 Weeks |
| 6 | Computer Vision | 6 Weeks |
| 7 | Natural Language Processing | 6 Weeks |
| 8 | Generative AI | 6 Weeks |
| 9 | RAG Engineering | 6 Weeks |
| 10 | Agentic AI | 5 Weeks |
| 11 | Agent Frameworks | 5 Weeks |
| 12 | Coding Agents | 3 Weeks |
| 13 | MLOps | 5 Weeks |
| 14 | LLMOps | 4 Weeks |
| 15 | Enterprise AI Architecture | 5 Weeks |
| 16 | Capstone Systems | 6 Weeks |
| **Total** | | **~91 Weeks part-time / ~45 weeks focused** |

---

## Framework & Tool Directory

| Category | Tool | Best For |
|----------|------|---------|
| LLM APIs | LiteLLM | Universal LLM client |
| Agent Framework | LangGraph | Complex stateful agents, HITL |
| Agent Framework | CrewAI | Role-based agent teams |
| Agent Framework | AutoGen | Code/debug multi-agent loops |
| Agent Framework | OpenAI Agents SDK | OpenAI-centric with handoffs |
| Agent Framework | Google ADK | Google Cloud agents |
| RAG | LlamaIndex | Document retrieval pipelines |
| RAG | LangChain | Chains + RAG |
| Vector DB | ChromaDB | Local dev |
| Vector DB | Qdrant | Production, hybrid search |
| Vector DB | Pinecone | Production cloud (managed) |
| Vector DB | pgvector | PostgreSQL extension |
| Serving | vLLM | High-throughput LLM serving |
| Serving | Ollama | Local model deployment |
| Fine-tuning | Unsloth | Fast LLM training |
| Fine-tuning | TRL | RLHF/DPO/SFT pipelines |
| Monitoring | LangSmith | LLM traces, evals, datasets |
| Monitoring | LangFuse | Open-source LLM observability |
| Evaluation | RAGAS | RAG pipeline evaluation |
| Evaluation | DeepEval | LLM evaluation framework |
| Protocols | FastMCP | MCP server development |
| Gateway | LiteLLM | Cost routing + fallbacks |
| Security | Presidio | PII detection & redaction |
| MLOps | MLflow | Experiment tracking + registry |
| MLOps | DVC | Data/model versioning |
| MLOps | Feast | Feature store |

---

## Agent Architecture Decision Guide

```
Need an AI system?
│
├── Simple Q&A or single task?
│   └── Prompt + LLM API (no agent needed)
│
├── Need external data?
│   └── RAG pipeline
│
├── Need to take actions?
│   └── Single ReAct agent
│
├── Need complex multi-step planning?
│   └── Plan-and-Execute agent (LangGraph)
│
└── Need multiple specialized capabilities?
    ├── 2-4 agents with clear roles?
    │   └── CrewAI or LangGraph supervisor
    │
    ├── Complex state, enterprise, HITL?
    │   └── LangGraph with full state management
    │
    └── Need interoperability with external AI tools?
        └── MCP + A2A protocols
```

---

*AI Architect Master Roadmap 2026 — Habibi Technology Solutions · Muhammed Juned*
*Restructured for clarity and role-based learning*
