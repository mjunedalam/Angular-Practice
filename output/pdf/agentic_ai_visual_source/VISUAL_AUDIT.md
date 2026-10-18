# Visual learning deep-dive audit

17 October 2026. This is an additive revision of the completed learning edition. The 39 chapter manuscripts remain byte-for-byte identical to the prior revised source.

## What changed in the learning design

The earlier 146 figures remain useful for architecture and relationships. The added lessons make individual mechanisms inspectable using specific fictional requests, records, evidence passages, permission cases, event sequences and quantities. Each chapter receives an analogy-to-mechanism lesson followed by a worked case. Every lesson adds three reading cues, a prediction question, a separate linked answer, a precise takeaway and a stated assumption.

The 13 new forms are chosen for the reasoning task: containers for ownership; envelopes for independent checks; snapshots for changed state; lanes for event ownership; grids for permission intersections; ledgers for resource accounting; pinned evidence for claim support; forked traces for counterfactuals; decision branches for outcomes; proportional bars for quantities; capacity trays for allocation; trust maps for constrained routes; and interval plots for uncertainty.

The examples are constructed, not measured benchmarks. No new provider contract or API currency claim is introduced. Original chapter source checks remain dated 12-13 October 2026.

## Chapter-by-chapter findings

### 1. LLM Runtime Fundamentals for Agent Engineers

The consultant analogy identifies separate responsibilities but does not let the reader inspect the actual contents of a call or a rejected proposal. Lesson A places a specific order, current payment evidence, required continuation reference and execution restrictions in separate containers. It makes selective context and retained state visible without claiming every endpoint is stateless. Lesson B presents a syntactically valid refund request against a smaller remaining balance and missing approval. The reader must distinguish parsing success, domain failure and deferred authority. Together the lessons expose why plausible structured text cannot establish a financial result.

- 1A — **What goes into this consultation?** (workspace): A call receives selected evidence; authority remains outside the generated response.
- 1B — **A valid request can still fail** (packet): Schema, current business rules and authority are independent gates.

### 2. What Is an AI Agent? Anatomy, Autonomy & Boundaries

The taxi comparison explains route choice but can leave autonomy looking like a property of the whole product. Lesson A holds the customer request constant and contrasts a fixed workflow with a model-selected follow-up after a missing capture appears. Both retain explicit incomplete or waiting outcomes, so the agent route is not presented as universally better. Lesson B converts termination into two concrete decision branches: a finish claim needs an authoritative receipt, while an exhausted allowance preserves incomplete work. The lessons make sequencing freedom and controller-owned completion inspectable without implying that all external tools behave deterministically.

- 2A — **Two routes after a missing capture** (fork): Autonomy changes who chooses the next step, not who grants access.
- 2B — **Who is allowed to say done?** (tree): Termination records why work stopped; completion requires task-specific evidence.

### 3. Reasoning & Control Patterns

The reporting-desk analogy names planning, critique and delegation but does not show what an evaluator actually verifies or how overhead accumulates. Lesson A pins three claims to fictional policy and payment excerpts, including a direct contradiction and an insufficient citation. The critic therefore contributes a check rather than an unexplained confidence score. Lesson B counts model invocations for four explicitly constructed traces, including worker and reducer overhead. These are arithmetic examples rather than benchmark results. Readers can separate evidence quality, model-call count and control-pattern choice without mistaking parallel wall-time reduction for reduced total work.

- 3A — **An editor checks the cited passage** (evidence): Review adds value when it contributes a concrete check or new evidence.
- 3B — **Count calls before comparing patterns** (bars): Parallel scheduling changes overlap; it does not erase worker or reducer work.

### 4. Prompt & Instruction Architecture

The handbook analogy distinguishes policy from correspondence, but a boundary drawing alone cannot show where hostile text would cross into an effect. Lesson A follows an injected customer email through a constrained model and an executor, displaying the allowed data route and the denied export route. The fence is explicitly a design claim requiring enforcement. Lesson B uses an actual composition candidate containing duplicate refund-pack identities. It exposes the mismatch that would arise if a dictionary manifest retained one version while both texts entered the prompt. This makes provenance fidelity a concrete release prerequisite rather than a documentation preference.

