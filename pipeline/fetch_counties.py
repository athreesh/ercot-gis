#!/usr/bin/env python3
"""Fetch Texas county centroids as a fallback geocoding source."""

import os
import time
import logging

import pandas as pd

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
CACHE_FILE = os.path.join(CACHE_DIR, "tx_county_centroids.csv")
CACHE_MAX_AGE_S = 24 * 60 * 60  # 24 hours

# Census Bureau county FIPS with names — more reliable than the spatial CSV
CENSUS_COUNTY_URL = (
    "https://www2.census.gov/geo/docs/reference/codes2020/cou/st48_tx_cou2020.txt"
)

# Fallback: btskinner centroids (has coords but no names)
CENTROIDS_URL = (
    "https://raw.githubusercontent.com/btskinner/spatial/master/data/county_centers.csv"
)


def _cache_is_fresh() -> bool:
    if not os.path.exists(CACHE_FILE):
        return False
    age = time.time() - os.path.getmtime(CACHE_FILE)
    return age < CACHE_MAX_AGE_S


def fetch_counties() -> pd.DataFrame:
    """
    Fetch Texas county centroids.

    Returns a DataFrame with columns [NAME, LATITUDE, LONGITUDE] where NAME
    is the county name in uppercase (e.g., "TRAVIS", "HARRIS").
    """
    if _cache_is_fresh():
        logger.info("Loading county centroids from cache")
        try:
            return pd.read_csv(CACHE_FILE)
        except Exception as exc:
            logger.warning("County cache read failed (%s), re-fetching", exc)

    try:
        result = _build_county_data()
    except Exception as exc:
        logger.error("Failed to build county data: %s", exc)
        if os.path.exists(CACHE_FILE):
            logger.warning("Falling back to stale county cache")
            return pd.read_csv(CACHE_FILE)
        return pd.DataFrame(columns=["NAME", "LATITUDE", "LONGITUDE"])

    # Cache as CSV (avoid pyarrow dependency)
    os.makedirs(CACHE_DIR, exist_ok=True)
    try:
        result.to_csv(CACHE_FILE, index=False)
        logger.info("Cached county data (%d rows)", len(result))
    except Exception as exc:
        logger.warning("Failed to cache county data: %s", exc)

    return result


def _build_county_data() -> pd.DataFrame:
    """Download centroids and county names, merge them."""
    # Step 1: Get centroids from btskinner
    logger.info("Downloading county centroid data...")
    centroids = pd.read_csv(CENTROIDS_URL)

    # Zero-pad FIPS
    centroids["_fips"] = centroids["fips"].astype(str).str.zfill(5)
    tx_centroids = centroids[centroids["_fips"].str.startswith("48")].copy()

    # Use 2010 census centroids (clat10, clon10)
    lat_col = lon_col = None
    for c in ["clat10", "clat00", "pclat10"]:
        if c in tx_centroids.columns:
            lat_col = c
            break
    for c in ["clon10", "clon00", "pclon10"]:
        if c in tx_centroids.columns:
            lon_col = c
            break

    if not lat_col or not lon_col:
        raise ValueError(f"No lat/lon columns found. Available: {list(tx_centroids.columns)}")

    logger.info("Using centroid columns: lat=%s, lon=%s", lat_col, lon_col)

    # Step 2: Get county names from Census Bureau
    logger.info("Downloading Texas county names from Census Bureau...")
    try:
        names_df = pd.read_csv(
            CENSUS_COUNTY_URL,
            sep="|",
            dtype=str,
            header=0,
        )
        # Columns: STATE|STATEFP|COUNTYFP|COUNTYNS|COUNTYNAME
        names_df["_fips"] = names_df["STATEFP"] + names_df["COUNTYFP"]
        fips_to_name = dict(
            zip(names_df["_fips"], names_df["COUNTYNAME"].str.upper().str.replace(r"\s+COUNTY$", "", regex=True))
        )
        logger.info("Got %d county names from Census Bureau", len(fips_to_name))
    except Exception as exc:
        logger.warning("Census county names failed (%s), using FIPS-based fallback", exc)
        fips_to_name = _texas_county_names_fallback()

    # Step 3: Merge
    records = []
    for _, row in tx_centroids.iterrows():
        fips = row["_fips"]
        name = fips_to_name.get(fips)
        if not name:
            continue
        lat = float(row[lat_col])
        lon = float(row[lon_col])
        records.append({"NAME": name, "LATITUDE": lat, "LONGITUDE": lon})

    result = pd.DataFrame(records)
    logger.info("Built %d Texas county centroids", len(result))
    return result


def _texas_county_names_fallback() -> dict:
    """Hardcoded FIPS → name for the most common Texas counties."""
    # If Census Bureau is down, at least cover the major ones
    return {
        "48201": "HARRIS", "48113": "DALLAS", "48439": "TARRANT",
        "48029": "BEXAR", "48453": "TRAVIS", "48141": "EL PASO",
        "48085": "COLLIN", "48121": "DENTON", "48215": "HIDALGO",
        "48339": "MONTGOMERY", "48157": "FORT BEND", "48491": "WILLIAMSON",
        "48303": "LUBBOCK", "48061": "CAMERON", "48355": "NUECES",
        "48367": "PARKER", "48251": "JOHNSON", "48027": "BELL",
        "48039": "BRAZORIA", "48167": "GALVESTON", "48257": "KAUFMAN",
        "48397": "ROCKWALL", "48245": "JEFFERSON", "48381": "RANDALL",
        "48375": "POTTER", "48479": "WEBB", "48041": "BRAZOS",
        "48309": "MCLENNAN", "48423": "SMITH", "48469": "VICTORIA",
        "48321": "MATAGORDA", "48209": "HAYS", "48187": "GUADALUPE",
        "48221": "HOOD", "48139": "ELLIS", "48497": "WISE",
        "48231": "HUNT", "48099": "CORYELL", "48471": "WALKER",
        "48351": "NEWTON", "48013": "ATASCOSA", "48021": "BASTROP",
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    df = fetch_counties()
    print(f"Fetched {len(df)} Texas counties")
    print(df.head(10))
