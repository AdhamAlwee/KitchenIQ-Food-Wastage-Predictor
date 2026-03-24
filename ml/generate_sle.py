"""
KitchenIQ — Shelf Life Expectancy (SLE) Synthetic Data Generator
=================================================================
Generates realistic ingredient delivery and spoilage logs
based on real UTP cafeteria ingredient list, storage setup,
and purchasing patterns provided.

OUTPUT COLUMNS:
  - delivery_id, ingredient_name, category, purchase_frequency
  - storage_type, delivery_date, quantity_delivered
  - actual_days_lasted (TARGET — what model predicts)
  - spoilage_reason, season, weather_condition
  - was_opened_same_day, days_until_expiry_label
  - alert_level (Green/Yellow/Red)
"""

import pandas as pd
import numpy as np
from datetime import date, timedelta
import os

OUTPUT_DIR = "/mnt/user-data/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

RNG = np.random.default_rng(seed=None)

START_DATE = date(2020, 1, 1)
END_DATE   = date(2024, 12, 31)

# ─── INGREDIENT MASTER LIST ───────────────────────────────────────────────────
# (name, category, storage, base_shelf_days, shelf_day_range,
#  purchase_freq_days, typical_qty, qty_unit, spoilage_factors)
#
# base_shelf_days = average days it lasts under normal conditions
# shelf_day_range = (min, max) realistic variance
# purchase_freq_days = how often it is purchased
# typical_qty = average delivery quantity
# qty_unit = kg / pieces / litres / packets

