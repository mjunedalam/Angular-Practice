# Field Mapping Report — Screen-by-Screen

All mappings trace from the raw `IWellData` API response through selectors in
`src/app/core/store/shared/well-data.selectors.ts` to the UI label shown on screen.

**Fallback:** `FALLBACK_STR = 'N/A'` is used whenever a field is `null | undefined | ''`.

---

## 1. Presentation Screen

### 1.1 Misc Section (`MiscPresWellDataComponent`)

**Selector:** `selectMiscWellData(d: IWellData)`  
**Store signal:** `store.miscWellData()`  
**Template variable:** `@let d = store.miscWellData()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wellName ?? FALLBACK_STR` | Primary well identifier from rig activity record |
| Rig Name | `RIG_IDENTIFICATION[0]` | `d.RIG_IDENTIFICATION?.[0].rigname ?? FALLBACK_STR` | Rig name shown as subtitle under well name |
| Spud Date | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].spuddate ?? FALLBACK_STR` | Formatted via `formatSpudDate()` in template |
| Targeted Aquifer | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | `d.EXAD_GWD_IR_HYDROGEOLOGY?.[0].estTargetAquifier ?? FALLBACK_STR` | Estimated target aquifer from hydrogeology IR |
| Current Status | `EXAD_GWD_DAILY_REMARKS[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].status ?? FALLBACK_STR` | Daily remarks status field |
| Days Since Spud | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].spuddays ?? 0` | Displayed as `daysSinceSpud \| number:"1.2-2"` |
| Target Days | `NEW_TARGET_DAYS[0]` / `RIG_ACTIVITY[0]` | `d.NEW_TARGET_DAYS?.[0].targetDays ?? d.RIG_ACTIVITY?.[0].wDrlgTrgtDay ?? 0` | New target days takes priority; falls back to rig activity planned drilling days |
| ROP | `ROP_DATA[0]` | `d.ROP_DATA?.[0].rop ?? null` | Rate of penetration; hidden if `null` |
| BI Number | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].biNum ?? FALLBACK_STR` | Budget item number, displayed as `BI{biNum}` |
| Supporting Well | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].waterWell ?? FALLBACK_STR` | Offset / supporting water well name |
| Footage (ft) | `DRLG_FD_TDAY[0]` / `DRLG_OP_STATUS[0]` | `d.DRLG_FD_TDAY?.[0].footage ?? d.DRLG_OP_STATUS?.[0].footage ?? 0` | Feet drilled today; daily footage record takes priority |
| Current Depth | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].wPrsntDpth ?? 0` | Present depth in feet |
| Next Well | `NEXT_2_WELL_ACTIVITY[0]` | `d.NEXT_2_WELL_ACTIVITY?.[0].nextWellActivity ?? FALLBACK_STR` | Next planned well activity |
| Rig Move — Actual | `IWellData` root | `d.actualRm ?? null` | Actual rig move days (root-level field) |
| Rig Move — KPI | `IWellData` root | `d.kpiRm ?? null` | KPI rig move days (root-level field) |
| Rig Move Days | `IWellData` root | `d.rigMoveDays ?? null` | Used to compute tone (positive/negative CSS class) |
| Current Hole Size | `DRLG_OP_SMRY[]` | `items.reduce((best, cur) => cur.wHoleEndDpth > best.wHoleEndDpth ? cur : best).wHolSz ?? null` | Picks the `DRLG_OP_SMRY` record with the deepest `wHoleEndDpth`, then reads `wHolSz`; shows `"NA"` if `null` |
| Operation Summary | `EXAD_GWD_DAILY_REMARKS[0]` / `DRLG_OP_SMRY[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].opRmk ?? d.DRLG_OP_SMRY?.[0].wOpRmk` | Only rendered when non-empty/non-null |
| Next 24 Hr Operation | `EXAD_GWD_DAILY_REMARKS[0]` / `DRLG_OP_STATUS[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].next24HrPlanRrmk ?? d.DRLG_OP_STATUS?.[0].nxt24HrPlanRmk` | Only rendered when non-empty/non-null |
| Drilling Summary Remark | `EXAD_GWD_DAILY_REMARKS[0]` / `DRLG_OP_STATUS[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].drlgSmryRmk ?? d.DRLG_OP_STATUS?.[0].wDrlgSmryRmk ?? null` | Only rendered when non-empty/non-null |

---

### 1.2 Offset Wells (`OffsetWwellsComponent`)

**Selector:** `selectOffsetWells(d: IWellData)`  
**Store signal:** `store.offsetWells()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `EXAD_GWD_IR_WATER[n]` | `ow.offsetWaterWell` | Accordion header title |
| Aquifer | `EXAD_GWD_IR_WATER[n]` / `EXAD_GWD_WELL_TESTS[match]` | `ow.aquifer \|\| test?.rsvrCd \|\| 'WASI'` | Water IR aquifer first; falls back to matching well test `rsvrCd`; hardcoded default `'WASI'` |
| TDS (PPM) | `EXAD_GWD_WELL_TESTS[match]` | `test?.wtrSaTdsCnc ?? 0` | Matched by `test.wellName === ow.offsetWaterWell` |
| RPM | `EXAD_GWD_IR_WATER[n]` | `ow.rpm ?? 0` | Pump RPM from water IR record |
| H2S | `EXAD_GWD_IR_WATER[n]` | `ow.h2s ?? 0` | H2S concentration; highlighted with warn class when `> 0` |
| Distance (ft) | `EXAD_GWD_IR_WATER[n]` | `ow.distance ?? 0` | Distance to offset well |
| Productivity | `EXAD_GWD_IR_WATER[n]` | `ow.specificCapacity ?? 0` | Specific capacity (GPM/FT) |
| Flow Rate (GPM) | `EXAD_GWD_WELL_TESTS[match]` / `EXAD_GWD_IR_WATER[n]` | `test?.hydProdRt ?? ow.flowRate ?? 0` | Well test production rate takes priority over IR flow rate |

