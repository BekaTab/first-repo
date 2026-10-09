"""Step 1 - collect Timed Auction vehicles (VIN, year, make, model) from IAAI.

Two extraction strategies run side by side and are merged by VIN:

1. **Network capture** - IAAI's search page loads results through JSON XHR
   calls. Those payloads are cleaner than the HTML, so every JSON response is
   scanned for objects that carry a VIN.
2. **DOM fallback** - the visible text of each result card (or the whole page
   if no card selector matches) is parsed line by line.
"""

from __future__ import annotations

import logging
import re

from playwright.sync_api import Error as PlaywrightError, Page, Response

from .browser import goto, human_delay, human_scroll, settle, wait_out_block, with_retries
from .config import Settings
from .models import Vehicle
from .parsing import dedupe_vehicles, extract_vehicles_from_json, is_timed, parse_listing_text

log = logging.getLogger(__name__)


class IAAIScraper:
    def __init__(self, page: Page, settings: Settings):
        self.page = page
        self.settings = settings
        self._responses: list[Response] = []

    # ------------------------------------------------------------------ public
    def scrape(self) -> list[Vehicle]:
        self.page.on("response", self._remember_json_response)
        collected: list[Vehicle] = []
        try:
            goto(self.page, self.settings.iaai_search_url, self.settings)
            self._apply_timed_filter()
            for page_no in range(1, self.settings.max_pages + 1):
                human_scroll(self.page)
                found = self._drain_json_responses() + self._parse_dom()
                collected.extend(found)
                unique = dedupe_vehicles(collected)
                log.info("IAAI page %d: %d listings parsed, %d unique so far", page_no, len(found), len(unique))
                if len(unique) >= self.settings.max_vehicles or not self._go_to_next_page():
                    break
        finally:
            self.page.remove_listener("response", self._remember_json_response)

        vehicles = [v for v in dedupe_vehicles(collected) if is_timed(v)]
        dropped = len(dedupe_vehicles(collected)) - len(vehicles)
        if dropped:
            log.info("Dropped %d non-timed listings", dropped)
        return vehicles[: self.settings.max_vehicles]

    # ---------------------------------------------------------------- internals
    def _remember_json_response(self, response: Response) -> None:
        # Only queue here; reading bodies inside a sync-API event handler can deadlock.
        # Any JSON is fine: the parser only keeps objects that carry a VIN.
        if "json" in response.headers.get("content-type", ""):
            self._responses.append(response)

    def _drain_json_responses(self) -> list[Vehicle]:
        vehicles: list[Vehicle] = []
        pending, self._responses = self._responses, []
        for response in pending:
            try:
                payload = response.json()
            except (PlaywrightError, ValueError):
                continue  # body evicted or not actually JSON
            vehicles.extend(extract_vehicles_from_json(payload, source_url=self.page.url))
        return vehicles

    def _parse_dom(self) -> list[Vehicle]:
        for selector in self.settings.iaai_card_selectors:
            cards = self.page.locator(selector)
            try:
                count = cards.count()
            except PlaywrightError:
                continue
            if not count:
                continue
            vehicles: list[Vehicle] = []
            for i in range(count):
                try:
                    text = cards.nth(i).inner_text(timeout=5000)
                except PlaywrightError:
                    continue
                vehicles.extend(parse_listing_text(text, source_url=self.page.url))
            if vehicles:
                return vehicles
        # No known card markup: parse the whole page's text.
        try:
            body = self.page.locator("body").inner_text(timeout=10000)
        except PlaywrightError:
            return []
        return parse_listing_text(body, source_url=self.page.url)

    def _apply_timed_filter(self) -> None:
        """Click the "Timed Auction" filter unless the configured URL already applies it."""
        if "timed" in self.settings.iaai_search_url.lower():
            return
        pattern = re.compile(re.escape(self.settings.iaai_timed_filter_text), re.I)
        target = self.page.get_by_text(pattern).first
        try:
            if not target.is_visible(timeout=5000):
                raise PlaywrightError("filter not visible")
            human_delay(self.settings, 0.5)
            target.click()
            settle(self.page)
            wait_out_block(self.page, self.settings)
            log.info("Applied '%s' filter", self.settings.iaai_timed_filter_text)
        except PlaywrightError:
            log.warning(
                "Could not find a '%s' filter on %s. Listings will only be kept when marked as timed "
                "or when sale type is unknown. Set IAAI_SEARCH_URL to a pre-filtered search URL to fix.",
                self.settings.iaai_timed_filter_text, self.page.url,
            )

    def _go_to_next_page(self) -> bool:
        for selector in self.settings.iaai_next_selectors:
            button = self.page.locator(selector).first
            try:
                if not button.count() or not button.is_visible() or not button.is_enabled():
                    continue
                if (button.get_attribute("aria-disabled") or "").lower() == "true":
                    continue
            except PlaywrightError:
                continue
            human_delay(self.settings)

            def _click() -> None:
                button.click()
                settle(self.page)

            with_retries(_click, self.settings, "Next page")
            wait_out_block(self.page, self.settings)
            return True
        return False
