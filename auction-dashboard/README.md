# IAAI Timed Auction Dashboard

Collects the day's **IAAI Timed Auction** vehicles (VIN, year, make, model), looks up each VIN's
**reserve price on autohelperbot.com**, and shows the combined list in a **Streamlit** table with
Year / Make / Model / Price filters and a Reserve Price sort.

```
auction-dashboard/
├── app.py                 # Streamlit UI (reads CSV snapshots only)
├── run_scraper.py         # CLI: scrape -> data/vehicles_<date>.csv
├── dashboard/
│   └── filters.py         # filtering / sorting / display formatting (pure pandas)
├── scraper/
│   ├── config.py          # every URL, selector and delay, overridable by env var
│   ├── browser.py         # Playwright start-up, pacing, retries, CAPTCHA detection
│   ├── iaai.py            # Step 1: IAAI Timed Auctions (JSON capture + DOM fallback)
│   ├── autohelperbot.py   # Step 2: VIN -> reserve price
│   ├── parsing.py         # pure parsers (VINs, titles, prices, JSON) - unit tested
│   ├── pipeline.py        # Step 1 + Step 2 -> CSV
│   ├── storage.py         # daily CSV snapshots + reserve-price cache
│   └── demo.py            # synthetic data for trying the UI
└── tests/                 # unit tests + browser tests against local fixture pages
```

The scraper and the UI are separate processes. The UI only reads the CSV files, so a slow or
blocked scrape never freezes the dashboard.

## How it works

**Step 1: IAAI.** The scraper opens the IAAI search page in Chromium, applies the Timed Auction
filter, and walks the result pages. It extracts data two ways and merges them by VIN:

- **JSON capture.** IAAI's search page loads its results from JSON calls in the background. The
  scraper reads those responses and keeps every object that has a VIN. This data is cleaner than
  the HTML.
- **DOM fallback.** It also parses the visible text of each result card (`YEAR MAKE MODEL`, VIN,
  stock number and sale type).

Listings marked as Live Auctions are dropped.

**Step 2: Autohelperbot.** For each VIN, the scraper opens a fresh search page, types the VIN and
reads the reserve price from the result. It looks for a "Reserve" label (English or Russian) with
an amount on the same line or the next line.

- Results are cached for 20 hours in `data/reserve_cache.json`, so a re-run doesn't query
  Autohelperbot again.
- If there is no price, the VIN is not found, the VIN is masked, the lookup errors or the site
  blocks the scraper, the price shows as **"Not Available"**. The `reserve_status` column in the
  CSV records why.
- If the site blocks the scraper, Step 2 stops but the IAAI data is still saved.

**Step 3/4: UI.** The dashboard has these controls:

- Year range slider
- Make and Model dropdowns (multi-select). The Model list follows the makes you pick.
- Reserve-price range slider, plus an option to include or exclude "Not Available" rows
- Ascending / Descending sort toggle. Rows without a price always go to the bottom.
- CSV download of the filtered table

## Run it locally

Requires Python 3.10+.

```bash
cd auction-dashboard

# 1. Create a virtual environment
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate

# 2. Install dependencies and the browser
pip install -r requirements.txt
python -m playwright install chromium

# 3. (Optional) Try the UI with synthetic data first
python run_scraper.py --demo
streamlit run app.py                 # opens http://localhost:8501
```

### First real run

```bash
# 4. One-time: open both sites in the scraper's own browser profile.
#    Log in to IAAI (and Autohelperbot if it requires an account), solve any
#    CAPTCHA, then press Enter in the terminal. The cookies are kept in .browser-profile/.
python run_scraper.py --login

# 5. In that browser (or your own), open IAAI search, tick the "Timed Auction" filter
#    and copy the URL from the address bar. Pass it in, or put it in an env var:
python run_scraper.py --search-url "https://www.iaai.com/Search?...timed..." --max-pages 3

# 6. Start (or refresh) the dashboard
streamlit run app.py
```

A browser window opens during the scrape. Leave it alone. If a CAPTCHA appears, solve it and the
scraper continues on its own; it waits up to `CHALLENGE_TIMEOUT` seconds. The output goes to
`data/vehicles_<YYYY-MM-DD>.csv`. The dashboard lets you pick any earlier snapshot, and its
sidebar has a **Run scraper now** button.

Useful flags: `--max-pages N`, `--max-vehicles N`, `--skip-reserve` (Step 1 only), `--headless`,
`-v`.

### Run it daily

Run it on your own computer, not a cloud server (see below). Examples:

```bash
# macOS / Linux crontab: 07:15 every day
15 7 * * * cd /path/to/auction-dashboard && .venv/bin/python run_scraper.py >> data/scrape.log 2>&1
```

On Windows, use Task Scheduler to run `.venv\Scripts\python.exe run_scraper.py` with the
"Start in" folder set to `auction-dashboard`.

### Tests

```bash
pytest -q
```

The browser tests start a local web server with fake IAAI and Autohelperbot pages
(`tests/fixtures/`) and run the real scraper classes against it in headless Chromium.

## Configuration

Every setting can be changed with an environment variable. You can export it in your shell or
prefix the command with it. The defaults are in `scraper/config.py`.