---

### 1.3 Water Well Test Result (`WwellTestResultComponent`)

**Selector:** `selectWellTestResults(d: IWellData)`  
**Store signal:** `store.wellTestResults()`  
**Source array:** `d.EXAD_GWD_WELL_TESTS[]`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `EXAD_GWD_WELL_TESTS[n]` | `t.wellName ?? ''` | Card / list title |
| Aquifer | `EXAD_GWD_WELL_TESTS[n]` | `t.rsvrCd ?? FALLBACK_STR` | Reservoir/aquifer code |
| Test Type | `EXAD_GWD_WELL_TESTS[n]` | `resolveTestType(t)` → `'FLOW' \| 'PUMP'` | `hydTestTypCd.toUpperCase() === 'FLOW'` → FLOW; else PUMP |
| Flow Rate (GPM) | `EXAD_GWD_WELL_TESTS[n]` | `t.hydProdRt ?? 0` | Main metric shown on the list tab |
| RPM | `EXAD_GWD_WELL_TESTS[n]` | `t.rpm ?? 0` | Only shown in dialog when `testType === 'PUMP'` |
| SIWHP (FT) | `EXAD_GWD_WELL_TESTS[n]` | `t.siwhp ?? 0` | Only shown in dialog when `testType === 'FLOW'` |
| TDS (PPM) | `EXAD_GWD_WELL_TESTS[n]` | `t.wtrSaTdsCnc ?? 0` | Total dissolved solids |
| Temperature | `EXAD_GWD_WELL_TESTS[n]` | `t.temp ?? 0` | Displayed as `value \| number:'1.0-1'`°C |
| Productivity (GPM/FT) | `EXAD_GWD_WELL_TESTS[n]` | `t.hydProduct ?? 0` | Well productivity index |
| H2S (PPM) | `EXAD_GWD_WELL_TESTS[n]` | `t.hydH2sCnc ?? 0` | Warning CSS class applied when `> 0` |

