"""Filtering and sorting of the vehicle table - pure pandas, independent of Streamlit."""

from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from scraper.models import NOT_AVAILABLE


@dataclass
class FilterState:
    year_range: tuple[int, int] | None = None
    makes: list[str] = field(default_factory=list)   # empty = all
    models: list[str] = field(default_factory=list)  # empty = all
    price_range: tuple[float, float] | None = None
    include_missing_price: bool = True
    sort_descending: bool = False


def apply_filters(frame: pd.DataFrame, state: FilterState) -> pd.DataFrame:
    mask = pd.Series(True, index=frame.index)
    if state.year_range:
        lo, hi = state.year_range
        mask &= frame["year"].between(lo, hi).fillna(False).astype(bool)
    if state.makes:
        mask &= frame["make"].isin(state.makes)
    if state.models:
        mask &= frame["model"].isin(state.models)

    has_price = frame["reserve_price"].notna()
    if state.price_range:
        lo, hi = state.price_range
        price_ok = has_price & frame["reserve_price"].between(lo, hi)
    else:
        price_ok = has_price
    mask &= price_ok | (~has_price & state.include_missing_price)
    return sort_by_reserve(frame[mask], state.sort_descending)


def sort_by_reserve(frame: pd.DataFrame, descending: bool) -> pd.DataFrame:
    """Sort by reserve price; vehicles without one always go to the bottom."""
    return frame.sort_values(
        ["reserve_price", "year"], ascending=[not descending, False], na_position="last", kind="stable"
    )


def models_for(frame: pd.DataFrame, makes: list[str]) -> list[str]:
    subset = frame[frame["make"].isin(makes)] if makes else frame
    return sorted(subset["model"].dropna().unique())


def to_display(frame: pd.DataFrame) -> pd.DataFrame:
    """Table shown to the user: friendly headers, missing prices as "Not Available"."""
    out = pd.DataFrame(
        {
            "VIN": frame["vin"],
            "Year": frame["year"],
            "Make": frame["make"],
            "Model": frame["model"],
            "Reserve Price": frame["reserve_price"].map(
                lambda p: f"${p:,.0f}" if pd.notna(p) else NOT_AVAILABLE
            ),
            "Lot #": frame["lot_number"],
            "Auction Date": frame["auction_date"],
        }
    )
    return out.reset_index(drop=True)
