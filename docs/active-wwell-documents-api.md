# Active Water Well — Document API

Base URL: `{apiUrl}` = `ExternalConfigService.settings.dailyOperationServiceUrl`

| Method | Endpoint | Params | Body |
|---|---|---|---|
| POST | `/welldocuments/well-presentation-docs` | `epaNum`, `uploadDate` | FormData: `wellFile` (one request per file) |
| GET | `/welldocuments/well-presentation-docs-list` | `epaNum`, `uploadDate` | — |
| GET | `/welldocuments/well-presentation-docs` | `docName`, `epaNum`, `uploadDate` | — (returns blob) |
| GET | `/well-pres-docs` | `epANum`, `date` | — |
| DELETE | `/welldocuments/well-presentation-docs` | `uploadDate`, `epaNum`, `docName` | — |
| PUT/PATCH | *(none — not implemented)* | — | — |

Source: `src/app/core/services/pres-docs.service.ts`