---

### 1.4 Wellbore View (`WellBoreViewComponent`)

**Selector:** `selectDiagramData(d: IWellData)`  
**Store signal:** `store.diagramData()`  
**Input:** `[diagramData]` passed from presentation parent

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `WELL_MASTER[0]` | `d.WELL_MASTER?.[0].well ?? ''` | Used as SVG title / label |
| Total Depth | `EXAD_RCD_PREWAP[0]` | `d.EXAD_RCD_PREWAP?.[0].estTargetDepth ?? 0` | Sets the D3 depth scale domain max |
| Current Depth | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].wPrsntDpth ?? 0` | Drill bit position on the wellbore diagram |
| Casings (IR) | `EXAD_GWD_IR_CASING[]` | `sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? [])` | Sorted deepest-first; used to draw planned casing strings |
| Drilling Casings | `DRLG_CSG[]` | `[...d.DRLG_CSG ?? []].sort((a,b) => b.wCsgBotDpth - a.wCsgBotDpth)` | Actual drilled casings, sorted deepest-first |
| Geologic Tops | `EXAD_GWD_IR_TOPS[]` | `[...d.EXAD_GWD_IR_TOPS ?? []].sort((a,b) => a.planTvdDepth - b.planTvdDepth)` | Planned formation tops, sorted shallow-first |
| Hydrogeology | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | `d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null` | Provides `estTargetAquifier` for annotation |
| Pre-Well Data | `EXAD_RCD_PREWAP[0]` | `d.EXAD_RCD_PREWAP?.[0] ?? null` | Drilling plan data (target depth, formation) |
| Rig Activity | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0] ?? null` | Rig metadata used for labels |
| Mud Circulation | `MUD_CIRC[]` | `d.MUD_CIRC?.[].wPrsntDpth` + `Number(m.wMudCircPc)` | Each entry mapped to `{depth, pct}` — drawn as mud-flow indicator |
| Well Design | `EXAD_GWD_WELL_DESIGN[0]` | `d.EXAD_GWD_WELL_DESIGN?.[0] ?? null` | Well design spec for completion element rendering |

---

### 1.5 Depth Scale (`DepthScaleComponent`)

