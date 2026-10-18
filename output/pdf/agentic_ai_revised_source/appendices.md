# A. Glossary & Critical Distinctions

Use this glossary to keep nearby ideas separate. The differences matter most when a system pauses, resumes or crosses into an external effect. A conversation history, application state and approval record can all be stored in one database while retaining different meanings. Names alone do not establish ownership, durability or authority. The chapter references indicate where to develop the concept and its trade-offs.

## Critical distinctions

**Model, agent and harness.** A model generates an output from its input context. An agent uses that output inside an owned loop to select work toward a goal. The harness operates the loop and enforces its boundaries. The model's requested tool call is a proposal; the harness validates and authorizes it. Hosting the model or using a framework does not transfer responsibility for the application's business rules.

**Workflow and agent.** A workflow has developer-defined transitions, even when some nodes call models. An agent uses model judgment to select its next permitted action. A hybrid is common: investigation can adapt while eligibility, approval and verification remain fixed. The difference concerns control ownership, not whether a diagram contains an LLM. See Chapters 2, 3 and 16 for the implications of choosing either pattern.

**Tool and skill.** A tool is one callable capability with inputs, outputs, errors, limits and effect semantics. A skill packages a reusable procedure with instructions, resources, tools and tested logic. A skill can perform several tool operations without becoming a separate agent. Discovering either capability does not authorize execution; identity and action policy still govern each operation. See Chapters 6 and 10.

**State, context, memory and RAG.** State records the current run. Context is the selected information sent to one model call. Memory retains governed information for later work. Retrieval-augmented generation brings external evidence into context. They overlap operationally but should not be interchangeable in the design. A remembered order status may be stale; the current order service still supplies the fact needed before a refund. See Chapters 7-9 and 12.

**MCP and A2A.** MCP connects tools, resources and prompts through defined interfaces. A2A supports task collaboration with remote agents. One boundary exposes a capability; the other can delegate reasoning and execution ownership. Both require scoped caller authority, validated results and retained provenance. Neither is the complete application authorization layer. See Chapters 14 and 15.

**Testing, evaluation, observability and AgentOps.** Tests verify deterministic contracts; evaluation measures task behavior and uncertainty; observability records operational evidence; AgentOps manages releases and outcomes over time. A passing unit test cannot establish model quality, and a high judge score cannot establish authorization. These practices complement one another because they answer different questions about the same run. See Chapters 24-27.

## Glossary

### A2A (Agent2Agent)

An open protocol for remote agent discovery and collaboration through tasks, messages, status and artifacts. A capability card describes a remote agent; it does not confer trust or local effect authority. Chapter 15.

### ABAC

Attribute-based access control: permission depends on verified subject, resource, action and environmental attributes. Evaluate it outside model judgment, with explicit rules and negative tests. Chapter 20.

### Activity (durable execution)

External or nondeterministic work recorded by a workflow engine, such as a model call or API operation. A lost completion can cause retry, so effects still require their own idempotency or reconciliation. Chapter 16.

### Agent card

A machine-readable description of a remote agent's identity, endpoint, capabilities and security requirements. Validate its provenance and constrain the task before delegation. Chapter 15.

### Approval interrupt

A pause pending a human decision. Durable pause preserves execution; the approval service separately validates authority, proposal binding, expiry and consumption. Chapter 18.

### Autonomy level

The permitted degree of independent action for a defined action class, from assistance or proposal to supervised or bounded autonomous execution. Grant it through policy and evidence, not model confidence. Chapter 2.

### Budget

A limit on steps, tool calls, tokens, money or time. Persist cumulative usage across continuation, and preserve uncertain effects when the run stops. Chapters 2 and 28.

### Canary release

A bounded rollout of a pinned behavior version to a selected cohort, measured against an explicit baseline with rollback conditions. Keep active runs on compatible versions. Chapter 27.

### Cascade

Trying a lower-cost model first and escalating when a reliable validation or quality signal requires it. Include both-stage cost and outcome quality when evaluating the policy. Chapter 28.

### Checkpoint

A stored snapshot of run progress used for continuation or inspection. It is durable only under a persistence contract that survives the relevant failure. It does not rewind external effects. Chapter 7.

### Circuit breaker

A mechanism that temporarily stops requests to a failing dependency and tests recovery under a defined policy. It helps avoid amplifying an outage with repeated calls. Chapter 23.

### Compensation

An authorized action that semantically reverses or offsets a known applied effect. It may fail or require different authority; it is not a general undo operation. Chapter 23.

### Confused deputy

A privileged component misled into acting for someone who lacks that authority. Preserve requester, actor and resource scope through the downstream boundary to prevent it. Chapter 20.

### Context engineering

Selecting and ordering information for a model call under token, freshness, entitlement and provenance constraints. It includes observation bounds, history management and reserved output space. Chapter 8.

### Context manifest

A record of what entered a model call: source identities, trust labels, versions and token counts. It supports diagnosis but cannot reconstruct discarded content unless its references remain available. Chapters 8 and 26.

### Continuous batching

Serving requests by adding or removing work from an active decoding batch rather than waiting for a fixed batch to finish. Evaluate throughput together with latency and memory constraints. Chapter 30.

### Corrective retrieval

Checking retrieved evidence and revising the query, source or answer strategy when support is weak. Abstention or a partial answer may be the correct correction. Chapter 13.

### Durable execution

Execution whose recorded progress, waits and retry decisions survive specified process failures. External effect safety remains a separate service contract. Chapter 16.

### Evaluator-optimizer

A bounded loop in which an output is graded against a rubric or external evidence, then improved. Repeated rereading without new information is not an assurance of quality. Chapter 3.

### Event sourcing

Recording changes as an ordered event stream from which current state can be reconstructed. Define validation, ordering, schema evolution and snapshot semantics. Chapter 7.

### Evidence ledger

Owned source records with stable IDs, locators, versions, times and supporting facts. Claims refer to entries, and support is checked rather than assumed from citation presence. Chapter 13.

