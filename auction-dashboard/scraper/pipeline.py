"""Orchestrates Step 1 (IAAI) + Step 2 (Autohelperbot) and writes the daily CSV."""

from __future__ import annotations

import logging
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError

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
        for i, url in enumerate((settings.iaai_login_url, settings.ahb_base_url)):
            try:
                tab = page if i == 0 else context.new_page()
                goto(tab, url, settings)
            except (BlockedError, PlaywrightError) as exc:
                # Leave the tab open anyway: the user can retry or navigate by hand.
                log.warning("Could not open %s: %s", url, str(exc).splitlines()[0])
        log.warning("Log in / solve any challenges in the browser, then CLOSE the browser window to save the session.")
        # Closing the window closes every page; cookies are already on disk in the profile.
        while context.pages:
            try:
                context.pages[0].wait_for_event("close", timeout=0)
            except PlaywrightError:
                break
        log.info("Browser closed - session saved in %s", settings.profile_dir)
