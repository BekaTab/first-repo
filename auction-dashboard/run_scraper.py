"""Command-line entry point for the scraping pipeline.

    python run_scraper.py                 # full run: IAAI -> Autohelperbot -> data/vehicles_<date>.csv
    python run_scraper.py --login         # one-time: log in / clear challenges in the persistent profile
    python run_scraper.py --demo          # write synthetic data to try the dashboard
"""

from __future__ import annotations

import argparse
import logging
import sys

from scraper.browser import BlockedError
from scraper.config import Settings
from scraper.pipeline import interactive_login, run, run_demo


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape IAAI Timed Auctions and Autohelperbot reserve prices.")
    parser.add_argument("--login", action="store_true", help="open both sites to log in / solve challenges, then exit")
    parser.add_argument("--demo", action="store_true", help="write synthetic sample data instead of scraping")
    parser.add_argument("--search-url", help="IAAI search URL with the Timed Auctions filter applied")
    parser.add_argument("--max-pages", type=int, help="max IAAI result pages to walk")
    parser.add_argument("--max-vehicles", type=int, help="stop after this many vehicles")
    parser.add_argument("--headless", action="store_true", help="run without a visible browser (more likely to be blocked)")
    parser.add_argument("--skip-reserve", action="store_true", help="only run Step 1 (IAAI)")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    settings = Settings()
    if args.search_url:
        settings.iaai_search_url = args.search_url
    if args.max_pages:
        settings.max_pages = args.max_pages
    if args.max_vehicles:
        settings.max_vehicles = args.max_vehicles
    if args.headless:
        settings.headless = True

    try:
        if args.demo:
            path = run_demo(settings)
        elif args.login:
            interactive_login(settings)
            return 0
        else:
            path = run(settings, skip_reserve=args.skip_reserve)
    except BlockedError as exc:
        logging.error("%s", exc)
        return 2
    print(f"Dataset written to {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
