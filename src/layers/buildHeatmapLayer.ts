import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import type { Project } from "../lib/types";

export function buildHeatmapLayer(data: Project[]) {
  return new HeatmapLayer<Project>({
    id: "heatmap",
    data,
    getPosition: (d: Project) => [d.longitude, d.latitude],
    getWeight: (d: Project) => d.capacityMw,
    radiusPixels: 60,
    intensity: 1.5,
    threshold: 0.1,
    colorRange: [
      [255, 255, 178],
      [254, 204, 92],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
      [128, 0, 38],
    ],
  });
}
