# Well Test Field Mapping

---

## Full Data Flow

### READ — API → Store → Form → Template

```
DailyOperationService.getWellDetail(date, epANum)
  GET /daily-operations/api/v1/wwells?date=&epANum=
  → ApiResponse<IWellData>
  → map(res => res.data[0])
  → IWellData
        │
        ▼
ActiveWwellStore  (signalStore)
  patchState({ wellData: IWellData })
        │
        ├─ withComputed: wwellTest = selectWwellTestViewModel(wellData())
        │       ├── testOutcome  ← EXAD_GWD_WELL_TESTS[0]       (actual values)
        │       ├── hydro        ← EXAD_GWD_IR_HYDROGEOLOGY[0]  (IR estimates)
        │       ├── wellDesign   ← EXAD_GWD_WELL_DESIGN[0]      (pumpDepthEstimate)
        │       └── prewap       ← EXAD_RCD_PREWAP[0]           (depth)
        │       → WwellTestViewModel
        │
        ▼
ActiveWwellViewComponent  (parent, effect on store.wellData())
  wellTestForm.patchValue({
    epANum         ← store.selectedEpANum()
    rsvrCd         ← wellTestData.aquiferActual   (testOutcome.rsvrCd)
    hydH2sCnc      ← wellTestData.h2sActual       (testOutcome.hydH2sCnc)
    temp           ← wellTestData.temp             (testOutcome.temp)
    hydTestTypCd   ← wellTestData.flowType         ('Y'|'N')
    wtrSaTdsCnc    ← wellTestData.tds              (testOutcome.wtrSaTdsCnc)
    rpm            ← wellTestData.rpm              (testOutcome.rpm)
    duration       ← wellTestData.duration         (testOutcome.duration)
    testerNetworkId← wellTestData.conductedBy      (testOutcome.testerNetworkId)
    testStaDt      ← selectedDateString
    hydProdRt      ← wellTestData.rate             (testOutcome.hydProdRt)
    siwhp          ← wellTestData.siwhp            (testOutcome.siwhp)
    hydProduct     ← wellTestData.productivityActual (testOutcome.hydProduct)
    hydPmpDpth     ← wellTestData.hydPmpDpth       (testOutcome.hydPmpDpth)
    statWlvl       ← wellTestData.swl              (testOutcome.statWlvl)
    dyncWlvl       ← wellTestData.dwl              (testOutcome.dyncWlvl)
  }, { emitEvent: false })
        │
        ▼
WwellTestComponent  (child)
  form = inject(ActiveWwellFormService).wellTestForm  ← same FormGroup reference
  data = store.wwellTest                              ← WwellTestViewModel signal
        │
        ▼
  Template
    [formControlName]  → renders actual values from form
    [value]="data()?.*Estimate"  → renders IR values from WwellTestViewModel
```

---

### WRITE — Template → Component → API → Store refresh

```
User edits form fields
  │
  ▼
WwellTestComponent.createOrUpdateActiveWwell()
  validates form + drillingRemarksForm
  forkJoin in parallel:
    ├─ createOrUpdateWellTest()  (if well test changed)
    │     form.getRawValue() + egwtId from wellData.EXAD_GWD_WELL_TESTS[0].egwt_id
    │     ActiveWellViewService.createOrUpdateGwdWellTest(body)
    │       POST /daily-operations/api/v1/water-well-tests
    │
    └─ createOrUpdateDrillingRemarks()  (if remarks dirty)
          drillingRemarksForm.value + egdrId from wellData.EXAD_GWD_DAILY_REMARKS[0].egdr_id
          ActiveWellViewService.createOrUpdateGwdDailyRemark(body)
            POST /daily-operations/api/v1/gwd-daily-remarks
        │
        ▼
  On success → store.refreshWellDetail()
    loadDetail({ date, epANum })  → full READ cycle above repeats
```

---

## Data Sources

| Symbol | Source |
|--------|--------|
| `testOutcome` | `EXAD_GWD_WELL_TESTS[0]` (via `selectPrimaryTestOutcome`) |
| `hydro` | `EXAD_GWD_IR_HYDROGEOLOGY[0]` |
| `wellDesign` | `EXAD_GWD_WELL_DESIGN[0]` |

---

## Common Fields (Both Test Types)

| UI Label | Form Control | Submitted API Field | IR Estimate (`data().*`) | IR Source |
|---|---|---|---|---|
| Aquifer | `rsvrCd` (dropdown: `Aquifer[]` from `store.aquifers`, value=`code`, label=`description`) | `testOutcome.rsvrCd` | `aquiferEstimate` | `hydro.estTargetAquifier` |
| Test Duration (h) | `duration` | `testOutcome.duration` | — | — |
| Temperature (°C) | `temp` | `testOutcome.temp` | — | — |
| TDS (PPM) | `wtrSaTdsCnc` | `testOutcome.wtrSaTdsCnc` | `tdsEstimate` | `hydro.estWaterQuality` |
| H2S (PPM) | `hydH2sCnc` | `testOutcome.hydH2sCnc` | `h2sEstimate` | `hydro.estH2s` |
| Conducted By | `testerNetworkId` | `testOutcome.testerNetworkId` | — | — |

---

## Pump Test Only Fields

> Active when `isFlowTest() === false` (`hydTestTypCd = 'N'`)

| UI Label | Form Control | Submitted API Field | IR Estimate (`data().*`) | IR Source |
|---|---|---|---|---|
| RPM | `rpm` | `testOutcome.rpm` | — | — |
| Test Rate (GPM) | `hydProdRt` | `testOutcome.hydProdRt` | — | — |
| Pump Depth (ft) | `hydPmpDpth` | `testOutcome.hydPmpDpth` | `pumpDepthEstimate` | `wellDesign.pumpLvl` |
| SWL (ft) | `statWlvl` | `testOutcome.statWlvl` | `swlEstimate` | `hydro.estStaticWaterLevel` |
| DWL (ft) | `dyncWlvl` | `testOutcome.dyncWlvl` | — | — |
| Well Productivity (GPM/FT) | `hydProduct` | `testOutcome.hydProduct` | `productivityEstimate` | `hydro.estProductivity` |

**Pump productivity formula:** `WP = Test Rate ÷ (DWL − SWL)`

---

## Flow Test Only Fields

> Active when `isFlowTest() === true` (`hydTestTypCd = 'Y'`)

| UI Label | Form Control | Submitted API Field | IR Estimate (`data().*`) | IR Source |
|---|---|---|---|---|
| Test Rate (GPM) | `hydProdRt` | `testOutcome.hydProdRt` | — | — |
| SIWHP (psi) | `siwhp` | `testOutcome.siwhp` | `siwhpEstimate` | `hydro.estStaticWaterLevel` |
| FWHP (psi) | `fwhp` | `testOutcome.fwhp` | — | — |
| Well Productivity (GPM/ft) | `hydProduct` | `testOutcome.hydProduct` | `productivityEstimate` | `hydro.estProductivity` |

**Flow productivity formula:** `WP = Test Rate ÷ (2.3072 × (SIWHP − FWHP))`

---

## Hidden / Metadata Fields (submitted but not shown in UI)

| Form Control | Value |
|---|---|
| `epANum` | from `store.selectedEpANum()` |
| `testStaDt` | `formatDateForInput(store.selectedDate())` |
| `hydTestTypCd` | `'Y'` (Flow) \| `'N'` (Pump) |
| `egwtId` | `wellData.EXAD_GWD_WELL_TESTS[0].egwt_id` (undefined = create, set = update) |
