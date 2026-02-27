#!/usr/bin/env python3
"""Fetch substation reference data from HIFLD and OpenStreetMap for Texas."""

import os
import time
import logging
from typing import Tuple

import pandas as pd
import requests

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
HIFLD_CACHE = os.path.join(CACHE_DIR, "hifld_substations.csv")
OSM_CACHE = os.path.join(CACHE_DIR, "osm_substations.csv")
CACHE_MAX_AGE_S = 24 * 60 * 60  # 24 hours

HIFLD_URL = (
    "https://opendata.arcgis.com/api/v3/datasets/"
    "4a3f79694e4b4be8a81375f5e4335b74_0/downloads/data"
    "?format=csv&spatialRefId=4326"
)

# Overpass API for OSM substations in Texas bounding box
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OVERPASS_QUERY = (
    '[out:json][timeout:120];'
    '(node["power"="substation"](25.8,-106.7,36.5,-93.5);'
    'way["power"="substation"](25.8,-106.7,36.5,-93.5););'
    'out center;'
)


def _cache_is_fresh(path: str) -> bool:
    if not os.path.exists(path):
        return False
    age = time.time() - os.path.getmtime(path)
    return age < CACHE_MAX_AGE_S


def _fetch_hifld() -> pd.DataFrame:
    """Download HIFLD substation data, filtered to Texas."""
    if _cache_is_fresh(HIFLD_CACHE):
        logger.info("Loading HIFLD substations from cache")
        try:
            return pd.read_csv(HIFLD_CACHE)
        except Exception as exc:
            logger.warning("HIFLD cache read failed (%s), re-fetching", exc)

    logger.info("Downloading HIFLD substation data...")
    try:
        # Download as CSV — this is a large file, give it time
        df = pd.read_csv(HIFLD_URL, low_memory=False)
    except Exception as exc:
        logger.error("Failed to download HIFLD data: %s", exc)
        if os.path.exists(HIFLD_CACHE):
            logger.warning("Falling back to stale HIFLD cache")
            return pd.read_csv(HIFLD_CACHE)
        raise

    logger.info("HIFLD raw: %d rows, columns: %s", len(df), list(df.columns))

    # Filter to Texas
    # Column name may vary; check common possibilities
    state_col = None
    for candidate in ["STATE", "State", "state", "ST"]:
        if candidate in df.columns:
            state_col = candidate
            break

    if state_col is None:
        logger.warning(
            "Could not find STATE column in HIFLD data. "
            "Available columns: %s. Using all rows.",
            list(df.columns),
        )
        tx_df = df.copy()
    else:
        tx_df = df[df[state_col].astype(str).str.strip().str.upper() == "TX"].copy()

    logger.info("HIFLD Texas substations: %d", len(tx_df))

    # Find coordinate columns
    lat_col = None
    lon_col = None
    for c in tx_df.columns:
        cl = c.upper()
        if cl in ("LATITUDE", "LAT", "Y"):
            lat_col = c
        elif cl in ("LONGITUDE", "LON", "LONG", "X"):
            lon_col = c

    # Find name column
    name_col = None
    for candidate in ["NAME", "Name", "name", "SUBSTATION", "SUB_NAME"]:
        if candidate in tx_df.columns:
            name_col = candidate
            break

    if not all([lat_col, lon_col, name_col]):
        logger.error(
            "Missing required columns. lat=%s, lon=%s, name=%s. Available: %s",
            lat_col, lon_col, name_col, list(tx_df.columns),
        )
        return pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    result = pd.DataFrame(
        {
            "NAME": tx_df[name_col].astype(str).str.strip().str.upper(),
            "LATITUDE": pd.to_numeric(tx_df[lat_col], errors="coerce"),
            "LONGITUDE": pd.to_numeric(tx_df[lon_col], errors="coerce"),
        }
    )

    # Drop rows with missing data
    result = result.dropna(subset=["NAME", "LATITUDE", "LONGITUDE"]).reset_index(drop=True)
    # Remove empty names
    result = result[result["NAME"] != ""].reset_index(drop=True)

    # Cache
    os.makedirs(CACHE_DIR, exist_ok=True)
    try:
        result.to_csv(HIFLD_CACHE, index=False)
        logger.info("Cached HIFLD data (%d rows)", len(result))
    except Exception as exc:
        logger.warning("Failed to cache HIFLD data: %s", exc)

    return result


def _fetch_osm() -> pd.DataFrame:
    """Download OSM substation data for the Texas bounding box."""
    if _cache_is_fresh(OSM_CACHE):
        logger.info("Loading OSM substations from cache")
        try:
            return pd.read_csv(OSM_CACHE)
        except Exception as exc:
            logger.warning("OSM cache read failed (%s), re-fetching", exc)

    logger.info("Querying Overpass API for Texas substations...")
    try:
        resp = requests.post(
            OVERPASS_URL,
            data={"data": OVERPASS_QUERY},
            timeout=180,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.error("Overpass API request failed: %s", exc)
        if os.path.exists(OSM_CACHE):
            logger.warning("Falling back to stale OSM cache")
            return pd.read_csv(OSM_CACHE)
        # Return empty DataFrame — OSM is optional
        logger.warning("Continuing without OSM substation data")
        return pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    elements = data.get("elements", [])
    logger.info("Overpass returned %d elements", len(elements))

    records = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "")
        if not name:
            continue

        # For ways, coordinates are in the "center" field
        if el.get("type") == "way":
            center = el.get("center", {})
            lat = center.get("lat")
            lon = center.get("lon")
        else:
            lat = el.get("lat")
            lon = el.get("lon")

        if lat is not None and lon is not None:
            records.append(
                {
                    "NAME": name.strip().upper(),
                    "LATITUDE": float(lat),
                    "LONGITUDE": float(lon),
                }
            )

    result = pd.DataFrame(records, columns=["NAME", "LATITUDE", "LONGITUDE"])
    result = result.dropna().drop_duplicates(subset=["NAME"]).reset_index(drop=True)

    # Cache
    os.makedirs(CACHE_DIR, exist_ok=True)
    try:
        result.to_csv(OSM_CACHE, index=False)
        logger.info("Cached OSM data (%d rows)", len(result))
    except Exception as exc:
        logger.warning("Failed to cache OSM data: %s", exc)

    return result


def fetch_substations() -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fetch substation reference data from HIFLD and OSM.

    Returns:
        (hifld_df, osm_df): Each with columns [NAME, LATITUDE, LONGITUDE].
        If OSM fetch fails, osm_df will be empty but HIFLD will still be returned.
    """
    try:
        hifld_df = _fetch_hifld()
    except Exception as exc:
        logger.error("HIFLD fetch failed entirely: %s", exc)
        hifld_df = pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    try:
        osm_df = _fetch_osm()
    except Exception as exc:
        logger.error("OSM fetch failed entirely: %s", exc)
        osm_df = pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    return hifld_df, osm_df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    hifld, osm = fetch_substations()
    print(f"HIFLD: {len(hifld)} substations")
    if len(hifld) > 0:
        print(hifld.head())
    print(f"\nOSM: {len(osm)} substations")
    if len(osm) > 0:
        print(osm.head())
