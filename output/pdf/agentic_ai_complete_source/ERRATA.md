# Confirmed corrections and open reports

Contact: juned.alam.dev@gmail.com. Include version, chapter/section, printed page, expected/observed result and a minimal reproduction or authoritative source. Do not include secrets or customer data.

The earlier unversioned complete manuscript prepared on 17 October 2026 is identified by PDF SHA-256 cd8168c87687fe6336c84655457792d04ad45af7a9642cf419d7a25a3180c751. It was a local preparation artifact, not a claimed public release.

| ID | Affected location | Confirmed issue | Corrected in |
|---|---|---|---|
| E001 | Earlier manuscript, Chapter 12, reciprocal-rank fusion | Duplicate IDs consumed rank positions; deduplicate each list before enumeration. | 1.0-rc.1 |
| E002 | Earlier companion, capstone covered_window; Chapter 38 | NaN/invalid time values could bypass checks and report recovery; validate temporal domain and interval availability before comparison. | 1.0-rc.1 |
| E003 | Earlier manuscript, Chapter 28 | Prose named require_quality_floor while listing defines meets_quality_floor. | 1.0-rc.1 |
| E004 | Earlier manuscript, Chapter 31 | Clarify that preapproved Claude tool calls can bypass the callback; enforcement must cover actual tool exposure/execution. | 1.0-rc.1 |
| E005 | Earlier manuscript, Chapter 36 | Name the selected model tier for each existing cost stage. | 1.0-rc.1 |
| E006 | Research lesson 06 and Appendix E references | Refresh AWS idempotency and Strands documentation destinations. | 1.0-rc.1 |

No unresolved reader reports have been received or independently verified in this local preparation task. Human review tasks and licensing decisions are tracked separately; they are not confirmed errata. Assign new IDs to confirmed issues and record the first corrected version. Preserve this history when issuing updates.