**Store signals used:** `store.totalDepth()`, `store.animationTrigger()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Total Depth | `EXAD_RCD_PREWAP[0]` | `d.EXAD_RCD_PREWAP?.[0].estTargetDepth ?? 0` | Sets D3 linear scale domain `[0, totalDepth]`; drives tick generation |
| Anim Trigger | Store internal | `store.animationTrigger()` (number signal) | Incrementing this value forces D3 to re-run the scale draw-down animation |

---

### 1.6 Geo Axis (Formation Tops in `WellBoreViewComponent`)

The geological axis is rendered inside the wellbore SVG at `geoLineX = 95 px`.  
**Data source:** `geologicTops` from `WellboreDiagramData` → `EXAD_GWD_IR_TOPS[]`  
**Also used:** `store.allFormationTops()` passed as `[formationTops]` input (from `selectAllFormationTops`)

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Formation Code | `EXAD_GWD_IR_TOPS[n]` | `top.stLongCd ?? FALLBACK_STR` | Displayed as geo label text to the right of the axis line |
| Planned TVD Depth | `EXAD_GWD_IR_TOPS[n]` | `top.planTvdDepth` | Y-position on D3 depth scale; sorted ascending before render |
| Actual Depth | `DRLG_FM_TOPS[n]` | `actual?.wStDmrkDpth` | Matched by `stLongCd`; empty string if not yet drilled |
| Depth Difference | Computed | `actualDepth - plannedDepth` | Positive = drilled deeper than prognosed; empty if either value missing |
| Remarks | `DRLG_FM_TOPS[n]` | `actual?.wStDmrkRmk ?? FALLBACK_STR` | Formation top pick remark |

---

### 1.7 Picked Formation Tops (`PickedFormationTopsComponent`)

**Selector:** `selectAllFormationTops(d: IWellData | null)`  
**Store signal:** `store.allFormationTops()`  
**Rendered as:** AG Grid table (3 visible columns)

#### Merge strategy

Rows are produced in two passes:

1. **Planned tops** — every entry in `EXAD_GWD_IR_TOPS[]` is emitted once. If a matching `DRLG_FM_TOPS` record exists (matched by `stLongCd`), its actual-depth and remarks fields are merged in. `isDrlgOnly = false`.
2. **Drilled-only tops** — `DRLG_FM_TOPS` entries whose `stLongCd` does not appear in `EXAD_GWD_IR_TOPS[]` are appended. `isDrlgOnly = true` → row rendered in green bold.

| Column Header | `FormationInfoViewModel` field | Source API Object | Exact Mapping | Business Logic |
|---|---|---|---|---|
| Formation | `formation` | `EXAD_GWD_IR_TOPS[n]` / `DRLG_FM_TOPS[n]` | `top.stLongCd ?? 'N/A'` | Formation code; key used to join planned ↔ actual |
| Prognosed | `prognosed` | `EXAD_GWD_IR_TOPS[n]` | `top.planTvdDepth` (if `> 0`, else `''`) | Planned TVD depth; blank for drilled-only rows |
| Actual Depth (ft) | `actualDepth` | `DRLG_FM_TOPS[n]` | `fm.wStDmrkDpth` (matched by `stLongCd`) | Blank when not yet drilled; `blankIfInvalid` formatter hides `0` / `null` |

#### Hidden / computed fields (not rendered as columns)

| Field | Source | Mapping | Used by |
|---|---|---|---|
| `difference` | Computed | `actualDepth − prognosed` (blank if either missing) | Not displayed in grid; available for future use |
| `remarks` | `DRLG_FM_TOPS[n].wStDmrkRmk` | `fm.wStDmrkRmk ?? 'N/A'` | Passed as `[formationTops]` input to `WellBoreViewComponent`; shown as hover tooltip on geo-axis labels |
| `isDrlgOnly` | Computed | `true` when `stLongCd` absent from `EXAD_GWD_IR_TOPS[]` | Controls green row style (`color: #16a34a, fontWeight: 600`) and green tick/label colour in wellbore SVG |

---

## 2. Active Water Well Screen

### 2.1 Database Info (`DatabaseInfoComponent`)

**Selector:** `selectDatabaseInfoViewModel(d: IWellData, date: Date)`  
**Store signal:** `store.databaseInfo()`  
**Template variable:** `@if (data(); as data)`

#### Dates

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Date | App state (selected date) | `formatDateForInput(date)` | The currently selected date in the store; not from API |
| Spud Date | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].spuddate ?? FALLBACK_STR` | Rig activity spud date |
| Target Date | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wDrlgEndDt ?? FALLBACK_STR` | Planned drilling end date |
| Release Date | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wDrlgEndDt ?? FALLBACK_STR` | Same field as Target Date (planned rig release) |

#### Timeline

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well TD Date | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wDrlgEndDt ?? FALLBACK_STR` | Total depth / well completion target date |
| Days Since Spud | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].spuddays ?? FALLBACK_STR` | Cumulative days since spud |
| Spud Days | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].spuddays ?? FALLBACK_STR` | Same underlying field as Days Since Spud |
| Footage (ft) | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].wDpthChgDis ?? FALLBACK_STR` | Daily depth change / footage drilled |

#### Depth

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| 5 AM Depth (ft) | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].wPrsntDpth ?? FALLBACK_STR` | Present depth as of the morning report snapshot |
| Pre 5 AM Depth (ft) | `DRLG_OP_STATUS[0]` | `d.DRLG_OP_STATUS?.[0].wPrevDpth ?? FALLBACK_STR` | Previous depth before the 5 AM snapshot |
| SAM Depth (ft) | `DRLG_OP_STATUS[0]` / `EXAD_RCD_PREWAP[0]` | `d.DRLG_OP_STATUS?.[0].targetDepth ?? d.EXAD_RCD_PREWAP?.[0].estTargetDepth ?? FALLBACK_STR` | Target depth; op status first, falls back to pre-well plan |
| Secondary SAM Depth (ft) | `EXAD_RCD_PREWAP[0]` | `d.EXAD_RCD_PREWAP?.[0].estTargetDepth ?? FALLBACK_STR` | Estimated target depth from pre-well plan only |

