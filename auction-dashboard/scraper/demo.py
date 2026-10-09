"""Synthetic sample data so the dashboard can be tried without scraping."""

from __future__ import annotations

import random
from datetime import date, datetime, timedelta, timezone

from .parsing import _VIN_TRANSLIT, _VIN_WEIGHTS

CATALOG = {
    "TOYOTA": ["CAMRY", "COROLLA", "RAV4", "TACOMA", "HIGHLANDER"],
    "HONDA": ["ACCORD", "CIVIC", "CR-V", "PILOT"],
    "FORD": ["F-150", "ESCAPE", "EXPLORER", "MUSTANG", "FUSION"],
    "CHEVROLET": ["SILVERADO 1500", "MALIBU", "EQUINOX", "TAHOE"],
    "NISSAN": ["ALTIMA", "ROGUE", "SENTRA"],
    "BMW": ["3 SERIES", "X5", "5 SERIES"],
    "MERCEDES-BENZ": ["C-CLASS", "GLE", "E-CLASS"],
    "TESLA": ["MODEL 3", "MODEL Y"],
    "JEEP": ["WRANGLER", "GRAND CHEROKEE", "CHEROKEE"],
    "HYUNDAI": ["ELANTRA", "SONATA", "TUCSON"],
}
_VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"


def random_vin(rng: random.Random) -> str:
    chars = [rng.choice(_VIN_CHARS) for _ in range(17)]
    chars[8] = "0"
    check = sum(_VIN_TRANSLIT[c] * w for c, w in zip(chars, _VIN_WEIGHTS)) % 11
    chars[8] = "X" if check == 10 else str(check)
    return "".join(chars)


def demo_rows(count: int = 120, seed: int | None = None) -> list[dict]:
    rng = random.Random(seed)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    rows = []
    for _ in range(count):
        make = rng.choice(list(CATALOG))
        year = rng.randint(2008, 2025)
        has_price = rng.random() > 0.2
        base = 3000 + (year - 2008) * 1400 + (9000 if make in {"BMW", "MERCEDES-BENZ", "TESLA"} else 0)
        price = round(base * rng.uniform(0.6, 1.5), -2) if has_price else None
        rows.append(
            {
                "vin": random_vin(rng),
                "year": year,
                "make": make,
                "model": rng.choice(CATALOG[make]),
                "reserve_price": price,
                "reserve_status": "found" if has_price else "not_found",
                "lot_number": str(rng.randint(30_000_000, 39_999_999)),
                "auction_type": "Timed Auction",
                "auction_date": (date.today() + timedelta(days=rng.randint(0, 6))).isoformat(),
                "source_url": "demo",
                "scraped_at": now,
            }
        )
    return rows
