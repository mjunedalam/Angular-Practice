# Presentation Feature — Field Mapping Overview

> Cross-verified against HTML templates, component TypeScript, and `well-data.selectors.ts`
>
> **Selector file:** [`well-data.selectors.ts`](../src/app/core/store/shared/well-data.selectors.ts)
> **Store file:** [`presentation.store.ts`](../src/app/features/presentation/store/presentation.store.ts)

---

## Screens

| # | Screen | Store Signal | Selector |
|---|--------|-------------|---------|
| 1 | [Well Name Chips](#1-well-name-chips) | `pagedWellNames()` | [`selectWellNamesFromList` L41](../src/app/core/store/shared/well-data.selectors.ts#L41) |
| 2 | [Misc Pres Well Data](#2-misc-pres-well-data) | `miscWellData()` | [`selectMiscWellData` L161](../src/app/core/store/shared/well-data.selectors.ts#L161) |
| 3 | [Well Test Result](#3-well-test-result) | `wwellTest()` + `wellHeaderData()` | [`selectWwellTestViewModel` L460](../src/app/core/store/shared/well-data.selectors.ts#L460) |
| 4 | [Formation Tops Grid](#4-formation-tops-grid) | `allFormationTops()` | [`selectAllFormationTops` L374](../src/app/core/store/shared/well-data.selectors.ts#L374) |
| 5 | [Offset Wells](#5-offset-wells) | `offsetWells()` | [`selectOffsetWells` L209](../src/app/core/store/shared/well-data.selectors.ts#L209) |
| 6 | [WWells Logs Indicators](#6-wwells-logs-indicators) | `wellsLogsIndicators()` + `wellsLogsRemarks()` | [`selectWellLogsIndicators` L238](../src/app/core/store/shared/well-data.selectors.ts#L238) |
| 7 | [Active Wwell Map](#7-active-wwell-map) | `wellHeaderData()` | [`selectWellHeaderViewModel` L289](../src/app/core/store/shared/well-data.selectors.ts#L289) |
| 8 | [Well Bore View](#8-well-bore-view) | `diagramData()` | [`selectDiagramData` L140](../src/app/core/store/shared/well-data.selectors.ts#L140) |
| 9 | [Depth Scale](#9-depth-scale) | `displayDepth()` + `totalDepth()` | [`selectDisplayDepth` L83](../src/app/core/store/shared/well-data.selectors.ts#L83) |
| 10 | [Active Wwell Docs Viewer](#10-active-wwell-docs-viewer) | `docsStore.*` | `WellDocsStore` (separate) |

---

## 1. Well Name Chips

**Component:** [`well-name-chips.component.ts`](../src/app/features/presentation/well-name-chips/well-name-chips.component.ts)
**Template:** [`well-name-chips.component.html`](../src/app/features/presentation/well-name-chips/well-name-chips.component.html)

Renders a paginated chip strip and a date text input.

### 1.1 Well Chip Strip

| UI Element | Store Signal | API / Source |
|------------|-------------|--------------|
| Chip label (well name) | `store.pagedWellNames()[n].wellName` | `WwellEntry.wGnrName` from well-list API |
| Chip identity key | `store.pagedWellNames()[n].epANum` | `WwellEntry.epANum` |
| Active chip highlight | `store.selectedEpANum()` | URL param `epANum` (state) |
| Prev `‹` button shown | `store.hasPrevPage()` | Computed from `wellNamesPage` — [`L62`](../src/app/core/store/shared/well-data.selectors.ts#L62) |
| Next `›` button shown | `store.hasNextPage()` | Computed from `wellNamesPage` — [`L66`](../src/app/core/store/shared/well-data.selectors.ts#L66) |
| Page label text | `pageLabel()` (component) | Derived: `page / totalPages` |
| Loading bar visible | `loaderVisible()` (component) | `store.isDetailsLoading()` |

**Selector:** [`selectWellNamesFromList` L41](../src/app/core/store/shared/well-data.selectors.ts#L41)

### 1.2 Date Picker

| UI Element | Signal | Notes |
|------------|--------|-------|
| Text input value | `selectedDateString()` (component) | Formats `store.selectedDate()` → `YYYY-MM-DD` |
| Native date `[max]` | `maxDateString` (component) | Locked to today — prevents future selection |

---

## 2. Misc Pres Well Data

**Component:** [`misc-pres-well-data.component.ts`](../src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.ts)
**Template:** [`misc-pres-well-data.component.html`](../src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.html)
**Store signal:** `store.miscWellData()` → type `MiscWellData | null`
**Selector:** [`selectMiscWellData` L161](../src/app/core/store/shared/well-data.selectors.ts#L161)

### 2.1 Identity Row

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Well Name | `d.wellName` | `RIG_ACTIVITY[0].wellName` | [L166](../src/app/core/store/shared/well-data.selectors.ts#L166) |
| Rig | `d.rigName` | `RIG_IDENTIFICATION[0].rigname` | [L186](../src/app/core/store/shared/well-data.selectors.ts#L186) |
| Rig Height (ft) | `d.rigHeight` | `RIG_IDENTIFICATION[0].rigHeight` | [L187](../src/app/core/store/shared/well-data.selectors.ts#L187) |
| BI Number | `d.biNum` | `RIG_ACTIVITY[0].biNum` | [L172](../src/app/core/store/shared/well-data.selectors.ts#L172) |
| Supporting Business | `d.supportings` | `EXAD_RCD_PREWAP[0].supportedBusiness` | [L173](../src/app/core/store/shared/well-data.selectors.ts#L173) |
| Targeted Aquifer | `d.targetedAquifer` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estTargetAquifier` | [L168](../src/app/core/store/shared/well-data.selectors.ts#L168) |

### 2.2 Rig Move KPI

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Actual (days) | `d.actualRm` | `IWellData.actualRm` (root field) | [L183](../src/app/core/store/shared/well-data.selectors.ts#L183) |
| KPI (days) | `d.kpiRm` | `IWellData.kpiRm` (root field) | [L184](../src/app/core/store/shared/well-data.selectors.ts#L184) |
| Diff class (positive/negative) | `d.rigMoveDays` | `IWellData.rigMoveDays` (root field) | [L185](../src/app/core/store/shared/well-data.selectors.ts#L185) |

### 2.3 Spud & Days

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Spud Date | `d.spudDate` | `RIG_ACTIVITY[0].spuddate` | [L189](../src/app/core/store/shared/well-data.selectors.ts#L189) |
| Days Since Spud | `d.daysSinceSpud` | `DRLG_OP_STATUS[0].spuddays` | [L170](../src/app/core/store/shared/well-data.selectors.ts#L170) |
| Target Days | `d.targetDays` | `NEW_TARGET_DAYS[0].targetDays ?? RIG_ACTIVITY[0].wDrlgTrgtDay` | [L171](../src/app/core/store/shared/well-data.selectors.ts#L171) |

### 2.4 Drilling Progress

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Current Depth (ft) | `d.currentDepth` | `DRLG_OP_STATUS[0].wPrsntDpth` | [L176](../src/app/core/store/shared/well-data.selectors.ts#L176) |
| Previous Depth (ft) | `d.previousDepth` | `DRLG_OP_STATUS[0].wPrevDpth` | [L188](../src/app/core/store/shared/well-data.selectors.ts#L188) |
| Current Hole Size | `d.holeSize` | `DRLG_OP_SMRY[max(wHoleEndDpth)].wHolSz` | [L190](../src/app/core/store/shared/well-data.selectors.ts#L190) |
| Footage (ft) | `d.feetDrilledToday` | `DRLG_FD_TDAY[0].footage ?? DRLG_OP_STATUS[0].footage` | [L178](../src/app/core/store/shared/well-data.selectors.ts#L178) |
| ROP (ft/h) | `d.rop` | `ROP_DATA[0].rop` | [L182](../src/app/core/store/shared/well-data.selectors.ts#L182) |

### 2.5 Activity

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Next Well | `d.nextWell` | `NEXT_2_WELL_ACTIVITY[0].nextWellActivity` | [L177](../src/app/core/store/shared/well-data.selectors.ts#L177) |

### 2.6 Remarks (full-width text cards)

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Operation Summary | `d.operationSummary` | `EXAD_GWD_DAILY_REMARKS[0].opRmk ?? DRLG_OP_SMRY[0].wOpRmk` | [L179](../src/app/core/store/shared/well-data.selectors.ts#L179) |
| Drilling Summary Remark | `d.drlgSmryRmk` | `EXAD_GWD_DAILY_REMARKS[0].drlgSmryRmk ?? DRLG_OP_STATUS[0].wDrlgSmryRmk` | [L181](../src/app/core/store/shared/well-data.selectors.ts#L181) |
| Next 24 Hr Operation | `d.next24HrOperation` | `EXAD_GWD_DAILY_REMARKS[0].next24HrPlanRrmk ?? DRLG_OP_STATUS[0].nxt24HrPlanRmk` | [L180](../src/app/core/store/shared/well-data.selectors.ts#L180) |

---

## 3. Well Test Result

**Component:** [`wwell-test-result.component.ts`](../src/app/features/presentation/wwell-test-result/wwell-test-result.component.ts)
**Template:** [`wwell-test-result.component.html`](../src/app/features/presentation/wwell-test-result/wwell-test-result.component.html)
**Store signals:**
- `store.wwellTest()` → [`selectWwellTestViewModel` L460](../src/app/core/store/shared/well-data.selectors.ts#L460) — all test data
- `store.wellHeaderData()` → [`selectWellHeaderViewModel` L289](../src/app/core/store/shared/well-data.selectors.ts#L289) — well name only

Source row: `EXAD_GWD_WELL_TESTS[0]` (primary test result)

### 3.1 List Card (collapsed view)

| UI Label | Signal / Field | API Response Path |
|----------|---------------|-------------------|
| Well Name | `store.wellHeaderData()?.wellName` | `RIG_ACTIVITY[0].wellName ?? WELL_MASTER[0].well` |
| Aquifer | `result.aquiferActual` | `EXAD_GWD_WELL_TESTS[0].rsvrCd` |
| Test Rate (GPM) | `result.rate` | `EXAD_GWD_WELL_TESTS[0].hydProdRt` |

### 3.2 Detail Dialog — All Test Types

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Test Type | `r.testType` | `EXAD_GWD_WELL_TESTS[0].hydTestTypCd` | [L470](../src/app/core/store/shared/well-data.selectors.ts#L470) |
| Aquifer (Actual) | `r.aquiferActual` | `EXAD_GWD_WELL_TESTS[0].rsvrCd` | [L475](../src/app/core/store/shared/well-data.selectors.ts#L475) |
| Aquifer (Estimate) | `r.aquiferEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estTargetAquifier` | [L476](../src/app/core/store/shared/well-data.selectors.ts#L476) |
| Test Rate (GPM) | `r.rate` | `EXAD_GWD_WELL_TESTS[0].hydProdRt` | [L485](../src/app/core/store/shared/well-data.selectors.ts#L485) |
| Duration (H) | `r.duration` | `EXAD_GWD_WELL_TESTS[0].duration` | [L483](../src/app/core/store/shared/well-data.selectors.ts#L483) |
| TDS (PPM) — Actual | `r.tds` | `EXAD_GWD_WELL_TESTS[0].wtrSaTdsCnc` | [L480](../src/app/core/store/shared/well-data.selectors.ts#L480) |
| TDS — Estimate | `r.tdsEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estWaterQuality` | [L481](../src/app/core/store/shared/well-data.selectors.ts#L481) |
| Temperature (°C) | `r.temp` | `EXAD_GWD_WELL_TESTS[0].temp` | [L479](../src/app/core/store/shared/well-data.selectors.ts#L479) |
| H₂S (PPM) — Actual | `r.h2sActual` | `EXAD_GWD_WELL_TESTS[0].hydH2sCnc` | [L477](../src/app/core/store/shared/well-data.selectors.ts#L477) |
| H₂S — Estimate | `r.h2sEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estH2s` | [L478](../src/app/core/store/shared/well-data.selectors.ts#L478) |
| Well Productivity (GPM/FT) | `r.productivityActual` | `EXAD_GWD_WELL_TESTS[0].hydProduct` | [L491](../src/app/core/store/shared/well-data.selectors.ts#L491) |
| Test Rate — Estimate | `r.testRateEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estProductivity` | [L492](../src/app/core/store/shared/well-data.selectors.ts#L492) |
| Conducted By | `r.conductedBy` | `EXAD_GWD_WELL_TESTS[0].testerNetworkId` | [L484](../src/app/core/store/shared/well-data.selectors.ts#L484) |

### 3.3 Detail Dialog — Pump Test Only (`testType !== 'FLOW'`)

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| RPM | `r.rpm` | `EXAD_GWD_WELL_TESTS[0].rpm` | [L483](../src/app/core/store/shared/well-data.selectors.ts#L483) |
| Pump Depth (FT) | `r.hydPmpDpth` | `EXAD_GWD_WELL_TESTS[0].hydPmpDpth` | [L490](../src/app/core/store/shared/well-data.selectors.ts#L490) |
| Pump Depth — Estimate | `r.pumpDepthEstimate` | `EXAD_GWD_WELL_DESIGN[0].pumpLvl` | [L496](../src/app/core/store/shared/well-data.selectors.ts#L496) |
| SWL — Static Water Level (FT) | `r.swl` | `EXAD_GWD_WELL_TESTS[0].statWlvl` | [L493](../src/app/core/store/shared/well-data.selectors.ts#L493) |
| SWL — Estimate | `r.swlEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estStaticWaterLevel` | [L494](../src/app/core/store/shared/well-data.selectors.ts#L494) |
| DWL — Dynamic Water Level (FT) | `r.dwl` | `EXAD_GWD_WELL_TESTS[0].dyncWlvl` | [L495](../src/app/core/store/shared/well-data.selectors.ts#L495) |

### 3.4 Detail Dialog — Flow Test Only (`testType === 'FLOW'`)

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| SIWHP (PSI) | `r.siwhp` | `EXAD_GWD_WELL_TESTS[0].siwhp` | [L486](../src/app/core/store/shared/well-data.selectors.ts#L486) |
| SIWHP — Estimate | `r.siwhpEstimate` | `EXAD_GWD_IR_HYDROGEOLOGY[0].estStaticWaterLevel` | [L488](../src/app/core/store/shared/well-data.selectors.ts#L488) |
| FWHP (PSI) | `r.fwhp` | `EXAD_GWD_WELL_TESTS[0].fwhp` | [L487](../src/app/core/store/shared/well-data.selectors.ts#L487) |

---

## 4. Formation Tops Grid

**Component:** [`picked-formation-tops.component.ts`](../src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.ts)
**Template:** [`picked-formation-tops.component.html`](../src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.html)
**Store signal:** `store.allFormationTops()` → type `FormationInfoViewModel[]`
**Selector:** [`selectAllFormationTops` L374](../src/app/core/store/shared/well-data.selectors.ts#L374)

Merges **planned** tops from `EXAD_GWD_IR_TOPS` with **actual drilled** tops from `DRLG_FM_TOPS`,
joined on `stLongCd`, sorted by effective depth. Rows that exist only in `DRLG_FM_TOPS` are flagged `isDrlgOnly: true`.

### 4.1 AG Grid Column Definitions

| Column Header | `field` | Planned Source | Actual Source | L# |
|---------------|---------|---------------|--------------|-----|
| Formation | `formation` | `EXAD_GWD_IR_TOPS[n].stLongCd` | `DRLG_FM_TOPS[n].stLongCd` | [L388](../src/app/core/store/shared/well-data.selectors.ts#L388) |
| Prognosed (ft) | `prognosed` | `EXAD_GWD_IR_TOPS[n].planTvdDepth` | — | [L385](../src/app/core/store/shared/well-data.selectors.ts#L385) |
| Actual Depth (ft) | `actualDepth` | — | `DRLG_FM_TOPS[n].wStDmrkDpth` | [L384](../src/app/core/store/shared/well-data.selectors.ts#L384) |

> `difference` and `remarks` exist in `FormationInfoViewModel` but have no column in the current grid column definition.

---

## 5. Offset Wells

**Component:** [`offset-wwells.component.ts`](../src/app/features/presentation/offset-wwells/offset-wwells.component.ts)
**Template:** [`offset-wwells.component.html`](../src/app/features/presentation/offset-wwells/offset-wwells.component.html)
**Store signal:** `store.offsetWells()` → type `OffsetWaterWells[]`
**Selector:** [`selectOffsetWells` L209](../src/app/core/store/shared/well-data.selectors.ts#L209)

Each row = one entry from `EXAD_GWD_IR_WATER`, joined with `EXAD_GWD_WELL_TESTS` where
`EXAD_GWD_WELL_TESTS[n].wellName === offsetWaterWell`.

### 5.1 Panel Header

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| Well Name | `well.wellName` | `EXAD_GWD_IR_WATER[n].offsetWaterWell` | [L214](../src/app/core/store/shared/well-data.selectors.ts#L214) |
| Aquifer | `well.aquifer` | `EXAD_GWD_IR_WATER[n].aquifer ?? EXAD_GWD_WELL_TESTS[match].rsvrCd ?? 'WASI'` | [L215](../src/app/core/store/shared/well-data.selectors.ts#L215) |

### 5.2 Stats & Metrics

| UI Label | Store Field | API Response Path | L# |
|----------|------------|-------------------|----|
| TDS (PPM) | `well.tds` | `EXAD_GWD_WELL_TESTS[match].wtrSaTdsCnc` | [L216](../src/app/core/store/shared/well-data.selectors.ts#L216) |
| RPM | `well.rpm` | `EXAD_GWD_IR_WATER[n].rpm` | [L217](../src/app/core/store/shared/well-data.selectors.ts#L217) |
| H2S | `well.h2s` | `EXAD_GWD_IR_WATER[n].h2s` | [L218](../src/app/core/store/shared/well-data.selectors.ts#L218) |
| Distance (ft) | `well.distance` | `EXAD_GWD_IR_WATER[n].distance` | [L219](../src/app/core/store/shared/well-data.selectors.ts#L219) |
| Direction | `well.direction` | `EXAD_GWD_IR_WATER[n].direction` | [L219](../src/app/core/store/shared/well-data.selectors.ts#L219) |
| Productivity (GPM/FT) | `well.productivity` | `EXAD_GWD_IR_WATER[n].specificCapacity` | [L220](../src/app/core/store/shared/well-data.selectors.ts#L220) |
| Flow Rate (GPM) | `well.rate` | `EXAD_GWD_WELL_TESTS[match].hydProdRt ?? EXAD_GWD_IR_WATER[n].flowRate` | [L221](../src/app/core/store/shared/well-data.selectors.ts#L221) |

---

## 6. WWells Logs Indicators

**Component:** [`wwells-logs-indicators.component.ts`](../src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.ts)
**Template:** [`wwells-logs-indicators.component.html`](../src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.html)
**Store signals:**
- `store.wellsLogsIndicators()` → [`selectWellLogsIndicators` L238](../src/app/core/store/shared/well-data.selectors.ts#L238) — active boolean per indicator
- `store.wellsLogsRemarks()` → [`selectWellLogsRemarks` L254](../src/app/core/store/shared/well-data.selectors.ts#L254) — tooltip text per indicator

Source: `EXAD_GWD_IR_HEADER[0]`

Active logic: non-empty and not equal to `"not required"` (case-insensitive).
See [`isLogActive` L229](../src/app/core/store/shared/well-data.selectors.ts#L229).

### 6.1 Indicator Strip

| Indicator | Active Signal | Tooltip Signal | API Response Path | L# |
|-----------|--------------|----------------|-------------------|----|
| RCC | `data.rcc` | `remarks.dtRemarks` | `EXAD_GWD_IR_HEADER[0].dtRemarks` | [L242](../src/app/core/store/shared/well-data.selectors.ts#L242) |
| Mud Log | `data.mudLog` | `remarks.mudRemarks` | `EXAD_GWD_IR_HEADER[0].mudRemarks` | [L243](../src/app/core/store/shared/well-data.selectors.ts#L243) |
| Logging | `data.logging` | `remarks.loggingRemarks` | `EXAD_GWD_IR_HEADER[0].loggingRemarks` | [L244](../src/app/core/store/shared/well-data.selectors.ts#L244) |

---

## 7. Active Wwell Map

**Component:** [`active-wwell-map.component.ts`](../src/app/features/presentation/active-wwell-map/active-wwell-map.component.ts)
**Template:** [`active-wwell-map.component.html`](../src/app/features/presentation/active-wwell-map/active-wwell-map.component.html)
**Store signal:** `store.wellHeaderData()` → [`selectWellHeaderViewModel` L289](../src/app/core/store/shared/well-data.selectors.ts#L289)

The template is a plain `<div #presMapViewNode>` — all rendering is ArcGIS JSAPI imperative.
Data is consumed inside a component `computed<SelectedWellCoords>()` and passed to `syncGlowGraphic()`.

### 7.1 Map Pin & Popup

| Data Point | Component Field | API Response Path | L# |
|------------|----------------|-------------------|----|
| Pin latitude | `header.lat` | `WELL_MASTER[0].lat` | [L301](../src/app/core/store/shared/well-data.selectors.ts#L301) |
| Pin longitude | `header.lon` | `WELL_MASTER[0].lon` | [L302](../src/app/core/store/shared/well-data.selectors.ts#L302) |
| Popup: Well Name | `header.wellName` | `RIG_ACTIVITY[0].wellName ?? WELL_MASTER[0].well` | [L300](../src/app/core/store/shared/well-data.selectors.ts#L300) |
| Popup: Field | `header.field` | `PRIMARY_HOLEID[0].wPrimHidName` | [L298](../src/app/core/store/shared/well-data.selectors.ts#L298) |
| Popup: EP Num | `header.epNum` | `WELL_MASTER[0].epANum` | [L297](../src/app/core/store/shared/well-data.selectors.ts#L297) |
| Popup: Depth | `header.depth` | `EXAD_RCD_PREWAP[0].estTargetDepth` | — |
| Hover tooltip | `header.wellName` | same as Well Name | — |

### 7.2 Component State (not from API)

| Signal | Meaning |
|--------|---------|
| `mapReady()` | Set to `true` after `MapView.when()` resolves |
| `errorMessage()` | `null` when pin is rendered; error text when coords missing |

---

## 8. Well Bore View

**Component:** [`wellbore-view.component.ts`](../src/app/features/presentation/well-bore-view/wellbore-view.component.ts)
**Template:** [`wellbore-view.component.html`](../src/app/features/presentation/well-bore-view/wellbore-view.component.html)

The template is a single `<svg #wellboreSvg>`. All drawing is D3 inside an Angular `effect()`.

**Store signal:** `store.diagramData()` → [`selectDiagramData` L140](../src/app/core/store/shared/well-data.selectors.ts#L140)

### 8.1 Diagram Data Fields

| `diagramData` Field | API Response Path | Notes |
|--------------------|-------------------|-------|
| `wellName` | `WELL_MASTER[0].well` | Well label on SVG |
| `totalDepth` | See [selectTotalDepth L77](../src/app/core/store/shared/well-data.selectors.ts#L77) | `max(EXAD_RCD_PREWAP[0].estTargetDepth, DRLG_OP_STATUS[0].wPrsntDpth)` |
| `displayDepth` | See [selectDisplayDepth L83](../src/app/core/store/shared/well-data.selectors.ts#L83) | `max(totalDepth, all formation top depths) + 500 ft padding` |
| `casings[]` | `EXAD_GWD_IR_CASING[]` | Planned casing intervals, sorted by depth desc |
| `drlgCasings[]` | `DRLG_CSG[]` | Actual run casings, sorted by `wCsgBotDpth` desc |
| `geologicTops[]` | `EXAD_GWD_IR_TOPS[]` | Planned formation tops, sorted by depth asc |
| `currentDepth` | `DRLG_OP_STATUS[0].wPrsntDpth` | Current bit depth marker |
| `mudCirculation[]` | `MUD_CIRC[].wPrsntDpth` + `MUD_CIRC[].wMudCircPc` | Mud returns per stand |
| `hydrogeology` | `EXAD_GWD_IR_HYDROGEOLOGY[0]` | Full object |
| `prewap` | `EXAD_RCD_PREWAP[0]` | Full object |
| `rigActivity` | `RIG_ACTIVITY[0]` | Full object |
| `wellDesign` | `EXAD_GWD_WELL_DESIGN[0]` | Full object |

---

## 9. Depth Scale

**Component:** [`depth-scale.component.ts`](../src/app/features/presentation/depth-scale/depth-scale.component.ts)
**Template:** [`depth-scale.component.html`](../src/app/features/presentation/depth-scale/depth-scale.component.html)

The template is a single `<svg #scaleSvg>`. Tick labels are computed ft-bgl values drawn by D3.

| Scale Element | Store Signal | Selector | API Response Path |
|---------------|-------------|----------|-------------------|
| Scale max (axis domain) | `store.displayDepth()` | [`selectDisplayDepth` L83](../src/app/core/store/shared/well-data.selectors.ts#L83) | `max(totalDepth, all planned/actual top depths) + 500 ft` |
| Total depth marker | `store.totalDepth()` | [`selectTotalDepth` L77](../src/app/core/store/shared/well-data.selectors.ts#L77) | `max(EXAD_RCD_PREWAP[0].estTargetDepth, DRLG_OP_STATUS[0].wPrsntDpth)` |

---

## 10. Active Wwell Docs Viewer

**Component:** [`active-wwell-docs-viewer.component.ts`](../src/app/features/presentation/active-wwell-docs-viewer/active-wwell-docs-viewer.component.ts)
**Template:** [`active-wwell-docs-viewer.component.html`](../src/app/features/presentation/active-wwell-docs-viewer/active-wwell-docs-viewer.component.html)
**Store:** `WellDocsStore` (injected as `docsStore` — separate from `PresentationStore`)
**Service:** `PresDocsService` → external storage API (S3 / presigned URLs)

This component does **not** use `well-data.selectors.ts`. Documents are fetched independently by `PresDocsService`, keyed on `epANum` + `date` from `PresentationStore`.

### 10.1 Document List

| UI Element | Store Signal | Source |
|------------|-------------|--------|
| Document count badge | `docsStore.docNames().length` | External API listing |
| Document file name | `docName` (iterated) | `docsStore.docNames()` |
| File type icon | `fileIcon(docName)` (component) | Derived from extension |
| View button loading | `isViewLoading(docName)` (component) | Internal download state |
| Download button loading | `isDownloadLoading(docName)` (component) | Internal download state |
| Delete button loading | `isFileDeleting(docName)` (component) | Internal delete state |

### 10.2 Store States

| UI State | Signal |
|----------|--------|
| Fetching spinner | `docsStore.listLoading()` |
| Error message | `docsStore.listError()` |
| Empty state | Derived: `!listLoading && !listError && docNames.length === 0` |

### 10.3 Request Keys (from PresentationStore)

| Key | Store Signal | Source |
|-----|-------------|--------|
| EP-A Number | `store.selectedEpANum()` | URL param `epANum` |
| Date | `store.selectedDate()` | URL param `date` |

---

## Store Signal Quick Reference

**File:** [`presentation.store.ts`](../src/app/features/presentation/store/presentation.store.ts)
All signals wired inside `withComputed()`.

| Store Signal | Selector Function | Line |
|-------------|------------------|------|
| `miscWellData()` | `selectMiscWellData` | [L161](../src/app/core/store/shared/well-data.selectors.ts#L161) |
| `wwellTest()` | `selectWwellTestViewModel` | [L460](../src/app/core/store/shared/well-data.selectors.ts#L460) |
| `wellHeaderData()` | `selectWellHeaderViewModel` | [L289](../src/app/core/store/shared/well-data.selectors.ts#L289) |
| `allFormationTops()` | `selectAllFormationTops` | [L374](../src/app/core/store/shared/well-data.selectors.ts#L374) |
| `pickedFormations()` | `selectPickedFormations` | [L201](../src/app/core/store/shared/well-data.selectors.ts#L201) |
| `offsetWells()` | `selectOffsetWells` | [L209](../src/app/core/store/shared/well-data.selectors.ts#L209) |
| `wellsLogsIndicators()` | `selectWellLogsIndicators` | [L238](../src/app/core/store/shared/well-data.selectors.ts#L238) |
| `wellsLogsRemarks()` | `selectWellLogsRemarks` | [L254](../src/app/core/store/shared/well-data.selectors.ts#L254) |
| `diagramData()` | `selectDiagramData` | [L140](../src/app/core/store/shared/well-data.selectors.ts#L140) |
| `totalDepth()` | `selectTotalDepth` | [L77](../src/app/core/store/shared/well-data.selectors.ts#L77) |
| `displayDepth()` | `selectDisplayDepth` | [L83](../src/app/core/store/shared/well-data.selectors.ts#L83) |
| `pagedWellNames()` | `selectPagedWellNames` | [L52](../src/app/core/store/shared/well-data.selectors.ts#L52) |
| `hasPrevPage()` | `selectHasPrevPage` | [L62](../src/app/core/store/shared/well-data.selectors.ts#L62) |
| `hasNextPage()` | `selectHasNextPage` | [L66](../src/app/core/store/shared/well-data.selectors.ts#L66) |
| `databaseInfo()` | `selectDatabaseInfoViewModel` | [L311](../src/app/core/store/shared/well-data.selectors.ts#L311) |
| `operationSummary()` | `selectOperationSummaryViewModel` | [L341](../src/app/core/store/shared/well-data.selectors.ts#L341) |
| `formationInfo()` | `selectFormationInfoViewModel` | [L352](../src/app/core/store/shared/well-data.selectors.ts#L352) |
| `casingInfo()` | `selectCasingInfoViewModel` | [L420](../src/app/core/store/shared/well-data.selectors.ts#L420) |
| `waterWelltestResult()` | `selectWaterWellTestResultsFromData` | [L557](../src/app/core/store/shared/well-data.selectors.ts#L557) |
| `wellTestResults()` | `selectWellTestResults` | [L270](../src/app/core/store/shared/well-data.selectors.ts#L270) |
