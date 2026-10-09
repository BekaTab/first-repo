"""Runtime settings, read from environment variables with sensible defaults.

Every site-specific URL and CSS selector lives here so that when IAAI or
Autohelperbot change their markup you only have to edit an env var (or this
file), not the scraping logic.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return list(default)
    return [part.strip() for part in raw.split("||") if part.strip()]


CHROME_PATHS = (
    Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    Path(os.getenv("PROGRAMFILES", r"C:\Program Files")) / "Google/Chrome/Application/chrome.exe",
    Path(os.getenv("PROGRAMFILES(X86)", r"C:\Program Files (x86)")) / "Google/Chrome/Application/chrome.exe",
    Path(os.getenv("LOCALAPPDATA", "")) / "Google/Chrome/Application/chrome.exe",
    Path("/usr/bin/google-chrome"),
    Path("/opt/google/chrome/chrome"),
)


def _default_channel() -> str | None:
    channel = os.getenv("BROWSER_CHANNEL")
    if channel:
        return None if channel.lower() == "chromium" else channel
    if os.getenv("BROWSER_EXECUTABLE"):
        return None
    return "chrome" if any(p.is_file() for p in CHROME_PATHS) else None


@dataclass
class Settings:
    # --- Browser -----------------------------------------------------------
    # Headed by default: a visible browser is far less likely to be challenged,
    # and it lets you solve a CAPTCHA by hand when one does appear.
    headless: bool = field(default_factory=lambda: _env_bool("HEADLESS", False))
    # Your installed Google Chrome is used when present: sites block it far less often than
    # Playwright's bundled "Chrome for Testing". BROWSER_CHANNEL=chromium forces the bundled one.
    browser_channel: str | None = field(default_factory=lambda: _default_channel())
    browser_executable: str | None = field(default_factory=lambda: os.getenv("BROWSER_EXECUTABLE") or None)
    # Persistent profile keeps cookies (logins, cleared challenges) between runs.
    # Chrome and the bundled Chromium get separate profiles: their profile formats can differ.
    profile_dir: Path = field(
        default_factory=lambda: Path(
            os.getenv("BROWSER_PROFILE_DIR")
            or PROJECT_ROOT / (".browser-profile-chrome" if _default_channel() == "chrome" else ".browser-profile")
        )
    )
    locale: str = field(default_factory=lambda: os.getenv("BROWSER_LOCALE", "en-US"))
    timezone: str = field(default_factory=lambda: os.getenv("BROWSER_TIMEZONE", "America/Chicago"))
    nav_timeout_ms: int = field(default_factory=lambda: int(os.getenv("NAV_TIMEOUT_MS", "45000")))

    # --- Politeness / pacing ----------------------------------------------
    min_delay: float = field(default_factory=lambda: float(os.getenv("MIN_DELAY", "2.5")))
    max_delay: float = field(default_factory=lambda: float(os.getenv("MAX_DELAY", "6.0")))
    max_retries: int = field(default_factory=lambda: int(os.getenv("MAX_RETRIES", "3")))
    # How long to wait for you to solve a CAPTCHA in the headed browser.
    challenge_timeout: float = field(default_factory=lambda: float(os.getenv("CHALLENGE_TIMEOUT", "180")))

    # --- IAAI ------------------------------------------------------------
    # Best practice: open IAAI in the browser, apply the "Timed Auctions" filter
    # yourself, and paste the resulting URL into IAAI_SEARCH_URL.
    iaai_search_url: str = field(
        default_factory=lambda: os.getenv("IAAI_SEARCH_URL", "https://www.iaai.com/Search")
    )
    iaai_login_url: str = field(default_factory=lambda: os.getenv("IAAI_LOGIN_URL", "https://www.iaai.com"))
    # Text of the filter/link clicked when IAAI_SEARCH_URL does not already apply it.
    iaai_timed_filter_text: str = field(default_factory=lambda: os.getenv("IAAI_TIMED_FILTER_TEXT", "Timed Auction"))
    iaai_card_selectors: list[str] = field(
        default_factory=lambda: _env_list(
            "IAAI_CARD_SELECTORS",
            [
                ".table-row.table-row-border",
                ".search-results .table-row",
                "[class*='vehicle-card' i]",
                "[data-testid*='vehicle' i]",
            ],
        )
    )
    iaai_next_selectors: list[str] = field(
        default_factory=lambda: _env_list(
            "IAAI_NEXT_SELECTORS",
            [
                "button[aria-label*='next' i]",
                "a[aria-label*='next' i]",
                ".pagination .next a",
                "li.next > a",
            ],
        )
    )
    max_pages: int = field(default_factory=lambda: int(os.getenv("MAX_PAGES", "5")))
    max_vehicles: int = field(default_factory=lambda: int(os.getenv("MAX_VEHICLES", "200")))

    # --- Autohelperbot --------------------------------------------------
    ahb_base_url: str = field(default_factory=lambda: os.getenv("AHB_BASE_URL", "https://autohelperbot.com"))
    # If the site exposes a direct per-VIN URL, set e.g. "https://autohelperbot.com/en/vin/{vin}"
    # to skip the search form entirely (faster and fewer interactions).
    ahb_search_url_template: str | None = field(default_factory=lambda: os.getenv("AHB_SEARCH_URL_TEMPLATE") or None)
    ahb_input_selectors: list[str] = field(
        default_factory=lambda: _env_list(
            "AHB_INPUT_SELECTORS",
            [
                "input[name*='vin' i]",
                "input[placeholder*='vin' i]",
                "input[id*='vin' i]",
                "input[type='search']",
                "form input[type='text']",
            ],
        )
    )
    ahb_result_wait_ms: int = field(default_factory=lambda: int(os.getenv("AHB_RESULT_WAIT_MS", "15000")))

    # --- Storage -----------------------------------------------------------
    data_dir: Path = field(default_factory=lambda: Path(os.getenv("DATA_DIR", PROJECT_ROOT / "data")))

    @property
    def reserve_cache_path(self) -> Path:
        return self.data_dir / "reserve_cache.json"
