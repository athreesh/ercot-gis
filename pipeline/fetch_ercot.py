#!/usr/bin/env python3
"""Fetch ERCOT GIS (Generation Interconnection Status) report via gridstatus."""

import os
import time
import logging

import pandas as pd

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
CACHE_FILE = os.path.join(CACHE_DIR, "ercot_gis_raw.csv")
CACHE_MAX_AGE_S = 24 * 60 * 60  # 24 hours


def _cache_is_fresh() -> bool:
    """Return True if the cache file exists and is less than 24 hours old."""
    if not os.path.exists(CACHE_FILE):
        return False
    age = time.time() - os.path.getmtime(CACHE_FILE)
    return age < CACHE_MAX_AGE_S


def fetch_ercot() -> pd.DataFrame:
    """
    Download the ERCOT interconnection queue via gridstatus.

    Returns a DataFrame with columns such as:
        Queue ID, Project Name, Interconnecting Entity, County, State,
        Interconnection Location, Transmission Owner, Generation Type,
        Capacity (MW), Summer Capacity (MW), Winter Capacity (MW),
        Queue Date, Status, Proposed Completion Date, Withdrawn Date,
        Withdrawal Comment, Actual Completion Date, Fuel, Technology,
        GIM Study Phase, CDR Reporting Zone, ...

    Results are cached to pipeline/cache/ercot_gis_raw.parquet for 24 hours.
    """
    if _cache_is_fresh():
        logger.info("Loading ERCOT data from cache: %s", CACHE_FILE)
        try:
            df = pd.read_csv(CACHE_FILE)
            logger.info("Loaded %d rows from cache", len(df))
            return df
        except Exception as exc:
            logger.warning("Cache read failed (%s), will re-fetch", exc)

    logger.info("Fetching ERCOT interconnection queue from gridstatus...")
    try:
        import gridstatus

        ercot = gridstatus.Ercot()
        df = ercot.get_interconnection_queue()
    except Exception as exc:
        logger.error("Failed to fetch ERCOT data: %s", exc)
        # If we have a stale cache, use it as a fallback
        if os.path.exists(CACHE_FILE):
            logger.warning("Falling back to stale cache")
            return pd.read_csv(CACHE_FILE)
        raise

    logger.info("Fetched %d projects with columns: %s", len(df), list(df.columns))

    # Persist to cache
    os.makedirs(CACHE_DIR, exist_ok=True)
    try:
        df.to_csv(CACHE_FILE, index=False)
        logger.info("Cached raw ERCOT data to %s", CACHE_FILE)
    except Exception as exc:
        logger.warning("Failed to write cache: %s", exc)

    return df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    df = fetch_ercot()
    print(f"Fetched {len(df)} projects")
    print(f"Columns: {list(df.columns)}")
    print(df.head())
