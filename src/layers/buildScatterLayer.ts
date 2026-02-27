import { ScatterplotLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { Project, FilterState } from "../lib/types";
import { FUEL_COLORS } from "../lib/constants";

export function buildScatterLayer(
  data: Project[],
  _filters: FilterState,
  onHover: (info: PickingInfo) => void
) {
  return new ScatterplotLayer<Project>({
    id: "scatter",
    data,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    lineWidthMinPixels: 1,
    getPosition: (d: Project) => [d.longitude, d.latitude],
    getRadius: (d: Project) => Math.max(Math.sqrt(d.capacityMw) * 150, 500),
    getFillColor: (d: Project) => [...FUEL_COLORS[d.fuel], 200] as [number, number, number, number],
    getLineColor: [255, 255, 255, 80],
    radiusMinPixels: 3,
    radiusMaxPixels: 50,
    onHover,
    updateTriggers: {
      getPosition: [data.length],
      getFillColor: [data.length],
      getRadius: [data.length],
    },
  });
}
