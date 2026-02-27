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
    <aside className="flex w-80 flex-col overflow-y-auto border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">ERCOT Queue Tracker</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Is Texas building fast enough?
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 px-4 py-4">
        {/* Headline stats */}
        <HeadlineStats
          projects={allProjects}
          dataCenters={dataCenters}
          largeLoads={largeLoads}
        />

        {/* Project count */}
        <div className="text-xs text-gray-500 text-center">
          Showing <span className="font-semibold text-gray-900">{filtered.length.toLocaleString()}</span>
          {" of "}
          <span>{allProjects.length.toLocaleString()}</span>
          {" generation projects"}
        </div>

        {/* Layer toggles */}
        <div className="border-t border-gray-200 pt-3">
          <LayerToggles
            layers={filters.layers}
            showTerritory={filters.showTerritory}
            hasTerritory={territory !== null}
            setLayerVisibility={setLayerVisibility}
            setShowTerritory={setShowTerritory}
          />
        </div>

        {/* Filters - collapsed by default */}
        <div className="border-t border-gray-200 pt-3">
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
        <div className="border-t border-gray-200 pt-3">
          <Legend />
        </div>
      </div>
    </aside>
  );
}
