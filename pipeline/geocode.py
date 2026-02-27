#!/usr/bin/env python3
"""
Three-tier fuzzy geocoding for ERCOT interconnection queue projects.

Tier 1: Match POI name against HIFLD substations (threshold >= 85)
Tier 2: Match POI name against OSM substations (threshold >= 85)
Tier 3: Match county name against TX county centroids (threshold >= 80)
"""

import logging
import random
import re

import pandas as pd
from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)

# Fuzzy match thresholds
SUBSTATION_THRESHOLD = 85
COUNTY_THRESHOLD = 80

# Jitter range in degrees (~1.1 km) for county-level matches to avoid overlaps
JITTER_RANGE = 0.01


def _clean_poi_name(raw: str) -> str:
    """
    Extract a plausible substation name from the ERCOT Interconnection Location field.

    Examples:
        "59903 Bearkat 345kV"                         → "BEARKAT"
        "tap 345kV 23914 Tule Canyon - 23912 Ogallala C2" → "TULE CANYON"
        "5705 Fowlerton 138kV"                        → "FOWLERTON"
        "two LCRA 138kV"                              → "LCRA"
    """
    if not raw or not isinstance(raw, str):
        return ""

    s = raw.strip()

    # Remove common voltage patterns
    s = re.sub(r"\d+\s*kV\b", "", s, flags=re.IGNORECASE)

    # Remove "tap" prefix
    s = re.sub(r"^tap\s+", "", s, flags=re.IGNORECASE)

    # Split on " - " and take the first segment (for "A - B" patterns)
    if " - " in s:
        s = s.split(" - ")[0].strip()
    # Also handle en-dash
    if " \u2013 " in s:
        s = s.split(" \u2013 ")[0].strip()

    # Remove leading numeric IDs (e.g., "59903", "23914")
    s = re.sub(r"^\d+\s+", "", s)

    # Remove trailing qualifiers like "C2", "SW", etc. that are circuit identifiers
    s = re.sub(r"\s+[A-Z]\d+$", "", s)

    # Remove "two", "new" and similar leading words
    s = re.sub(r"^(two|new|old)\s+", "", s, flags=re.IGNORECASE)

    s = s.strip().upper()
    return s


def _build_choice_map(ref_df: pd.DataFrame) -> dict:
    """Build a {name: (lat, lon)} dict from a reference DataFrame."""
    result = {}
    for _, row in ref_df.iterrows():
        name = str(row["NAME"]).strip()
        if name and name != "NAN":
            result[name] = (row["LATITUDE"], row["LONGITUDE"])
    return result


def _fuzzy_match(
    query: str,
    choices: dict,
    threshold: int,
) -> tuple:
    """
    Find the best fuzzy match for query among choices.

    Returns (matched_name, lat, lon, score) or (None, None, None, 0).
    """
    if not query or not choices:
        return None, None, None, 0

    choice_list = list(choices.keys())
    result = process.extractOne(
        query,
        choice_list,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=threshold,
    )

    if result is None:
        return None, None, None, 0

    matched_name, score, _idx = result
    lat, lon = choices[matched_name]
    return matched_name, lat, lon, score