### Excessive agency

Giving an agent more capabilities, scope or autonomous authority than its task needs. Narrow tool exposure and downstream permission reduce the possible consequences of manipulation. Chapter 19.

### Golden trajectory

A reviewed reference path of decisions and observations for a case. Allow legitimate alternatives; grade invariant requirements instead of requiring every successful run to mimic one transcript. Chapter 24.

### Graph orchestration

Explicit scheduling of nodes over state with branches, loops and pauses. Validate dynamic destinations and preserve authority checks in the actual execution path. Chapter 16.

### Groundedness / faithfulness

The extent to which claims are supported by the provided evidence. A supported claim can still concern an outdated or inappropriate source, so source applicability also matters. Chapters 12 and 25.

### Handoff

An explicit transfer of task or conversational control. Record ownership, scope, budgets and the return or escalation contract. Chapters 7 and 17.

### Hybrid retrieval

Combining lexical and dense retrieval signals, often through rank fusion. Measure relevance by query type and preserve entitlement filters before results reach context. Chapter 12.

### Idempotency key

An identifier reused for the same intended operation under the downstream service's deduplication contract. Its retention and request-binding rules matter; generating a new key creates a new request identity. Chapter 6.

### Indirect prompt injection

Hostile instructions embedded in content the agent reads, such as documents, tool output or images. Treat content as data and enforce authority independently of its text. Chapter 19.

### Instruction pack

A reviewed, owned and versioned set of instructions assembled into the agent's prompt. Loaded provenance and authority matter more than emphatic wording. Chapter 4.

### KV cache

Stored attention keys and values for processed tokens during inference. Its memory demands affect concurrency and serving behavior; it is unrelated to application approval or run state. Chapter 30.

### Kill switch

A runtime control that denies a defined class of new work, such as mutations. It cannot undo submitted effects, which still need reconciliation and reporting. Chapter 27.

### LLM-as-judge

A model grading outputs against a rubric. Calibrate it against human labels, pin its version and prefer deterministic checks for properties code can establish. Chapter 25.

### LLM gateway

An owned model-access service centralizing provider behavior, identity, routing, quota, usage and data policy. It supports consistent enforcement but does not decide application eligibility. Chapter 30.

### MCP (Model Context Protocol)

A protocol through which hosts access tools, resources and prompts. Discovery, transport and application authorization remain distinct responsibilities. Chapter 14.

### Plan-and-execute

A model proposes an inspectable plan that an executor carries out under validated boundaries. New evidence may require replanning and new authority for changed effects. Chapter 3.

### Policy-as-code

Versioned, testable permission and governance rules enforced outside model judgment. Verify both allowed and denied cases, including boundary errors. Chapter 20.

### Progressive disclosure

Loading a small capability catalogue first, then detailed instructions and resources when needed. It reduces unnecessary context without removing permission checks. Chapter 10.

### Provenance

The identities and versions behind a decision: requester, actor, instructions, model, evidence, policy and approval. It supports traceability; provenance alone does not prove correctness. Chapters 22 and 26.

### RBAC

Role-based access control. A verified role can be a necessary permission condition, while resource ownership, tenancy and current business rules still constrain the action. Chapter 20.

### ReAct

A model-directed loop choosing a permitted action, observing the result and deciding again. Budgets, typed tools and external completion checks bound the adaptive work. Chapter 3.

### Reducer

A function defining how an update combines with current state. Choose semantics such as immutable-ID deduplication rather than assuming list addition is always correct. Chapters 7, 16 and 32.

### Reranker

A model or algorithm that reorders retrieved candidates for relevance. It helps prioritize evidence but cannot repair missing entitlement or source-version metadata. Chapter 12.

### Retry budget

A bound on retry work that prevents failures from multiplying traffic and cost. Distinguish safe read retry from an uncertain external effect. Chapter 23.

### Router

A validated decision among fixed handlers, with clarification or fallback for ambiguous input. Static type annotations alone do not authorize its destinations. Chapter 3.

### Saga

A durable sequence of operations with compensating actions when later work cannot complete. Every effect and compensation needs authority, recorded progress and repeat-safe recovery. Chapter 23.

### Sandbox

An isolated execution environment with explicit file, network, resource and secret restrictions. Read-only storage prevents writes, not reads; confinement requires the full policy. Chapter 21.

### Shadow release

Observing a candidate on permitted copied work without allowing real side effects. Ensure the shadow's tools cannot mutate or exfiltrate through an overlooked path. Chapter 27.

### Skill

A reusable procedure combining instructions, resources, contracts, tools and tested logic. Procedural updates are behavior changes and follow review and evaluation. Chapter 10.

### SLO / SLI

A service-level objective is a target for a measured service-level indicator. State population, window and outcome meaning so a healthy platform cannot conceal unverified task completion. Chapter 27.

### Structured output

An output constrained and validated against a schema. Syntactic validity does not establish truth, authority, current eligibility or semantic correctness. Chapter 1.

### Token exchange

Exchanging a credential for a more appropriate audience- and scope-bound token, often preserving subject and actor identities. Downstream services still enforce the resource and action. Chapter 20.

### Tool poisoning

Manipulation of a tool description or schema to influence agent behavior. Pin approved identities and definitions, review changes and deny unfamiliar capabilities. Chapters 14 and 19.

### Trajectory

The sequence of decisions, observations, calls and transitions in a run. Evaluate required invariants and outcomes, not just fluent explanations of the sequence. Chapter 25.

### Workload identity

Authenticated identity associated with a running service or workload, reducing dependence on static keys. It is not a substitute for the current user's delegated and resource-scoped authority. Chapters 20 and 29.

# B. Production Readiness & Architecture Review Checklist

A readiness review turns a design's promises into evidence. For every question, record an owner, artifact, observed result and unresolved risk. A “yes” without a test, record or rehearsal is only an assurance. Use this checklist before initial launch and when autonomy grows. Separate hard action-safety requirements from product targets that may have an explicitly approved staged scope.