- 4A — **The customer email is not a policy update** (faultmap): Attribution guides interpretation; execution checks constrain consequences.
- 4B — **The manifest must match the assembled text** (packet): Provenance is accurate only when the manifest describes the actual instruction body.

### 5. Agent Harness Architecture

The railway control-room analogy explains coordination but leaves the difference between instructions, selected evidence and retained execution authority abstract. Lesson A gives a single run three concrete workspaces, including a released definition, a stale balance observation and an unresolved intent. It asks which owner must repair the discrepancy. Lesson B follows an approved refund across cancellation while the payment service is already processing it. The final record distinguishes stopped future scheduling from a confirmed completed effect. This directly addresses the chapter's cancellation and outcome-verification corrections without implying that a harness can physically interrupt every external transaction.

- 5A — **Three records for one controlled journey** (workspace): Fix the owner of the failed contract: guidance, evidence or execution state.
- 5B — **Cancellation arrives after submission** (swimlane): Stopping future work and discovering an in-flight outcome are separate responsibilities.

### 6. Tool Calling & Action Architecture

The service-counter analogy suggests that a correct form and a receipt are helpful, but readers need to see the checks and the limits of that receipt. Lesson A uses exact INR minor units, an authenticated principal and a pending approval to show a valid request that must wait. Lesson B holds a lost refund response constant while varying the downstream effect contract. An atomic deduplication service can return the original result; a service without safe status or retry semantics leaves the effect unknown. This preserves the distinction between local identity, external execution guarantees and ordinary narrative evidence.

- 6A — **The counter accepts a form, not permission** (packet): Tool contracts express intended work; trusted checks decide whether it may execute.
- 6B — **A receipt key needs a downstream contract** (fork): Unknown outcomes require effect-aware recovery, not a new proposal with new wording.

### 7. Agent State & Checkpointing

The shift-handover analogy correctly separates a chart from a consultation but does not expose which cells survive the critical crash window. Lesson A shows three versions of the same run record, preserving the intent while the known outcome changes from pending through unknown to confirmed. The highlighted changes distinguish new evidence from new execution. Lesson B gives stale and current workers different ownership epochs and traces their requests to separate state and effect gates. It makes the limitation of optimistic concurrency visible: protecting a record is insufficient unless the resource performing the mutation also rejects stale authority.

- 7A — **The handover keeps the same intent** (snapshots): A saved intent tells a new worker what to reconcile, not what to repeat.
- 7B — **A stale worker must stop at the effect gate** (faultmap): Ownership must be enforced where the protected effect occurs.

### 8. Context Engineering

The suitcase analogy makes limited capacity intuitive but can blur the difference between input tokens and room reserved for generation. Lesson A fills a constructed capacity tray exactly, allocating output separately and excluding both irrelevant and unauthorized candidates. It states serialization assumptions rather than presenting a universal provider budget. Lesson B confronts a polished summary with its original proposal and pending-approval records, then checks a freshly fetched but superseded policy. The reader must distinguish operational truth, retrieval time and source validity. These lessons add arithmetic and evidence inspection while preserving paired provenance and exact financial state.

- 8A — **Pack for this decision, including output room** (packing): Capacity budgeting preserves required meaning and distinct room for generated output.
- 8B — **Check what the summary compressed away** (evidence): Compression may shorten wording, but it must preserve operational distinctions and source validity.

### 9. Memory Architecture

The shopkeeper's file analogy distinguishes memory from current work but can leave readers unsure where an actual fact should live. Lesson A sorts a language preference, a current refund intent and an earlier resolved episode into concrete containers while preserving the payment service's authority. Lesson B shows a keyed preference across an inferred contradiction and a later explicit user correction. The unchanged cells expose the rejected supersession, and the final version demonstrates an authenticated transactional replacement. This teaches source authority for a particular fact without inventing a universal trust score or implying that repeated recall makes an inference verified.

- 9A — **One customer, three different records** (workspace): A record's purpose and authority determine its use, not how easily it can be recalled.
- 9B — **A plausible inference cannot replace a preference** (snapshots): Supersession follows source authority and subject binding, not generated confidence alone.