#### Casing & Rig

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Last Casing Size | `EXAD_GWD_IR_CASING[]` / `DRLG_OP_STATUS[0]` | `casing?.csgSize ?? d.DRLG_OP_STATUS?.[0].wCsgOdSz` via `selectPrimaryCasing()` | Primary casing = deepest by `csgDepth`; falls back to op status casing OD size |
| Last Casing Depth | `EXAD_GWD_IR_CASING[]` / `DRLG_OP_STATUS[0]` | `casing?.csgDepth ?? d.DRLG_OP_STATUS?.[0].wCsgBotDpth ?? FALLBACK_STR` | Deepest casing bottom depth |
| Rig | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wRigCd ?? FALLBACK_STR` | Rig code |
| Rig Move KPI | `IWellData` root | `d.kpiRm ?? FALLBACK_STR` | Root-level KPI rig move days |

---

### 2.2 Well Header (`WwellHeaderComponent`)

**Selector:** `selectWellHeaderViewModel(d: IWellData, epANum: number | null)`  
**Store signal:** `store.wellHeaderData()`  
**Template variable:** `@let d = store.wellHeaderData()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Field (EN) | `PRIMARY_HOLEID[0]` | `primaryHole?.wPrimHidName ?? FALLBACK_STR` | Primary hole field name (English); no rig fallback |
| Field (AR) | `PRIMARY_HOLEID[0]` | `primaryHole?.w_prim_hid_ar_name_html ?? null` | Arabic HTML for the field name; rendered with `[innerHTML]` after English label when present |
| Well Name | `RIG_ACTIVITY[0]` / `WELL_MASTER[0]` | `rig?.wellName ?? master?.well ?? FALLBACK_STR` | Rig activity well name takes priority over GIS master well |
| Latitude | `WELL_MASTER[0]` | `master?.lat ?? FALLBACK_STR` | GIS coordinate — badge labeled "GIS" in UI |
| Longitude | `WELL_MASTER[0]` | `master?.lon ?? FALLBACK_STR` | GIS coordinate — badge labeled "GIS" in UI |
| Targeted Aquifer | `EXAD_GWD_IR_HYDROGEOLOGY[0]` / `EXAD_RCD_PREWAP[0]` | `hydro?.estTargetAquifier ?? prewap?.targetFormation ?? FALLBACK_STR` | IR badge in UI; hydrogeology estimate first |
| Target Depth (ft) | `EXAD_RCD_PREWAP[0]` / `DRLG_OP_STATUS[0]` | `prewap?.estTargetDepth ?? status?.targetDepth ?? FALLBACK_STR` | Displayed as `{depth} ft` |
| EP Num | `DRLG_OP_STATUS[0]` | `status?.epANum ?? epANum ?? FALLBACK_STR` | Drilling status EP number; falls back to store's selected EP number |
| Status | `EXAD_GWD_DAILY_REMARKS[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].status ?? ""` via `selectStatus()` | Editable via `mat-select`; initial value loaded from daily remarks |
| BI | `EXAD_RCD_PREWAP[0]` | `prewap?.supportedBusiness ?? FALLBACK_STR` | Supported business / BI label (`'N/A'` fallback); previously `rig?.biNum` |

---

### 2.3 Well Test — Test Remarks (`WwellTestComponent`)