## Architecture & autonomy

Can the owner explain why adaptive choice is needed and which steps remain fixed? Does the autonomy register name permitted actions rather than grant broad independence to an agent persona? Does every model-generated route pass runtime validation? Are budgets, terminal reasons and completion evidence explicit? The review should also include one simplification considered and the contract that prevents removing a necessary boundary.

- Record the workflow/agent decision and supported users, environments and outcomes.
- Verify declared destinations and tests for unknown or bypass routes.
- Check step, time, token and money limits, including continuation.
- Inspect action-class autonomy and prohibited operations.
- Demonstrate external completion checks and truthful incomplete exits.
- Reconcile progress records and uncertain effects when multi-session work resumes.

## Tools & side effects

For each capability, inspect purpose, inputs, output, errors, scope and effect class. A valid JSON request can still name another tenant's record or stale business facts. Mutation safety requires authority and a downstream effect contract, not just a local ledger. Reconciliation and compensation must be usable by operators when the ordinary path fails; their permissions and limits deserve the same review as initial execution.

- Validate strict schemas and clear descriptions with selection cases.
- Enforce principal, tenant, resource and operation scope at execution.
- Filter offered tools and independently deny unauthorized direct calls.
- Persist logical effect intent before dispatch and define downstream deduplication retention.
- Test lost responses, concurrent proposals and outcome reconciliation.
- Test authorized compensation and manual recovery.
- Pin MCP/remote identities and schemas, with explicit drift response.

## State, context & memory

State should survive the failures the product promises to tolerate, under a tested migration contract. Context should expose only what the current call may see. Memory should retain information for a stated purpose, with provenance and deletion. These can share infrastructure but must retain separate ownership. A cache, checkpoint or namespace label cannot silently become the authority for a user's action.

- Resume after actual process loss without repeating an uncertain effect blindly.
- Version state and test old paused records against deployment changes.
- Bound observations and reserve output tokens centrally.
- Retain context manifests with usable source references and data-policy decisions.
- Gate memory writes, record supersession and reject policy-like instructions.
- Verify served deletion, derived indexes, backup expiry and restore suppression separately.

## Knowledge

Inspect whether the evidence applies to the question, not only whether search returned something. Relevant policy version, entitled records, units and population definitions determine meaning. A source outage or missing dimension should produce an inspectable limit. The final answer and proposed action both need support; a citation marker establishes a pointer, not entailment or current truth.

- Measure retrieval by labeled query slices and document versions.
- Apply entitlement and tenant filters inside retrieval.
- Preserve freshness, owner, source locator and query definitions.
- Verify claim support and evidence sufficiency.
- Test conflict resolution, partial answers and unanswerable questions.

## Security & identity

Assume the model can be manipulated by material it reads. Confirm that the resulting proposal cannot acquire more authority than the authenticated task permits. Review requester, actor and service credentials separately. Sandbox generated code and UI actions wherever candidate behavior executes, including hidden tests. Name the residual risks rather than turning a finite injection suite into a universal security claim.

- Propagate subject, actor, audience, resource and scope under verified identity.
- Use short-lived authority and no secrets in model context or candidate execution.
- Test cross-tenant reads, writes, caches and memory access.
- Cover prompt injection, tool poisoning, exfiltration and compromised remote artifacts.
- Deny egress and file access outside an explicit policy; test reads and writes separately.
- Maintain a current threat model mapped to applicable security guidance.

## Human oversight

An approver needs a concrete proposal, enough evidence to judge it and a record of the decision. The service must check more than a matching hash: identity, role, action, expiry and use status all matter. Current preconditions can invalidate an old proposal even while its approval remains unexpired. This review should include rejection quality and rubber-stamping risk, not just approval throughput.

- Apply deterministic risk and required-approver policy before execution.
- Bind exact proposal, target, arguments, tenant and expiry.
- Present evidence, impact, recovery and verification on the card.
- Require distinct authorized identities where policy calls for them.
- Define reminders, reassignment and expiry without automatic approval.
- Test immediate replay, altered proposal and changed live preconditions.

## Reliability

Failures need classified responses. Reads can often retry; uncertain effects require reconciliation; changed plans require new authority; compensation applies only to known effects. A dead-letter queue without replay and closure tooling merely stores unfinished responsibility. Durable waits need timers that survive restart, and retry limits must protect dependencies instead of increasing pressure during an outage.

- Set timeouts and bounded jittered retries by operation semantics.
- Record outcome unknown distinctly from definite failure or denial.
- Exercise circuit breakers and evaluated degraded paths.
- Preserve durable timers, signals and behavior versions across restart.
- Operate dead-letter inspection, authorized replay and closure.
- Rehearse restore objectives and downstream effect reconciliation.

## Testing & evals

Deterministic tests establish control contracts; live-model evaluations examine behavior on labeled tasks. Keep critical slices visible and specify how independent cases and repeated trials are counted. Judges need calibration and versioning. A candidate should not pass by editing its tests, leaking held-out examples into prompts or changing the grader along with the system being measured.

- Cover validators, tools, policy branches, migrations and every critical graph path.
- Use fault injection for timeout, replay, crash and dependency failure.
- Evaluate outcome, grounding, trajectory, safety and efficiency by slice.
- Calibrate judges against human labels and prefer deterministic checks where possible.
- Keep held-out sets, environment and grader versions controlled.
- Block releases on critical failures, with inspectable reports and intervals.

## Observability & AgentOps

An operator should reconstruct an important run from source request through external result. Versions and evidence make the explanation reproducible; redaction keeps it appropriate to retain. Audits survive trace sampling when authority matters. Operational controls must be rehearsed: a kill switch that changes only a prompt leaves other effect paths active, while a broad shutdown may remove the investigation humans still need.

- Propagate correlation across queues, models, tools, MCP and A2A.
- Record provenance and sensitive-data decisions before export.
- Define SLOs for useful verified outcomes as well as platform availability.
- Maintain alerts, runbooks, ownership and on-call access.
- Rehearse shadow, canary, compatible rollback and mutation stop controls.
- Feed reviewed production failures back into regression cases.

