import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import { useProjectData } from "./hooks/useProjectData";
import { useFilters } from "./hooks/useFilters";
import { useServiceTerritory } from "./hooks/useServiceTerritory";
import { useDataCenters } from "./hooks/useDataCenters";
import { useLargeLoads } from "./hooks/useLargeLoads";

export default function App() {
  const { projects, loading, error, capacityRange, codYearRange } =
    useProjectData();
  const {
    filters,
    filtered,
    setFuel,
    setStatus,
    setCapacityRange,
    setCodYearRange,
    setViewMode,
    setShowTerritory,
    setLayerVisibility,
  } = useFilters(projects, capacityRange, codYearRange);
  const territory = useServiceTerritory();
  const dataCenters = useDataCenters();
  const largeLoads = useLargeLoads();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading ERCOT data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Backdrop — mobile only, when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-200 ease-out
          md:relative md:translate-x-0 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          filters={filters}
          filtered={filtered}
          allProjects={projects}
          dataCenters={dataCenters}
          largeLoads={largeLoads}
          territory={territory}
          setFuel={setFuel}
          setStatus={setStatus}
          setCapacityRange={setCapacityRange}
          setCodYearRange={setCodYearRange}
          setViewMode={setViewMode}
          setShowTerritory={setShowTerritory}
          setLayerVisibility={setLayerVisibility}
          onClose={closeSidebar}
        />
      </div>

      {/* Map */}
      <div className="relative flex-1 flex flex-col">
        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-md bg-bp-green px-3 py-2 text-xs font-medium text-white shadow-lg md:hidden"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Filters
        </button>

        <MapView
          data={filtered}
          filters={filters}
          territory={territory}
          dataCenters={dataCenters}
          largeLoads={largeLoads}
        />
      </div>
    </div>
  );
}
