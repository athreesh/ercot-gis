import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import type maplibregl from "maplibre-gl";

interface Props {
  layers: Layer[];
  map: maplibregl.Map | null;
}

export default function DeckGLOverlay({ layers, map }: Props) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!overlayRef.current) {
      overlayRef.current = new MapboxOverlay({ layers, interleaved: false });
      map.addControl(overlayRef.current as unknown as maplibregl.IControl);
    } else {
      overlayRef.current.setProps({ layers });
    }
  }, [map, layers]);

  // Clean up overlay when component unmounts
  useEffect(() => {
    return () => {
      if (overlayRef.current && map) {
        try {
          map.removeControl(overlayRef.current as unknown as maplibregl.IControl);
        } catch {
          // Map may already be removed
        }
        overlayRef.current = null;
      }
    };
  }, [map]);

  return null;
}
