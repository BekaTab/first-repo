"""Streamlit dashboard for the daily IAAI Timed Auction list.

Run with:  streamlit run app.py

The UI only reads CSV snapshots produced by ``run_scraper.py``; scraping runs
in a separate process so a slow or blocked scrape never freezes the page.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pandas as pd
import streamlit as st

from dashboard.filters import FilterState, apply_filters, models_for, to_display
from scraper.config import PROJECT_ROOT, Settings
from scraper.storage import list_datasets, load_dataset

st.set_page_config(page_title="Timed Auction Dashboard", page_icon="🚗", layout="wide")
settings = Settings()


@st.cache_data(show_spinner=False)
def load(path: str, mtime: float) -> pd.DataFrame:  # mtime busts the cache when the file changes
    return load_dataset(Path(path))


def run_scraper(extra: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(PROJECT_ROOT / "run_scraper.py"), *extra],
        cwd=PROJECT_ROOT, capture_output=True, text=True,
    )


# ------------------------------------------------------------------ data source
st.title("🚗 IAAI Timed Auctions — Reserve Prices")

with st.sidebar:
    st.header("Data")
    datasets = list_datasets(settings.data_dir)
    with st.expander("Refresh data", expanded=not datasets):
        st.caption("Opens a browser window; solve any CAPTCHA it shows. Can take several minutes.")
        if st.button("Run scraper now", type="primary", width="stretch"):
            with st.spinner("Scraping IAAI and Autohelperbot..."):
                proc = run_scraper([])
            (st.success if proc.returncode == 0 else st.error)(f"Scraper exited with code {proc.returncode}")
            st.code((proc.stdout + proc.stderr)[-4000:] or "(no output)")
            st.cache_data.clear()
        if st.button("Generate demo data", width="stretch"):
            run_scraper(["--demo"])
            st.cache_data.clear()
            st.rerun()

if not datasets:
    st.info(
        "No data yet. Run `python run_scraper.py` (or `python run_scraper.py --demo` for sample data), "
        "or use **Refresh data** in the sidebar."
    )
    st.stop()

with st.sidebar:
    chosen = st.selectbox("Snapshot", datasets, format_func=lambda p: p.stem.removeprefix("vehicles_"))

df = load(str(chosen), chosen.stat().st_mtime)
if chosen.stem.endswith("_demo"):
    st.warning("Showing **synthetic demo data**, not real auction listings.")

if df.empty:
    st.warning("This snapshot has no vehicles. Check the scraper log / README troubleshooting.")
    st.stop()

# ------------------------------------------------------------------ filters
with st.sidebar:
    st.header("Filters")

    years = df["year"].dropna()
    year_range = None
    if not years.empty and years.min() < years.max():
        year_range = st.slider("Year", int(years.min()), int(years.max()), (int(years.min()), int(years.max())))

    makes = st.multiselect("Make", sorted(df["make"].unique()), placeholder="All makes")
    model_options = models_for(df, makes)
    models = st.multiselect("Model", model_options, placeholder="All models")

    prices = df["reserve_price"].dropna()
    price_range = None
    if not prices.empty and prices.min() < prices.max():
        lo, hi = int(prices.min()), int(prices.max()) + 1
        price_range = st.slider("Reserve price ($)", lo, hi, (lo, hi), step=100, format="$%d")
    include_missing = st.checkbox("Include vehicles with reserve “Not Available”", value=True)

    st.header("Sort")
    order = st.radio("Reserve price", ["Ascending", "Descending"], horizontal=True)

state = FilterState(
    year_range=year_range,
    makes=makes,
    models=[m for m in models if m in model_options],
    price_range=price_range,
    include_missing_price=include_missing,
    sort_descending=order == "Descending",
)
filtered = apply_filters(df, state)

# ------------------------------------------------------------------ table
scraped = df["scraped_at"].dropna()
if not scraped.empty:
    st.caption(f"Scraped {str(scraped.max())[:16].replace('T', ' ')} UTC")
c1, c2, c3 = st.columns(3)
c1.metric("Vehicles shown", f"{len(filtered):,} of {len(df):,}")
c2.metric("With reserve price", f"{filtered['reserve_price'].notna().sum():,}")
median = filtered["reserve_price"].median()
c3.metric("Median reserve", f"${median:,.0f}" if pd.notna(median) else "—")

st.dataframe(
    to_display(filtered),
    width="stretch",
    hide_index=True,
    height=min(38 * (len(filtered) + 1), 720),
    column_config={"Year": st.column_config.NumberColumn(format="%d")},
)

st.download_button(
    "Download filtered CSV",
    filtered.to_csv(index=False).encode("utf-8"),
    file_name=f"{chosen.stem}_filtered.csv",
    mime="text/csv",
)