### 10. Skills & Reusable Capability Architecture

The recipe-kit analogy explains reuse and selective opening but can blur instruction loading with executable authority. Lesson A splits those two requests and gives each its own gate, allowing a reader to predict why opening a reviewed refund procedure is different from running its financial step. Lesson B examines a release manifest with one unresolved dependency range. Its failed check shows exactly why a past invocation cannot be reproduced until versions and hashes are pinned. Together these examples preserve the distinction between the book's local packaging convention and a runtime-specific format, without claiming that signed content or a manifest supplies permission.

- 10A — **Opening the recipe is not cooking the refund** (tree): Reusable procedure knowledge does not amplify the caller's privileges.
- 10B — **Resolve the recipe's dependencies before release** (packet): Compatibility ranges guide resolution; exact versions and hashes explain execution.

### 11. Build a Mini Agent Harness From Scratch

The model-railway analogy honestly limits the demonstration but does not show how its persisted allowances behave across a wait or why the crash test is decisive. Lesson A follows the companion's fixed accounting unit through lookup, proposal, restart and final response, with no replenishment during review. Lesson B places persistence, external commit and process exit on separate lanes before a new worker reconciles. Its sequence makes the missing local result visible even though the separate payment database already committed. Both lessons retain the single-writer, synchronous, fake-service scope and explicitly avoid presenting local checks as production network or distributed-ownership guarantees.

- 11A — **The model train does not receive a new allowance** (ledger): Durable limits count consumed work across waiting and restart.
- 11B — **Crash where the two databases disagree** (swimlane): Test the crash after external commit and before local confirmation.

### 12. RAG Foundations for Agents

The open-book examination analogy suggests that a real citation is reassuring, but it does not require readers to inspect whether the cited passage supports the answer. Lesson A uses a returns rule, a warranty exception and a warranty-assessment passage to distinguish support, contradiction and insufficiency for specific blender claims. Lesson B turns evaluation denominators into visible uncertainty intervals using constructed counts for retrieval hits, citation validity, actual support and appropriate abstention. The measures remain separate and no rate is presented as a benchmark. This highlights why unanswerable questions need their own outcome measure and why impressive citation membership alone cannot establish groundedness.

- 12A — **Three real pages, three different relationships** (evidence): A real citation is inspectable evidence, not automatic support for its attached claim.
- 12B — **Rates need the right denominator and uncertainty** (intervals): Measure the property you need, name its denominator, and retain statistical uncertainty.

### 13. Agentic RAG & Advanced Retrieval

The reporter analogy warns that copied stories are not independent evidence, but an ordinary loop diagram still rewards visible activity. Lesson A holds the first incomplete search constant while comparing a justified follow-up to another permitted source with a forbidden expansion into another tenant. The boundary remains intact even when research cannot finish. Lesson B counts newly accepted unique relevant records across four constructed rounds. The zero bars reveal repetition and irrelevant novelty, and the prediction asks whether another identical search is justified. These examples make source authority and progress measurable without inventing causal findings, backend performance results or a universal sufficiency threshold.

- 13A — **A weak result does not widen access** (fork): Corrective retrieval changes permitted search strategy, never silently broadens authority.
- 13B — **Four search rounds can add only three facts** (bars): Progress counts new relevant evidence, not repeated arrivals or unrelated novelty.

### 14. MCP - Model Context Protocol

The connector analogy distinguishes connection from permission, but the existing process diagrams do not let readers inspect a particular advertised capability against a pinned host catalog. Lesson A gives the host, connection and server concrete contents and makes a server-only destructive capability visibly absent from model exposure. Lesson B supplies a request whose schema and identity checks pass while its resource permission fails. Readers must explain why invocation stops despite technical compatibility. Neither lesson adds protocol-version claims or treats annotations as authority. The examples retain separate host and server responsibilities and explicitly distinguish model proposals from MCP messages.

- 14A — **One connection, two different catalogs** (workspace): Discovery describes capabilities; the host chooses exposure.
- 14B — **Valid arguments, forbidden service** (packet): Read-only operations still require resource authorization.

### 15. A2A & Remote-Agent Interoperability

