import { useState, useMemo, useCallback, useEffect } from "react";
import type { Project, FilterState, FuelType, Status, ViewMode, LayerVisibility } from "../lib/types";
import { DEFAULT_FILTERS } from "../lib/constants";
import { applyFilters } from "../lib/filterEngine";

interface UseFiltersResult {
  filters: FilterState;
  filtered: Project[];
  setFuel: (fuel: FuelType, on: boolean) => void;
  setStatus: (status: Status, on: boolean) => void;
  setCapacityRange: (range: [number, number]) => void;
  setCodYearRange: (range: [number, number]) => void;
  setViewMode: (mode: ViewMode) => void;
  setShowTerritory: (on: boolean) => void;
  setLayerVisibility: (layer: keyof LayerVisibility, on: boolean) => void;
}

export function useFilters(
  projects: Project[],
  capacityRange: [number, number],
  codYearRange: [number, number]
): UseFiltersResult {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    capacityRange,
    codYearRange,
  }));

  // Update ranges when data-derived ranges change (after initial load)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      capacityRange,
      codYearRange,
    }));
  }, [capacityRange, codYearRange]);

  const filtered = useMemo(
    () => applyFilters(projects, filters),
    [projects, filters]
  );

  const setFuel = useCallback((fuel: FuelType, on: boolean) => {
    setFilters((prev) => ({
      ...prev,
      fuels: { ...prev.fuels, [fuel]: on },
    }));
  }, []);

  const setStatus = useCallback((status: Status, on: boolean) => {
    setFilters((prev) => ({
      ...prev,
      statuses: { ...prev.statuses, [status]: on },
    }));
  }, []);

  const setCapacityRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, capacityRange: range }));
  }, []);

  const setCodYearRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, codYearRange: range }));
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setFilters((prev) => ({ ...prev, viewMode }));
  }, []);

  const setShowTerritory = useCallback((showTerritory: boolean) => {
    setFilters((prev) => ({ ...prev, showTerritory }));
  }, []);

  const setLayerVisibility = useCallback((layer: keyof LayerVisibility, on: boolean) => {
    setFilters((prev) => ({
      ...prev,
      layers: { ...prev.layers, [layer]: on },
    }));
  }, []);

  return {
    filters,
    filtered,
    setFuel,
    setStatus,
    setCapacityRange,
    setCodYearRange,
    setViewMode,
    setShowTerritory,
    setLayerVisibility,
  };
}