INGREDIENTS = [
    # ── DAILY PURCHASES ────────────────────────────────────────────────────────
    {
        "name": "Chicken (Fresh)",
        "category": "protein",
        "storage": "fridge",
        "purchase_freq": 1,
        "base_shelf_days": 2,
        "shelf_range": (1, 3),
        "typical_qty": 8.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "improper_handling"],
    },
    {
        "name": "Fish (Mackerel)",
        "category": "protein",
        "storage": "fridge",
        "purchase_freq": 1,
        "base_shelf_days": 2,
        "shelf_range": (1, 3),
        "typical_qty": 5.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "improper_handling"],
    },
    {
        "name": "Coconut Milk (Fresh)",
        "category": "dairy_alt",
        "storage": "fridge",
        "purchase_freq": 1,
        "base_shelf_days": 1,
        "shelf_range": (1, 2),
        "typical_qty": 3.0,
        "qty_unit": "litres",
        "risk_factors": ["high_temp", "opened_packaging"],
    },
    {
        "name": "Bean Sprouts",
        "category": "vegetable",
        "storage": "fridge",
        "purchase_freq": 2,
        "base_shelf_days": 3,
        "shelf_range": (2, 5),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "moisture"],
    },
    {
        "name": "Cabbage",
        "category": "vegetable",
        "storage": "fridge",
        "purchase_freq": 2,
        "base_shelf_days": 5,
        "shelf_range": (3, 7),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "moisture"],
    },
    {
        "name": "Bok Choy (Pok Choy)",
        "category": "vegetable",
        "storage": "fridge",
        "purchase_freq": 2,
        "base_shelf_days": 4,
        "shelf_range": (2, 6),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "moisture"],
    },
    {
        "name": "Laksa Noodles (Fresh)",
        "category": "noodles_fresh",
        "storage": "fridge",
        "purchase_freq": 2,
        "base_shelf_days": 2,
        "shelf_range": (1, 3),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "opened_packaging"],
    },
    {
        "name": "Bread / Burger Buns",
        "category": "bakery",
        "storage": "dry_rack",
        "purchase_freq": 2,
        "base_shelf_days": 3,
        "shelf_range": (2, 4),
        "typical_qty": 4.0,
        "qty_unit": "packets",
        "risk_factors": ["humidity", "opened_packaging"],
    },
    {
        "name": "Tofu",
        "category": "protein_alt",
        "storage": "fridge",
        "purchase_freq": 3,
        "base_shelf_days": 4,
        "shelf_range": (2, 7),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "opened_packaging"],
    },
    {
        "name": "Cucumber",
        "category": "vegetable",
        "storage": "fridge",
        "purchase_freq": 3,
        "base_shelf_days": 7,
        "shelf_range": (5, 10),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["moisture", "high_temp"],
    },
    # ── WEEKLY PURCHASES ───────────────────────────────────────────────────────
    {
        "name": "Eggs",
        "category": "protein",
        "storage": "fridge",
        "purchase_freq": 7,
        "base_shelf_days": 28,
        "shelf_range": (21, 35),
        "typical_qty": 30.0,
        "qty_unit": "trays",
        "risk_factors": ["cracked_shells", "high_temp"],
    },
    {
        "name": "Yellow Noodles (Dried)",
        "category": "noodles_dry",
        "storage": "dry_rack",
        "purchase_freq": 7,
        "base_shelf_days": 180,
        "shelf_range": (120, 240),
        "typical_qty": 5.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "pests"],
    },
    {
        "name": "Rice",
        "category": "staple",
        "storage": "dry_rack",
        "purchase_freq": 10,
        "base_shelf_days": 270,
        "shelf_range": (180, 365),
        "typical_qty": 25.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "pests"],
    },
    {
        "name": "Wheat Flour",
        "category": "staple",
        "storage": "dry_rack",
        "purchase_freq": 10,
        "base_shelf_days": 240,
        "shelf_range": (180, 300),
        "typical_qty": 10.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "pests"],
    },
    {
        "name": "Cooking Oil",
        "category": "condiment",
        "storage": "dry_rack",
        "purchase_freq": 10,
        "base_shelf_days": 365,
        "shelf_range": (270, 450),
        "typical_qty": 10.0,
        "qty_unit": "litres",
        "risk_factors": ["light_exposure", "opened_packaging"],
    },
    {
        "name": "Garlic",
        "category": "vegetable",
        "storage": "dry_rack",
        "purchase_freq": 7,
        "base_shelf_days": 21,
        "shelf_range": (14, 30),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "moisture"],
    },
    {
        "name": "Onion",
        "category": "vegetable",
        "storage": "dry_rack",
        "purchase_freq": 7,
        "base_shelf_days": 28,
        "shelf_range": (21, 40),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "moisture"],
    },
    {
        "name": "Butter / Margarine",
        "category": "dairy",
        "storage": "fridge",
        "purchase_freq": 7,
        "base_shelf_days": 30,
        "shelf_range": (21, 45),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "opened_packaging"],
    },
    {
        "name": "Chilli Paste (Fresh)",
        "category": "condiment_fresh",
        "storage": "fridge",
        "purchase_freq": 4,
        "base_shelf_days": 5,
        "shelf_range": (3, 7),
        "typical_qty": 2.0,
        "qty_unit": "kg",
        "risk_factors": ["high_temp", "opened_packaging"],
    },
    # ── MONTHLY PURCHASES ──────────────────────────────────────────────────────
    {
        "name": "Sugar",
        "category": "staple",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 730,
        "shelf_range": (540, 900),
        "typical_qty": 10.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "moisture"],
    },
    {
        "name": "Salt",
        "category": "staple",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 1825,
        "shelf_range": (1000, 3650),
        "typical_qty": 5.0,
        "qty_unit": "kg",
        "risk_factors": ["moisture"],
    },
    {
        "name": "Soy Sauce (Bottled)",
        "category": "condiment",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 540,
        "shelf_range": (365, 730),
        "typical_qty": 6.0,
        "qty_unit": "bottles",
        "risk_factors": ["opened_packaging", "light_exposure"],
    },
    {
        "name": "Chilli Sauce (Bottled)",
        "category": "condiment",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 365,
        "shelf_range": (270, 540),
        "typical_qty": 6.0,
        "qty_unit": "bottles",
        "risk_factors": ["opened_packaging"],
    },
    {
        "name": "Peanuts (Roasted)",
        "category": "dry_goods",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 60,
        "shelf_range": (45, 90),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "opened_packaging"],
    },
    {
        "name": "Anchovies (Ikan Bilis)",
        "category": "dry_goods",
        "storage": "dry_rack",
        "purchase_freq": 30,
        "base_shelf_days": 120,
        "shelf_range": (90, 180),
        "typical_qty": 3.0,
        "qty_unit": "kg",
        "risk_factors": ["humidity", "pests"],
    },
    {
        "name": "Milk (UHT)",
        "category": "dairy",
        "storage": "dry_rack",
        "purchase_freq": 14,
        "base_shelf_days": 180,
        "shelf_range": (150, 210),
        "typical_qty": 12.0,
        "qty_unit": "litres",
        "risk_factors": ["opened_packaging", "high_temp"],
    },
    {
        "name": "Cheese (Sliced)",
        "category": "dairy",
        "storage": "fridge",
        "purchase_freq": 14,
        "base_shelf_days": 21,
        "shelf_range": (14, 30),
        "typical_qty": 1.0,
        "qty_unit": "kg",
        "risk_factors": ["opened_packaging", "high_temp"],
    },
]