The contractor analogy explains distributed ownership, but an abstract task lifecycle can hide which identifier survives a question and which recovery guarantee belongs to an adapter. Lesson A follows incident INC-77 through one input-required pause, preserving the same remote task while the commander supplies a scoped cluster identifier. Lesson B contrasts recovery after a lost creation response with and without an agreed remote deduplication contract. Its unresolved branch stops instead of silently creating a replacement. The examples preserve the distinction between A2A collaboration and MCP capability access, avoid equating duration with protocol choice, and treat received artifacts as evidence requiring acceptance.

- 15A — **A question does not create a second investigation** (swimlane): Continue the owned task when supplying missing input.
- 15B — **Recovering a lost task-creation response** (fork): A local key needs a remote recovery contract.

### 16. Workflow & Graph Orchestration

The railway analogy makes allowed transitions intuitive, but the existing route drawings do not force a reader to test every entrance to a loop. Lesson A partitions the two retry causes and applies the same investigation counter to each, exposing the often missed verification route. Lesson B displays an approval checkpoint across a wait while the live deployment changes. The unchanged proposal and decision remain available for audit, yet the new resource version blocks execution. These examples connect routing, persistent state and fresh preconditions without implying that a checkpoint creates exclusive ownership or that a legal edge grants the node permission to mutate production.

- 16A — **Two return tracks share one attempt guard** (tree): Guard every entrance to a loop with a shared invariant.
- 16B — **The checkpoint survives; the old facts do not** (snapshots): Durable state preserves history; authorization needs current facts.

### 17. Multi-Agent Architectures

The manager analogy clarifies ownership, yet the existing organizational diagrams can still leave readers equating a worker report with a completed refund. Lesson A puts different evidence fragments into three owned containers, including the exact missing link that prevents the supervisor from finishing the case. Lesson B turns the global budget rule into a reservation ledger with unused funds released only after settlement. Readers calculate whether another delegation fits rather than assuming each worker receives a fresh allowance. Both lessons preserve report provenance, limit worker authority and keep the supervisor accountable for the overall outcome without asserting that multiple agents automatically improve quality.

- 17A — **Three desks, one unresolved refund** (workspace): Merge qualifications with findings, not just conclusions.
- 17B — **A child worker cannot mint a new budget** (ledger): Account for every child against one owned budget.

### 18. Human-in-the-Loop, Approval & Escalation

The cheque analogy establishes exact binding, but a matching proposal digest can visually overshadow the independent requirement for currently entitled approvers. Lesson A presents an unchanged refund whose binding passes but whose approver lost the required role before resume. The denial is therefore about current authority, not malformed data. Lesson B makes a human correction visibly replace the proposal and clear the old decision, preventing an edited amount from inheriting permission. Readers must distinguish valid binding, approval outcome, current entitlement and downstream resource conditions. Both examples retain immutable historical records and avoid suggesting that either approval or idempotency eliminates execution-time precondition checks.

- 18A — **The signature matches; the authority expired** (packet): Exact binding and current authority are separate gates.
- 18B — **Changing the amount creates a new decision** (snapshots): A modification starts a new approval obligation.

### 19. Agent Security Fundamentals

The limited-keys analogy and broad attack-surface map explain least privilege without asking readers to trace a specific disclosure route. Lesson A follows an injected email through a summarizer to two different destinations, showing both legitimate content access and denied external egress. It explicitly includes remote image rendering as an effect path rather than assuming the sender is the only exit. Lesson B applies destination and network checks to a redirect that begins with an approved hostname. The narrow two-case tree makes initial URL validation visibly insufficient while preserving the chapter's warning that sanitization and drawn trust boundaries are not implementation guarantees.

- 19A — **Trace the stolen invoice route to its stop** (faultmap): Inspect every outbound channel that can carry private data.
- 19B — **An approved hostname can redirect elsewhere** (tree): Validate each actual network destination, including redirects.

### 20. Identity, Authorization & Delegated Access

