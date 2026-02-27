import type { Project, DataCenter, LargeLoad, FilterState, FuelType, Status, ViewMode, LayerVisibility } from "../lib/types";
import HeadlineStats from "./HeadlineStats";
import Legend from "./Legend";
import LayerToggles from "./filters/LayerToggles";
import FilterSection from "./filters/FilterSection";
import FuelTypeFilter from "./filters/FuelTypeFilter";
import StatusFilter from "./filters/StatusFilter";
import CapacityFilter from "./filters/CapacityFilter";
import CodYearFilter from "./filters/CodYearFilter";
import ViewModeToggle from "./filters/ViewModeToggle";

interface Props {
  filters: FilterState;
  filtered: Project[];
  allProjects: Project[];
  dataCenters: DataCenter[];
  largeLoads: LargeLoad[];
  territory: GeoJSON.FeatureCollection | null;
  setFuel: (fuel: FuelType, on: boolean) => void;
  setStatus: (status: Status, on: boolean) => void;
  setCapacityRange: (range: [number, number]) => void;
  setCodYearRange: (range: [number, number]) => void;
  setViewMode: (mode: ViewMode) => void;
  setShowTerritory: (on: boolean) => void;
  setLayerVisibility: (layer: keyof LayerVisibility, on: boolean) => void;
  onClose?: () => void;
}

export default function Sidebar({
  filters,
  filtered,
  allProjects,
  dataCenters,
  largeLoads,
  territory,
  setFuel,
  setStatus,
  setCapacityRange,
  setCodYearRange,
  setViewMode,
  setShowTerritory,
  setLayerVisibility,
  onClose,
}: Props) {
  const capacityRange: [number, number] = (() => {
    if (allProjects.length === 0) return [0, 2000];
    const caps = allProjects.map((p) => p.capacityMw);
    return [Math.floor(Math.min(...caps)), Math.ceil(Math.max(...caps))];
  })();

  const codYearRange: [number, number] = (() => {
    if (allProjects.length === 0) return [2020, 2035];
    const years = allProjects
      .filter((p) => p.codYear !== null)
      .map((p) => p.codYear as number);
    if (years.length === 0) return [2020, 2035];
    return [Math.min(...years), Math.max(...years)];
  })();

  return (
    <aside className="flex w-80 flex-col overflow-y-auto border-r border-bp-border bg-white">
      {/* Header */}
      <div className="flex items-start justify-between bg-bp-green px-4 py-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">ERCOT Queue Tracker</h1>
          <p className="mt-0.5 text-xs text-white/60">
            Is Texas building fast enough?
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded p-1 text-white/60 hover:text-white hover:bg-white/10 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 px-3.5 py-3.5">
        <HeadlineStats
          projects={allProjects}
          dataCenters={dataCenters}
          largeLoads={largeLoads}
        />

        {/* Project count */}
        <div className="text-[11px] text-bp-muted text-center">
          Showing <span className="font-semibold text-bp-dark">{filtered.length.toLocaleString()}</span>
          {" of "}
          <span>{allProjects.length.toLocaleString()}</span>
          {" generation projects"}
        </div>

        {/* Layer toggles */}
        <div className="border-t border-bp-border pt-3">
          <LayerToggles
            layers={filters.layers}
            showTerritory={filters.showTerritory}
            hasTerritory={territory !== null}
            setLayerVisibility={setLayerVisibility}
            setShowTerritory={setShowTerritory}
          />
        </div>

        {/* Filters - collapsed by default */}
        <div className="border-t border-bp-border pt-3">
          <FilterSection title="Filters" defaultOpen={false}>
            <div className="space-y-3">
              <ViewModeToggle filters={filters} setViewMode={setViewMode} />

              <FilterSection title="Fuel Type" defaultOpen={true}>
                <FuelTypeFilter filters={filters} setFuel={setFuel} />
              </FilterSection>

              <FilterSection title="Status" defaultOpen={true}>
                <StatusFilter filters={filters} setStatus={setStatus} />
              </FilterSection>

              <FilterSection title="Capacity (MW)" defaultOpen={true}>
                <CapacityFilter
                  filters={filters}
                  setCapacityRange={setCapacityRange}
                  globalRange={capacityRange}
                />
              </FilterSection>

              <FilterSection title="COD Year" defaultOpen={true}>
                <CodYearFilter
                  filters={filters}
                  setCodYearRange={setCodYearRange}
                  globalRange={codYearRange}
                />
              </FilterSection>
            </div>
          </FilterSection>
        </div>

        {/* Legend */}
        <div className="border-t border-bp-border pt-3">
          <Legend />
        </div>
      </div>
    </aside>
  );
}
