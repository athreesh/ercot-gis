import type { FuelType, Status, FilterState, DCType, LoadType, LayerVisibility } from "./types";

export const FUEL_COLORS: Record<FuelType, [number, number, number]> = {
  Solar: [255, 183, 27],
  Wind: [72, 199, 142],
  "Battery Storage": [99, 102, 241],
  Gas: [239, 68, 68],
  Nuclear: [168, 85, 247],
  Hybrid: [20, 184, 166],
  Other: [156, 163, 175],
};

export const STATUS_COLORS: Record<Status, string> = {
  Active: "#22c55e",
  Withdrawn: "#ef4444",
  Suspended: "#f59e0b",
  Completed: "#3b82f6",
  "IA Executed": "#8b5cf6",
  Other: "#9ca3af",
};

export const ALL_FUELS: FuelType[] = [
  "Solar",
  "Wind",
  "Battery Storage",
  "Gas",
  "Nuclear",
  "Hybrid",
  "Other",
];

export const ALL_STATUSES: Status[] = [
  "Active",
  "Withdrawn",
  "Suspended",
  "Completed",
  "IA Executed",
  "Other",
];

export const DC_TYPE_COLORS: Record<DCType, [number, number, number]> = {
  hyperscaler: [59, 130, 246],
  colo: [16, 185, 129],
  enterprise: [245, 158, 11],
  ai: [236, 72, 153],
};

export const DC_TYPE_LABELS: Record<DCType, string> = {
  hyperscaler: "Hyperscaler",
  colo: "Colocation",
  enterprise: "Enterprise",
  ai: "AI / GPU Cloud",
};

export const LOAD_TYPE_COLORS: Record<LoadType, [number, number, number]> = {
  data_center: [239, 68, 68],
  crypto: [245, 158, 11],
  industrial: [107, 114, 128],
  manufacturing: [139, 92, 246],
  other: [156, 163, 175],
};

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
  data_center: "Data Center",
  crypto: "Crypto Mining",
  industrial: "Industrial",
  manufacturing: "Manufacturing",
  other: "Other",
};

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  generationQueue: true,
  dataCenters: true,
  largeLoads: true,
};

export const DEFAULT_FILTERS: FilterState = {
  fuels: Object.fromEntries(ALL_FUELS.map((f) => [f, true])) as Record<FuelType, boolean>,
  statuses: Object.fromEntries(ALL_STATUSES.map((s) => [s, true])) as Record<Status, boolean>,
  capacityRange: [0, 2000],
  codYearRange: [2020, 2035],
  viewMode: "scatter",
  showTerritory: false,
  layers: { ...DEFAULT_LAYER_VISIBILITY },
};

export const TEXAS_CENTER = { longitude: -99.5, latitude: 31.2 };

export const INITIAL_VIEW = {
  ...TEXAS_CENTER,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
};

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