The courier analogy separates subject, actor and credential, but readers need to apply the permission intersection to specific orders rather than remember identity terminology. Lesson A varies one permission ceiling at a time across four concrete refund cases; an all-allow row still requires downstream financial and approval checks. Lesson B presents a verified token with the expected refund scope but the wrong audience, demonstrating why apparently strong claims cannot be repurposed. Neither lesson promises that token exchange automatically narrows scopes or makes a token one-use. Background jobs remain outside the explicitly user-directed setup, preserving their separate principal and policy model.

- 20A — **Three permission ceilings must overlap** (matrix): Intersect authority; never combine privileges to bypass a denial.
- 20B — **Right scope, wrong audience** (packet): Validate destination binding independently of scope.

### 21. Sandboxing & Safe Execution

The glovebox analogy explains containment but can obscure the fact that the harness should retain credentials while the program receives only projected data. Lesson A supplies literal input files, sandbox limits and release criteria in separately owned containers. The learner identifies why a safe chart workflow does not need a production token inside generated code. Lesson B compares two output collectors under a constructed hostile stream: one stops capture at its configured cap, while the other exceeds its available buffer before final truncation. This isolates an enforcement-timing defect without inventing a benchmark or claiming any sandbox technology is universally stronger than another.

- 21A — **Pass the CSV through the glovebox opening** (workspace): Contain input authority and inspect output release separately.
- 21B — **A limit must act before the collector fills** (fork): Enforce resource bounds during consumption, not after it.

### 22. Enterprise Governance, Privacy & Compliance

The records-office analogy names retention and exceptions without making a reader inspect how the same deletion request yields different lawful handling under a verified hold. Lesson A follows one record through live copies, backup obligations and a narrowly scoped hold; neither branch claims instantaneous universal erasure. Lesson B pairs three audit claims with concrete receipts, exposing the gap between a readable hash chain and integrity anchored outside the writer's control. The exercise also challenges an unsupported backup-erasure claim. Both lessons separate evidence from assurance and retain the chapter's distinctions among minimization, purpose, access, integrity and recordkeeping obligations without prescribing universal retention periods.

- 22A — **One deletion request, two retention conditions** (fork): Deletion follows lineage, eligibility and each storage contract.
- 22B — **Which audit claims do these receipts support?** (evidence): Audit integrity and operational truth require different evidence.

### 23. Reliability Engineering for Agents

The delivery analogy warns that a timeout cannot establish non-delivery, but readers need to weigh contradictory observations rather than simply memorize a recovery slogan. Lesson A supplies a timed-out shipment call, an authoritative shipment lookup and a missing fee result, separating observed effects from unresolved ones. Lesson B follows a persisted refund intent through same-key recovery and a prohibited replacement identity. The downstream dedupe record, retention window and unchanged payload are explicit. Neither the local ledger nor a new worker is treated as sufficient for uniqueness, and the examples preserve uncertainty so that compensation or replacement cannot outrun reconciliation of the original operation.

- 23A — **Which parcel actually exists?** (evidence): Reconcile effects before deciding what to compensate.
- 23B — **The same refund must reach the same remote record** (faultmap): Match the recovery horizon to downstream dedupe retention.

### 24. Agent Testing Strategy

The simulator analogy encourages controlled tests but does not show why a persuasive refusal can coexist with a broken executor. Lesson A gives two exact test branches with protected-effect assertions: rejection must leave zero effects, while recovery of one approved operation must leave exactly one. It states the fake service's deduplication assumption rather than transferring that guarantee to a real API. Lesson B orders a post-commit response loss, worker restart and same-operation recovery around the durable intent. The reader must choose the fault boundary that exercises the ambiguous gap. Both examples keep the actual validator under test and separate deterministic enforcement evidence from live-model quality.

- 24A — **Grade the simulator by its effect ledger** (tree): Assert on protected state, not comforting response text.
- 24B — **Place the fault after commit and before acknowledgement** (swimlane): Inject faults around commits, not only before calls.

### 25. Evaluation & Quality Measurement

The exam analogy and existing conceptual interval discussion do not provide a shared proportional scale on which readers can compare perfect small samples with a predeclared lower-bound gate. Lesson A plots four calculated two-sided Wilson intervals and a 95 percent floor. Its counts are constructed independent binary cases, with the 72 versus 73 perfect-case boundary checked by a separate score-test quadratic calculation. Lesson B displays all four cells of the chapter's judge-calibration example as counts rather than a headline agreement figure. Readers recover both 85 percent agreement and the 30 percent false-acceptance rate among unfaithful answers, keeping denominators and consequences explicit.

