import { GeoJsonLayer } from "@deck.gl/layers";

export function buildTerritoryLayer(geojson: GeoJSON.FeatureCollection) {
  return new GeoJsonLayer({
    id: "territory",
    data: geojson,
    pickable: false,
    stroked: true,
    filled: true,
    getFillColor: [59, 130, 246, 30],
    getLineColor: [59, 130, 246, 180],
    getLineWidth: 2,
    lineWidthMinPixels: 2,
  });
}
