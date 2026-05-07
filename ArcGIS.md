# ESRI ArcGIS — Quick Reference

## What is ArcGIS?

ArcGIS is Esri's platform for working with geographic data. It has two main parts:

- **ArcGIS Online** (`arcgis.com`) — Esri's cloud platform. Anyone can sign up, create maps, share data.
- **ArcGIS Enterprise** — same platform but hosted privately (like Aramco's `eccenterprisegis.enp.aramco.com.sa`).

---

## Core Concepts

| Concept | What it is |
|---|---|
| **Portal** | The server that stores maps, layers, and data (Aramco's or arcgis.com) |
| **WebMap** | A saved map configuration — which layers to show, what style, what zoom level |
| **Layer** | A single dataset on the map (oil wells, pipelines, boundaries) |
| **MapView** | The visual container that renders the map in the browser |
| **FeatureLayer** | A live queryable dataset (points, lines, polygons) |
| **MapImageLayer** | A pre-rendered image of multiple layers from a Map Server |
| **GraphicsLayer** | An in-memory layer for custom graphics drawn by the app |

---

## What is `webMapItemId`?

Every item saved in an ArcGIS portal gets a **unique 32-character ID**:

e691172598f04ea8881cd2a4adaa45ba   ← Public test WebMap on arcgis.com


When you create a `WebMap` with this ID, the SDK fetches that saved configuration from the portal —
all layers, styles, zoom extents, basemap — in one shot:

```ts
const webMap = new WebMap({
  portalItem: { id: 'e691172598f04ea8881cd2a4adaa45ba' }
});
```

You can find this ID in the portal URL:

```
https://eccenterprisegis.../arcgis/home/item.html?id=c177620bd7744a22b6e7e0d98c33d18a
                                                        ↑ this is the webMapItemId
```

---

## How it fits in this app

```
external-config.json
  └── webMapItemId     ──→  WebMap({ portalItem: { id } })  ──→  loads map from portal
  └── esriUrl          ──→  esriConfig.portalUrl             ──→  tells SDK WHERE the portal is
  └── mockWebMapItemId ──→  public test map on arcgis.com
  └── useMockMap       ──→  switches between Aramco portal / public arcgis.com
```

| `useMockMap` | Portal | WebMap ID | Works from |
|---|---|---|---|
| `true` | `arcgis.com` (default) | `mockWebMapItemId` | anywhere |
| `false` | Aramco enterprise portal | `webMapItemId` | Aramco network only |

---

## SDK Setup in Angular

### 1. Install the package

```bash
npm install @arcgis/core
```

### 2. Register assets in `angular.json`

```json
{
  "glob": "**/*",
  "input": "node_modules/@arcgis/core/assets",
  "output": "assets"
}
```

### 3. Add the CSS globally in `angular.json`

```json
"styles": [
  "node_modules/@arcgis/core/assets/esri/themes/light/main.css"
]
```

### 4. Set the assets path at runtime

```ts
import esriConfig from '@arcgis/core/config';
esriConfig.assetsPath = './assets';
```

---

## Loading a WebMap in Angular

```ts
import WebMap  from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

const webMap = new WebMap({
  portalItem: { id: 'YOUR_WEBMAP_ITEM_ID' }
});

const view = new MapView({
  container: this.mapViewEl.nativeElement,
  map: webMap,
  center: [45.0, 24.5], // [longitude, latitude]
  zoom: 6,
});

await view.when(); // resolves when the map is fully rendered
```

---

## Layer Types Cheat Sheet

```ts
// Pre-built map from portal (loads all its own layers)
new WebMap({ portalItem: { id: '...' } })

// Live vector data — query, filter, style
new FeatureLayer({ url: 'https://.../FeatureServer/0', definitionExpression: "..." })

// Rendered map image from a Map Server (fast, read-only)
new MapImageLayer({ url: 'https://.../MapServer', sublayers: [{ id: 6 }] })

// Custom in-memory graphics (drawn by your code)
new GraphicsLayer({ id: 'my-layer' })
```

---

## Coordinates in ArcGIS

ArcGIS uses **[longitude, latitude]** order for `center` (opposite of Google Maps):

```ts
center: [46.6, 24.7]   // ✓ ArcGIS: [lng, lat]
center: [24.7, 46.6]   // ✗ wrong — that's [lat, lng]
```

`Point` geometry uses named properties (safe, order-independent):

```ts
new Point({ latitude: 24.7, longitude: 46.6 })
```

---

## Authentication

| Method | When to use |
|---|---|
| **No auth** | Public items on arcgis.com |
| **OAuth2 (OAuthInfo)** | Private portal items — redirects user to login |
| **Token** | Server-to-server or pre-authenticated sessions |

To bypass auth during development, comment out the auth call and point `useMockMap: true`
to a public WebMap on arcgis.com.
