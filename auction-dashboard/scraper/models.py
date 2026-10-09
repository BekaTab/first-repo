"""Plain data containers shared by the scrapers, the pipeline and the UI."""

from __future__ import annotations

from dataclasses import asdict, dataclass

NOT_AVAILABLE = "Not Available"

# Column order of the CSV files written by the pipeline and read by the UI.
COLUMNS = [
    "vin",
    "year",
    "make",
    "model",
    "reserve_price",
    "reserve_status",
    "lot_number",
    "auction_type",
    "auction_date",
    "source_url",
    "scraped_at",
]


@dataclass
class Vehicle:
    vin: str
    year: int | None = None
    make: str | None = None
    model: str | None = None
    lot_number: str | None = None
    auction_type: str | None = None
    auction_date: str | None = None
    source_url: str | None = None

    @property
    def completeness(self) -> int:
        """How many optional fields are filled; used to pick the best duplicate."""
        return sum(v is not None for k, v in asdict(self).items() if k != "vin")

    def merge(self, other: "Vehicle") -> "Vehicle":
        """Fill this record's gaps from ``other`` (same VIN)."""
        merged = asdict(self)
        for key, value in asdict(other).items():
            if merged.get(key) is None and value is not None:
                merged[key] = value
        return Vehicle(**merged)


@dataclass
class ReserveResult:
    """Outcome of one Autohelperbot lookup.

    ``status`` is one of ``found``, ``not_found``, ``masked_vin``, ``blocked`` or ``error``.
    Only ``found`` carries a price; everything else is shown as "Not Available".
    """

    price: float | None
    status: str
    detail: str = ""
    from_cache: bool = False

    @property
    def display(self) -> str:
        return f"${self.price:,.0f}" if self.price is not None else NOT_AVAILABLE

    @property
    def cacheable(self) -> bool:
        # Transient failures must be retried on the next run, not cached.
        return self.status in {"found", "not_found", "masked_vin"}
