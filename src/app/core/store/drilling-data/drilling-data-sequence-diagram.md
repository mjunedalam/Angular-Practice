# Drilling Data Sequence Diagram

This diagram shows the current `presentation` screen flow from UI interactions into `DrillingDataStore`, state updates, selectors, actions/events naming, and `DrillingDataService`.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Presentation as "Presentation UI"
    participant Chips as "WellNameChipsComponent"
    participant Actions as "drilling-data.actions.ts"
    participant Store as "DrillingDataStore"
    participant State as "drilling-data.state.ts"
    participant Selectors as "drilling-data.selectors.ts"
    participant Service as "DrillingDataService"
    participant API as "Remote API / localFallback"
    participant Widgets as "Presentation child widgets"
    participant Router as "Angular Router"

    Note over Actions: Action/event constants document commands and outcomes<br/>such as loadDrillingData, selectWell,<br/>drillingDataLoaded, drillingDataLoadFailed.

    User->>Presentation: Open `/main/presentations?date=&epANum=`
    Presentation->>Presentation: `ngOnInit()`
    Presentation->>Presentation: `applyQueryParams(...)`
    Presentation->>Actions: `setDate` / `loadDrillingData`
    Presentation->>Store: `setDate(requestedDate, { autoSelectFirst: true })`
    Store->>Store: `loadMorningReportRequest(...)`
    Store->>State: `patchState({ loading, error, selectedDate })`
    Store->>Service: `getDrillingData(date)`

    alt API URL configured
        Service->>API: `GET /drilling-eye?date=...`
        API-->>Service: `ApiResponse<IWellData>`
    else API unavailable / timeout / config missing
        Service->>API: `GET /assets/data/data.json`
        API-->>Service: fallback `ApiResponse<IWellData>`
    end

    Service-->>Store: `IWellData[]`
    Store->>State: `resolveSelectionAfterDataLoad(...)`
    State-->>Store: `{ selectedEpANum, wellNamesPage }`
    Store->>State: `patchState({ allWellsData, hasLoadedOnce, rigStatusOverrides, selectedEpANum, wellNamesPage })`
    Store->>Actions: `drillingDataLoaded`

    par Derived well list and paging
        Store->>Selectors: `selectWellNamesFromData(allWellsData)`
        Selectors-->>Store: `wellNames`
        Store->>Selectors: `uniqueByEpANum(wellNames)`
        Selectors-->>Store: `uniqueWellNames`
        Store->>Selectors: `selectPagedWellNames(uniqueWellNames, wellNamesPage)`
        Selectors-->>Store: `pagedWellNames`
    and Derived selected well details
        Store->>Selectors: `selectSelectedWell(allWellsData, selectedEpANum)`
        Selectors-->>Store: `selectedWell`
    and Derived presentation view models
        Store->>Selectors: `selectDiagramData(selectedWell)`
        Store->>Selectors: `selectMiscWellData(selectedWell)`
        Store->>Selectors: `selectPickedFormations(selectedWell)`
        Store->>Selectors: `selectOffsetWells(selectedWell)`
        Store->>Selectors: `selectWellLogsIndicators(selectedWell)`
        Store->>Selectors: `selectWellTestResults(selectedWell)`
        Store->>Selectors: `selectWellHeaderViewModel(selectedWell, selectedEpANum)`
        Store->>Selectors: `selectDatabaseInfoViewModel(selectedWell, selectedDate)`
        Store->>Selectors: `selectOperationSummaryViewModel(selectedWell)`
        Store->>Selectors: `selectFormationInfoViewModel(selectedWell)`
        Store->>Selectors: `selectCasingInfoViewModel(selectedWell)`
        Store->>Selectors: `selectWwellTestViewModel(selectedWell)`
        Store->>Selectors: `selectMorningReports(allWellsData, rigStatusOverrides)`
        Store->>Selectors: `selectWaterWellTestResultsFromData(allWellsData)`
    end

    Store-->>Widgets: expose computed signals
    Widgets-->>User: render map, chips, diagram, misc data, formations, offsets, logs, tests

    opt Query param contains `epANum`
        Presentation->>Actions: `selectWell`
        Presentation->>Store: `selectWell({ epANum, date })`
        Store->>State: `normalizeEpANum(...)`
        Store->>State: `resolvePageForSelection(allWellsData, epANum, wellNamesPage)`
        State-->>Store: `nextPage`
        Store->>State: `patchState({ selectedEpANum, wellNamesPage, animationTrigger })`
        Store->>Selectors: `selectSelectedWell(...)`
        Store-->>Widgets: recompute selected-well view models
    end

    User->>Chips: Change date
    Chips->>Actions: `setDate`
    Chips->>Store: `setDate(date)`
    Store->>Store: repeat load flow above
    Store-->>Widgets: refresh all derived signals

    User->>Chips: Click well chip
    Chips->>Actions: `selectWell`
    Chips->>Store: `selectWell({ epANum, date })`
    Store->>State: `patchState({ selectedEpANum, wellNamesPage, animationTrigger })`
    Store->>Selectors: `selectSelectedWell(...)`
    Store-->>Widgets: refresh detail widgets for selected well

    User->>Chips: Click next / previous page
    Chips->>Actions: `nextPage` / `prevPage`
    Chips->>Store: `nextPage()` / `prevPage()`
    Store->>Store: `selectPage(pageIndex)`
    Store->>Selectors: `selectPagedWellNames(uniqueWellNames, nextPage)`
    Selectors-->>Store: first well on target page
    Store->>State: `patchState({ wellNamesPage, selectedEpANum, animationTrigger })`
    Store-->>Widgets: chips and detail panels update

    User->>Widgets: Edit rig status
    Widgets->>Actions: `updateRigStatus`
    Widgets->>Store: `updateRigStatus(epANum, rigStatus)`
    Store->>State: `updateRigStatusOverrides(rigStatusOverrides, epANum, rigStatus)`
    State-->>Store: updated `rigStatusOverrides`
    Store->>State: `patchState({ rigStatusOverrides })`
    Store->>Selectors: `selectMorningReports(allWellsData, rigStatusOverrides)`
    Selectors-->>Store: updated report list
    Store-->>Widgets: morning report cards rerender with override

    Store->>Router: sync `epANum` + `date` back into query params
    Router-->>Presentation: stable deep-link state

    opt Future CRUD flow
        User->>Widgets: Insert / update / delete well
        Widgets->>Actions: `upsertWell` / `removeWell`
        Widgets->>Store: `upsertWell(wellData)` / `removeWell(epANum)`
        Store->>State: `upsertWellData(...)` / `removeWellData(...)`
        Store->>State: `resolveSelectionAfterDataLoad(...)`
        Store->>Actions: `wellUpserted` / `wellRemoved`
        Store-->>Widgets: all selectors recompute from new source data
    end
```
