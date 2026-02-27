import { useEffect, useState } from "react";
import type { DataCenter, DCType, DCStatus } from "../lib/types";

function parseDCType(raw: string): DCType {
  if (raw === "hyperscaler" || raw === "colo" || raw === "enterprise" || raw === "ai") return raw;
  return "colo";
}

function parseDCStatus(raw: string): DCStatus {
  if (raw === "operational" || raw === "under-construction" || raw === "planned") return raw;
  return "operational";
}

export function useDataCenters(): DataCenter[] {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/data/datacenters.json");
        if (!res.ok) return;
        const geojson = await res.json();

        const parsed: DataCenter[] = (geojson.features ?? []).map((f: any): DataCenter => {
          const p = f.properties ?? {};
          const coords = f.geometry?.coordinates ?? [0, 0];
          return {
            name: String(p.name ?? "Unknown"),
            operator: String(p.operator ?? ""),
            city: String(p.city ?? ""),
            county: String(p.county ?? ""),
            latitude: Number(coords[1]),
            longitude: Number(coords[0]),
            capacityMw: p.capacityMw != null ? Number(p.capacityMw) : null,
            usageMw: p.usageMw != null ? Number(p.usageMw) : null,
            type: parseDCType(String(p.type ?? "")),
            status: parseDCStatus(String(p.status ?? "")),
            campus: String(p.campus ?? ""),
          };
        });

        if (!cancelled) setDataCenters(parsed);
      } catch {
        // silently fail — data centers are supplementary
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return dataCenters;
}
