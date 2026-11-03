"""
სახელმწიფო შესყიდვების ტენდერების მონიტორი
------------------------------------------
ერთფაილიანი Streamlit აპლიკაცია, რომელიც იღებს აქტიურ ტენდერებს
https://tenders.procurement.gov.ge/ -დან და იძლევა მათი ძებნის,
ფილტრაციის, მონიტორინგისა და Excel/CSV-ად ექსპორტის საშუალებას.

გაშვება:  streamlit run app.py
"""

from __future__ import annotations

import io
import random
import re
import time
from datetime import datetime, timedelta

import pandas as pd
import requests
import streamlit as st
from bs4 import BeautifulSoup

# --------------------------------------------------------------------------- #
# კონფიგურაცია
# --------------------------------------------------------------------------- #
BASE_URL = "https://tenders.procurement.gov.ge"
PUBLIC_URL = f"{BASE_URL}/public/?lang=ge"
SEARCH_URL = f"{BASE_URL}/public/library/controller.php"
TENDER_URL = f"{BASE_URL}/public/?go={{app_id}}&lang=ge"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "ka-GE,ka;q=0.9,en;q=0.8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": PUBLIC_URL,
}

REQUEST_TIMEOUT = 25  # წამი
CACHE_TTL = 15 * 60  # მონაცემები ინახება 15 წუთი

# სტატუსები, რომლებიც ნიშნავს, რომ წინადადებების მიღება ჯერ კიდევ შესაძლებელია
ACTIVE_STATUS_PATTERNS = (
    "წინადადებების მიღება დაწყებულია",
    "წინადადებების მიღება მიმდინარეობს",
    "გამოცხადებულია",
)

COLUMNS = [
    "ID",
    "ნომერი",
    "დასახელება",
    "შემსყიდველი",
    "ფასი (GEL)",
    "სტატუსი",
    "CPV",
    "გამოცხადდა",
    "ვადა",
    "ბმული",
]

TENDER_NO_RE = re.compile(r"\b[A-Z]{2,4}\d{6,}\b")
CPV_RE = re.compile(r"\b(\d{8})(?:-\d)?\b")
DATE_RE = re.compile(r"(\d{2}\.\d{2}\.\d{4})(?:\s+(\d{1,2}:\d{2}))?")
AMOUNT_RE = re.compile(r"(\d[\d`'’\s .,]*\d|\d)")


# --------------------------------------------------------------------------- #
# დამხმარე ფუნქციები
# --------------------------------------------------------------------------- #
def parse_amount(text: str | None) -> float | None:
    """'12`345.50 GEL', '12 345,50', '12,345.50' -> 12345.5"""
    if not text:
        return None
    match = AMOUNT_RE.search(text)
    if not match:
        return None
    raw = re.sub(r"[`'’\s ]", "", match.group(1))
    if "," in raw and "." in raw:
        raw = raw.replace(",", "")
    elif "," in raw:
        head, _, tail = raw.rpartition(",")
        raw = f"{head.replace(',', '')}.{tail}" if len(tail) <= 2 else raw.replace(",", "")
    if raw.count(".") > 1:  # 1.234.567 -> 1234567
        head, _, tail = raw.rpartition(".")
        raw = head.replace(".", "") + ("." + tail if len(tail) <= 2 else tail)
    try:
        return float(raw)
    except ValueError:
        return None


def parse_date(text: str | None) -> datetime | None:
    if not text:
        return None
    match = DATE_RE.search(text)
    if not match:
        return None
    day, clock = match.group(1), match.group(2) or "00:00"
    try:
        return datetime.strptime(f"{day} {clock}", "%d.%m.%Y %H:%M")
    except ValueError:
        return None


def extract_field(lines: list[str], *labels: str) -> str | None:
    """პოულობს ველს ლეიბლით: 'ლეიბლი: მნიშვნელობა' ან ლეიბლი და მნიშვნელობა ცალ-ცალკე ხაზზე."""
    for i, line in enumerate(lines):
        for label in labels:
            if label in line:
                rest = line.split(label, 1)[1].strip(" :\t-–")
                if rest:
                    return rest
                for nxt in lines[i + 1 : i + 3]:
                    if nxt.strip(" :"):
                        return nxt.strip(" :")
    return None


def is_active(status: str, deadline: datetime | None) -> bool:
    status = status or ""
    if any(p in status for p in ACTIVE_STATUS_PATTERNS):
        return deadline is None or deadline >= datetime.now()
    # სტატუსი უცნობია — ვენდობით ვადას
    return not status and deadline is not None and deadline >= datetime.now()


