"""Orchestrates Step 1 (IAAI) + Step 2 (Autohelperbot) and writes the daily CSV."""

from __future__ import annotations

import logging
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from .autohelperbot import AutoHelperBotClient
from .browser import BlockedError, browser_context, goto, human_delay
from .config import Settings
from .demo import demo_rows
from .iaai import IAAIScraper
from .models import ReserveResult, Vehicle
from .storage import ReserveCache, dataset_path, save_dataset

log = logging.getLogger(__name__)


def combine(vehicle: Vehicle, reserve: ReserveResult, scraped_at: str) -> dict:
    return {
        **asdict(vehicle),
        "reserve_price": reserve.price,
        "reserve_status": reserve.status,
        "scraped_at": scraped_at,
    }


def run(settings: Settings, skip_reserve: bool = False) -> Path:
    scraped_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with browser_context(settings) as context:
        iaai_page = context.pages[0] if context.pages else context.new_page()
        vehicles = IAAIScraper(iaai_page, settings).scrape()
        log.info("Step 1 done: %d Timed Auction vehicles from IAAI", len(vehicles))
        if not vehicles:
            log.warning("No vehicles found - check IAAI_SEARCH_URL / IAAI_CARD_SELECTORS (see README).")

        rows: list[dict] = []
        if skip_reserve:
            rows = [combine(v, ReserveResult(None, "skipped"), scraped_at) for v in vehicles]
        else:
            client = AutoHelperBotClient(context.new_page(), settings, ReserveCache(settings.reserve_cache_path))
            blocked = False
            for i, vehicle in enumerate(vehicles, 1):
                if blocked:
                    result = ReserveResult(None, "blocked", "Autohelperbot challenge not solved")
                else:
                    try:
                        result = client.lookup(vehicle.vin)
                    except BlockedError as exc:
                        # Keep the IAAI data; the remaining VINs are simply "Not Available".
                        log.error("%s - stopping reserve lookups for this run", exc)
                        blocked = True
                        result = ReserveResult(None, "blocked", str(exc))
                    else:
                        log.info("[%d/%d] %s -> %s", i, len(vehicles), vehicle.vin, result.display)
                        if not result.from_cache and result.status != "masked_vin":
                            human_delay(settings)  # only pause after a real request
                rows.append(combine(vehicle, result, scraped_at))
            found = sum(r["reserve_price"] is not None for r in rows)
            log.info("Step 2 done: reserve price found for %d/%d vehicles", found, len(rows))

    return save_dataset(rows, dataset_path(settings.data_dir))


def run_demo(settings: Settings, count: int = 120) -> Path:
    return save_dataset(demo_rows(count), dataset_path(settings.data_dir, demo=True))


def interactive_login(settings: Settings) -> None:
    """Open both sites in the persistent profile so you can log in / clear challenges once."""
    if settings.headless:
        raise SystemExit("--login needs a visible browser; unset HEADLESS.")
    with browser_context(settings) as context:
        page = context.pages[0] if context.pages else context.new_page()
        for url in ("https://www.iaai.com", settings.ahb_base_url):
            tab = page if url.startswith("https://www.iaai") else context.new_page()
            try:
                goto(tab, url, settings)
            except BlockedError as exc:
                log.warning("%s", exc)
        input("Log in / solve any challenges in the browser tabs, then press Enter here to save the session... ")