**Selector:** `selectWwellTestViewModel(d: IWellData)`  
**Store signal:** `store.wwellTest()`  
**Form controls in:** `wellTestForm`  
**Source:** `EXAD_GWD_WELL_TESTS[0]` (primary test outcome)

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Aquifer (Actual) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.rsvrCd` | Editable via `mat-select` (`formControlName="rsvrCd"`) |
| Aquifer (IR / Estimate) | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | `hydro?.estTargetAquifier` | Read-only IR field shown alongside editable actual |
| Test Duration (h) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.duration` | Editable numeric input |
| Test Rate (GPM) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.hydProdRt` | Shown when `isFlowTest()` = true (`flowType !== 'N'`) |
| RPM | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.rpm` | Shown when `isFlowTest()` = false (pump test) |
| Temperature (°C) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.temp` | Always shown |
| TDS (PPM) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.wtrSaTdsCnc` | Always shown |
| H2S (PPM) — Actual | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.hydH2sCnc` | Editable; always shown |
| H2S (PPM) — Estimate | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | `hydro?.estH2s` | Read-only IR field |
| Pump Depth (ft) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.hydPmpDpth` | Pump test only |
| SWL — Static Water Level (ft) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.statWlvl` | Pump test only |
| DWL — Dynamic Water Level (ft) | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.dyncWlvl` | Pump test only |
| Well Productivity (GPM/FT) — Actual | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.hydProduct` | Pump test only; IR estimate from `hydro?.estProductivity` shown read-only |
| SIWHP | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.siwhp` | Flow test only |
| Conducted By | `EXAD_GWD_WELL_TESTS[0]` | `testOutcome?.testerNetworkId` | Tester's network ID; editable text input |
| Flow Test toggle | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | `hydro?.flowType ?? 'N'` | `flowType !== 'N'` → flow test UI; else pump test UI |

---

## 3. Morning Report (`MorningReportComponent`)

**Selectors:** `selectMorningReports()` + `selectWaterWellTestResultsFromData()`  
**Mapper:** `mapWellDataToMorningReport(d)` + `mapToWaterWellTestResult(o, drillingWellName)`

---

### 3.1 Water Well Test Results Card

**Source:** `d.EXAD_GWD_WELL_TESTS[]` mapped via `mapToWaterWellTestResult()`  
**Store signal:** `store.waterWelltestResult()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `WELL_MASTER[0]` | `d.WELL_MASTER?.[0].well ?? ''` | The *drilling* well name, not the test well name |
| Aquifer | `EXAD_GWD_WELL_TESTS[n]` | `o.rsvrCd ?? ''` | Reservoir code from test outcome |
| Test Type | `EXAD_GWD_WELL_TESTS[n]` | `resolveTestType(o)` → `'FLOW' \| 'PUMP'` | `hydTestTypCd.toUpperCase() === 'FLOW'` → FLOW; else PUMP |
| Test Rate (GPM) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.hydProdRt ?? '')` | Production rate |
| SIWHP (PSI) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.siwhp ?? '')` | Only shown when `testType === 'FLOW'`; header label toggles to "RPM" for pump |
| RPM | `EXAD_GWD_WELL_TESTS[n]` | `String(o.rpm ?? '')` | Only shown when `testType === 'PUMP'` |
| H2S (PPM) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.hydH2sCnc ?? '')` | H2S concentration |
| Temperature (°C) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.temp ?? '')` | Test temperature |
| Well Productivity (GPM/ft) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.hydProduct ?? '')` | Well productivity index |
| TDS (PPM) | `EXAD_GWD_WELL_TESTS[n]` | `String(o.wtrSaTdsCnc ?? '')` | Total dissolved solids |

---

### 3.2 Daily Drilling Summary Card

**Source:** `mapWellDataToMorningReport(d)` per well  
**Store signal:** `store.morningReport()`