## Cost & scale

Budget the unit of useful work, including verification and failed attempts. Capacity needs model quota, tool limits, fair admission and queue policy together. Autoscaling workers cannot create provider quota, and can amplify an overloaded backend. Compare task routing and caching with measured quality; a lower token invoice is not the same value if more cases end incorrectly or remain unverified.

- Enforce run, user and tenant allowances through reservation and usage accounting.
- Evaluate routing, cascade and caching under their explicit assumptions.
- Measure total cost per successful outcome, separating infrastructure where needed.
- Load-test queues, backpressure, concurrency and fair sharing.
- Allocate regional provider quotas and verify permitted fallbacks.

## Governance

Document data classes and flows, retention, audit and applicable organizational obligations. Prompts, models, policies, tools and autonomy are behavioral artifacts and should change through owned review. Legal interpretation belongs to qualified organizational owners using current primary sources; the engineering checklist supplies records and enforcement evidence. Increasing autonomy is a new decision supported by error, recovery and operating data, not a reward for a high demo score.

- Review provider, region, destination and retention for each data flow.
- Verify tamper-evident audit with external anchoring and access controls.
- Govern behavior releases with owners, versions and evaluation evidence.
- Record residual risks and approved exceptions with scope and expiry.
- Require evidence and staged monitoring before expanding an action class's autonomy.

# C. Senior Interview Question Bank

Practice these questions aloud before reading the model answer. A strong answer connects requirements to a concrete request and failure, then names evidence. It does not need every framework name. If an answer fits any system without changing its examples, make it more specific. Use the referenced chapters to develop the trade-offs and repeat the exercise with a different task.

## 1. Define an agent precisely. How does it differ from a workflow and a chatbot?

An agent uses model judgment inside an owned loop to select permitted work toward a goal, observe results and stop under explicit conditions. A workflow has developer-defined transitions even when nodes call models. A chatbot may answer turn by turn without owning a longer task. Explain the control boundary with ShopAssist: investigation can adapt, while order ownership, approval and accounting remain fixed services. Chapters 2 and 3.

## 2. Draw the anatomy and explain the loop

Start with goal, principal, policy, model, tools, observations, state and termination. Build bounded context, request a decision, validate authority and budget, execute permitted work, record its result and decide whether the goal is externally verified. Model output is probabilistic; external systems can also fail or be uncertain, so deterministic harness logic must classify their outcomes rather than pretend the whole world is deterministic. Chapters 2 and 5.

## 3. The agent reports work done when it is incomplete. How do you fix it?

Treat final text as a completion claim. Define acceptance evidence from actual artifacts or system state, and verify it before marking the run complete. Separate completed, pending, incomplete, failed and outcome-unknown exits. For coding, inspect tests and artifacts; for refunds, inspect effect records. Evaluate false completion against those observations, retain every escaped case and avoid grading only the agent's own summary. Chapters 5, 24 and 25.

## 4. Trace a tool call end to end

The model emits intent, the runtime validates its contract, checks principal and resource, classifies risk and obtains bound authority if required. It persists an effect identity, issues scoped credentials, dispatches with timeout, normalizes the result and records audit plus telemetry. A lost response becomes uncertainty to reconcile. The next model observation retains source identity without acquiring instruction authority. Chapters 1 and 6.

## 5. Differentiate state, context, memory and RAG

State is this run's plan and pending decision. Context is the selected tokens in one call. Memory may retain a governed language preference across runs. RAG retrieves an applicable policy passage into context. All can contribute information, but current order facts must be refetched before a refund. Explain what can expire, what can be deleted and what is authoritative for the proposed action. Chapters 7-9 and 12.

## 6. Compare the major control patterns

ReAct adapts from each observation; plan-and-execute makes an intended sequence inspectable; evaluator-optimizer uses a rubric or external evidence to improve an output; graphs make mandatory steps and waits explicit. Predictable work usually fits a workflow, while open investigation benefits from bounded adaptation. Measure quality, cost and latency on the same cases and explain the recovery behavior, not just a preferred pattern name. Chapters 3 and 16.

## 7. How are tools and skills discovered and composed?

Tools expose atomic typed capabilities; skills package reusable procedures, resources and tested logic. A small catalogue enables discovery, with details loaded when needed through progressive disclosure. The registry pins identity, version and contract, and execution still checks authority. A newly discovered skill cannot override policy by describing itself as safe. Show one skill used by two agents without duplicating orchestration. Chapters 6 and 10.

## 8. How do you resume a coding task spanning several sessions?

Keep durable state and a human-readable progress record with the goal, attempted approaches, artifacts, check evidence and next step. Resume by inspecting actual branch/files and reconciling any external effect whose response may have been lost. Load approved repository instructions from a trusted ref. Keep candidate execution isolated and PR publication scoped. A progress file or a remembered summary is an orientation aid, not proof of completion. Chapters 7, 23 and 34.

## 9. Design checkpoint continuation and idempotency

Persist versioned state, logical effect intent before dispatch and outcome after observation. Use single-writer/fencing controls where concurrent workers can race. A downstream service's idempotency or atomic business constraint prevents duplicate effects under its stated retention contract. An ordinary check-before-act races unless it is atomic. Unknown outcomes need reconciliation or escalation; a checkpoint alone cannot make a remote API transaction part of the database commit. Chapters 7, 16 and 23.

## 10. Threat-model injection, poisoning, exfiltration and execution

Assume proposals can be manipulated. Constrain private data access, untrusted input and outbound effects; enforce authority outside model text. Pin tool schemas, scope identities, deny unfamiliar capabilities and isolate executable content with explicit egress and file policy. A reader/actor split helps but does not turn arbitrary free text into safe instructions. Test actual denied actions and retain residual risks rather than promising universal injection immunity. Chapters 19 and 21.

## 11. Distinguish user, agent and service identity