# --------------------------------------------------------------------------- #
# HTML-ის პარსინგი
# --------------------------------------------------------------------------- #
def parse_tenders(html: str) -> list[dict]:
    """ძებნის შედეგის HTML-იდან ამოაქვს ტენდერების სია.

    საიტი თითო ტენდერს აბრუნებს `<tr id="A123456" onclick="ShowApp(123456, ...)">`
    ფორმატით, რომლის შიგნითაც ველები 'ლეიბლი: მნიშვნელობა' სახითაა.
    """
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("tr[id^=A]") or soup.select("[onclick*=ShowApp]")
    tenders: list[dict] = []

    for row in rows:
        app_id = None
        id_match = re.fullmatch(r"A(\d+)", row.get("id", ""))
        if id_match:
            app_id = id_match.group(1)
        else:
            onclick = re.search(r"ShowApp\((\d+)", row.get("onclick", ""))
            app_id = onclick.group(1) if onclick else None
        if not app_id:
            continue

        lines = [ln.strip() for ln in row.get_text("\n").split("\n") if ln.strip()]
        text = " ".join(lines)

        number = TENDER_NO_RE.search(text)
        status = extract_field(lines, "შესყიდვის სტატუსი", "სტატუსი") or ""
        buyer = extract_field(lines, "შემსყიდველი") or ""
        amount = parse_amount(
            extract_field(lines, "სავარაუდო ღირებულება", "ღირებულება", "ფასი")
        )
        category = extract_field(lines, "შესყიდვის კატეგორია", "კატეგორია", "CPV") or ""
        cpv = CPV_RE.search(category) or CPV_RE.search(text)
        category_name = re.sub(r"^\s*\d{8}(?:-\d)?\s*[-–:]?\s*", "", category).strip()

        title = (
            extract_field(lines, "შესყიდვის ობიექტი", "შესყიდვის საგანი", "დასახელება")
            or category_name
            or (lines[0] if lines else "")
        )
        published = parse_date(
            extract_field(lines, "გამოცხადების თარიღი", "გამოქვეყნების თარიღი")
        )
        deadline = parse_date(
            extract_field(lines, "წინადადებების მიღება მთავრდება", "მიღების დასრულების თარიღი")
        )

        tenders.append(
            {
                "ID": int(app_id),
                "ნომერი": number.group(0) if number else "",
                "დასახელება": title,
                "შემსყიდველი": buyer,
                "ფასი (GEL)": amount,
                "სტატუსი": status,
                "CPV": cpv.group(1) if cpv else "",
                "გამოცხადდა": published,
                "ვადა": deadline,
                "ბმული": TENDER_URL.format(app_id=app_id),
            }
        )
    return tenders


# --------------------------------------------------------------------------- #
# მონაცემების წამოღება
# --------------------------------------------------------------------------- #
def _new_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(HEADERS)
    # მთავარი გვერდი აძლევს PHPSESSID cookie-ს, რომლის გარეშეც ძებნა არ მუშაობს
    session.get(PUBLIC_URL, timeout=REQUEST_TIMEOUT)
    return session


def _search_payload(keyword: str, date_from: str, date_to: str, page: int) -> dict:
    return {
        "action": "search_app",
        "search": "",
        "app_t": "0",          # ყველა ტიპის შესყიდვა
        "app_reg_id": "",
        "app_shems_id": "0",
        "app_monac_id": "0",
        "app_basecode": "0",
        "app_codes": "",
        "app_status": "0",     # სტატუსს ვფილტრავთ ლოკალურად (საიმედოობისთვის)
        "app_agr_status": "0",
        "app_type": "0",
        "app_date_type": "1",  # გამოცხადების თარიღით
        "app_date_from": date_from,
        "app_date_tlll": date_to,
        "app_date_till": date_to,
        "app_amount_from": "",
        "app_amount_to": "",
        "app_currency": "2",   # GEL
        "app_pricelist": "0",
        "search_text": keyword,
        "page": str(page),
    }


