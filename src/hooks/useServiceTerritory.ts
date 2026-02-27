import { useEffect, useState } from "react";

export function useServiceTerritory(): GeoJSON.FeatureCollection | null {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/data/service-territory.geojson");
        if (!res.ok) {
          // Silently return null on 404 or any error
          return;
        }
        const geojson = await res.json();
        if (!cancelled) {
          setData(geojson as GeoJSON.FeatureCollection);
        }
      } catch {
        // Silently ignore errors
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