| Variable | Default | Purpose |
|---|---|---|
| `IAAI_SEARCH_URL` | `https://www.iaai.com/Search` | Search URL; ideally one that already has the Timed Auction filter applied |
| `IAAI_TIMED_FILTER_TEXT` | `Timed Auction` | Text of the filter clicked when the URL doesn't contain "timed" |
| `IAAI_CARD_SELECTORS` | see config | CSS selectors for result cards, separated by `\|\|` |
| `IAAI_NEXT_SELECTORS` | see config | CSS selectors for the "next page" button |
| `MAX_PAGES` / `MAX_VEHICLES` | `5` / `200` | Limits per run |
| `AHB_BASE_URL` | `https://autohelperbot.com` | Page that has the VIN search box |
| `AHB_SEARCH_URL_TEMPLATE` | – | Direct result URL, e.g. `https://autohelperbot.com/.../{vin}`. Skips the search form |
| `AHB_INPUT_SELECTORS` | see config | Selectors for the VIN search box |
| `HEADLESS` | `0` | `1` hides the browser. Sites are more likely to block a hidden browser, and you can't solve CAPTCHAs |
| `BROWSER_CHANNEL` | – | `chrome` uses your installed Google Chrome |
| `BROWSER_EXECUTABLE` | – | Path to a specific Chromium/Chrome binary |
| `MIN_DELAY` / `MAX_DELAY` | `2.5` / `6.0` | Random pause between actions, in seconds |
| `CHALLENGE_TIMEOUT` | `180` | Seconds to wait for you to solve a CAPTCHA |
| `DATA_DIR` / `BROWSER_PROFILE_DIR` | `data/` / `.browser-profile/` | Storage locations |

### If a site changes its layout

I could not test against the live IAAI and Autohelperbot sites while building this, so the CSS
selectors are educated defaults. The parsers don't depend on exact markup: they search the page
text and the JSON responses for VINs, titles and "Reserve" labels. Selectors only matter for
finding result cards, the next-page button and the search box. If a run finds nothing:

1. Run with `-v` and watch the browser.
2. In Chrome DevTools, right-click a result card or the search box and choose
   **Copy > Copy selector**.
3. Put that selector in `IAAI_CARD_SELECTORS`, `IAAI_NEXT_SELECTORS` or `AHB_INPUT_SELECTORS`.
4. On Autohelperbot, if the address bar changes to something like `/vin/<VIN>` after a search, set
   `AHB_SEARCH_URL_TEMPLATE`. It's faster and needs fewer interactions.

## Handling CAPTCHAs and Cloudflare blocks

Both sites use bot-management services, such as Cloudflare or Imperva/Incapsula-style challenges.
These services score each visit on IP reputation, browser fingerprint, behavior and request rate.
This project gets past those checks by **looking like one careful person using a real browser**.
It does not try to fight the protection. In practice that works more reliably than evasion tricks,
and it won't get your buyer account banned.

**What the code already does**

- **Uses a real, visible browser** (`HEADLESS=0`). Headless browsers are easy to detect.
- **Keeps a persistent profile.** Cookies are kept between runs, including the "challenge passed"
  cookie (`cf_clearance` on Cloudflare, `incap_ses_*`/`visid_incap_*` on Imperva) and your
  logins. You usually solve a challenge once, not on every run.
- **Waits for you to solve challenges.** `browser.py` recognizes Cloudflare, Imperva, hCaptcha,
  reCAPTCHA, PerimeterX and DataDome challenge pages and pauses until you solve them. In headless
  mode it stops cleanly instead of retrying over and over.
- **Paces requests like a person.** It waits 2.5–6 s at random between actions, scrolls gradually,
  types the VIN character by character, and caps pages and vehicles per run.
- **Makes as few requests as possible.** It reads the JSON IAAI already loads instead of opening
  every vehicle page, and caches reserve prices for 20 hours.
- **Stops when blocked.** When Autohelperbot blocks it, Step 2 stops for that run instead of
  retrying every remaining VIN.

**What you should do**

1. **Run from your home or office internet connection.** Cloud servers and VPN IPs
   (AWS, GCP, DigitalOcean, etc.) get far more challenges, and often outright blocks.
2. **Use your installed Chrome.** Set `BROWSER_CHANNEL=chrome`; its fingerprint matches a normal
   user better than the bundled Chromium.
3. **Log in to IAAI with your own buyer account** (`--login`). Logged-in sessions are trusted
   more. They also often show full VINs; Autohelperbot can't look up a partial VIN, so those rows
   are marked "Not Available".
4. **Keep the volume low.** One run a day of a few pages is fine. Hundreds of page loads in a few
   minutes will get your IP flagged. If the scraper keeps getting challenged, raise
   `MIN_DELAY`/`MAX_DELAY` and lower `MAX_PAGES`.
5. **If you get blocked**, stop and wait a few hours. Don't retry over and over: repeated
   challenge failures lower your IP's reputation further. Clearing `.browser-profile/` and logging
   in again can help if a cookie became invalid.
6. **Autohelperbot specifically:** check whether your account level includes an API or its
   Telegram bot. That gives you the same reserve data without scraping, and it's the more stable
   long-term option. If the site has a per-VIN result URL, use `AHB_SEARCH_URL_TEMPLATE`.
7. **IAAI specifically:** for regular, larger-volume data, ask IAAI about their official data and
   partner feeds for registered buyers. It's more reliable than any scraper.

**What this project deliberately does *not* do:** use paid CAPTCHA-solving services, spoof
browser fingerprints, or rotate proxies to hide traffic. Those approaches break both sites' Terms
of Use and get accounts banned. They also turn a personal research tool into something the site
operators actively fight. Before you automate either site, check its Terms of Use and robots.txt
and stay within what your account allows.
