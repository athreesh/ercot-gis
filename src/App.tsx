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
    <div className="flex h-screen">
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
      />
      <MapView
        data={filtered}
        filters={filters}
        territory={territory}
        dataCenters={dataCenters}
        largeLoads={largeLoads}
      />
    </div>
  );
}
