#!/usr/bin/env python3
"""ERCOT GIS pipeline: fetch -> geocode -> export"""

import logging
import os
import sys

# Ensure pipeline/ is on path
sys.path.insert(0, os.path.dirname(__file__))

from fetch_ercot import fetch_ercot
from fetch_substations import fetch_substations
from fetch_counties import fetch_counties
from geocode import geocode_projects
from export_geojson import export_geojson
from export_datacenters import export_datacenters
from export_large_loads import export_large_loads

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "projects.json")
DC_OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "datacenters.json")
LOAD_OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "load_queue.json")


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    print("=== ERCOT GIS Pipeline ===")

    print("\n[1/7] Fetching ERCOT interconnection queue...")
    try:
        ercot_df = fetch_ercot()
        print(f"  -> {len(ercot_df)} projects")
    except Exception as exc:
        print(f"  !! FATAL: Could not fetch ERCOT data: {exc}")
        sys.exit(1)

    print("\n[2/7] Fetching HIFLD + OSM substations...")
    try:
        hifld_df, osm_df = fetch_substations()
        print(f"  -> HIFLD: {len(hifld_df)}, OSM: {len(osm_df)}")
    except Exception as exc:
        print(f"  !! WARNING: Substation fetch failed: {exc}")
        import pandas as pd
        hifld_df = pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])
        osm_df = pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    print("\n[3/7] Fetching TX county centroids...")
    try:
        county_df = fetch_counties()
        print(f"  -> {len(county_df)} counties")
    except Exception as exc:
        print(f"  !! WARNING: County fetch failed: {exc}")
        import pandas as pd
        county_df = pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    print("\n[4/7] Geocoding projects...")
    geocoded = geocode_projects(ercot_df, hifld_df, osm_df, county_df)
    matched = geocoded[geocoded["geocode_source"] != "unmatched"]
    total = len(geocoded)
    n_matched = len(matched)
    pct = (n_matched / total * 100) if total > 0 else 0
    print(f"  -> {n_matched}/{total} geocoded ({pct:.0f}%)")

    # Print breakdown by source
    source_counts = geocoded["geocode_source"].value_counts()
    for source, count in source_counts.items():
        print(f"     {source}: {count}")

    print(f"\n[5/7] Exporting GeoJSON -> {OUTPUT}")
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    n = export_geojson(geocoded, OUTPUT)
    print(f"  -> {n} features written")

    print(f"\n[6/7] Exporting data centers -> {DC_OUTPUT}")
    n_dc = export_datacenters(DC_OUTPUT)
    print(f"  -> {n_dc} data center features written")

    print(f"\n[7/7] Exporting large loads -> {LOAD_OUTPUT}")
    n_load = export_large_loads(LOAD_OUTPUT)
    print(f"  -> {n_load} large load features written")

    print("\nDone!")


if __name__ == "__main__":
    main()