- 25A — **A perfect score can still miss the evidence gate** (intervals): Plan sample size for the bound your gate actually uses.
- 25B — **A judge can agree often and miss dangerous errors** (bars): Judge agreement does not substitute for inspecting critical errors.

### 26. Observability for Agent Systems

The parcel-tracking analogy distinguishes individual traces from aggregates, but a missing scan can still invite the wrong conclusion about an external effect. Lesson A shows a refund across a sampled or lost response span and later authoritative reconciliation, retaining one operation identity and explicit uncertainty. Lesson B asks where four concrete telemetry fields may be stored under a stated metadata policy. It makes high-cardinality run identifiers, private content and bearer tokens visibly different from bounded tool names. The pair preserves privacy and audit retention distinctions, avoids claiming access to private model reasoning, and shows why neither trace completeness nor metadata anonymity can be assumed.

- 26A — **A missing span is not a missing refund** (snapshots): Use traces to investigate and authoritative records to establish effects.
- 26B — **Choose the destination before recording the field** (matrix): Apply telemetry privacy rules to errors and every export route.

### 27. AgentOps & Production Operations

The airline analogy distinguishes grounding from reversing earlier flights, but the existing diagrams leave that distinction abstract. Lesson A tracks a pinned release, a changing executor restriction and an already applied refund across three records. The unchanged effect cell makes the remaining recovery obligation visible even after enforcement is confirmed. Lesson B replaces a canary percentage with constructed outcome counts and Wilson intervals for two traffic slices. Readers must notice that identical point estimates can carry different uncertainty and that four marginal intervals do not implement a comparative promotion test. Both lessons separate an observable fact from the operational decision that still requires a defined owner and policy.

- 27A — **The brakes change; the old refund remains** (snapshots): Containment changes future permission; recovery handles existing obligations.
- 27B — **A 95% canary can still be thin evidence** (intervals): Exposure share and point estimates cannot substitute for a promotion test.

### 28. Cost, Latency & Model Routing Engineering

The chapter names reservations and settlement, but a lifecycle arrow does not show which money returns to the available balance. Lesson A makes one tenant allowance numerical: estimates reduce availability, and settlement releases only the unused difference, leaving actual spend charged. This also prevents readers from treating a concurrency permit like reusable financial allowance. Lesson B works through a semantic-cache false hit using opened versus unopened goods. The two traces share one request but differ in their critical-field check, so the changed mechanism explains the changed result. These examples deepen the routing and caching discussion without inventing provider prices, measured savings or a new authority path.

- 28A — **Only unused reservation returns** (ledger): Settling spend releases unused estimates, not the money already consumed.
- 28B — **One changed word defeats a cache hit** (fork): Cache reuse must preserve the facts that determine the answer.

### 29. Production Agent Platform Architecture

The hospital handover analogy explains why records survive shifts, but it can leave readers imagining that possession of the chart grants exclusive ownership. Lesson A places worker-local state, durable ownership records and the external operation ledger in separate containers with concrete identifiers. Their relationships show why a restored checkpoint cannot settle an unknown effect. Lesson B follows a stale worker after a takeover and makes both rejected state writes and rejected new effects visible. The sequence assumes fencing is actually enforced at both consumers, making its dependency explicit. Together the pages turn horizontal scaling from a list of services into inspectable record and authority contracts.

- 29A — **Three records behind a worker handover** (workspace): Shared state preserves continuity; ownership and effect evidence establish safe continuation.
- 29B — **A living worker can have stale authority** (swimlane): Fence both state advancement and new protected effects.

### 30. LLM Gateway, Provider Abstraction & Self-Hosted Inference

