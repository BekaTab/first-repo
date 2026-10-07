from datetime import timedelta

import pandas as pd

from dashboard.filters import FilterState, apply_filters, models_for, to_display
from scraper.demo import demo_rows
from scraper.models import NOT_AVAILABLE, ReserveResult
from scraper.parsing import vin_check_digit_ok
from scraper.storage import ReserveCache, dataset_path, list_datasets, load_dataset, save_dataset


def frame():
    return pd.DataFrame(
        {
            "vin": list("ABCD"),
            "year": pd.array([2015, 2018, 2020, 2022], dtype="Int64"),
            "make": ["FORD", "TOYOTA", "FORD", "BMW"],
            "model": ["F-150", "CAMRY", "ESCAPE", "X5"],
            "reserve_price": [9000.0, None, 4000.0, 30000.0],
            "lot_number": None, "auction_date": None, "source_url": None,
        }
    )


def test_sort_ascending_and_descending_keep_missing_last():
    assert list(apply_filters(frame(), FilterState())["vin"]) == ["C", "A", "D", "B"]
    assert list(apply_filters(frame(), FilterState(sort_descending=True))["vin"]) == ["D", "A", "C", "B"]


def test_filters_combine():
    state = FilterState(year_range=(2016, 2022), makes=["FORD", "BMW"], price_range=(0, 10000))
    assert list(apply_filters(frame(), state)["vin"]) == ["C"]
    state.makes = []
    assert list(apply_filters(frame(), state)["vin"]) == ["C", "B"]  # B has no price but is included
    state.include_missing_price = False
    assert list(apply_filters(frame(), state)["vin"]) == ["C"]


def test_models_follow_makes():
    assert models_for(frame(), ["FORD"]) == ["ESCAPE", "F-150"]


def test_display_marks_missing_price():
    shown = to_display(frame())
    assert list(shown["Reserve Price"]) == ["$9,000", NOT_AVAILABLE, "$4,000", "$30,000"]


def test_dataset_roundtrip(tmp_path):
    rows = demo_rows(25, seed=1)
    assert all(vin_check_digit_ok(r["vin"]) for r in rows)
    path = save_dataset(rows, dataset_path(tmp_path, demo=True))
    assert list_datasets(tmp_path) == [path]
    loaded = load_dataset(path)
    assert len(loaded) == 25 and loaded["year"].dtype == "Int64"
    assert loaded["reserve_price"].isna().sum() == sum(r["reserve_price"] is None for r in rows)


def test_reserve_cache_expires(tmp_path):
    cache = ReserveCache(tmp_path / "c.json")
    cache.put("VIN1", ReserveResult(100.0, "found"))
    again = ReserveCache(tmp_path / "c.json")
    assert again.get("VIN1").price == 100.0 and again.get("VIN1").from_cache
    expired = ReserveCache(tmp_path / "c.json", max_age=timedelta(seconds=-1))
    assert expired.get("VIN1") is None
