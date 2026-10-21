"""Pure text/JSON parsing helpers (no browser required, fully unit-tested).

Keeping parsing separate from navigation means a markup change on either site
usually only requires adjusting a selector, while these functions keep working
on whatever text the browser hands them.
"""

from __future__ import annotations

import re
from typing import Any, Iterable, Iterator

from .models import Vehicle

# VINs never contain I, O or Q. IAAI sometimes masks the tail with '*' for
# anonymous visitors, so masked VINs are matched too (and flagged later).
VIN_RE = re.compile(r"(?<![A-Z0-9*])([A-HJ-NPR-Z0-9]{11}[A-HJ-NPR-Z0-9*]{6})(?![A-Z0-9*])")
_VIN_TRANSLIT = {
    **{str(d): d for d in range(10)},
    **dict(zip("ABCDEFGH", range(1, 9))),
    **dict(zip("JKLMN", range(1, 6))),
    "P": 7, "R": 9,
    **dict(zip("STUVWXYZ", range(2, 10))),
}
_VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

MULTIWORD_MAKES = {
    "ALFA ROMEO", "ASTON MARTIN", "LAND ROVER", "ROLLS ROYCE", "MERCEDES BENZ",
    "AM GENERAL", "HARLEY DAVIDSON",
}
TITLE_RE = re.compile(r"^\s*((?:19|20)\d{2})\s+([A-Za-z][\w\-]*(?:\s+[\w\-]+)*?)\s*$")

MONEY_RE = re.compile(
    r"(?:US\$|\$|USD\s?)\s?(\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.(\d{1,2}))?"
    r"|(\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.(\d{1,2}))?\s?(?:\$|USD)"
)
RESERVE_KEYWORDS = ("reserve", "резерв")
NO_RESERVE_RE = re.compile(r"\b(no reserve|not available|not met|n/?a|unknown|hidden)\b", re.I)
NOT_FOUND_RE = re.compile(r"(no results|nothing found|not found|ничего не найдено|не найдено)", re.I)

STOCK_RE = re.compile(r"(?:stock|lot|item)\s*(?:#|no\.?|number)?\s*:?\s*(\d{5,10})", re.I)
TIMED_RE = re.compile(r"\btimed\b", re.I)
FIELD_LABEL_RE = re.compile(r"\s(?:stock|lot|item|vin)\b", re.I)
LIVE_RE = re.compile(r"\blive (auction|online)\b", re.I)


# --------------------------------------------------------------------------- VINs
def is_masked_vin(vin: str) -> bool:
    return "*" in vin


def vin_check_digit_ok(vin: str) -> bool:
    """North-American check digit (position 9). Non-NA VINs may legitimately fail."""
    if len(vin) != 17 or is_masked_vin(vin):
        return False
    try:
        total = sum(_VIN_TRANSLIT[c] * w for c, w in zip(vin, _VIN_WEIGHTS))
    except KeyError:
        return False
    check = total % 11
    return vin[8] == ("X" if check == 10 else str(check))


def find_vins(text: str) -> list[str]:
    """All VIN-looking tokens in ``text`` (upper-cased, de-duplicated, ordered)."""
    seen: dict[str, None] = {}
    for match in VIN_RE.finditer(text.upper()):
        token = match.group(1)
        # Require letters *and* digits so 17-digit IDs / words are not mistaken for VINs.
        if re.search(r"\d", token) and re.search(r"[A-Z]", token):
            seen.setdefault(token, None)
    return list(seen)


# ------------------------------------------------------------------- titles / money
def parse_title(title: str) -> tuple[int | None, str | None, str | None]:
    """Split a listing title like ``2019 LAND ROVER RANGE ROVER SPORT HSE``.

    Returns ``(year, make, model)``; parts that cannot be determined are ``None``.
    """
    match = TITLE_RE.match(title or "")
    if not match:
        return None, None, None
    year = int(match.group(1))
    words = match.group(2).upper().replace("-", " ").split()
    if not words:
        return year, None, None
    make_len = 2 if " ".join(words[:2]) in MULTIWORD_MAKES else 1
    make = " ".join(words[:make_len])
    if make == "MERCEDES BENZ":
        make = "MERCEDES-BENZ"
    model = " ".join(words[make_len:]) or None
    return year, make, model


def parse_money(text: str) -> float | None:
    match = MONEY_RE.search(text or "")
    if not match:
        return None
    whole = match.group(1) or match.group(3)
    cents = match.group(2) or match.group(4) or "0"
    try:
        return float(re.sub(r"[,\s]", "", whole) + "." + cents)
    except ValueError:
        return None


def parse_reserve_price(text: str) -> float | None:
    """Find the reserve price in a page's visible text.

    Looks for a line mentioning "reserve" and takes the amount on that line, or
    on the next line when that line is *only* an amount (label/value layouts).
    Returns ``None`` when the page says there is no reserve or none is shown.
    """
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    for i, line in enumerate(lines):
        lowered = line.lower()
        if not any(k in lowered for k in RESERVE_KEYWORDS):
            continue
        price = parse_money(line)
        if price is not None:
            return price
        if NO_RESERVE_RE.search(line):
            continue
        for nxt in lines[i + 1 : i + 3]:
            if MONEY_RE.fullmatch(nxt.replace(" ", "")) or MONEY_RE.fullmatch(nxt):
                return parse_money(nxt)
            if any(k in nxt.lower() for k in RESERVE_KEYWORDS):
                break
    return None