# ─── WEATHER (Perak monthly rain probability) ──────────────────────────────────
RAIN_PROB = {1:0.40,2:0.35,3:0.30,4:0.32,5:0.25,6:0.22,
             7:0.22,8:0.25,9:0.30,10:0.38,11:0.45,12:0.48}

def get_weather(d):
    p = RAIN_PROB[d.month]
    r = RNG.random()
    if r < p:            return "rainy"
    elif r < p + 0.25:   return "cloudy"
    else:                return "sunny"

def get_season(d):
    # Perak seasons based on monsoon
    if d.month in [11, 12, 1, 2]:  return "wet_season"
    elif d.month in [5, 6, 7, 8]:  return "dry_season"
    else:                           return "transition"

# ─── SHELF LIFE MODIFIER ──────────────────────────────────────────────────────
def compute_actual_shelf_life(ingredient, delivery_date, weather):
    """
    Compute realistic shelf life with contextual modifiers.
    Returns (actual_days_lasted, spoilage_reason)
    """
    base   = ingredient["base_shelf_days"]
    lo, hi = ingredient["shelf_range"]
    # Start with random within realistic range
    days = RNG.uniform(lo, hi)

    spoilage_reason = "normal_usage"
    risk_factors    = ingredient["risk_factors"]
    storage         = ingredient["storage"]

    # Weather effect on storage
    if weather == "rainy" and "humidity" in risk_factors:
        days *= RNG.uniform(0.75, 0.92)
        spoilage_reason = "humidity_spoilage"
    if weather == "rainy" and "moisture" in risk_factors:
        days *= RNG.uniform(0.80, 0.95)

    # Hot season increases spoilage for fridge items
    season = get_season(delivery_date)
    if season == "dry_season" and storage == "fridge":
        days *= RNG.uniform(0.85, 0.98)  # fridge works harder
        if "high_temp" in risk_factors:
            days *= RNG.uniform(0.80, 0.95)
            spoilage_reason = "heat_spoilage"

    # Random improper handling events (~20% chance)
    if RNG.random() < 0.20 and "improper_handling" in risk_factors:
        days *= RNG.uniform(0.40, 0.70)
        spoilage_reason = "improper_handling"

    # Opened packaging effect (~30% of deliveries opened same day)
    was_opened = RNG.random() < 0.30
    if was_opened and "opened_packaging" in risk_factors:
        if base > 30:   # long shelf items — big reduction when opened
            days *= RNG.uniform(0.20, 0.40)
        else:           # short shelf — moderate reduction
            days *= RNG.uniform(0.70, 0.90)
        spoilage_reason = "opened_packaging"

    # Pests for dry goods (~18% chance)
    if RNG.random() < 0.18 and "pests" in risk_factors:
        days *= RNG.uniform(0.30, 0.60)
        spoilage_reason = "pest_contamination"

    actual = max(1, round(days))
    return actual, spoilage_reason, was_opened


# ─── ALERT LEVEL ──────────────────────────────────────────────────────────────
def get_alert_level(days_remaining, base_shelf):
    """
    Red   = expires in ≤20% of shelf life remaining
    Yellow = ≤40% remaining
    Green  = >40% remaining
    """
    pct = days_remaining / base_shelf if base_shelf > 0 else 0
    if pct <= 0.25:   return "RED"
    elif pct <= 0.50: return "YELLOW"
    else:             return "GREEN"


