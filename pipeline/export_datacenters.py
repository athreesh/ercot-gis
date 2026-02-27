#!/usr/bin/env python3
"""Convert curated texas_datacenters.json to GeoJSON for the frontend."""

import json
import logging
import os

logger = logging.getLogger(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "texas_datacenters.json")


def export_datacenters(output_path: str) -> int:
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
            "operator": entry.get("operator"),
            "city": entry.get("city"),
            "county": entry.get("county"),
            "capacityMw": entry.get("capacity_mw"),
            "type": entry.get("type"),
            "status": entry.get("status"),
            "campus": entry.get("campus"),
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

    logger.info("Wrote %d data center features to %s", len(features), output_path)
    return len(features)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "datacenters.json")
    n = export_datacenters(out)
    print(f"Exported {n} data center features to {out}")
