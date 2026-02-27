import { ScatterplotLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { LargeLoad } from "../lib/types";
import { LOAD_TYPE_COLORS } from "../lib/constants";

export function buildLoadQueueLayer(
  data: LargeLoad[],
  onHover: (info: PickingInfo) => void
) {
  return new ScatterplotLayer<LargeLoad>({
    id: "large-loads",
    data,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: false,
    lineWidthMinPixels: 2,
    getPosition: (d: LargeLoad) => [d.longitude, d.latitude],
    getRadius: (d: LargeLoad) => Math.max(Math.sqrt(d.requestedMw) * 200, 800),
    getLineColor: (d: LargeLoad) => [...LOAD_TYPE_COLORS[d.type], 220] as [number, number, number, number],
    radiusMinPixels: 6,
    radiusMaxPixels: 60,
    onHover,
    updateTriggers: {
      getPosition: [data.length],
      getLineColor: [data.length],
      getRadius: [data.length],
    },
  });
}