The user or approved system principal defines who requested the work. The agent workload defines the running actor. The downstream credential reaches a specific service. Effective authority respects their permitted intersection and resource scope, often through short-lived audience-bound token exchange. The service still checks ownership and current conditions. Explain a confused-deputy case in which a broad service account would otherwise act for an unauthorized caller. Chapter 20.

## 12. Design human approval for a high-risk action

Score risk deterministically, pause durably and present the exact proposal with supporting evidence, impact, recovery and verification. Validate approver identity and role, action binding, canonical hash, expiry and consumption. Require distinct privileged approvers where stated. Revalidate current preconditions atomically at execution. Reject immediate replay while still unexpired. Reminders and reassignment do not renew authority silently or turn timeout into automatic approval. Chapter 18.

## 13. How do testing and evaluation fit release work?

Tests check deterministic contracts, routes, policy, migrations, restart and effect recovery. Evaluation measures model-dependent outcomes, evidence support, trajectories, safety and cost over labeled cases. Repeat trials to reveal instability, while reporting intervals over the declared independent case unit. Both gate changes, with critical safety failures separate from aggregate quality. Live rehearsal then tests dependencies and permissions omitted by deterministic fakes. Chapters 24 and 25.

## 14. Trace one complete agent run with OpenTelemetry

Use one correlation chain with run, model, tool, retrieval, policy, approval and state events or spans. Record behavior, tool, prompt and evidence versions. Propagate context through asynchronous and remote boundaries; avoid treating a long approval wait as one worker that remains alive. Redact before recording, and keep unsampled durable authority/effect audit separately. A trace explains what happened; it should not expose private reasoning or secret content unnecessarily. Chapter 26.

## 15. Define AgentOps SLOs, rollout and emergency controls

Measure verified task outcomes, safe escalation, unauthorized actions, time, cost and recovery, with platform health alongside them. Shadow before a bounded canary, compare pinned cohorts and state rollback criteria with adequate samples. Keep active runs compatible through deployment. A mutation kill switch prevents new effects while observation remains useful; it cannot reverse already submitted work. Rehearse who operates it and how uncertain outcomes are reconciled. Chapter 27.

## 16. Design model routing, budgets and degraded modes

Route tasks according to measured quality and risk. A cascade needs a reliable signal for escalating, and evaluated fallbacks must not alter an approved effect. Account for both calls, validation and unsuccessful work. Reserve per-run and per-tenant capacity centrally, enforce cumulative allowances and offer useful scoped degradation when a provider fails. Explain cost per successful task rather than only cheaper token prices. Chapters 28 and 30.

## 17. Scale a stateful agent on Kubernetes

Keep APIs and workers restartable, with owned durable state outside pods. Use queues, admission control, fair sharing, explicit leases/fencing and concurrency caps matched to provider and tool limits. Isolate executable tasks and issue workload identity without static secrets. Version deployment and behavior together, rehearse restore and preserve paused runs. Autoscaling adds workers; it does not solve quota exhaustion or duplicate external-effect semantics. Chapter 29.

## 18. Choose among single-agent, graph and multi-agent designs

Begin with fixed steps as a workflow and exploratory work as a bounded agent. Add a router for distinct intents, specialists for measured permission/context/ownership advantages, and parallel workers for independent subtasks. Use a graph or durable workflow when mandatory transitions and long waits need explicit control. Describe what you considered removing. A single agent with well-designed tools can outperform a larger coordination system on the actual workload. Chapters 16, 17 and 35.

## 19. How do you establish that a context-policy change helped?

Hold model, tasks, grading and environment constant, changing only the context policy. Repeat trials, compare per-case outcomes and report quality, false completion, cost, latency and tool failures by slice. Inspect regressions and support retention: a short summary may reduce cost while dropping a fact needed later. Pin the behavior and dataset versions, then stage observation before expanding use. Chapters 8, 25 and 28.

## 20. Perform a readiness review and simplify the design

Walk the autonomy, control, tools, state, knowledge, memory, security, identity, governance, reliability, quality, operations and cost contracts using evidence. Propose cuts such as merging identical specialists or removing an ineffective reflection loop. Preserve the required authority and recovery boundary. Record owners and consequences for unresolved gaps. A senior answer ends with a defendable scope and tests, not the largest possible catalogue of services. Chapter 35 and AppendixB.

# D. Tooling Map & Further Reading

The stack should support the contracts you can explain and test. Master one path deeply before adopting alternatives. The product and protocol references below reflect the October 2026 edition; consult current primary documentation and preserve exact versions in your own release records. Papers describe mechanisms under their experimental assumptions. A reported research gain does not establish the same result on your enterprise task.

## Enterprise tooling map

Python with typed APIs, FastAPI and Pydantic is one application path; Java with Spring Boot and Spring AI is another. Learn asynchronous behavior, authentication, streaming, contract validation and tests in the language your team operates. Build a small from-scratch harness before mapping it to LangGraph or the OpenAI Agents SDK. Use the Claude Agent SDK when its built-in capability surface fits the controlled environment rather than exposing it casually to every customer task.

For knowledge, LlamaIndex, LangChain and Spring AI offer ingestion and retrieval components. PostgreSQL, Redis and an owned object store support records, caches and large payloads. pgvector, OpenSearch/Elasticsearch, Pinecone, Weaviate or Milvus are options for search needs; learn filtering, relevance, HNSW/IVF trade-offs and tenancy before comparing brands. Retrieval quality and authority depend on the metadata and access contract, not just a successful similarity call.

Temporal and cloud workflow services support durable coordination under their distinct semantics. Kafka, RabbitMQ, SQS, Service Bus and Pub/Sub supply event or work transport. Learn acknowledgment, redelivery, ordering, backpressure and dead-letter recovery. OpenTelemetry with Prometheus/Grafana or an enterprise APM explains operational behavior; LangSmith or Phoenix can add agent-focused inspection. Keep audit, redaction and version provenance explicit whichever backend you choose.

