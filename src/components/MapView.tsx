import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGLOverlay from "./DeckGLOverlay";
import Tooltip from "./Tooltip";
import { buildScatterLayer } from "../layers/buildScatterLayer";
import { buildHexLayer } from "../layers/buildHexLayer";
import { buildHeatmapLayer } from "../layers/buildHeatmapLayer";
import { buildTerritoryLayer } from "../layers/buildTerritoryLayer";
import { buildDataCenterLayer } from "../layers/buildDataCenterLayer";
import { buildLoadQueueLayer } from "../layers/buildLoadQueueLayer";
import type { Project, DataCenter, LargeLoad, FilterState } from "../lib/types";
import type { Layer } from "@deck.gl/core";
import type { PickingInfo } from "@deck.gl/core";
import { MAP_STYLE, INITIAL_VIEW } from "../lib/constants";

interface Props {
  data: Project[];
  filters: FilterState;
  territory: GeoJSON.FeatureCollection | null;
  dataCenters: DataCenter[];
  largeLoads: LargeLoad[];
}

export default function MapView({ data, filters, territory, dataCenters, largeLoads }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    object: Project | DataCenter | LargeLoad;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => setMapReady(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const onHoverProject = useCallback((info: PickingInfo) => {
    if (info.object) {
      setTooltip({ x: info.x, y: info.y, object: info.object as Project });
    } else {
      setTooltip(null);
    }
  }, []);

  const onHoverDC = useCallback((info: PickingInfo) => {
    if (info.object) {
      setTooltip({ x: info.x, y: info.y, object: info.object as DataCenter });
    } else {
      setTooltip(null);
    }
  }, []);

  const onHoverLoad = useCallback((info: PickingInfo) => {
    if (info.object) {
      setTooltip({ x: info.x, y: info.y, object: info.object as LargeLoad });
    } else {
      setTooltip(null);
    }
  }, []);

  const layers = useMemo(() => {
    const result: Layer[] = [];

    if (territory && filters.showTerritory) {
      result.push(buildTerritoryLayer(territory));
    }

    if (filters.layers.generationQueue) {
      if (filters.viewMode === "scatter") {
        result.push(buildScatterLayer(data, filters, onHoverProject));
      } else if (filters.viewMode === "hex") {
        result.push(buildHexLayer(data, onHoverProject));
      } else {
        result.push(buildHeatmapLayer(data));
      }
    }

    if (filters.layers.dataCenters && dataCenters.length > 0) {
      result.push(buildDataCenterLayer(dataCenters, onHoverDC));
    }

    if (filters.layers.largeLoads && largeLoads.length > 0) {
      result.push(buildLoadQueueLayer(largeLoads, onHoverLoad));
    }

    return result;
  }, [data, filters, territory, dataCenters, largeLoads, onHoverProject, onHoverDC, onHoverLoad]);

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="absolute inset-0" />
      {mapReady && <DeckGLOverlay layers={layers} map={mapRef.current} />}
      {tooltip && (
        <Tooltip x={tooltip.x} y={tooltip.y} object={tooltip.object} />
      )}
    </div>
  );
}
