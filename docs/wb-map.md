# WWell Map Integration (ArcGIS)

Component: `src/app/features/presentation/active-wwell-map/`

## Steps

1. **Install SDK** — `@arcgis/core` (JS API 4.x), imported as ES modules (no CDN script tag).
2. **Config** — portal/app values live in `src/assets/external-config.json` (`esriUrl`, `appId`, `webMapItemId`, `mapServerUrl`). Read via `ExternalConfigService`.
3. **Auth** — `EsriMapService` (`@core/services/esri-map.service.ts`) wraps `@arcgis/core/identity/IdentityManager` for sign-in/`destroyCredentials()`. Currently a stub (no popup auth wired yet).
4. **Component setup**
   - `@ViewChild('presMapViewNode')` gives the map a host `<div>` (see `.html`).
   - `ngOnInit` (browser only, guarded by `isPlatformBrowser`) calls `initMap()`.
5. **initMap()**
   - `new WebMap({ portalItem: { id: <webMapItemId> } })`
   - `new MapView({ container, map, center, zoom })` from shared `MAP_CONFIG`
   - `await mapView.when()` then add a `GraphicsLayer` (`selected-well`) for markers.
6. **Reactive sync** — an Angular `effect()` watches a `computed()` (`selectedWellCoords`, built from `PresentationStore.wellHeaderData()` / `selectedEpANum()`) and calls `syncGlowGraphic()` whenever the selected well or its lat/lon changes.
7. **Rendering the pin** — `syncGlowGraphic()` clears the layer, builds a `Point`, and adds 3 `Graphic`s (outer glow / mid ring / core marker via `SimpleMarkerSymbol`) plus a `TextSymbol` label with the well name; core graphic carries a `popupTemplate`. Then `focusWell()` calls `mapView.goTo()` to zoom/pan to the point.
8. **Hover tooltip** — custom `<div class="wwell-map-tooltip">` positioned on `mapView.on('pointer-move')` + `hitTest()` against the graphics layer (native Esri popup not used for hover).
9. **Screenshot export** — `captureMapAsBase64()` / `saveMapImage()` use `mapView.takeScreenshot()`, downscale via `<canvas>`, and trigger a browser download (used for report attachments).
10. **Boot/loading state** — `LoaderService.registerBootTask/resolveBootTask('arcgis-map')` ties map init into the app's global loader; `mapReady` signal drives the loading spinner / error message in the template.
11. **Cleanup** — `ngOnDestroy` removes the pointer-move listener, tooltip element, and calls `mapView.destroy()`.

## Notes / gotchas
- Portal item id is currently **hardcoded** in `initMap()` rather than read from `externalConfig.webMapItemId` — align these if the map ID changes.
- SSR-guarded: ArcGIS JS API only runs in the browser (`isPlatformBrowser` check).
- Coordinates come from `wellHeaderData().lat/lon` (string or number) — parsed defensively via `parseCoord()`.