@st.cache_data(ttl=CACHE_TTL, show_spinner=False)
def fetch_tenders(keyword: str, days_back: int, max_pages: int) -> tuple[pd.DataFrame, str]:
    """იღებს ტენდერებს საიტიდან (გვერდებად). ქეშირდება 15 წუთით.

    აბრუნებს (DataFrame, წამოღების დრო).
    """
    session = _new_session()
    date_to = datetime.now()
    date_from = date_to - timedelta(days=days_back)
    fmt = "%d.%m.%Y"

    collected: dict[int, dict] = {}
    for page in range(1, max_pages + 1):
        payload = _search_payload(keyword, date_from.strftime(fmt), date_to.strftime(fmt), page)
        resp = session.post(
            SEARCH_URL,
            params={"action": "search_app", "page": page},
            data=payload,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        resp.encoding = resp.encoding or "utf-8"

        content = resp.text
        # ზოგჯერ endpoint აბრუნებს JSON-ს, რომლის შიგნითაც HTML-ია
        if content.lstrip().startswith("{"):
            try:
                data = resp.json()
                content = data.get("html") or data.get("data") or data.get("content") or ""
            except ValueError:
                pass

        page_items = parse_tenders(content)
        new_items = [t for t in page_items if t["ID"] not in collected]
        if not new_items:  # ბოლო გვერდი ან გვერდი არ შეიცვალა
            break
        for item in new_items:
            collected[item["ID"]] = item
        time.sleep(0.3)  # თავაზიანი სიჩქარე სერვერის მიმართ

    df = pd.DataFrame(list(collected.values()), columns=COLUMNS)
    return df, datetime.now().strftime("%d.%m.%Y %H:%M")


@st.cache_data(show_spinner=False)
def demo_tenders(n: int = 60) -> tuple[pd.DataFrame, str]:
    """სადემონსტრაციო (გამოგონილი) მონაცემები — ინტერფეისის შესამოწმებლად."""
    rnd = random.Random(42)
    buyers = [
        ("თბილისის მერია", "204521221"),
        ("საავტომობილო გზების დეპარტამენტი", "204521312"),
        ("განათლებისა და მეცნიერების სამინისტრო", "204868281"),
        ("შინაგან საქმეთა სამინისტრო", "204422498"),
        ("ბათუმის მუნიციპალიტეტის მერია", "245426453"),
        ("სსიპ საქართველოს ეროვნული მუზეუმი", "204929961"),
        ("ქუთაისის მუნიციპალიტეტის მერია", "212712331"),
    ]
    items = [
        ("45233142", "გზების სარეაბილიტაციო სამუშაოები"),
        ("30213000", "პერსონალური კომპიუტერების შესყიდვა"),
        ("09134200", "დიზელის საწვავის შესყიდვა"),
        ("15800000", "კვების პროდუქტების შესყიდვა"),
        ("79713000", "დაცვის მომსახურება"),
        ("45453000", "სკოლის შენობის მიმდინარე რემონტი"),
        ("33140000", "სამედიცინო სახარჯი მასალები"),
        ("72260000", "პროგრამული უზრუნველყოფის მომსახურება"),
        ("34144210", "სახანძრო ავტომობილის შესყიდვა"),
        ("90910000", "დასუფთავების მომსახურება"),
    ]
    statuses = [
        "წინადადებების მიღება დაწყებულია",
        "წინადადებების მიღება დაწყებულია",
        "გამოცხადებულია",
        "წინადადებების მიღება დასრულებულია",
    ]
    now = datetime.now()
    rows = []
    for i in range(n):
        app_id = 640000 + rnd.randint(0, 9999)
        cpv, title = rnd.choice(items)
        buyer, _code = rnd.choice(buyers)
        published = now - timedelta(days=rnd.randint(0, 20), hours=rnd.randint(0, 12))
        deadline = (now + timedelta(days=rnd.randint(-2, 25))).replace(
            hour=rnd.choice([11, 13, 16]), minute=0, second=0, microsecond=0
        )
        prefix = rnd.choice(["NAT", "SPA", "CON"])
        rows.append(
            {
                "ID": app_id,
                "ნომერი": f"{prefix}{now:%y}{rnd.randint(1000, 99999):07d}",
                "დასახელება": title,
                "შემსყიდველი": buyer,
                "ფასი (GEL)": round(rnd.choice([5, 20, 80, 250, 900]) * rnd.uniform(1_000, 4_000), 2),
                "სტატუსი": rnd.choice(statuses),
                "CPV": cpv,
                "გამოცხადდა": published,
                "ვადა": deadline,
                "ბმული": TENDER_URL.format(app_id=app_id),
            }
        )
    df = pd.DataFrame(rows, columns=COLUMNS).drop_duplicates("ID")
    return df, now.strftime("%d.%m.%Y %H:%M")


# --------------------------------------------------------------------------- #
# ექსპორტი
# --------------------------------------------------------------------------- #
def to_excel(df: pd.DataFrame) -> bytes:
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="ტენდერები")
        sheet = writer.sheets["ტენდერები"]
        for col_cells in sheet.columns:
            width = max(len(str(c.value or "")) for c in col_cells[:200])
            sheet.column_dimensions[col_cells[0].column_letter].width = min(max(width + 2, 10), 60)
    return buffer.getvalue()


