# ERCOT GIS Queue Tracker

Interactive map visualizing the collision between energy supply and demand in Texas (ERCOT grid). Shows generation interconnection queue, data center locations, and large load requests.

## Quick Start

```bash
npm install          # install frontend deps
npm run dev          # start Vite dev server at localhost:5173
npx tsc --noEmit     # type-check without emitting
```

### Pipeline (Python)
```bash
source pipeline/.venv/bin/activate
python pipeline/run.py   # runs all 7 steps, outputs to public/data/
```

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18, TypeScript, Tailwind CSS
- **Mapping**: MapLibre GL + deck.gl (via `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/mapbox`)
- **State**: React hooks (`useFilters`, `useProjectData`, `useDataCenters`, `useLargeLoads`)
- **No router** — single-page map application

### Key Directories
```
src/
  App.tsx                  # Root — wires hooks to Sidebar + MapView
  components/
    MapView.tsx            # MapLibre map + deck.gl overlay
    Sidebar.tsx            # Narrative sidebar: headline stats → layers → filters → legend
    Tooltip.tsx            # Duck-typed tooltip for 3 data types (Project, DataCenter, LargeLoad)
    HeadlineStats.tsx      # Supply/demand/DC count cards
    Legend.tsx              # Unified legend for all 3 layer types
    DeckGLOverlay.tsx      # deck.gl ↔ MapLibre bridge
    filters/               # FilterSection, FuelType, Status, Capacity, CodYear, ViewMode, LayerToggles
  hooks/
    useProjectData.ts      # Fetches /data/projects.json → Project[]
    useDataCenters.ts      # Fetches /data/datacenters.json → DataCenter[]
    useLargeLoads.ts       # Fetches /data/load_queue.json → LargeLoad[]
    useFilters.ts          # All filter state + layer visibility
    useServiceTerritory.ts # ERCOT boundary GeoJSON
  layers/
    buildScatterLayer.ts   # Generation queue dots (colored by fuel)
    buildHexLayer.ts       # Hex aggregation view
    buildHeatmapLayer.ts   # Heatmap view
    buildDataCenterLayer.ts# Filled circles (colored by DC type)
    buildLoadQueueLayer.ts # Ring outlines (sized by MW, colored by load type)
    buildTerritoryLayer.ts # ERCOT service boundary polygon
  lib/
    types.ts               # All TypeScript interfaces (Project, DataCenter, LargeLoad, FilterState, etc.)
    constants.ts           # Colors, labels, defaults, map config
    filterEngine.ts        # applyFilters() for generation queue

pipeline/
  run.py                   # Orchestrator: fetch → geocode → export (7 steps)
  fetch_ercot.py           # Scrapes ERCOT interconnection queue
  fetch_substations.py     # HIFLD + OSM substation data
  fetch_counties.py        # TX county centroids
  geocode.py               # Match projects to coordinates
  export_geojson.py        # DataFrame → GeoJSON for projects
  export_datacenters.py    # Curated JSON → GeoJSON for data centers
  export_large_loads.py    # Curated JSON → GeoJSON for large loads
  data/
    texas_datacenters.json # Hand-curated ~54 TX data center locations
    large_loads.json       # Hand-curated ~33 large load queue entries

public/data/               # Generated GeoJSON consumed by frontend
  projects.json            # Generation interconnection queue
  datacenters.json         # Data centers
  load_queue.json          # Large load requests
```

### Data Flow
1. Pipeline fetches ERCOT queue data, geocodes it, exports to `public/data/projects.json`
2. Pipeline reads curated JSON from `pipeline/data/` and exports GeoJSON to `public/data/`
3. Frontend fetches all 3 JSON files on mount, renders on deck.gl layers

### Three Data Layers
| Layer | Source | Visual | Toggle |
|-------|--------|--------|--------|
| Generation Queue | `projects.json` (1800+ projects) | Filled circles by fuel color | `layers.generationQueue` |
| Data Centers | `datacenters.json` (~54 facilities) | Filled circles by DC type | `layers.dataCenters` |
| Large Load Queue | `load_queue.json` (~33 requests) | Ring outlines sized by MW | `layers.largeLoads` |

### Types (src/lib/types.ts)
- `Project` — generation interconnection queue entry
- `DataCenter` — physical data center facility
- `LargeLoad` — large load interconnection request
- `FilterState` — all UI state including `layers: LayerVisibility`
- `LayerVisibility` — `{ generationQueue, dataCenters, largeLoads }`

## Conventions
- **camelCase** for GeoJSON properties exported by pipeline
- Layer builders in `src/layers/build*.ts` return deck.gl Layer instances
- Hooks in `src/hooks/use*.ts` follow React conventions
- Tooltip uses duck-typing (`fuel` → Project, `operator` → DataCenter, `requestedMw` → LargeLoad)
- Pipeline curated data lives in `pipeline/data/*.json`, exported GeoJSON in `public/data/`
- Territory toggle is off by default; all data layers are on by default