# ─── GENERATE DELIVERY LOGS ───────────────────────────────────────────────────
def generate():
    print("Generating SLE delivery logs...")
    rows = []
    delivery_id = 1

    for ingredient in INGREDIENTS:
        name     = ingredient["name"]
        freq     = ingredient["purchase_freq"]
        storage  = ingredient["storage"]
        base     = ingredient["base_shelf_days"]
        category = ingredient["category"]

        # Simulate deliveries across 5 years
        d = START_DATE
        while d <= END_DATE:
            weather      = get_weather(d)
            season       = get_season(d)

            # Quantity with ±20% realistic variance
            qty = round(ingredient["typical_qty"] * RNG.uniform(0.80, 1.20), 2)

            # Compute shelf life
            actual_days, spoilage_reason, was_opened = compute_actual_shelf_life(
                ingredient, d, weather)

            expiry_date    = d + timedelta(days=actual_days)
            days_remaining = actual_days  # at time of delivery

            # Simulate that some deliveries are NOT day-1 fresh
            # (stock sitting in store before being logged)
            days_already_used = 0
            if RNG.random() < 0.35:   # 35% of stock has been sitting
                max_used = max(1, int(actual_days * 0.60))
                days_already_used = RNG.integers(1, max(2, max_used))
            days_remaining_now = max(1, actual_days - days_already_used)

            # Alert level at delivery
            alert = get_alert_level(days_remaining_now, base)

            # Days until expiry label (for classification use)
            if actual_days <= 2:         expiry_label = "expires_1_2_days"
            elif actual_days <= 5:       expiry_label = "expires_3_5_days"
            elif actual_days <= 14:      expiry_label = "expires_1_2_weeks"
            elif actual_days <= 30:      expiry_label = "expires_this_month"
            else:                        expiry_label = "long_shelf_life"


            # Per unit consumption rate (how much used per day based on recipes)
            # rough daily usage in same unit
            daily_usage = round(qty / max(actual_days, 1) * RNG.uniform(0.8, 1.2), 3)

            split = "train" if d.year <= 2022 else "test"

            rows.append({
                "delivery_id":          delivery_id,
                "ingredient_name":      name,
                "category":             category,
                "storage_type":         storage,
                "purchase_frequency":   f"every_{freq}_days",
                "delivery_date":        d.isoformat(),
                "delivery_month":       d.month,
                "delivery_year":        d.year,
                "season":               season,
                "weather_on_delivery":  weather,
                "quantity_delivered":   qty,
                "quantity_unit":        ingredient["qty_unit"],
                "was_opened_same_day":  int(was_opened),
                "estimated_daily_usage":daily_usage,
                "base_shelf_days":      base,
                "actual_days_lasted":   actual_days,   # ← TARGET
                "expiry_date":          expiry_date.isoformat(),
                "days_remaining_label": expiry_label,
                "spoilage_reason":      spoilage_reason,
                "alert_level":          alert,
                "split":                split,
            })

            delivery_id += 1
            # Next delivery date
            next_days = max(1, int(freq * RNG.uniform(0.85, 1.15)))
            d += timedelta(days=next_days)

    return pd.DataFrame(rows)


# ─── SAVE & REPORT ────────────────────────────────────────────────────────────
def save_and_report(df):
    df.to_csv(f"{OUTPUT_DIR}/kitcheniq_sle_v2_full.csv",  index=False)
    df[df.split=="train"].to_csv(f"{OUTPUT_DIR}/kitcheniq_sle_v2_train.csv", index=False)
    df[df.split=="test"].to_csv(f"{OUTPUT_DIR}/kitcheniq_sle_v2_test.csv",   index=False)

    print("\n" + "="*65)
    print("  KITCHENIQ SLE DATA — SUMMARY")
    print("="*65)
    print(f"  Total delivery logs  : {len(df):,}")
    print(f"  Training rows        : {len(df[df.split=='train']):,}  (2020–2022)")
    print(f"  Testing rows         : {len(df[df.split=='test']):,}  (2023–2024)")
    print(f"  Unique ingredients   : {df.ingredient_name.nunique()}")

    print("\n  AVERAGE SHELF LIFE BY STORAGE TYPE:")
    print(df.groupby("storage_type")["actual_days_lasted"]
            .agg(["mean","min","max"]).round(1).to_string())

    print("\n  SPOILAGE REASONS:")
    print(df["spoilage_reason"].value_counts().to_string())

    print("\n  ALERT LEVEL DISTRIBUTION:")
    print(df["alert_level"].value_counts().to_string())

    print("\n  SAMPLE ROWS (perishables):")
    sample = df[df.storage_type=="fridge"][
        ["ingredient_name","actual_days_lasted","alert_level",
         "spoilage_reason","weather_on_delivery"]].head(6)
    print(sample.to_string(index=False))
    print(f"\n  Files saved to: {OUTPUT_DIR}/")
    print("="*65)


if __name__ == "__main__":
    print("KitchenIQ SLE Data Generator")
    #print(str(days_remaining_now))
    df = generate()
    save_and_report(df)
    print("Done!")