DeepEval, Ragas, promptfoo and provider/runtime evaluation tools can help automate measurement. The important skills are labeled cases, calibrated graders, critical slices, independent observational units and release decisions. OAuth/OIDC, RBAC/ABAC, OPA/Cedar and Vault or cloud secret platforms support identity and policy. API gateways such as Kong, Apigee, AWS API Gateway and Azure API Management implement edge concerns, while downstream services still authorize records and effects.

Docker, Kubernetes/OpenShift and Helm support deployment and isolation; Terraform and GitOps tools such as Argo CD manage infrastructure and releases. GitHub Actions, GitLab or Jenkins can run deterministic checks and evaluations. When self-hosting is justified, study vLLM, KServe, Ray Serve and SGLang with batching, memory, GPU utilization and latency measurement. MLflow or Kubeflow earns a place when experiment lineage or training pipelines actually need it, not as a required box in every agent architecture.

## Primary deep-learning path

Begin with provider calls, structured outputs and typed tools, then a controlled harness and one framework adapter. Build the appropriate Python or Java application path. Add governed relational and retrieval storage, then durable execution and events where the lifecycle requires them. Establish testing and evaluation before expanding autonomy. Instrument and operate the system, deploy it reproducibly on one cloud, and consider self-hosted inference only after quality, economics and operating ownership justify it.

The order is intentionally cumulative. A new service should solve a problem already visible in the smaller system: a lost approval requires durable continuation; a confusing answer requires better evidence; an expensive run requires accounting and context measurement. Keep alternatives behind contracts and revisit them through comparable tests. Framework independence is demonstrated by preserved behavior, not by an abstract interface that has never been exercised with another adapter.

## Further reading: reasoning, retrieval and agents

