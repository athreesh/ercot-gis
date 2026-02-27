import { ScatterplotLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { DataCenter } from "../lib/types";
import { DC_TYPE_COLORS } from "../lib/constants";

export function buildDataCenterLayer(
  data: DataCenter[],
  onHover: (info: PickingInfo) => void
) {
  return new ScatterplotLayer<DataCenter>({
    id: "data-centers",
    data,
    pickable: true,
    opacity: 0.9,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    getPosition: (d: DataCenter) => [d.longitude, d.latitude],
    getRadius: 800,
    getFillColor: (d: DataCenter) => [...DC_TYPE_COLORS[d.type], 220] as [number, number, number, number],
    getLineColor: [255, 255, 255, 200],
    radiusMinPixels: 6,
    radiusMaxPixels: 20,
    onHover,
    updateTriggers: {
      getPosition: [data.length],
      getFillColor: [data.length],
    },
  });
}