def looks_like_not_found(text: str) -> bool:
    return bool(NOT_FOUND_RE.search(text or ""))


# ------------------------------------------------------------------ IAAI listings
def parse_listing_text(text: str, source_url: str | None = None) -> list[Vehicle]:
    """Extract vehicles from listing text (a single card or a whole results page).

    A ``YEAR MAKE MODEL`` title line starts a new card. Each card's VINs are
    emitted when the card ends, together with the stock number and sale type
    (Timed / Live) found anywhere inside that card.
    """
    vehicles: list[Vehicle] = []
    title: tuple[int | None, str | None, str | None] = (None, None, None)
    lot: str | None = None
    sale_type: str | None = None
    vins: list[str] = []

    def flush() -> None:
        year, make, model = title
        for vin in vins:
            vehicles.append(
                Vehicle(
                    vin=vin, year=year, make=make, model=model, lot_number=lot,
                    auction_type=sale_type, source_url=source_url,
                )
            )

    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        line_vins = find_vins(line)
        # Inline markup can put a whole card on one line ("2015 FORD F-150 Stock#: 1 VIN: ..."),
        # so only look at the text before the first field label.
        head = FIELD_LABEL_RE.split(line, maxsplit=1)[0]
        parsed = parse_title(head)
        if parsed[0] is not None and parsed[1] is not None:
            flush()
            title, lot, sale_type, vins = parsed, None, None, []
        if stock := STOCK_RE.search(line):
            lot = stock.group(1)
        if TIMED_RE.search(line):
            sale_type = "Timed Auction"
        elif LIVE_RE.search(line):
            sale_type = "Live Auction"
        vins.extend(v for v in line_vins if v not in vins)
    flush()
    return vehicles


_KEYS = {
    "vin": {"vin", "vinnumber", "fullvin", "vehiclevin"},
    "year": {"year", "modelyear", "vehicleyear"},
    "make": {"make", "makedesc", "makename", "vehiclemake"},
    "model": {"model", "modeldesc", "modelname", "vehiclemodel"},
    "title": {"title", "yearmakemodel", "ymm", "vehicledescription", "description"},
    "lot_number": {"stocknumber", "stockno", "stock", "lotnumber", "itemid"},
    "auction_type": {"auctiontype", "saletype", "auctionformat", "salesformat"},
    "auction_date": {"auctiondate", "saledate", "auctionenddate", "auctionendtime", "timedauctionenddate"},
}


def _norm_key(key: str) -> str:
    return re.sub(r"[^a-z0-9]", "", key.lower())


def _pick(record: dict[str, Any], field: str) -> Any:
    for key, value in record.items():
        if _norm_key(key) in _KEYS[field] and value not in (None, "", []):
            return value
    return None


def _walk_dicts(node: Any) -> Iterator[dict[str, Any]]:
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from _walk_dicts(value)
    elif isinstance(node, list):
        for item in node:
            yield from _walk_dicts(item)


def extract_vehicles_from_json(payload: Any, source_url: str | None = None) -> list[Vehicle]:
    """Find vehicle records anywhere inside a JSON payload (e.g. IAAI search XHR).

    The structure of IAAI's internal API is undocumented and changes, so instead
    of hard-coding a path this walks every object and keeps the ones with a VIN.
    """
    vehicles: list[Vehicle] = []
    for record in _walk_dicts(payload):
        vin_value = _pick(record, "vin")
        if not isinstance(vin_value, str):
            continue
        vins = find_vins(vin_value)
        if not vins:
            continue
        year_raw, make, model = _pick(record, "year"), _pick(record, "make"), _pick(record, "model")
        if (year_raw is None or make is None) and isinstance(title := _pick(record, "title"), str):
            t_year, t_make, t_model = parse_title(title)
            year_raw, make, model = year_raw or t_year, make or t_make, model or t_model
        try:
            year = int(str(year_raw)[:4]) if year_raw is not None else None
        except ValueError:
            year = None
        lot = _pick(record, "lot_number")
        auction_type = _pick(record, "auction_type")
        auction_date = _pick(record, "auction_date")
        vehicles.append(
            Vehicle(
                vin=vins[0],
                year=year,
                make=str(make).strip().upper() if make else None,
                model=str(model).strip().upper() if model else None,
                lot_number=str(lot) if lot is not None else None,
                auction_type=str(auction_type) if auction_type is not None else None,
                auction_date=str(auction_date) if auction_date is not None else None,
                source_url=source_url,
            )
        )
    return vehicles


def dedupe_vehicles(vehicles: Iterable[Vehicle]) -> list[Vehicle]:
    """Merge duplicates (same VIN seen in JSON and DOM, or on two pages)."""
    by_vin: dict[str, Vehicle] = {}
    for vehicle in vehicles:
        existing = by_vin.get(vehicle.vin)
        if existing is None:
            by_vin[vehicle.vin] = vehicle
        elif vehicle.completeness > existing.completeness:
            by_vin[vehicle.vin] = vehicle.merge(existing)
        else:
            by_vin[vehicle.vin] = existing.merge(vehicle)
    return list(by_vin.values())


def is_timed(vehicle: Vehicle) -> bool:
    """Keep vehicles explicitly marked timed, and those with no sale-type info.

    When the search URL already filters on Timed Auctions, listings usually do
    not repeat the sale type, so unknown means "trust the filter".
    """
    return vehicle.auction_type is None or bool(TIMED_RE.search(vehicle.auction_type))