def geocode_projects(
    ercot_df: pd.DataFrame,
    hifld_df: pd.DataFrame,
    osm_df: pd.DataFrame,
    county_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Geocode ERCOT projects using three-tier fuzzy matching.

    Adds columns: latitude, longitude, geocode_source, geocode_score

    Tier 1: HIFLD substations by POI name
    Tier 2: OSM substations by POI name
    Tier 3: County centroids by county name
    """
    df = ercot_df.copy()

    # Identify the POI column
    poi_col = None
    for candidate in [
        "Interconnection Location",
        "POI Location",
        "POI Name",
        "Interconnection Point",
        "Point of Interconnection",
    ]:
        if candidate in df.columns:
            poi_col = candidate
            break

    if poi_col is None:
        logger.warning(
            "Could not find POI column. Available: %s. "
            "Geocoding will rely on county matching only.",
            list(df.columns),
        )

    # Identify county column
    county_col = None
    for candidate in ["County", "county", "COUNTY"]:
        if candidate in df.columns:
            county_col = candidate
            break

    if county_col is None:
        logger.warning("Could not find County column. Available: %s", list(df.columns))

    # Build reference lookup maps
    hifld_map = _build_choice_map(hifld_df) if len(hifld_df) > 0 else {}
    osm_map = _build_choice_map(osm_df) if len(osm_df) > 0 else {}
    county_map = _build_choice_map(county_df) if len(county_df) > 0 else {}

    logger.info(
        "Reference sizes — HIFLD: %d, OSM: %d, Counties: %d",
        len(hifld_map), len(osm_map), len(county_map),
    )

    # Initialize output columns
    latitudes = []
    longitudes = []
    sources = []
    scores = []

    total = len(df)
    tier_counts = {"hifld": 0, "osm": 0, "county": 0, "unmatched": 0}

    for idx, row in df.iterrows():
        # Extract and clean POI name
        poi_raw = str(row[poi_col]) if poi_col and pd.notna(row.get(poi_col)) else ""
        poi_clean = _clean_poi_name(poi_raw)

        # Also try matching the raw POI (sometimes the full string matches better)
        poi_upper = poi_raw.strip().upper() if poi_raw else ""

        county_name = (
            str(row[county_col]).strip().upper()
            if county_col and pd.notna(row.get(county_col))
            else ""
        )

        lat, lon, source, score = None, None, "unmatched", 0

        # --- Tier 1: HIFLD ---
        if hifld_map and poi_clean:
            _, t_lat, t_lon, t_score = _fuzzy_match(
                poi_clean, hifld_map, SUBSTATION_THRESHOLD
            )
            if t_lat is not None:
                lat, lon, source, score = t_lat, t_lon, "hifld", t_score

            # If cleaned name didn't match well, try the raw POI
            if lat is None and poi_upper and poi_upper != poi_clean:
                _, t_lat, t_lon, t_score = _fuzzy_match(
                    poi_upper, hifld_map, SUBSTATION_THRESHOLD
                )
                if t_lat is not None:
                    lat, lon, source, score = t_lat, t_lon, "hifld", t_score

        # --- Tier 2: OSM ---
        if lat is None and osm_map and poi_clean:
            _, t_lat, t_lon, t_score = _fuzzy_match(
                poi_clean, osm_map, SUBSTATION_THRESHOLD
            )
            if t_lat is not None:
                lat, lon, source, score = t_lat, t_lon, "osm", t_score

            if lat is None and poi_upper and poi_upper != poi_clean:
                _, t_lat, t_lon, t_score = _fuzzy_match(
                    poi_upper, osm_map, SUBSTATION_THRESHOLD
                )
                if t_lat is not None:
                    lat, lon, source, score = t_lat, t_lon, "osm", t_score

        # --- Tier 3: County ---
        if lat is None and county_map and county_name:
            _, t_lat, t_lon, t_score = _fuzzy_match(
                county_name, county_map, COUNTY_THRESHOLD
            )
            if t_lat is not None:
                # Add jitter to avoid exact overlaps at county centroid
                jitter_lat = random.uniform(-JITTER_RANGE, JITTER_RANGE)
                jitter_lon = random.uniform(-JITTER_RANGE, JITTER_RANGE)
                lat = t_lat + jitter_lat
                lon = t_lon + jitter_lon
                source = "county"
                score = t_score

        tier_counts[source] += 1
        latitudes.append(lat)
        longitudes.append(lon)
        sources.append(source)
        scores.append(score)

        # Progress logging every 250 rows
        if (idx + 1) % 250 == 0 or idx + 1 == total:
            logger.info("  Geocoded %d / %d projects...", idx + 1, total)

    df["latitude"] = latitudes
    df["longitude"] = longitudes
    df["geocode_source"] = sources
    df["geocode_score"] = scores

    logger.info(
        "Geocoding complete — HIFLD: %d, OSM: %d, County: %d, Unmatched: %d",
        tier_counts["hifld"],
        tier_counts["osm"],
        tier_counts["county"],
        tier_counts["unmatched"],
    )

    return df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    from fetch_ercot import fetch_ercot
    from fetch_substations import fetch_substations
    from fetch_counties import fetch_counties

    ercot_df = fetch_ercot()
    hifld_df, osm_df = fetch_substations()
    county_df = fetch_counties()

    result = geocode_projects(ercot_df, hifld_df, osm_df, county_df)

    print("\nGeocoding results:")
    print(result["geocode_source"].value_counts())
    print(f"\nTotal: {len(result)}")
    print(result[["Project Name", "Interconnection Location", "County", "geocode_source", "geocode_score"]].head(20))
