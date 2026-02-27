export type FuelType = "Solar" | "Wind" | "Battery Storage" | "Gas" | "Nuclear" | "Hybrid" | "Other";
export type Status = "Active" | "Withdrawn" | "Suspended" | "Completed" | "IA Executed" | "Other";
export type ViewMode = "scatter" | "hex" | "heatmap";
export type GeocodedSource = "hifld" | "osm" | "county" | "unmatched";

export type DCType = "hyperscaler" | "colo" | "enterprise" | "ai";
export type DCStatus = "operational" | "under-construction" | "planned";
export type LoadType = "data_center" | "crypto" | "industrial" | "manufacturing" | "other";

export interface Project {
  id: string;
  name: string;
  fuel: FuelType;
  capacityMw: number;
  status: Status;
  codYear: number | null;
  county: string;
  poi: string;
  latitude: number;
  longitude: number;
  geocodeSource: GeocodedSource;
  geocodeScore: number;
}

export interface DataCenter {
  name: string;
  operator: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  capacityMw: number | null;
  usageMw: number | null;
  type: DCType;
  status: DCStatus;
  campus: string;
}

export interface LargeLoad {
  name: string;
  entity: string;
  county: string;
  latitude: number;
  longitude: number;
  requestedMw: number;
  status: string;
  type: LoadType;
  yearFiled: number;
}

export interface LayerVisibility {
  generationQueue: boolean;
  dataCenters: boolean;
  largeLoads: boolean;
}

export interface FilterState {
  fuels: Record<FuelType, boolean>;
  statuses: Record<Status, boolean>;
  capacityRange: [number, number];
  codYearRange: [number, number];
  viewMode: ViewMode;
  showTerritory: boolean;
  layers: LayerVisibility;
}
