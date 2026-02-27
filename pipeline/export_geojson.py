#!/usr/bin/env python3
"""Convert geocoded ERCOT DataFrame to GeoJSON FeatureCollection."""

import json
import logging
import math
import re

import pandas as pd

logger = logging.getLogger(__name__)

# ── Fuel type normalization ──────────────────────────────────────────────────
FUEL_MAP = {
    "SOLAR": "Solar",
    "WIND": "Wind",
    "GAS": "Gas",
    "FUEL OIL": "Gas",
    "HYDROGEN": "Hydrogen",
    "WATER": "Hydro",
    "OTHER": "Other",
    "NUCLEAR": "Nuclear",
}

# More specific generation-type patterns (checked first)
GENERATION_TYPE_MAP = {
    "BATTERY": "Battery Storage",
    "ENERGY STORAGE": "Battery Storage",
    "SOLAR": "Solar",
    "PHOTOVOLTAIC": "Solar",
    "WIND": "Wind",
    "COMBINED-CYCLE": "Gas",
    "COMBUSTION": "Gas",
    "GAS": "Gas",
    "STEAM TURBINE": "Gas",
    "INTERNAL COMBUSTION": "Gas",
    "RECIPROCATING": "Gas",
    "FUEL OIL": "Gas",
    "NUCLEAR": "Nuclear",
    "HYDROGEN": "Hydrogen",
    "HYDRO": "Hydro",
    "WATER": "Hydro",
}

# ── Status normalization ─────────────────────────────────────────────────────
STATUS_MAP = {
    "ACTIVE": "Active",
    "WITHDRAWN": "Withdrawn",
    "SUSPENDED": "Suspended",
    "COMPLETED": "Completed",
    "IA EXECUTED": "IA Executed",
    "IA SIGNED": "IA Executed",
    "OPERATIONAL": "Completed",
    "IN SERVICE": "Completed",
}


def _normalize_fuel(fuel_raw: str, gen_type_raw: str) -> str:
    """Normalize fuel/generation type to a clean category."""
    gen_upper = str(gen_type_raw).upper() if pd.notna(gen_type_raw) else ""
    fuel_upper = str(fuel_raw).upper() if pd.notna(fuel_raw) else ""

    # Check generation type first (more specific)
    for pattern, category in GENERATION_TYPE_MAP.items():
        if pattern in gen_upper:
            return category

    # Fall back to fuel column
    for key, category in FUEL_MAP.items():
        if key in fuel_upper:
            return category

    return "Other"


def _normalize_status(status_raw: str) -> str:
    """Normalize status to a clean category."""
    if not status_raw or not isinstance(status_raw, str):
        return "Other"

    s = status_raw.strip().upper()
    for key, category in STATUS_MAP.items():
        if key in s:
            return category

    return "Other"


def _parse_capacity(val) -> float | None:
    """Parse capacity to float, returning None on failure."""
    if pd.isna(val):
        return None
    try:
        f = float(val)
        return f if math.isfinite(f) else None
    except (ValueError, TypeError):
        return None


def _parse_cod_year(row: pd.Series) -> int | None:
    """
    Extract the Commercial Operation Date year from whichever column is available.

    Checks: Actual Completion Date, Proposed Completion Date
    """
    for col in ["Actual Completion Date", "Proposed Completion Date"]:
        val = row.get(col)
        if pd.notna(val):
            try:
                if hasattr(val, "year"):
                    return int(val.year)
                # Try parsing as string
                m = re.search(r"(\d{4})", str(val))
                if m:
                    return int(m.group(1))
            except (ValueError, TypeError):
                continue
    return None