def to_csv(df: pd.DataFrame) -> bytes:
    # utf-8-sig — რომ Excel-მა ქართული ასოები სწორად გახსნას
    return df.to_csv(index=False).encode("utf-8-sig")


def export_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col in ("გამოცხადდა", "ვადა"):
        out[col] = pd.to_datetime(out[col]).dt.strftime("%d.%m.%Y %H:%M")
    return out


# --------------------------------------------------------------------------- #
# ინტერფეისი
# --------------------------------------------------------------------------- #
CSS = """
<style>
.block-container {padding-top: 1.6rem; max-width: 1400px;}
.tender-card {
  border: 1px solid rgba(128,128,128,.25); border-radius: 14px;
  padding: 14px 16px; margin-bottom: 12px; height: 100%;
  background: rgba(128,128,128,.04);
}
.tender-card h4 {font-size: 1rem; margin: 4px 0 6px; line-height: 1.35;}
.tender-card .meta {font-size: .84rem; opacity: .8; margin: 2px 0;}
.tender-card .price {font-size: 1.15rem; font-weight: 700; margin: 6px 0;}
.badge {display:inline-block; padding:2px 9px; border-radius:999px;
        font-size:.74rem; font-weight:600; margin-right:4px;}
.b-active {background:#dcfce7; color:#166534;}
.b-other  {background:#e5e7eb; color:#374151;}
.b-soon   {background:#fee2e2; color:#991b1b;}
.b-new    {background:#dbeafe; color:#1e40af;}
.tender-card a {text-decoration:none; font-weight:600;}
</style>
"""


def fmt_money(value: float | None) -> str:
    if value is None or pd.isna(value):
        return "—"
    return f"{value:,.2f} ₾".replace(",", " ")


def fmt_compact(value: float | None) -> str:
    if value is None or pd.isna(value):
        return "—"
    for limit, suffix in ((1e9, "მლრდ"), (1e6, "მლნ"), (1e3, "ათ.")):
        if abs(value) >= limit:
            return f"{value / limit:.2f} {suffix} ₾"
    return f"{value:.0f} ₾"


def fmt_dt(value) -> str:
    if value is None or pd.isna(value):
        return "—"
    return pd.Timestamp(value).strftime("%d.%m.%Y %H:%M")