| Field Name | API Object | Exact Mapping | Business Logic |
|---|---|---|---|
| Well Name | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wellName ?? ''` | Card header — `report.wGnrName` |
| Rig Code | `RIG_ACTIVITY[0]` | `d.RIG_ACTIVITY?.[0].wRigCd ?? ''` | Card header subtitle — `report.wRigCd` |
| Rig Status | `EXAD_GWD_DAILY_REMARKS[0]` | `d.EXAD_GWD_DAILY_REMARKS?.[0].status ?? 'NA'` | Editable inline input; overrides stored in `rigStatusOverrides` map keyed by `epANum` |
| Target Aquifer | `EXAD_GWD_IR_HYDROGEOLOGY[0]` / `EXAD_RCD_PREWAP[0]` | `hydro?.estTargetAquifier ?? prewap?.targetFormation ?? ''` | `report.trgtRsvrCd` |
| Current Formation | `DRLG_FM_TOPS[]` (last element) | `tops[tops.length - 1]?.stLongCd ?? ''` | Last picked formation top code — `report.stLongCd` |
| Current Depth (ft) | `DRLG_OP_STATUS[0]` | `status?.wPrsntDpth ?? null` | `report.wPrsntDpth` |
| Planned Total Depth (ft) | `EXAD_RCD_PREWAP[0]` | `prewap?.estTargetDepth ?? null` | `report.plLtrlEndDpth` |
| Footage (ft) | `DRLG_OP_STATUS[0]` | `status?.wDpthChgDis ?? null` | Daily depth change — `report.wDpthChgDis` |
| Supportings | `EXAD_RCD_PREWAP[0]` | `d.EXAD_RCD_PREWAP?.[0].supportedBusiness ?? "Missing"` | Business unit being supported — `report.supportings` |
| Operation | `DRLG_OP_SMRY[0]` / `DRLG_OP_STATUS[0]` | `opSmry?.wOpRmk ?? status?.wOpRmk ?? ''` | Today's drilling operation description — `report.wOpRmk` |

---

## API Response Object Reference

| API Object Key | Description |
|---|---|
| `RIG_ACTIVITY[0]` | Rig assignment & well identification |
| `DRLG_OP_STATUS[0]` | Current drilling operation status (depths, days, footage) |
| `EXAD_GWD_IR_HYDROGEOLOGY[0]` | Hydrogeology infrastructure record (aquifer, estimates) |
| `EXAD_GWD_IR_CASING[]` | Planned casing string records |
| `DRLG_CSG[]` | Actual drilled casing records |
| `EXAD_GWD_IR_TOPS[]` | Planned formation top picks |
| `DRLG_FM_TOPS[]` | Actual drilled formation tops |
| `EXAD_GWD_WELL_TESTS[]` | Well test outcome records |
| `EXAD_GWD_IR_WATER[]` | Offset water well infrastructure records |
| `EXAD_RCD_PREWAP[0]` | Pre-well activity plan (target depth, formation, business) |
| `WELL_MASTER[0]` | GIS well master (coordinates, well name) |
| `RIG_IDENTIFICATION[0]` | Rig name / identification |
| `EXAD_GWD_DAILY_REMARKS[0]` | Daily remarks (status, operation remarks) |
| `DRLG_OP_SMRY[]` | Drilling operation summary records (hole size, event time) |
| `NEW_TARGET_DAYS[0]` | Updated target drilling days |
| `NEXT_2_WELL_ACTIVITY[0]` | Next planned well activity |
| `ROP_DATA[0]` | Rate of penetration data |
| `MUD_CIRC[]` | Mud circulation depth/percentage points |
| `EXAD_GWD_WELL_DESIGN[0]` | Well design / completion spec |
| `EXAD_GWD_IR_HEADER[0]` | Header IR (RCC / mud log / logging remarks) |
| `DRLG_FD_TDAY[0]` | Feet drilled today record |
| `IWellData.actualRm` | Actual rig move days (root-level) |
| `IWellData.kpiRm` | KPI rig move days (root-level) |
| `IWellData.rigMoveDays` | Rig move days delta (root-level) |
