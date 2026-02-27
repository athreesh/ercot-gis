#!/usr/bin/env python3
"""Convert curated large_loads.json to GeoJSON for the frontend."""

import json
import logging
import os

logger = logging.getLogger(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "large_loads.json")


def export_large_loads(output_path: str) -> int:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    features = []
    for entry in raw:
        lat = entry.get("latitude")
        lon = entry.get("longitude")
        if lat is None or lon is None:
            continue

        properties = {
            "name": entry.get("name"),
            "entity": entry.get("entity"),
            "county": entry.get("county"),
            "requestedMw": entry.get("requested_mw"),
            "status": entry.get("status"),
            "type": entry.get("type"),
            "yearFiled": entry.get("year_filed"),
        }

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(lon, 6), round(lat, 6)],
            },
            "properties": properties,
        })

    geojson = {"type": "FeatureCollection", "features": features}

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)

    logger.info("Wrote %d large load features to %s", len(features), output_path)
    return len(features)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "load_queue.json")
    n = export_large_loads(out)
    print(f"Exported {n} large load features to {out}")
