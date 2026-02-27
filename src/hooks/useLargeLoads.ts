import { useEffect, useState } from "react";
import type { LargeLoad, LoadType } from "../lib/types";

function parseLoadType(raw: string): LoadType {
  if (raw === "data_center" || raw === "crypto" || raw === "industrial" || raw === "manufacturing" || raw === "other") return raw;
  return "other";
}

export function useLargeLoads(): LargeLoad[] {
  const [loads, setLoads] = useState<LargeLoad[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/data/load_queue.json");
        if (!res.ok) return;
        const geojson = await res.json();

        const parsed: LargeLoad[] = (geojson.features ?? []).map((f: any): LargeLoad => {
          const p = f.properties ?? {};
          const coords = f.geometry?.coordinates ?? [0, 0];
          return {
            name: String(p.name ?? "Unknown"),
            entity: String(p.entity ?? ""),
            county: String(p.county ?? ""),
            latitude: Number(coords[1]),
            longitude: Number(coords[0]),
            requestedMw: Number(p.requestedMw ?? 0),
            status: String(p.status ?? ""),
            type: parseLoadType(String(p.type ?? "")),
            yearFiled: Number(p.yearFiled ?? 0),
          };
        });

        if (!cancelled) setLoads(parsed);
      } catch {
        // silently fail — large loads are supplementary
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return loads;
}
