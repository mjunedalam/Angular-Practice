# Preface: build understanding before autonomy

An AI agent can look impressive after a short demonstration. Give a model a few tools and it may search a document, inspect an order and propose a refund. The difficult work begins when the order belongs to another customer, the payment service times out, the model reads a malicious instruction, or the process restarts halfway through the task.

This book explains the engineering that makes those situations manageable. Its central idea is simple: the model proposes what to do; the surrounding application decides what may happen, performs the work and checks the result. Once that distinction is clear, the rest of the architecture becomes easier to understand.

## One familiar picture

:::analogy A capable assistant in a well-run workplace
Imagine hiring an assistant who can read quickly, explain unfamiliar material and suggest a useful next step. You would still give that person a defined role, access to the right records, a spending limit and a way to ask for approval. You would record important decisions and check that promised work actually happened. The assistant's talent would not replace those arrangements.

An agent system needs the same separation of responsibilities. The model supplies useful judgment-shaped proposals. Your software supplies the records, rules, tools and checks. Where it stops: a model does not become a responsible employee merely because its language sounds human. Its apparent confidence is not evidence of permission, accuracy or successful execution.
:::

The analogy is a starting point, not a substitute for precise terms. Each chapter connects an everyday situation to a concrete mechanism, then marks the point at which the comparison stops helping. That lets you remember the idea without inheriting a misleading assumption.

## Two systems we will build on

ShopAssist is a customer-support agent for a fictional retailer. It can read an order, retrieve a returns policy and help prepare a refund. A refund is a useful teaching example because it is easy to understand and expensive to repeat accidentally. We will use it to connect tool schemas, identity, approval, idempotency, evidence and recovery.

AegisOps is an incident-response system. It investigates a failing service, collects evidence, proposes a response and, when policy permits, helps execute a controlled change. It forces us to connect several disciplines: distributed systems, access control, workflow, verification, monitoring and human judgment. We will build its responsibilities in stages rather than begin with a crowd of autonomous agents.

The examples are fictional teaching systems. Their purpose is to expose decisions you will face in a real system. A number printed in an example is an assumption for that example unless a source or measurement method says otherwise.

## The route through the book

Chapters 1-4 explain the model and the basic control patterns. Chapters 5-11 build the runtime around it: tools, state, context, memory and reusable skills. Chapters 12-15 connect the runtime to knowledge and other systems. Chapters 16-18 add workflows, collaboration and human approval.

Chapters 19-22 explain the boundaries that an action-taking agent must respect. Chapters 23-28 cover failure, testing, evaluation, observation, operation and cost. Chapters 29-35 map the ideas onto platforms, frameworks and specialized use cases. Chapters 36-39 assemble the pieces into capstone projects.

:::diagram
{"kind":"flow","title":"Learn the system in layers","nodes":[{"label":"Understand the model","detail":"Chapters 1-4: capability, intent and control.","role":"model"},{"label":"Build the runtime","detail":"Chapters 5-11: tools, state and context.","role":"runtime"},{"label":"Connect and coordinate","detail":"Chapters 12-18: evidence, protocols and people.","role":"data"},{"label":"Constrain and measure","detail":"Chapters 19-28: security, quality and operations.","role":"policy"},{"label":"Assemble and verify","detail":"Chapters 29-39: platforms and working projects.","role":"success"}],"caption":"Each layer gives the next one something dependable to stand on. Security is required before you ship actions, even if you are reading the book in a different order.","insight":"Start with one bounded task, then add only the machinery it needs."}
:::

If you are building your first agent, read Chapters 1-2, 5-8 and 11 first. Then read Chapters 18-24 before enabling consequential actions. If your work is mainly retrieval, add Chapters 12-13 and 25-26. If you operate a platform, continue through Chapters 27-33. Architects can use Chapter 35 to review a proposed design, but the questions become much more useful after the underlying mechanisms are familiar.

## Choose a starting point