The restaurant analogy can obscure the difference between a kitchen being open and a request being eligible for that kitchen. Lesson A makes a restricted incident request pass through three independent route criteria; an available route with forbidden placement still fails. This distinguishes model-access policy from downstream remediation authority. Lesson B calculates the chapter's toy KV-cache example across four sequence lengths, using proportional bars rather than an unscaled capacity anatomy. The page names excluded memory and architecture assumptions, so arithmetic is not mistaken for a capacity benchmark. Together these visuals make route qualification and model-serving resource reasoning inspectable without adding volatile provider claims.

- 30A — **An available model can still be ineligible** (matrix): Route eligibility precedes capacity and economic selection.
- 30B — **Long context consumes concrete KV memory** (bars): A KV estimate is one memory component, not total serving capacity.

### 31. Framework Mapping: LangGraph, OpenAI Agents SDK, Spring AI & Others

The vehicle analogy makes framework choice approachable but does not show which concrete records travel with an application when its engine changes. Lesson A places a refund proposal, approval, effect identity and remaining allowance beside the adapter and framework execution record. The containers expose application ownership without promising interchangeable checkpoint formats. Lesson B inspects a newly discovered tool whose namespace looks familiar, separating its valid shape from exact-name authorization and downstream eligibility. The denied envelope provides a specific counterexample to treating SDK discovery or preapproval as a complete access-control policy. Neither lesson adds release-specific API claims; both focus on contracts the chapter already assigns to the application.

- 31A — **What must survive an engine change** (workspace): Keep business obligations independent of framework message formats.
- 31B — **A familiar namespace is not an allowlist** (packet): Authorize an exact reviewed capability, then authorize the specific resource.

### 32. LangGraph in Depth: Building Durable Agent Graphs

The dispatch-office analogy explains parallel reports but does not show how an immutable evidence reducer treats retransmission and contradiction. Lesson A follows the same fields across three merges: a new entry is accepted, an identical repeated entry adds nothing, and a conflicting value under the same ID is rejected. Lesson B narrows the commander policy to the two highest risk classes and draws every approval outcome. Readers can see why two valid approvers matter for risk 4 and why approval cannot unlock risk 5. These focused views complement the existing graph diagrams without implying that a route annotation creates authority or a checkpoint rewinds external effects.

- 32A — **Retransmission is not new evidence** (snapshots): Define merge semantics from evidence meaning before parallelizing nodes.
- 32B — **Two high-risk branches, four explicit outcomes** (tree): Approval satisfies a permitted gate; it cannot override a blocked action class.

### 33. Cloud & Enterprise Integration Tracks

Cloud catalogue mappings can look complete while hiding who owns the authority record and where a model proposal stops being data. Lesson A separates managed execution, application authority and the domain change service, then marks the tempting direct mutation route as denied. The trust map explicitly treats generated intent as untrusted and assumes enforcement rather than crediting the drawing itself. Lesson B inspects four concrete principals against one incident and one rollback. Its review cell distinguishes an operator's ability to request approval from an executor's narrow accepted grant. Both pages deepen enterprise identity and managed-runtime boundaries without asserting new service features, cloud equivalence or automatic portability.

- 33A — **Managed execution stops at business authority** (faultmap): Managed infrastructure does not inherit application authority or establish domain outcomes.
- 33B — **One incident, four different principals** (matrix): Transport access, delegated authority and resource permission are separate decisions.

### 34. Specialized Agent Systems

The specialist-team analogy states that tools and completion evidence vary, but it does not demonstrate the selection pressure inside one bounded context. Lesson A packs a coding specialist's task contract, relevant source, current progress and reserved output into a numerical tray while excluding secrets and irrelevant history. The reservation is distinguished from input content, and provider simplification is explicit. Lesson B tests three specialist completion claims against concrete receipts: a supported policy answer, a contradicted patch claim and an operational claim lacking recovery evidence. The visual relationships require readers to judge support rather than reward the presence of a citation, a test label or a successful API response.

- 34A — **Pack the specialist workspace for the job** (packing): Bound context around the specialist task and preserve room for its result.
- 34B — **Different jobs need different proof** (evidence): Choose evidence that establishes the specific completion claim.

### 35. Architecture Selection Patterns & Senior Design Review

