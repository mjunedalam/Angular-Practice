# Pump Test vs Flow Test — Complete Decision Logic

All three surfaces share the same raw API object but use different decision signals.

---

## 1. Source API Object

```
EXAD_GWD_WELL_TESTS[]   (IWaterWellTestOutcome)
```

| Decision Field | API Path | Condition |
|---|---|---|
| Test type code | `EXAD_GWD_WELL_TESTS[n].hydTestTypCd` | `=== 'FLOW'` → Flow; anything else → Pump |
| Flow type flag *(edit form only)* | `EXAD_GWD_IR_HYDROGEOLOGY[0].flowType` | `=== 'Y'` → Flow |

---

## 2. Shared Resolver — `resolveTestType()`

`src/app/core/store/shared/well-data.selectors.ts:236`

```typescript
function resolveTestType(t: IWaterWellTestOutcome): WellTestType {
    const code = (t.hydTestTypCd ?? '').toUpperCase().trim();
    return code === 'FLOW' ? 'FLOW' : 'PUMP';
}
```

Default when `hydTestTypCd` is null / empty / unrecognised → **PUMP**

Used by: Presentation screen + Morning Report. **Not** used by the edit form.

---

## 3. Presentation Screen — `WwellTestResultComponent`

**Selector:** `selectWellTestResults()` · **View model:** `WellTestResult`

### Common fields (shown for both PUMP and FLOW)

| Field | API Source | Notes |
|---|---|---|
| Well Name | `EXAD_GWD_WELL_TESTS[n].wellName` | List + dialog title |
| Aquifer | `EXAD_GWD_WELL_TESTS[n].rsvrCd` | Dialog subtitle |
| Flow Rate (GPM) | `EXAD_GWD_WELL_TESTS[n].hydProdRt` | Main stat on list tab |
| TDS (PPM) | `EXAD_GWD_WELL_TESTS[n].wtrSaTdsCnc` | Dialog metric |
| Temperature (°C) | `EXAD_GWD_WELL_TESTS[n].temp` | Dialog metric |
| Productivity (GPM/FT) | `EXAD_GWD_WELL_TESTS[n].hydProduct` | Dialog metric |
| H₂S (PPM) | `EXAD_GWD_WELL_TESTS[n].hydH2sCnc` | Dialog metric; warn style if > 0 |

### Distinct fields (one or the other)

| Field | Shown for | API Source | Notes |
|---|---|---|---|
| RPM | **PUMP only** | `EXAD_GWD_WELL_TESTS[n].rpm` | Zero-filled for FLOW at selector level |
| SIWHP (FT) | **FLOW only** | `EXAD_GWD_WELL_TESTS[n].siwhp` | Zero-filled for PUMP at selector level |

---

## 4. Morning Report — `mapToWaterWellTestResult()`

**Mapper:** `well-data.selectors.ts:496` · **View model:** `WaterWellTestResult`
Iterates all `IWellData[]` → all `EXAD_GWD_WELL_TESTS[]` per well.
`MorningReport` model itself has no test-type field; branching is resolved inside the mapper.

### Common fields (shown for both PUMP and FLOW)

| Field | `WaterWellTestResult` key | API Source |
|---|---|---|
| Well Name | `wellName` | `WELL_MASTER[0].well` (drilling well name) |
| Aquifer | `trgtRsvrCd` | `EXAD_GWD_WELL_TESTS[n].rsvrCd` |
| Test Rate (GPM) | `testRate` | `EXAD_GWD_WELL_TESTS[n].hydProdRt` |
| H₂S (PPM) | `h2sPPM` | `EXAD_GWD_WELL_TESTS[n].hydH2sCnc` |
| Temperature (°C) | `temperature` | `EXAD_GWD_WELL_TESTS[n].temp` |
| Well Productivity | `wellProductivity` | `EXAD_GWD_WELL_TESTS[n].hydProduct` |
| TDS (PPM) | `tds` | `EXAD_GWD_WELL_TESTS[n].wtrSaTdsCnc` |

### Distinct fields (one or the other)

