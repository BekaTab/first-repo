"""CSV snapshots (one per day) and the VIN -> reserve-price cache."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pandas as pd

from .models import COLUMNS, ReserveResult

log = logging.getLogger(__name__)
DATASET_GLOB = "vehicles_*.csv"


def dataset_path(data_dir: Path, day: date | None = None, demo: bool = False) -> Path:
    day = day or date.today()
    return data_dir / f"vehicles_{day.isoformat()}{'_demo' if demo else ''}.csv"


def save_dataset(rows: list[dict], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    frame = pd.DataFrame(rows, columns=COLUMNS)
    tmp = path.with_suffix(".tmp")
    frame.to_csv(tmp, index=False)
    tmp.replace(path)  # atomic: the UI never reads a half-written file
    log.info("Saved %d vehicles to %s", len(frame), path)
    return path


def list_datasets(data_dir: Path) -> list[Path]:
    """Newest first (file names start with the ISO date, so name order = date order)."""
    return sorted(data_dir.glob(DATASET_GLOB), key=lambda p: (p.name.split("_")[1], p.stat().st_mtime), reverse=True)


def load_dataset(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path, dtype={"vin": str, "lot_number": str})
    for column in COLUMNS:
        if column not in frame:
            frame[column] = None
    frame["year"] = pd.to_numeric(frame["year"], errors="coerce").astype("Int64")
    frame["reserve_price"] = pd.to_numeric(frame["reserve_price"], errors="coerce")
    for column in ("make", "model"):
        frame[column] = frame[column].fillna("UNKNOWN").astype(str)
    return frame[COLUMNS]


class ReserveCache:
    """JSON cache so re-runs on the same day don't re-query VINs (less load, fewer blocks)."""

    def __init__(self, path: Path, max_age: timedelta = timedelta(hours=20)):
        self.path = path
        self.max_age = max_age
        self._data: dict[str, dict] = {}
        if path.exists():
            try:
                self._data = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                log.warning("Ignoring unreadable cache %s", path)

    def get(self, vin: str) -> ReserveResult | None:
        entry = self._data.get(vin)
        if not entry:
            return None
        saved = datetime.fromisoformat(entry["saved_at"])
        if datetime.now(timezone.utc) - saved > self.max_age:
            return None
        return ReserveResult(entry["price"], entry["status"], entry.get("detail", ""), from_cache=True)

    def put(self, vin: str, result: ReserveResult) -> None:
        self._data[vin] = {
            "price": result.price,
            "status": result.status,
            "detail": result.detail,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self._data, indent=1), encoding="utf-8")
