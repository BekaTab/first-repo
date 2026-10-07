import pytest

from scraper.models import Vehicle
from scraper.parsing import (
    dedupe_vehicles,
    extract_vehicles_from_json,
    find_vins,
    is_masked_vin,
    is_timed,
    parse_listing_text,
    parse_money,
    parse_reserve_price,
    parse_title,
    vin_check_digit_ok,
)


def test_find_vins_ignores_non_vins_and_dedupes():
    text = "VIN: 1HGCM82633A004352 id 12345678901234567 again 1hgcm82633a004352 OOOOOOOOOOOOOOOOO"
    assert find_vins(text) == ["1HGCM82633A004352"]


def test_masked_vin_is_detected():
    [vin] = find_vins("VIN 1HGCM82633A******")
    assert is_masked_vin(vin)


def test_check_digit():
    assert vin_check_digit_ok("1HGCM82633A004352")
    assert not vin_check_digit_ok("1HGCM82643A004352")


@pytest.mark.parametrize(
    "title, expected",
    [
        ("2018 TOYOTA CAMRY SE", (2018, "TOYOTA", "CAMRY SE")),
        ("2020 Land Rover Range Rover Sport HSE", (2020, "LAND ROVER", "RANGE ROVER SPORT HSE")),
        ("2015 MERCEDES-BENZ C 300", (2015, "MERCEDES-BENZ", "C 300")),
        ("2021 TESLA", (2021, "TESLA", None)),
        ("Stock#: 123456", (None, None, None)),
    ],
)
def test_parse_title(title, expected):
    assert parse_title(title) == expected


@pytest.mark.parametrize(
    "text, expected",
    [("$7,250", 7250.0), ("USD 1,200.50", 1200.5), ("12 500 $", 12500.0), ("no money", None)],
)
def test_parse_money(text, expected):
    assert parse_money(text) == expected


@pytest.mark.parametrize(
    "text, expected",
    [
        ("Reserve price: $8,400\nFinal bid: $7,000", 8400.0),
        ("Final bid\n$6,900\nReserve price\n$7,250", 7250.0),           # label / value on next line
        ("Reserve: not available\nFinal bid $12,000", None),             # don't grab the bid
        ("Reserve not met\n$5,000", None),
        ("Резервная цена: 9 300 $", 9300.0),
        ("Nothing here", None),
    ],
)
def test_parse_reserve_price(text, expected):
    assert parse_reserve_price(text) == expected


def test_parse_listing_text_uses_card_state():
    text = """
    2018 TOYOTA CAMRY SE
    Stock#: 34567890
    VIN: 4T1B11HK5JU123456
    Timed Auction
    2020 LAND ROVER RANGE ROVER SPORT HSE
    VIN: SALWR2RV0LA700001
    Live Auction
    """
    camry, rover = parse_listing_text(text)
    assert (camry.year, camry.make, camry.model, camry.lot_number) == (2018, "TOYOTA", "CAMRY SE", "34567890")
    assert camry.auction_type == "Timed Auction" and is_timed(camry)
    assert rover.make == "LAND ROVER" and rover.lot_number is None
    assert not is_timed(rover)


def test_extract_vehicles_from_nested_json():
    payload = {"data": {"vehicles": [
        {"VIN": "1FTEW1EP7JFA00003", "Year": "2018", "MakeDesc": "Ford", "ModelDesc": "F-150", "StockNumber": 1234567},
        {"vin": "5YJ3E1EA7KF000004", "YearMakeModel": "2019 TESLA MODEL 3"},
        {"vin": "not-a-vin"},
    ]}}
    ford, tesla = extract_vehicles_from_json(payload)
    assert (ford.year, ford.make, ford.model, ford.lot_number) == (2018, "FORD", "F-150", "1234567")
    assert (tesla.year, tesla.make, tesla.model) == (2019, "TESLA", "MODEL 3")


def test_dedupe_merges_fields():
    a = Vehicle("1FTEW1EP7JFA00003", year=2018, make="FORD")
    b = Vehicle("1FTEW1EP7JFA00003", model="F-150", lot_number="1", auction_date="2026-10-09")
    [merged] = dedupe_vehicles([a, b])
    assert (merged.year, merged.make, merged.model, merged.lot_number) == (2018, "FORD", "F-150", "1")


def test_parse_listing_text_single_line_card():
    [v] = parse_listing_text("2015 MERCEDES-BENZ C 300 Stock#: 34567892 VIN: 55SWF4JB1FU000002 Timed Auction")
    assert (v.year, v.make, v.model, v.lot_number, v.auction_type) == (
        2015, "MERCEDES-BENZ", "C 300", "34567892", "Timed Auction")
