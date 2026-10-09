"""Step 2 - look up the reserve price for each VIN on autohelperbot.com."""

from __future__ import annotations

import logging

from playwright.sync_api import Error as PlaywrightError, Locator, Page

from .browser import BlockedError, goto, human_delay, settle, wait_out_block, with_retries
from .config import Settings
from .models import ReserveResult
from .parsing import is_masked_vin, looks_like_not_found, parse_reserve_price
from .storage import ReserveCache

log = logging.getLogger(__name__)


class AutoHelperBotClient:
    def __init__(self, page: Page, settings: Settings, cache: ReserveCache | None = None):
        self.page = page
        self.settings = settings
        self.cache = cache

    def lookup(self, vin: str) -> ReserveResult:
        """Never raises (except :class:`BlockedError`): failures become "Not Available"."""
        if is_masked_vin(vin):
            return ReserveResult(None, "masked_vin", "IAAI showed a partial VIN; log in to IAAI to see full VINs")
        if self.cache and (cached := self.cache.get(vin)):
            return cached
        try:
            result = self._lookup_uncached(vin)
        except BlockedError:
            raise
        except PlaywrightError as exc:
            log.warning("Lookup for %s failed: %s", vin, str(exc).splitlines()[0])
            result = ReserveResult(None, "error", str(exc).splitlines()[0])
        if self.cache and result.cacheable:
            self.cache.put(vin, result)
        return result

    # ---------------------------------------------------------------- internals
    def _lookup_uncached(self, vin: str) -> ReserveResult:
        if self.settings.ahb_search_url_template:
            goto(self.page, self.settings.ahb_search_url_template.format(vin=vin), self.settings)
        else:
            self._search_via_form(vin)
        self._wait_for_result(vin)

        text = self.page.locator("body").inner_text(timeout=10000)
        price = parse_reserve_price(text)
        if price is not None:
            return ReserveResult(price, "found")
        if looks_like_not_found(text):
            return ReserveResult(None, "not_found", "VIN not found on Autohelperbot")
        return ReserveResult(None, "not_found", "No reserve price shown for this VIN")

    def _search_via_form(self, vin: str) -> None:
        # Always start from a fresh page so the previous VIN's result can't be read again.
        goto(self.page, self.settings.ahb_base_url, self.settings)
        search_box = self._find_search_box()
        if search_box is None:
            raise PlaywrightError(
                "VIN search box not found on Autohelperbot - set AHB_INPUT_SELECTORS or AHB_SEARCH_URL_TEMPLATE"
            )

        def _submit() -> None:
            search_box.click()
            search_box.fill("")
            search_box.press_sequentially(vin, delay=60)  # typed like a person, not pasted
            human_delay(self.settings, 0.2)
            search_box.press("Enter")
            settle(self.page)

        with_retries(_submit, self.settings, f"Searching {vin}")
        wait_out_block(self.page, self.settings)

    def _find_search_box(self) -> Locator | None:
        for selector in self.settings.ahb_input_selectors:
            box = self.page.locator(selector).first
            try:
                if box.count() and box.is_visible() and box.is_editable():
                    return box
            except PlaywrightError:
                continue
        return None

    def _wait_for_result(self, vin: str) -> None:
        """Results render client-side; wait until the VIN or a "not found" message is on the page."""
        try:
            self.page.wait_for_function(
                """(vin) => {
                    const t = (document.body && document.body.innerText || '').toUpperCase();
                    return t.includes(vin) || /NOT FOUND|NO RESULTS|НЕ НАЙДЕНО/.test(t);
                }""",
                arg=vin,
                timeout=self.settings.ahb_result_wait_ms,
            )
        except PlaywrightError:
            log.debug("Timed out waiting for result markers for %s; parsing what is there", vin)
