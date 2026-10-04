# Backend changes — agwa-planning

Repo: `/Users/junedalam/Downloads/Misc/agwa-planning`

## IR letter PDF — live SAP workflow status

- `src/main/java/com/aramco/easd/gdsd/planning/service/IrLetterDataAssembler.java` — added `classifyLiveSapStatusText()` (mirrors Angular's `SAP_TERMINATED_STATUS_TEXT`/`SAP_APPROVED_STATUS_TEXT` regexes), updated `resolveApprover()` to prefer it over the stale `sap_wf_status` column, added `sapWfStatusText` to `AssemblyInput`
- `src/main/java/com/aramco/easd/gdsd/planning/service/IrLetterService.java` — `renderLetterPdf()` gained a `sapWfStatusText` parameter, threaded into `AssemblyInput`
- `src/main/java/com/aramco/easd/gdsd/planning/dto/LetterPdfRequest.java` — added `sapWfStatusText` field to the request DTO
- `src/main/java/com/aramco/easd/gdsd/planning/resource/IntegratedRequirementResource.java` — `letterPdf()` extracts `payload.sapWfStatusText()` and passes it through
- `src/test/java/com/aramco/easd/gdsd/planning/service/IrLetterDataAssemblerTest.java` — added 3 unit tests for `classifyLiveSapStatusText()`
