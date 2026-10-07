"""Shared Playwright plumbing: browser start-up, pacing, retries, block detection.

The approach to bot protection here is deliberately *conservative*: a real,
visible browser with a persistent profile, human-like pacing, and a human in
the loop for CAPTCHAs. It does not try to forge fingerprints or solve
challenges automatically - see README "Handling CAPTCHAs and Cloudflare".
"""

from __future__ import annotations

import logging
import random
import time
from contextlib import contextmanager
from typing import Callable, Iterator, TypeVar

from playwright.sync_api import BrowserContext, Error as PlaywrightError, Page, sync_playwright

from .config import Settings

log = logging.getLogger(__name__)
T = TypeVar("T")

# Visible-text phrases shown by Cloudflare, Imperva/Incapsula, PerimeterX, DataDome etc.
BLOCK_TEXT_MARKERS = (
    "just a moment",
    "checking your browser",
    "verify you are human",
    "verifying you are human",
    "are you a robot",
    "press & hold",
    "pardon our interruption",
    "request unsuccessful. incapsula",
    "attention required! | cloudflare",
    "access denied",
    "sorry, you have been blocked",
    "powered by imperva",
    "incapsula incident id",
)
# Challenge iframes / resources.
BLOCK_FRAME_MARKERS = (
    "challenges.cloudflare.com",
    "_incapsula_resource",
    "hcaptcha.com/captcha",
    "google.com/recaptcha/api2/bframe",
    "captcha-delivery.com",
    "px-captcha",
)


class BlockedError(RuntimeError):
    """Raised when a site keeps showing a bot challenge we cannot get past."""


def human_delay(settings: Settings, factor: float = 1.0) -> None:
    """Sleep a random, human-ish amount of time between actions."""
    time.sleep(random.uniform(settings.min_delay, settings.max_delay) * factor)


def human_scroll(page: Page, steps: int = 4) -> None:
    """Scroll down gradually - also triggers lazy-loaded result cards."""
    for _ in range(steps):
        page.mouse.wheel(0, random.randint(500, 1100))
        time.sleep(random.uniform(0.4, 1.2))


def detect_block(page: Page) -> str | None:
    """Return a short description if the page is a bot challenge, else ``None``."""
    try:
        title = (page.title() or "").lower()
        body = page.locator("body").inner_text(timeout=5000).lower()[:3000]
    except PlaywrightError:
        return None
    for marker in BLOCK_TEXT_MARKERS:
        if marker in title or marker in body:
            return f"page text: '{marker}'"
    for frame in page.frames:
        url = (frame.url or "").lower()
        for marker in BLOCK_FRAME_MARKERS:
            if marker in url:
                return f"challenge frame: {marker}"
    return None


def wait_out_block(page: Page, settings: Settings) -> None:
    """If the page is a challenge, give the human time to solve it (headed mode only)."""
    reason = detect_block(page)
    if not reason:
        return
    if settings.headless:
        raise BlockedError(
            f"Bot challenge on {page.url} ({reason}). Re-run with HEADLESS=0 and solve it in the browser window."
        )
    log.warning(
        "Bot challenge detected on %s (%s). Solve it in the browser window - waiting up to %ss...",
        page.url, reason, int(settings.challenge_timeout),
    )
    deadline = time.monotonic() + settings.challenge_timeout
    while time.monotonic() < deadline:
        time.sleep(2)
        if not detect_block(page):
            log.info("Challenge cleared, continuing.")
            human_delay(settings, 0.5)
            return
    raise BlockedError(f"Challenge on {page.url} was not solved within {settings.challenge_timeout:.0f}s")


def with_retries(action: Callable[[], T], settings: Settings, what: str) -> T:
    """Run ``action`` with exponential backoff on Playwright errors (not on blocks)."""
    for attempt in range(1, settings.max_retries + 1):
        try:
            return action()
        except BlockedError:
            raise
        except PlaywrightError as exc:
            if attempt == settings.max_retries:
                raise
            wait = (2 ** attempt) + random.uniform(0, 2)
            log.warning("%s failed (attempt %d/%d): %s - retrying in %.0fs",
                        what, attempt, settings.max_retries, str(exc).splitlines()[0], wait)
            time.sleep(wait)
    raise AssertionError("unreachable")


def goto(page: Page, url: str, settings: Settings) -> None:
    """Navigate with retries, then pause for any bot challenge."""

    def _go() -> None:
        page.goto(url, wait_until="domcontentloaded", timeout=settings.nav_timeout_ms)
        settle(page)

    with_retries(_go, settings, f"Loading {url}")
    wait_out_block(page, settings)


def settle(page: Page, timeout_ms: int = 10000) -> None:
    """Wait for XHR-driven content to finish loading, without failing if it never idles."""
    try:
        page.wait_for_load_state("networkidle", timeout=timeout_ms)
    except PlaywrightError:
        pass


@contextmanager
def browser_context(settings: Settings) -> Iterator[BrowserContext]:
    """A persistent Chromium context so cookies and cleared challenges survive runs."""
    settings.profile_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        context = pw.chromium.launch_persistent_context(
            user_data_dir=str(settings.profile_dir),
            headless=settings.headless,
            channel=settings.browser_channel,
            executable_path=settings.browser_executable,
            locale=settings.locale,
            timezone_id=settings.timezone,
            viewport={"width": 1440, "height": 900},
        )
        context.set_default_timeout(settings.nav_timeout_ms)
        try:
            yield context
        finally:
            try:
                context.close()
            except PlaywrightError:
                pass  # the user already closed the browser window