def render_card(row: pd.Series, is_new: bool) -> str:
    deadline = row["ვადა"]
    badges = []
    status = row["სტატუსი"] or "უცნობი სტატუსი"
    badges.append(
        f'<span class="badge {"b-active" if row["_active"] else "b-other"}">{status}</span>'
    )
    if pd.notna(deadline):
        left = pd.Timestamp(deadline) - pd.Timestamp.now()
        if pd.Timedelta(0) <= left <= pd.Timedelta(days=3):
            hours = int(left.total_seconds() // 3600)
            badges.append(f'<span class="badge b-soon">⏰ დარჩა {hours} სთ</span>')
    if is_new:
        badges.append('<span class="badge b-new">ახალი</span>')

    title = (row["დასახელება"] or "—").replace("<", "&lt;")
    buyer = (row["შემსყიდველი"] or "—").replace("<", "&lt;")
    return f"""
<div class="tender-card">
  <div>{''.join(badges)}</div>
  <h4>{title}</h4>
  <div class="meta">🏛️ {buyer}</div>
  <div class="meta">#{row['ნომერი'] or row['ID']} · CPV {row['CPV'] or '—'}</div>
  <div class="price">{fmt_money(row['ფასი (GEL)'])}</div>
  <div class="meta">📅 ვადა: <b>{fmt_dt(deadline)}</b></div>
  <div class="meta"><a href="{row['ბმული']}" target="_blank">გახსნა საიტზე ↗</a></div>
</div>
"""


def sidebar_filters() -> dict:
    sb = st.sidebar
    sb.header("🔎 ფილტრები")

    keyword = sb.text_input("საკვანძო სიტყვა", placeholder="მაგ: კომპიუტერი, საწვავი, რემონტი")
    buyer = sb.text_input("შემსყიდველი (დასახელება ან ს/კ)", placeholder="მაგ: მერია ან 204521221")
    cpv = sb.text_input(
        "CPV კოდი(ები)", placeholder="მაგ: 45, 30213000",
        help="რამდენიმე კოდი გამოყავით მძიმით. საკმარისია კოდის დასაწყისი (მაგ. 45 = სამშენებლო სამუშაოები).",
    )

    sb.subheader("💰 სავარაუდო ღირებულება (GEL)")
    c1, c2 = sb.columns(2)
    price_min = c1.number_input("მინ.", min_value=0, value=0, step=1_000)
    price_max = c2.number_input("მაქს.", min_value=0, value=0, step=10_000, help="0 = შეზღუდვის გარეშე")

    sb.subheader("📌 სტატუსი")
    only_active = sb.toggle("მხოლოდ აქტიური (მიღება მიმდინარეობს)", value=True)
    ending_days = sb.slider("ვადა იწურება N დღეში (0 = ყველა)", 0, 30, 0)

    with sb.expander("⚙️ წამოღების პარამეტრები"):
        days_back = st.slider("გამოცხადებული ბოლო N დღეში", 3, 90, 30)
        max_pages = st.slider("მაქს. გვერდები საიტიდან", 1, 50, 10, help="მეტი გვერდი = მეტი ტენდერი, ნელი ჩატვირთვა")
        server_search = st.checkbox(
            "საკვანძო სიტყვით ძებნა საიტზევე", value=False,
            help="ჩართვისას სიტყვა იგზავნება საიტზე და ახალ მონაცემებს იწერს; გამორთვისას ფილტრი მყისიერია.",
        )
        demo = st.checkbox("დემო რეჟიმი (გამოგონილი მონაცემები)", value=False)

    if sb.button("🔄 მონაცემების განახლება", use_container_width=True):
        fetch_tenders.clear()
        st.toast("ქეში გასუფთავდა — მონაცემები ახლიდან იტვირთება")

    return dict(
        keyword=keyword.strip(), buyer=buyer.strip(), cpv=cpv.strip(),
        price_min=price_min, price_max=price_max, only_active=only_active,
        ending_days=ending_days, days_back=days_back, max_pages=max_pages,
        server_search=server_search, demo=demo,
    )


def apply_filters(df: pd.DataFrame, f: dict) -> pd.DataFrame:
    out = df.copy()
    out["_active"] = [is_active(s, d if pd.notna(d) else None) for s, d in zip(out["სტატუსი"], out["ვადა"])]

    if f["keyword"]:
        words = f["keyword"].lower().split()
        haystack = (out["დასახელება"].fillna("") + " " + out["ნომერი"].fillna("")).str.lower()
        for w in words:
            out = out[haystack.loc[out.index].str.contains(w, regex=False)]
    if f["buyer"]:
        out = out[out["შემსყიდველი"].fillna("").str.lower().str.contains(f["buyer"].lower(), regex=False)]
    if f["cpv"]:
        prefixes = tuple(c.strip() for c in re.split(r"[,\s;]+", f["cpv"]) if c.strip())
        out = out[out["CPV"].fillna("").str.startswith(prefixes)]
    if f["price_min"]:
        out = out[out["ფასი (GEL)"].fillna(0) >= f["price_min"]]
    if f["price_max"]:
        out = out[out["ფასი (GEL)"].fillna(0) <= f["price_max"]]
    if f["only_active"]:
        out = out[out["_active"]]
    if f["ending_days"]:
        now = pd.Timestamp.now()
        dl = pd.to_datetime(out["ვადა"])
        out = out[(dl >= now) & (dl <= now + pd.Timedelta(days=f["ending_days"]))]

    return out.sort_values("ვადა", na_position="last")


def main() -> None:
    st.set_page_config(page_title="ტენდერების მონიტორი", page_icon="📑", layout="wide")
    st.markdown(CSS, unsafe_allow_html=True)

    f = sidebar_filters()

    st.title("📑 სახელმწიფო შესყიდვების მონიტორი")
    st.caption(f"წყარო: [tenders.procurement.gov.ge]({BASE_URL}) · მონაცემები ქეშირდება 15 წუთით")

    try:
        with st.spinner("ტენდერები იტვირთება tenders.procurement.gov.ge-დან..."):
            if f["demo"]:
                df, loaded_at = demo_tenders()
            else:
                server_kw = f["keyword"] if f["server_search"] else ""
                df, loaded_at = fetch_tenders(server_kw, f["days_back"], f["max_pages"])
    except requests.RequestException as exc:
        st.error(
            "საიტთან დაკავშირება ვერ მოხერხდა. შეამოწმეთ ინტერნეტი ან სცადეთ მოგვიანებით.\n\n"
            f"დეტალები: `{exc}`"
        )
        st.info("ინტერფეისის სანახავად ჩართეთ **დემო რეჟიმი** გვერდითა პანელში (⚙️ წამოღების პარამეტრები).")
        st.stop()

    if f["demo"]:
        st.warning("დემო რეჟიმი: ნაჩვენებია გამოგონილი მონაცემები, არა რეალური ტენდერები.")

    if df.empty:
        st.warning(
            "საიტიდან ტენდერები ვერ წამოვიდა. შესაძლოა საიტის სტრუქტურა შეიცვალა ან "
            "მითითებულ პერიოდში განცხადება არ არის — გაზარდეთ დღეების რაოდენობა."
        )
        st.stop()

    # მონიტორინგი: რომელი ტენდერებია ახალი წინა ჩატვირთვასთან შედარებით
    current_ids = set(df["ID"])
    seen = st.session_state.get("seen_ids")
    new_ids = current_ids - seen if seen is not None else set()
    st.session_state["seen_ids"] = current_ids if seen is None else seen | current_ids
    if new_ids:
        st.toast(f"🆕 {len(new_ids)} ახალი ტენდერი წინა ჩატვირთვის შემდეგ")

    result = apply_filters(df, f)

    # --- KPI ბარათები ---
    now = pd.Timestamp.now()
    deadlines = pd.to_datetime(result["ვადა"])
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("ნაპოვნი ტენდერი", f"{len(result):,}".replace(",", " "), help=f"სულ წამოღებულია {len(df)}")
    k2.metric("ჯამური ღირებულება", fmt_compact(result["ფასი (GEL)"].sum()), help=fmt_money(result["ფასი (GEL)"].sum()))
    k3.metric("ვადა 3 დღეში", int(((deadlines >= now) & (deadlines <= now + pd.Timedelta(days=3))).sum()))
    k4.metric("განახლდა", loaded_at[-5:], help=loaded_at)

    if result.empty:
        st.info("ფილტრებს არცერთი ტენდერი არ შეესაბამება. სცადეთ ფილტრების შერბილება.")
        st.stop()

    # --- ექსპორტი ---
    export = export_frame(result[COLUMNS])
    stamp = datetime.now().strftime("%Y%m%d_%H%M")
    e1, e2, _ = st.columns([1, 1, 4])
    e1.download_button(
        "⬇️ Excel (.xlsx)", to_excel(export), f"tenders_{stamp}.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", use_container_width=True,
    )
    e2.download_button("⬇️ CSV", to_csv(export), f"tenders_{stamp}.csv", "text/csv", use_container_width=True)

    tab_cards, tab_table = st.tabs(["🗂️ ბარათები", "📋 ცხრილი"])

    with tab_cards:
        per_page = 12
        pages = max(1, -(-len(result) // per_page))
        page = st.number_input("გვერდი", 1, pages, 1, key="card_page") if pages > 1 else 1
        chunk = result.iloc[(page - 1) * per_page : page * per_page]
        cols = st.columns(3)
        for i, (_, row) in enumerate(chunk.iterrows()):
            cols[i % 3].markdown(render_card(row, row["ID"] in new_ids), unsafe_allow_html=True)
        st.caption(f"გვერდი {page} / {pages} · დალაგებულია ვადის მიხედვით (ჯერ ყველაზე ახლო)")

    with tab_table:
        st.dataframe(
            result[COLUMNS],
            hide_index=True,
            use_container_width=True,
            height=min(38 * (len(result) + 1), 640),
            column_config={
                "ID": st.column_config.NumberColumn("ID", format="%d"),
                "ფასი (GEL)": st.column_config.NumberColumn("ფასი (GEL)", format="%.2f ₾"),
                "გამოცხადდა": st.column_config.DatetimeColumn("გამოცხადდა", format="DD.MM.YYYY"),
                "ვადა": st.column_config.DatetimeColumn("ვადა", format="DD.MM.YYYY HH:mm"),
                "ბმული": st.column_config.LinkColumn("ბმული", display_text="გახსნა ↗"),
                "დასახელება": st.column_config.TextColumn("დასახელება", width="large"),
            },
        )


if __name__ == "__main__":
    main()