You do not need to train a neural network to use this book. You should be comfortable reading a small Python function, a JSON record and an HTTP request. SQLite, transactions and asynchronous execution become useful as the runtime grows. When a term is unfamiliar, use the glossary and the short model bridge in Chapter 1 before continuing.

| Your immediate goal | Reading route | What to build or explain |
|---|---|---|
| Understand models and agents | Chapter 1 model bridge, then 2-3 | Separate learned weights, supplied context and software authority. |
| Build retrieval | 12-13, then the evaluation and tracing parts of 25-26 | Run the same questions through a fixed and a bounded adaptive search. |
| Coordinate work | 16, then 17, then 15 | Learn dependencies and delegation before remote-agent protocol details. |
| Build the capstone | 35, then 36-38 | Choose a design, define its contract, run the small example, then extend it. |

Chapter 2 gives an early architecture and model-adaptation decision preview. Chapter 35 returns to those choices with a more demanding design review. This is a spiral: first learn the decision, then the mechanism, then the failure cases. Keep Chapters 18-24 in your route before enabling consequential actions.

## Get the runnable examples from this PDF

This complete PDF carries an attachment named **Agentic_AI_Engineering_companion.zip**. In a PDF reader that supports attachments, open its Attachments panel, save the ZIP, and extract it into a local folder. Some browser previews hide attachments; save the PDF and open it in an attachment-capable reader. Read `START_HERE.txt` and `examples/README.md` in the extracted folder. The editable source package contains the same examples.

Begin with the standard-library harness and retrieval lab. The framework capstone and telemetry regression checks use their own documented dependency environments. Each lab states which services are simulated, what was actually executed, and what its tests establish. The included chapter files let regression tests execute the same functions printed in the book. Keep `chapters/` beside `examples/` when extracting the companion.

The digital edition includes heading and reading-order tags, text alternatives for diagrams, and linear alternatives for compact tables. These help navigation and interpretation; they do not constitute a PDF/UA certification or a substitute for assistive-reader testing. The labels and explanations also remain visible on the page.

## How a chapter should feel

Begin with the situation and the analogy. Read the explanation until you can say what the system must remember, what it may change and how it knows the task is finished. Follow the diagram with your finger, including the failure path. Then work through the example and predict what would happen if one assumption changed.

Do the self-check before looking at Appendix G. For an exercise, use the acceptance criteria to decide whether your implementation demonstrates the intended property. Appendix F gives the solution approach; it does not replace running your code and observing its behavior.

The diagrams use a small set of consistent meanings. Deep ink marks model or core-system responsibilities. Cyan-teal marks ordinary runtime work and information flow. Amber marks side effects or waits. Red marks a denial, a risk or a control boundary. Green highlights verification and outcomes. Blue highlights records or evidence; violet marks external dependencies. Every important distinction also has a word, shape or label, so it remains understandable without colour.

## Code and evidence

Most snippets are deliberately small. A listing marked illustrative shows a mechanism and its stated interface; it is not a complete production service. The included mini-harness, retrieval comparison, judge-evaluation fixture and graph capstone are executable teaching programs with deterministic checks. Their documentation states exactly what is simulated, what persists, which failures each demonstrates and what remains outside the example.

Never turn a teaching simplification into a production promise. A checkpoint is not automatically a durable workflow. A successful API response is not always proof of the business outcome. A local unique key does not, on its own, make an external effect happen exactly once. The book returns to these distinctions because they change how systems behave after failure.

Framework APIs and protocols change. Use the dated primary references in the relevant chapters and check the version you install. The durable skills are learning to define a contract, identify a failure window, test an invariant and collect evidence that the invariant held.

## A useful habit

Before adding a new agent or tool, write one sentence that names its job and one sentence that names its boundary. Then state what evidence would convince you that it succeeded. If those sentences are hard to write, more autonomy will make the design harder to understand. A small system with visible responsibilities is a better foundation for learning and for production.