- Yao et al., [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629), 2022 / ICLR 2023. Read the interaction mechanism and task assumptions before adopting a loop.
- Shinn et al., [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366), 2023. Examine feedback and episodic memory, including what actually supplies verification.
- Lewis et al., [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020. This provides the foundation for combining retrieval and generation.
- Asai et al., [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511), 2023. Distinguish its trained mechanisms from a generic prompt telling an agent to reflect.
- Yan et al., [Corrective Retrieval Augmented Generation](https://arxiv.org/abs/2401.15884), 2024. Examine how weak retrieval is evaluated and corrected.
- Edge et al., [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130), 2024. Consider the relationship between indexed structure and query needs.
- Liu et al., [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172), 2023. Use it to motivate task-specific context evaluation, not a claim that every current model behaves identically.
- Cormack, Clarke and Buettcher, [Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods](https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf), SIGIR 2009. Inspect the rank-fusion method and evaluation setting.

## Further reading: serving and systems

- Kwon et al., [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180), SOSP 2023. Connect the memory mechanism to throughput and latency measurement.
- Beyer et al., [Site Reliability Engineering](https://sre.google/books/) and The Site Reliability Workbook. Use the primary texts for SLOs, error budgets, incident practice and operating ownership.
- Garcia-Molina and Salem, [Sagas](https://doi.org/10.1145/38713.38742), SIGMOD 1987. Study semantic compensation rather than assuming a distributed sequence has database-like rollback.
- [Temporal activities](https://docs.temporal.io/activity-definition) and [Python workflow messages](https://docs.temporal.io/develop/python/workflows/message-passing). Inspect retry, lost completion, durable waits and signal behavior.
- [Docker run reference](https://docs.docker.com/reference/cli/docker/container/run/) and [Kubernetes documentation](https://kubernetes.io/docs/). Verify the actual isolation, identity and resource contracts behind deployment shorthand.

## Protocols and standards

Consult the [MCP 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28) and its [release explanation](https://blog.modelcontextprotocol.io/posts/2026-07-28/), which describes the stateless core. Consult the [A2A 1.0 specification](https://a2a-protocol.org/v1.0.0/specification) for remote-task semantics. Pin protocol and SDK compatibility in your application rather than treating a current web page as the version a paused run originally used.

[OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/otel/semantic-conventions/) evolve; follow the applicable current convention and preserve your instrumentation version. [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749.html), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) and [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html) describe different parts of identity and token exchange. Read them with your actual audience, resource and delegation requirements, not as a substitute for testing those requirements.

## Security, risk and governance

Use the [OWASP GenAI Security Project](https://genai.owasp.org/) and [agentic security guidance](https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/) to organize threats and controls. Use the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) and its Generative AI Profile for risk-management structure. Their role is to guide review and evidence, not to turn a completed checklist into automatic risk acceptance.

[ISO/IEC 42001:2023](https://www.iso.org/standard/42001) concerns AI management systems. [Regulation (EU)2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) is the primary EU AI Act text. Applicability, implementation dates and legal interpretation must be determined by qualified organizational owners using current authoritative material. Engineers contribute the system inventory, data flows, controls, audit and operating evidence those decisions require.

## Frameworks and platforms: official references

- [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) and [LangChain](https://docs.langchain.com/oss/python/langchain/overview) for graph and component interfaces.
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) and [RunState](https://openai.github.io/openai-agents-python/ref/run_state/) for run lifecycle and owned snapshot handling.
- [Spring AI](https://docs.spring.io/spring-ai/reference/) and its [2.0 release](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/) for the advisor-based tool loop.
- [Claude Agent SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions) for capability and callback boundaries.
- [LlamaIndex](https://docs.llamaindex.ai/), [CrewAI](https://docs.crewai.com/) and [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/) for their supported programming contracts.
- [Google ADK](https://google.github.io/adk-docs/) and [Gemini Enterprise Agent Platform](https://cloud.google.com/blog/products/ai-machine-learning/whats-new-in-gemini-enterprise-agent-platform/) for the Google-native path.
- [Strands Agents](https://strandsagents.com/latest/) and [Amazon Bedrock AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/) for the AWS path, including [policy](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-core-concepts.html).
- [vLLM](https://docs.vllm.ai/), [KServe](https://kserve.github.io/website/) and [Ray Serve](https://docs.ray.io/en/latest/serve/) when inference hosting is a measured requirement.

# E. Case Studies - Four Production Failures

These four cases are fictional composites for learning. Organizations, figures and timelines are invented; the failure mechanisms reflect the engineering contracts discussed in the book. They are not reports of the author's customers or verified incidents. Read each case by asking what the runtime knew, what authority it held, what evidence was missing and which change would have prevented the consequence. The model is one participant in the system, not its only possible cause of failure.

:::analogy Reading an accident investigation
A published investigation reconstructs the sequence and asks how the system permitted it, rather than stopping at blame. Pilots and engineers study such reports to rehearse situations they hope never to face. These fictional cases serve that purpose for agents. Where it stops: they are teaching composites, not official accident findings or measured evidence about the frequency of real deployments' failures.
:::

## Case 1 - The refund that ran twice

### Context and event

A retailer allows a support agent to refund up to INR 5000 under a reviewed policy. The provider normally responds within seconds. The harness uses an eight-second timeout and retries failed tool calls twice. During a slowdown, the provider applies a refund but its response arrives after the harness has given up. The runtime calls the same business action again without a stable provider idempotency key, and the provider applies another refund.

Over forty minutes, 214 customers receive unintended second refunds averaging INR 1850, totaling INR 395900. The assistant's confirmation text is fluent and usually accurate about at least one refund. Its tool-success metric looks healthy after retries. Finance's reconciliation finds duplicate effects rather than relying on the agent's summary. This case illustrates that model-quality and tool-response dashboards can stay green while financial correctness fails at the transport boundary.

### Timeline and root causes

At 14:02, provider latency rises. At 14:05, the first duplicate effect occurs without an alert. At 14:31, finance identifies unexpected duplicate records. At 14:42, the owner disables new refund execution while support continues to explain status and hand off. By 15:30, the team begins reconciliation against provider records. Recovery requires establishing which effects actually occurred; issuing compensations before that evidence would create more uncertainty.

:::diagram
{"kind":"timeline","title":"The response was lost, not the refund","nodes":[{"label":"First request","detail":"Provider processes intended refund","role":"action"},{"label":"Caller timeout","detail":"Runtime does not know the applied outcome","role":"runtime"},{"label":"New unbound request","detail":"No stable effect key reaches provider","role":"action"},{"label":"Second refund","detail":"Provider treats the retry as new work","role":"external"},{"label":"Reconciliation","detail":"Finance finds duplicate effect records","role":"data"}],"caption":"The missing control is repeat-safe effect identity, not better confirmation wording.","insight":"A timeout communicates uncertainty about the result."}
:::

The tool lacked provider idempotency despite support for it. The harness classified a timeout as definite failure and applied a generic retry policy to a financial write. It recorded no recoverable intent and made no outcome query. Monitoring counted eventual responses rather than expected logical effects. A preceding “not refunded” read would still race without atomic payment accounting. These failures belong in service and runtime contracts, not in a prompt telling the agent to be careful.

### Repair and lesson

Persist the logical effect identity before dispatch, reuse it under the provider's documented retention rules, and reconcile after unknown outcome. Enforce cumulative refundable balance atomically in the payment service. Differentiate repeated delivery from a distinct legitimate partial refund. Reconciliation should alert on duplicate effect identities or exceeded accounting bounds, not simply more than one refund per order, which can be permitted. Test the provider applying an effect then losing its response across an actual worker restart.

The owner restores execution only after the effect and retry contracts pass. Audit links authority, intent, provider reference and reconciliation. For a provider without safe deduplication or status resolution, unresolved uncertainty goes to human handling rather than another financial write. The central lesson is narrow: repeat-safe retries require a service contract that establishes the prior result; a local unique row or confident response cannot substitute for it. Chapters 6, 7, 18 and 23.

## Case 2 - The helpful email

### Context and event

An inbox agent reads supplier invoices and can reply or forward messages with the shared mailbox's broad permissions. An attacker sends an email styled as an audit notice, including a hidden instruction to forward recent invoices and bank details to an external lookalike recipient and omit the action from the summary. The content enters the model alongside private records and a capable outbound tool. The runtime performs no recipient or data-loss check before execution.

The agent forwards twenty invoices and its daily summary does not mention them. The summary is produced from the same manipulated context, so it cannot serve as an independent audit. The system combined untrusted content, confidential data and outbound authority without a governing effect boundary. The visible user task was invoice extraction, but its credential scope exposed the mailbox's broader capabilities. A better wording instruction alone would not establish a durable recipient policy.

### Root causes

The reader and actor shared a context and permissions. The forward tool accepted arbitrary recipients and attachments, with no approved external-send flow. The service credential represented the mailbox's broad standing rights rather than the task's narrow actor. No trusted runtime event recorded source message, destination and attachment decision. The threat model checked direct malicious requests but omitted instructions hidden in ordinary retrieved business content.

:::diagram
{"kind":"boundary","title":"Invoice data must not become send authority","boundary_label":"Recipient and data policy","gate_after":1,"nodes":[{"label":"Supplier email","detail":"Untrusted content may include hidden instructions","role":"external"},{"label":"Extracted invoice","detail":"Validated business fields with source identity","role":"data"},{"label":"Outbound decision","detail":"Allowlisted recipient, data check and required approval","role":"policy"},{"label":"Scoped draft or send","detail":"Executor uses only permitted mailbox operation","role":"action"}],"caption":"Structured extraction reduces exposure but is not itself a complete permission boundary.","insight":"The recipient and attachments are checked where sending occurs."}
:::

### Repair and lesson

Restrict the reader to permitted extraction with no outbound tools. The actor receives validated fields and source references, while any retained text remains data. Limit the agent to scoped reading and drafting unless an explicit send policy grants more. External recipients are allowlisted, sensitive attachments are checked and required approval is bound to the exact outgoing message. Record audit independently of the model's summary, redacting content under retention policy.

Expand the attack cases with hidden text, multilingual instructions, lookalike destinations and attempts to suppress disclosure. Measure denied attempts and successful effects separately. A reader/actor split can reduce the attack surface, but a free-text schema still carries manipulation risk; deterministic scope and outbound policy remain essential. The lesson is that extraction does not authorize dissemination. Permission follows the actual recipient, data and effect, even when the instruction arrives in a familiar invoice format. Chapters 19-22.

## Case 3 - The quiet cost explosion

### Context and event

A business analytics agent handles thirty thousand conversations daily at approximately four cents per run, or $1200 per day. A Friday release changes SQL observations from a short bounded result to full result sets. Most final answers still look correct. For a common quarter-comparison task, large tool results enter history and are repeatedly resent, while ambiguous errors cause near-identical queries. No cost budget or loop guard establishes a stopping decision.

In forty-eight hours, sixty thousand runs average thirty-seven cents each: $22200 instead of about $2400. The illustrative difference is $19800. Customers do not complain because answer wording remains useful. Latency and error dashboards do not reveal the entire financial consequence. The release evaluation checked answer quality but did not compare tokens, cost or repeated observations by task slice, allowing a roughly ninefold cost regression to pass.

### Root causes

Unbounded observations inflated every later model call. History retained raw results rather than references and useful summaries. Near-identical requests supplied no new evidence, but step limits alone still permitted expensive loops. The gateway recorded invoices without per-run budget enforcement or an hourly cost-per-success signal. A tool contract change had been treated as plumbing instead of a behavioral and economic release. No owner reviewed its context consequences on the heavy slice.

:::diagram
{"kind":"flow","title":"A larger observation compounds later spend","nodes":[{"label":"Full SQL result","detail":"Large response enters context without a bound","role":"data"},{"label":"Retained history","detail":"Every later call carries prior raw results","role":"runtime"},{"label":"Repeated query","detail":"Error causes variants without useful new evidence","role":"model"},{"label":"Budget decision","detail":"Cap cost and stop nonproductive work","role":"policy"},{"label":"Measured release","detail":"Compare cost and quality by task slice","role":"success"}],"caption":"The final two controls describe the repaired design; no chart invents measured improvement.","insight":"Tool output size can alter cost without changing visible answer quality."}
:::

### Repair and lesson

Cap context observations under an explicit policy, retaining source records outside context and returning summaries plus evidence locators. Measure whether compaction preserves needed facts. Add repeated-call fingerprints and a no-new-evidence rule, with cumulative step, token and cost budgets. A budget stop produces a truthful incomplete or escalation outcome. The service should not quietly return a cheaper guessed answer merely to satisfy its cost target.

Compare candidate and baseline cost per useful outcome, p95 tokens, latency and quality on the heavy query slice. Set locally justified alerts and regression ceilings rather than treating an example percentage as universal. Reconcile the usage ledger with actual provider billing rules. The lesson is that cost is part of outcome quality and operating reliability: it must be measured at the work unit and considered when tool, prompt or context behavior changes. Chapters 8, 23, 26 and 28.

## Case 4 - The eval that lied

### Context and event

A legal-operations team gates answers using an LLM judge of support by governing contract clauses. It calibrates the initial grader against human labels once, obtaining an illustrative kappa of 0.78. Months later, a release changes retrieval and replaces the judge with a cheaper model. Reported faithful answers rise from 91% to 96%. The team interprets the higher score as improvement without checking whether the measuring instrument changed.

Three weeks later, a reviewer finds answers citing clauses from the wrong contract version. Human relabeling of 150 answers gives 84% faithfulness under the intended definition. The new judge accepted near-matching text and ignored the governing-version requirement. These fictional numbers illustrate confounded measurement, not a measured reliability property of any named model. The team changed both behavior and grading, so the old and new scores were not a fair comparison.

### Root causes

The judge and rubric were not treated as versioned measurement components. The changed grader lacked fresh calibration, and routine human samples had stopped. The rubric asked whether a clause existed rather than whether the source version governed the case. The release process allowed an attractive headline score to replace independent evidence. A valid-looking citation ID could pass even when the retrieval record established a different contract's authority.

:::diagram
{"kind":"comparison","title":"Hold the ruler steady when behavior changes","left":{"title":"Confounded release","items":["Retrieval changes","Uncalibrated judge changes","Headline score rises","Governing version defect hidden"]},"right":{"title":"Comparable measurement","items":["Frozen labeled cases","Pinned calibrated judge","Deterministic version checks","Human samples track drift"]},"caption":"The repaired measurement isolates behavior changes from grader changes.","insight":"A higher score is useful only when its meaning is comparable."}
:::

### Repair and lesson

Check governing clause and version deterministically before the judge sees the answer. Pin rubric, grader model and dataset; calibrate a grader change on fresh human labels, including version-conflict examples. Define a comparable measurement transition if the organization needs both old and new graders. Changing the judge is allowed, but it must have independent evidence and cannot silently redefine the release criterion while grading a changed agent.

Retain weekly human review with agreed disagreement analysis and drift alerts. Report the observational unit, rubric and confidence limits, not only a convenient aggregate score. Improve the criteria when reviewers find new gaps and retain the old measurement context for historical interpretation. The lesson is that evaluations are instruments with operating responsibilities. Prefer code for properties it can establish, and calibrate probabilistic judgments rather than treating a model's score as ground truth. Chapters 24 and 25.

## What the four cases have in common

The refund failed at repeat-safe effect handling. The email failed at data and outbound authority. The cost case failed at observation bounds, budget and release measurement. The judge case failed at measurement ownership and source applicability. All involve the system around model behavior as well as the model itself. Repairing that system requires records, interfaces and operating decisions a reviewer can inspect and a test can challenge.

Use the cases as rehearsal prompts. Ask which source established the fact, which component owned authority, what survived the failure and what the system should report while the outcome is uncertain. Then implement the negative case against your own contracts. Keep the scenario's limits explicit: no fictional teaching case proves your live deployment safe. It helps you identify a mechanism that must be established through your own evidence.