Architecture-selection prose offers many useful patterns, but readers need a smaller decision they can inspect without interpreting a catalogue. Lesson A narrows the task into known procedure versus exploratory investigation, then tests persistence and scope needs. Its conditional leaves avoid treating a decision tree as an automatic architecture verdict. Lesson B makes a simplification review concrete through a finite run allowance: optional critique cannot spend the reservation protecting required verification. The resulting arithmetic distinguishes useful cuts from removing an acceptance contract. The numbers are constructed allocations, not savings claims, and both pages preserve deterministic authority even when the selected control flow uses model reasoning.

- 35A — **Choose control for the work in front of you** (tree): Match adaptive control to uncertain work and preserve fixed obligations around it.
- 35B — **Cut optional critique before required verification** (ledger): A simpler design retains the checks that establish the promised outcome.

### 36. The AegisOps Blueprint

The emergency-team analogy joins diagnosis, consent, treatment and observation, but a reader can still collapse approval, command completion and recovery into one success marker. Lesson A assigns those events to separate owners using one incident, proposal and rollback identity; only the complete independent window closes the run. Lesson B inspects an approved rollback whose expected revision has become stale. Passing schema and human authority checks cannot overcome the live precondition failure. These pages give the blueprint's conceptual boundaries specific records and timing while retaining the risk 4 two-person requirement. All times and observations are fictional, and neither local intent nor a successful command is presented as an external execution guarantee.

- 36A — **Follow INC-82 through three owners** (swimlane): Trace diagnosis, authority, effect and recovery as distinct owned facts.
- 36B — **Approved rollback, changed live revision** (packet): Valid approval does not excuse stale live preconditions.

### 37. Building AegisOps Phase by Phase

The workshop analogy emphasizes postponing powerful tools, but it can suggest that early read-only phases need no security boundary. Lesson A therefore follows both authorized metric queries and untrusted log text through scoped adapters into the evidence ledger, denying the shortcut from a log instruction to a proposal. Lesson B exposes the exact stale-revision race in phase 10 by comparing a preceding read with an atomic expected-revision mutation. The same valid approval and competing deployment appear in both traces; only the enforcement mechanism changes. These pages make phase exit evidence concrete without claiming that a fake rehearsal establishes live production readiness or that a separate lookup closes a race.

- 37A — **Read-only tools still cross trust boundaries** (faultmap): Build scope, provenance and data handling before granting richer capabilities.
- 37B — **A prior read leaves a mutation race** (fork): Enforce volatile preconditions where the effect becomes real.

### 38. Hardening, Evaluation & Game Days

The recovery analogy and state diagram correctly distinguish treatment from outcome, but neither makes missing observation coverage easy to count. Lesson A compares four separate verification windows with proportional covered-bucket bars. Equal full coverage still produces different results when one bucket fails a threshold, making coverage necessary but insufficient. Lesson B shows constructed zero-violation counts across increasing independent sample sizes with calculated Wilson intervals. The visible uncertainty counters the temptation to describe finite clean tests as universal safety. No positive violation budget is introduced: a single observed forbidden effect still fails its hard gate. Both pages label their statistical and telemetry assumptions rather than presenting simulated evidence as measured operating results.

- 38A — **Ten buckets are necessary, not sufficient** (bars): Coverage, valid measurements and passing criteria are separate requirements.
- 38B — **Zero observed failures still leaves uncertainty** (intervals): Finite clean tests establish bounded evidence, not zero possible risk.

### 39. More Capstone Projects

The examination-board analogy asks for proof but can leave project completion judged by the polish of its narrative. Lesson A compares three concrete portfolio claims with the actual receipts for refunds, research and coding. One claim is supported within a fake provider's contract, one exceeds the available schema, and one is contradicted by a protected-path guard. Lesson B shows what a resumed coding session should carry into a bounded context: trusted task limits, past attempts, reconciled current evidence and output capacity. Stale completion prose and credentials are excluded. These pages make the tracks' different acceptance standards visible while keeping simulation, state reconciliation and live operating approval distinct.

- 39A — **Bring receipts to the capstone review** (evidence): Judge each capstone by evidence specific to its risky boundary.
- 39B — **Resume from reconciled facts, not old confidence** (packing): Resume with actual-state reconciliation and preserve publication identity.
