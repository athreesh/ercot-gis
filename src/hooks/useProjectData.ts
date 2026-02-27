import { useEffect, useState, useMemo } from "react";
import type { Project, FuelType, Status, GeocodedSource } from "../lib/types";

interface UseProjectDataResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  capacityRange: [number, number];
  codYearRange: [number, number];
}

function parseFuel(raw: string): FuelType {
  const map: Record<string, FuelType> = {
    Solar: "Solar",
    Wind: "Wind",
    "Battery Storage": "Battery Storage",
    Gas: "Gas",
    Nuclear: "Nuclear",
    Hybrid: "Hybrid",
  };
  return map[raw] ?? "Other";
}

function parseStatus(raw: string): Status {
  const map: Record<string, Status> = {
    Active: "Active",
    Withdrawn: "Withdrawn",
    Suspended: "Suspended",
    Completed: "Completed",
    "IA Executed": "IA Executed",
  };
  return map[raw] ?? "Other";
}

function parseGeocodedSource(raw: string): GeocodedSource {
  if (raw === "hifld" || raw === "osm" || raw === "county") return raw;
  return "unmatched";
}

export function useProjectData(): UseProjectDataResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/data/projects.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const geojson = await res.json();

        const parsed: Project[] = (geojson.features ?? []).map(
          (f: any): Project => {
            const p = f.properties ?? {};
            const coords = f.geometry?.coordinates ?? [0, 0];
            return {
              id: String(p.id ?? p.INR ?? f.id ?? ""),
              name: String(p.name ?? p.projectName ?? "Unknown"),
              fuel: parseFuel(String(p.fuel ?? p.fuelType ?? "")),
              capacityMw: Number(p.capacityMW ?? p.capacityMw ?? p.capacity_mw ?? 0),
              status: parseStatus(String(p.status ?? "")),
              codYear: p.codYear != null && p.codYear !== "" ? Number(p.codYear) : null,
              county: String(p.county ?? ""),
              poi: String(p.poi ?? p.interconnectionLocation ?? ""),
              latitude: Number(coords[1]),
              longitude: Number(coords[0]),
              geocodeSource: parseGeocodedSource(String(p.geocodeSource ?? p.geocode_source ?? "")),
              geocodeScore: Number(p.geocodeScore ?? p.geocode_score ?? 0),
            };
          }
        );

        if (!cancelled) {
          setProjects(parsed);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load project data");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const capacityRange = useMemo<[number, number]>(() => {
    if (projects.length === 0) return [0, 2000];
    const caps = projects.map((p) => p.capacityMw);
    return [Math.floor(Math.min(...caps)), Math.ceil(Math.max(...caps))];
  }, [projects]);

  const codYearRange = useMemo<[number, number]>(() => {
    if (projects.length === 0) return [2020, 2035];
    const years = projects.filter((p) => p.codYear !== null).map((p) => p.codYear as number);
    if (years.length === 0) return [2020, 2035];
    return [Math.min(...years), Math.max(...years)];
  }, [projects]);

  return { projects, loading, error, capacityRange, codYearRange };
}
