import { HexagonLayer } from "@deck.gl/aggregation-layers";
import type { PickingInfo } from "@deck.gl/core";
import type { Project } from "../lib/types";

export function buildHexLayer(data: Project[], onHover: (info: PickingInfo) => void) {
  return new HexagonLayer<Project>({
    id: "hex",
    data,
    pickable: true,
    extruded: true,
    radius: 15000,
    elevationScale: 100,
    getPosition: (d: Project) => [d.longitude, d.latitude],
    getElevationWeight: (d: Project) => d.capacityMw,
    getColorWeight: (d: Project) => d.capacityMw,
    colorRange: [
      [255, 255, 178],
      [254, 204, 92],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
      [128, 0, 38],
    ],
    onHover: (info: PickingInfo) => {
      onHover(info);
      return true;
    },
  });
}