def export_geojson(df: pd.DataFrame, output_path: str) -> int:
    """
    Convert the geocoded DataFrame to a GeoJSON FeatureCollection.

    Args:
        df: Geocoded ERCOT DataFrame with latitude/longitude columns.
        output_path: Path to write the GeoJSON file.

    Returns:
        Number of features written.
    """
    # Filter to rows with valid coordinates
    geo_df = df.dropna(subset=["latitude", "longitude"]).copy()
    geo_df = geo_df[
        geo_df["latitude"].apply(lambda x: isinstance(x, (int, float)) and math.isfinite(x))
        & geo_df["longitude"].apply(lambda x: isinstance(x, (int, float)) and math.isfinite(x))
    ]

    logger.info(
        "Exporting %d of %d rows with valid coordinates", len(geo_df), len(df)
    )

    # Detect available columns (robust to column name variations)
    def _find_col(candidates, columns):
        for c in candidates:
            if c in columns:
                return c
        return None

    col_id = _find_col(["Queue ID", "Project ID", "ID"], df.columns)
    col_name = _find_col(["Project Name", "Name", "PROJECT_NAME"], df.columns)
    col_fuel = _find_col(["Fuel", "FUEL", "Fuel Type"], df.columns)
    col_gen_type = _find_col(["Generation Type", "Technology Type", "Gen Type"], df.columns)
    col_capacity = _find_col(["Capacity (MW)", "MW", "Capacity", "Net Capacity (MW)"], df.columns)
    col_status = _find_col(["Status", "STATUS", "Queue Status"], df.columns)
    col_county = _find_col(["County", "COUNTY"], df.columns)
    col_poi = _find_col(
        ["Interconnection Location", "POI Location", "POI Name"], df.columns
    )
    col_entity = _find_col(
        ["Interconnecting Entity", "Developer", "Entity"], df.columns
    )
    col_zone = _find_col(["CDR Reporting Zone", "Zone", "Region"], df.columns)
    col_queue_date = _find_col(["Queue Date", "Queue_Date"], df.columns)

    features = []
    for _, row in geo_df.iterrows():
        lat = float(row["latitude"])
        lon = float(row["longitude"])

        fuel_raw = row.get(col_fuel) if col_fuel else None
        gen_type_raw = row.get(col_gen_type) if col_gen_type else None

        properties = {}

        # Core fields
        if col_id:
            properties["id"] = str(row[col_id]) if pd.notna(row[col_id]) else None
        if col_name:
            properties["name"] = str(row[col_name]) if pd.notna(row[col_name]) else None

        properties["fuelType"] = _normalize_fuel(fuel_raw, gen_type_raw)

        if col_capacity:
            properties["capacityMW"] = _parse_capacity(row[col_capacity])

        if col_status:
            properties["status"] = _normalize_status(
                str(row[col_status]) if pd.notna(row[col_status]) else ""
            )

        properties["codYear"] = _parse_cod_year(row)

        if col_county:
            properties["county"] = (
                str(row[col_county]).strip() if pd.notna(row[col_county]) else None
            )

        if col_poi:
            properties["interconnectionLocation"] = (
                str(row[col_poi]).strip() if pd.notna(row[col_poi]) else None
            )

        if col_entity:
            properties["developer"] = (
                str(row[col_entity]).strip() if pd.notna(row[col_entity]) else None
            )

        if col_zone:
            properties["zone"] = (
                str(row[col_zone]).strip() if pd.notna(row[col_zone]) else None
            )

        if col_queue_date:
            qd = row[col_queue_date]
            if pd.notna(qd):
                try:
                    properties["queueDate"] = (
                        qd.strftime("%Y-%m-%d") if hasattr(qd, "strftime") else str(qd)
                    )
                except Exception:
                    properties["queueDate"] = str(qd)

        # Geocoding metadata
        properties["geocodeSource"] = row.get("geocode_source", "unknown")
        properties["geocodeScore"] = (
            round(float(row["geocode_score"]), 1)
            if pd.notna(row.get("geocode_score"))
            else None
        )

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(lon, 6), round(lat, 6)],
            },
            "properties": properties,
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features,
    }

    # Write pretty-printed JSON
    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False, default=str)

    logger.info("Wrote %d features to %s", len(features), output_path)
    return len(features)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    import sys
    import os

    sys.path.insert(0, os.path.dirname(__file__))

    from fetch_ercot import fetch_ercot
    from fetch_substations import fetch_substations
    from fetch_counties import fetch_counties
    from geocode import geocode_projects

    ercot_df = fetch_ercot()
    hifld_df, osm_df = fetch_substations()
    county_df = fetch_counties()
    geocoded = geocode_projects(ercot_df, hifld_df, osm_df, county_df)

    out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "projects.json")
    n = export_geojson(geocoded, out)
    print(f"Exported {n} features to {out}")