| Field | `WaterWellTestResult` key | Shown for | API Source | When absent |
|---|---|---|---|---|
| RPM | `rPM` | **PUMP only** | `EXAD_GWD_WELL_TESTS[n].rpm` | `''` for FLOW |
| SIWHP | `siwhp` | **FLOW only** | `EXAD_GWD_WELL_TESTS[n].siwhp` | `''` for PUMP |

---

## 5. Active Water Well Edit Form — `WwellTestComponent`

**Selector:** `selectWwellTestViewModel()` · **View model:** `WwellTestViewModel`

### Decision — TWO signals, not one

```typescript
// In WwellTestViewModel:
flowType: EXAD_GWD_IR_HYDROGEOLOGY[0].flowType   // IR estimate
testType: EXAD_GWD_WELL_TESTS[0].hydTestTypCd    // raw, not normalised

// isFlowTest() computed:
isFlowTest() = (flowType === 'Y') || (testType?.toLowerCase() === 'flow')
```

Either condition alone triggers the Flow Test UI.

### Distinct fields (one or the other)

| Field | Form Control | Shown for | API Source | Notes |
|---|---|---|---|---|
| Test Rate (GPM) | `hydProdRt` | **FLOW only** | `EXAD_GWD_WELL_TESTS[0].hydProdRt` | Replaces RPM |
| SIWHP | `siwhp` | **FLOW only** | `EXAD_GWD_WELL_TESTS[0].siwhp` | Replaces pump depth / SWL / DWL / productivity block |
| RPM | `rpm` | **PUMP only** | `EXAD_GWD_WELL_TESTS[0].rpm` | Replaces Test Rate |
| Pump Depth (ft) | `hydPmpDpth` | **PUMP only** | `EXAD_GWD_WELL_TESTS[0].hydPmpDpth` | |
| SWL — Static Water Level (ft) | `statWlvl` | **PUMP only** | `EXAD_GWD_WELL_TESTS[0].statWlvl` | |
| DWL — Dynamic Water Level (ft) | `dyncWlvl` | **PUMP only** | `EXAD_GWD_WELL_TESTS[0].dyncWlvl` | |
| Well Productivity (GPM/FT) | `hydProduct` | **PUMP only** | `EXAD_GWD_WELL_TESTS[0].hydProduct` | |
| Productivity (IR estimate) | readonly | **PUMP only** | `EXAD_GWD_IR_HYDROGEOLOGY[0].estProductivity` | IR badge |

### Common fields (shown for both PUMP and FLOW)

| Field | Form Control | API Source | Notes |
|---|---|---|---|
| Aquifer | `rsvrCd` | `EXAD_GWD_WELL_TESTS[0].rsvrCd` | Editable select |
| Aquifer (IR estimate) | readonly | `EXAD_GWD_IR_HYDROGEOLOGY[0].estTargetAquifier` | IR badge |
| Test Duration (h) | `duration` | `EXAD_GWD_WELL_TESTS[0].duration` | |
| Temperature (°C) | `temp` | `EXAD_GWD_WELL_TESTS[0].temp` | |
| TDS (PPM) | `wtrSaTdsCnc` | `EXAD_GWD_WELL_TESTS[0].wtrSaTdsCnc` | |
| H₂S (PPM) | `hydH2sCnc` | `EXAD_GWD_WELL_TESTS[0].hydH2sCnc` | |
| H₂S (IR estimate) | readonly | `EXAD_GWD_IR_HYDROGEOLOGY[0].estH2s` | IR badge |
| Conducted By | `testerNetworkId` | `EXAD_GWD_WELL_TESTS[0].testerNetworkId` | |

Badge label: `isFlowTest() ? 'Flow Test / Natural Flow' : 'Pump Test / Natural Flow'`

---

## 6. Key Difference Between Surfaces

| Concern | Presentation / Morning Report | Edit Form |
|---|---|---|
| Decision field(s) | `hydTestTypCd` only | `flowType === 'Y'` OR `hydTestTypCd === 'flow'` |
| Normalisation | `resolveTestType()` — uppercased, default PUMP | Raw string comparison |
| Default (no data) | **PUMP** | **PUMP** (both flags falsy) |
| Edge case | No test record → always PUMP | IR `flowType='Y'` + no test record → **FLOW** UI |
| Scope | All `EXAD_GWD_WELL_TESTS[]` entries | First entry `[0]` only |
