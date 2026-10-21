"""Drive the real scraper classes in Chromium against local fixture pages."""

import functools
import http.server
import threading
from pathlib import Path

import pytest

pytest.importorskip("playwright")
from scraper.autohelperbot import AutoHelperBotClient  # noqa: E402
from scraper.browser import BlockedError, browser_context, goto  # noqa: E402
from scraper.config import Settings  # noqa: E402
from scraper.iaai import IAAIScraper  # noqa: E402
from scraper.storage import ReserveCache  # noqa: E402

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def server():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(FIXTURES))
    handler.log_message = lambda *a, **k: None
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{httpd.server_address[1]}"
    httpd.shutdown()


@pytest.fixture
def settings(tmp_path, server):
    s = Settings()
    s.headless = True
    s.min_delay = s.max_delay = 0.01
    s.profile_dir = tmp_path / "profile"
    s.data_dir = tmp_path / "data"
    s.iaai_search_url = f"{server}/iaai_page1.html"
    s.ahb_base_url = f"{server}/ahb.html"
    s.ahb_result_wait_ms = 3000
    return s


@pytest.fixture
def context(settings):
    try:
        with browser_context(settings) as ctx:
            yield ctx
    except Exception as exc:  # pragma: no cover - no browser installed
        pytest.skip(f"Chromium not available: {exc}")


def test_iaai_scraper_merges_json_and_dom_and_keeps_only_timed(context, settings):
    vehicles = {v.vin: v for v in IAAIScraper(context.new_page(), settings).scrape()}
    # Range Rover is a Live Auction -> dropped; F-150 only exists in the JSON; C 300 is on page 2.
    assert set(vehicles) == {"4T1B11HK5JU123456", "1FTEW1EP7JFA00003", "55SWF4JB1FU000002"}
    camry = vehicles["4T1B11HK5JU123456"]
    assert (camry.year, camry.make, camry.lot_number, camry.auction_date) == (2018, "TOYOTA", "34567890", "2026-10-08")
    assert vehicles["1FTEW1EP7JFA00003"].model == "F-150"
    assert vehicles["55SWF4JB1FU000002"].make == "MERCEDES-BENZ"


def test_autohelperbot_lookup_results(context, settings):
    client = AutoHelperBotClient(context.new_page(), settings, ReserveCache(settings.reserve_cache_path))
    found = client.lookup("4T1B11HK5JU123456")
    assert (found.price, found.status) == (7250.0, "found")
    no_reserve = client.lookup("1FTEW1EP7JFA00003")
    assert no_reserve.price is None and no_reserve.display == "Not Available"
    missing = client.lookup("55SWF4JB1FU000002")
    assert missing.status == "not_found"
    assert client.lookup("1HGCM82633A******").status == "masked_vin"
    assert client.lookup("4T1B11HK5JU123456").from_cache


def test_challenge_page_raises_in_headless_mode(context, settings, server):
    with pytest.raises(BlockedError):
        goto(context.new_page(), f"{server}/challenge.html", settings)
