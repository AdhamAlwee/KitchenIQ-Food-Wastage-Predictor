"""
KitchenIQ — Realistic Synthetic Sales Data Generator
=====================================================
Generates 5 years of daily cafeteria sales data for UTP
(Universiti Teknologi PETRONAS), Tronoh, Perak, Malaysia.

RULES APPLIED:
  - Long weekends (>2 days) => significantly fewer sales
  - Wednesday evening => slower business (student co-curricular programs)
  - Rainy days => reduced foot traffic
  - UTP academic calendar (semester peaks, exam slumps, semester breaks)
  - Malaysian public holidays + Perak state holidays
  - Ramadan / pre-Eid effects
  - Correlated weather (rainy days cluster realistically)
  - End-of-month budget fatigue for students
  - NO seed => realistic variance between runs
"""

import pandas as pd
import numpy as np
from datetime import date, timedelta
import os

START_DATE = date(2020, 1, 1)
END_DATE   = date(2024, 12, 31)
TRAIN_END  = date(2022, 12, 31)
OUTPUT_DIR = "/mnt/user-data/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

RNG = np.random.default_rng(seed=None)  # unseeded = realistic variance

# ── MENU ──────────────────────────────────────────────────────────────────────
# (name, meal_type, base_portions_per_100_pax, category)
MENU_ITEMS = [
    ("Nasi Lemak",          "breakfast", 35, "rice"),
    ("Roti Canai",          "breakfast", 28, "bread"),
    ("Mee Goreng Mamak",    "breakfast", 20, "noodles"),
    ("Toast & Eggs",        "breakfast", 15, "western"),
    ("Kuih Assorted",       "breakfast", 12, "snack"),
    ("Nasi Campur",         "lunch",     40, "rice"),
    ("Mee Goreng",          "lunch",     22, "noodles"),
    ("Nasi Ayam",           "lunch",     28, "rice"),
    ("Economy Rice",        "lunch",     30, "rice"),
    ("Burger / Sandwich",   "lunch",     12, "western"),
    ("Laksa",               "lunch",     18, "noodles"),
    ("Fried Rice",          "lunch",     20, "rice"),
    ("Nasi Campur",         "dinner",    35, "rice"),
    ("Char Kuey Teow",      "dinner",    22, "noodles"),
    ("Nasi Goreng Kampung", "dinner",    25, "rice"),
    ("Western Set",         "dinner",    15, "western"),
    ("Soup Noodles",        "dinner",    18, "noodles"),
    ("Roti Canai Dinner",   "dinner",    10, "bread"),
]

BASE_PAX = {"breakfast": 180, "lunch": 320, "dinner": 260}

DOW_NAMES = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
MEAL_PAX_FACTOR = {
    "breakfast": [0.85, 0.90, 0.88, 0.92, 0.78, 0.40, 0.35],
    "lunch":     [1.05, 1.08, 0.95, 1.10, 0.90, 0.45, 0.35],
    "dinner":    [0.90, 0.92, 0.70, 0.95, 1.05, 0.55, 0.45],
}

# ── MALAYSIAN PUBLIC HOLIDAYS ──────────────────────────────────────────────────
def get_holidays(start_year, end_year):
    h = set()
    fixed = [(1,1),(5,1),(8,31),(9,16),(12,25)]
    eid = {2020:[date(2020,5,24),date(2020,5,25)],
           2021:[date(2021,5,13),date(2021,5,14)],
           2022:[date(2022,5,2), date(2022,5,3)],
           2023:[date(2023,4,21),date(2023,4,22)],
           2024:[date(2024,4,10),date(2024,4,11)]}
    adha = {2020:date(2020,7,31),2021:date(2021,7,20),2022:date(2022,7,9),
            2023:date(2023,6,28),2024:date(2024,6,16)}
    maulidur = {2020:date(2020,10,29),2021:date(2021,10,19),2022:date(2022,10,8),
                2023:date(2023,9,27),2024:date(2024,9,15)}
    nuzul = {2020:date(2020,5,11),2021:date(2021,4,30),2022:date(2022,4,19),
             2023:date(2023,4,8),2024:date(2024,3,27)}
    thaipusam = {2020:date(2020,2,8),2021:date(2021,1,28),2022:date(2022,1,18),
                 2023:date(2023,2,5),2024:date(2024,1,25)}
    wesak = {2020:date(2020,5,7),2021:date(2021,5,26),2022:date(2022,5,15),
             2023:date(2023,5,4),2024:date(2024,5,22)}
    cny = {2020:[date(2020,1,25),date(2020,1,26)],2021:[date(2021,2,12),date(2021,2,13)],
           2022:[date(2022,2,1),date(2022,2,2)],2023:[date(2023,1,22),date(2023,1,23)],
           2024:[date(2024,2,10),date(2024,2,11)]}
    deepavali = {2020:date(2020,11,14),2021:date(2021,11,4),2022:date(2022,10,24),
                 2023:date(2023,11,12),2024:date(2024,10,31)}

    for yr in range(start_year, end_year+1):
        for m,d in fixed:
            h.add(date(yr,m,d))
        h.add(date(yr,11,3))   # Perak Sultan Birthday
        for d in eid.get(yr,[]): h.add(d)
        if yr in adha:     h.add(adha[yr])
        if yr in maulidur: h.add(maulidur[yr])
        if yr in nuzul:    h.add(nuzul[yr])
        if yr in thaipusam:h.add(thaipusam[yr])
        if yr in wesak:    h.add(wesak[yr])
        for d in cny.get(yr,[]): h.add(d)
        if yr in deepavali:h.add(deepavali[yr])
    return h

# ── RAMADAN ───────────────────────────────────────────────────────────────────
RAMADAN = {
    2020:(date(2020,4,24),date(2020,5,23)),
    2021:(date(2021,4,13),date(2021,5,12)),
    2022:(date(2022,4,2), date(2022,5,1)),
    2023:(date(2023,3,23),date(2023,4,20)),
    2024:(date(2024,3,11),date(2024,4,9)),
}
def is_ramadan(d): 
    p=RAMADAN.get(d.year)
    return p and p[0]<=d<=p[1]

# ── EID EXODUS (week before Eid) ──────────────────────────────────────────────
def days_to_eid(d):
    eid_dates = [date(2020,5,24),date(2021,5,13),date(2022,5,2),
                 date(2023,4,21),date(2024,4,10)]
    for eid in eid_dates:
        diff = (eid - d).days
        if 0 < diff <= 6:
            return diff
    return None

# ── WEATHER (correlated, Perak monsoon pattern) ───────────────────────────────
RAIN_PROB = {1:0.40,2:0.35,3:0.30,4:0.32,5:0.25,6:0.22,
             7:0.22,8:0.25,9:0.30,10:0.38,11:0.45,12:0.48}

def simulate_weather(dates):
    result = []
    prev_rainy = False
    for d in dates:
        base = RAIN_PROB[d.month]
        prob = min(0.85, base * (1.6 if prev_rainy else 0.7))
        r = RNG.random()
        if r < prob:
            w = "rainy"; prev_rainy = True
        elif r < prob + 0.25:
            w = "cloudy"; prev_rainy = False
        else:
            w = "sunny"; prev_rainy = False
        result.append(w)
    return result

# ── LONG WEEKEND DETECTOR ─────────────────────────────────────────────────────
def find_long_weekends(all_dates, holidays):
    non_work = {d for d in all_dates if d.weekday()>=5 or d in holidays}
    lw = set()
    run, prev = [], None
    for d in sorted(non_work):
        if prev and (d-prev).days==1:
            run.append(d)
        else:
            if len(run)>=3:
                lw.update(run)
                lw.add(run[0]-timedelta(1))
                lw.add(run[-1]+timedelta(1))
            run=[d]
        prev=d
    if len(run)>=3:
        lw.update(run)
        lw.add(run[0]-timedelta(1))
        lw.add(run[-1]+timedelta(1))
    return lw

# ── ACADEMIC CALENDAR ─────────────────────────────────────────────────────────
def academic_status(d):
    m = d.month
    if m in [1,2,3]:          return "semester_active"
    if m==4 and d.day>=15:    return "exam_period"
    if m==4:                  return "semester_active"
    if m==5:                  return "short_semester"
    if m in [6,7,8,9]:        return "semester_active"
    if m==10 and d.day>=15:   return "exam_period"
    if m==10:                 return "semester_active"
    return "semester_break"  # Nov, Dec

# ── MULTIPLIER ENGINE ─────────────────────────────────────────────────────────
def compute_multiplier(d, weather, holidays, long_weekends):
    m = 1.0
    factors = []
    dow = d.weekday()

    # Wednesday co-curricular
    if dow == 2:
        m *= 0.88
        factors.append("Wednesday co-curricular activities (CCA)")

    # Weather
    if weather == "rainy":
        rf = RNG.uniform(0.68, 0.80)
        m *= rf
        factors.append(f"rainy weather (students prefer online/self-cook, -{round((1-rf)*100)}%)")
    elif weather == "cloudy":
        m *= RNG.uniform(0.92, 0.97)

    # Public holiday
    if d in holidays:
        m *= 0.10
        factors.append("public holiday (campus near-empty)")
    elif d in long_weekends:
        lf = RNG.uniform(0.38, 0.58)
        m *= lf
        factors.append(f"long weekend effect (many students leave campus, -{round((1-lf)*100)}%)")

    # Academic
    ac = academic_status(d)
    if ac == "semester_break":
        bf = RNG.uniform(0.15, 0.28)
        m *= bf
        factors.append(f"semester break (very low campus population, -{round((1-bf)*100)}%)")
    elif ac == "exam_period":
        ef = RNG.uniform(0.72, 0.88)
        m *= ef
        factors.append(f"exam period (irregular eating patterns, -{round((1-ef)*100)}%)")
    elif ac == "short_semester":
        sf = RNG.uniform(0.58, 0.72)
        m *= sf
        factors.append(f"short semester (reduced student intake, -{round((1-sf)*100)}%)")

    # Ramadan
    if is_ramadan(d) and dow < 5:
        m *= 0.65
        factors.append("Ramadan fasting month (breakfast/lunch demand drops)")

    # Pre-Eid exodus
    eid_days = days_to_eid(d)
    if eid_days:
        ef2 = RNG.uniform(0.40, 0.65)
        m *= ef2
        factors.append(f"pre-Eid exodus ({eid_days} days before Eid, -{round((1-ef2)*100)}%)")

    # End-of-month budget fatigue
    if d.day >= 25:
        m *= RNG.uniform(0.88, 0.96)
        factors.append("end-of-month student budget fatigue")

    # Natural noise
    noise = RNG.normal(1.0, 0.045)
    m *= max(0.5, min(1.5, noise))

    context = "; ".join(factors) if factors else "normal operating day — no significant demand modifiers"
    return max(0.05, m), context, ac

# ── GENERATE ──────────────────────────────────────────────────────────────────
def generate():
    print("Building date list...")
    all_dates = []
    d = START_DATE
    while d <= END_DATE:
        all_dates.append(d)
        d += timedelta(days=1)

    holidays    = get_holidays(START_DATE.year, END_DATE.year)
    long_wknds  = find_long_weekends(all_dates, holidays)
    weather_map = dict(zip(all_dates, simulate_weather(all_dates)))

    print(f"Dates: {len(all_dates)} | Holidays: {len(holidays)} | Long-wknd dates: {len(long_wknds)}")
    print("Generating rows...")

    rows = []
    for d in all_dates:
        dow_idx  = d.weekday()
        dow_name = DOW_NAMES[dow_idx]
        weather  = weather_map[d]
        mult, context, ac_status = compute_multiplier(d, weather, holidays, long_wknds)

        for menu_item, meal_type, base_per_100, category in MENU_ITEMS:
            if dow_idx == 6 and category == "western":
                continue  # western stall closed Sundays

            base_pax   = BASE_PAX[meal_type]
            pax_factor = MEAL_PAX_FACTOR[meal_type][dow_idx]
            exp_pax    = int(base_pax * pax_factor)

            # Wednesday dinner: extra CCA cut
            if dow_idx == 2 and meal_type == "dinner":
                exp_pax = int(exp_pax * 0.68)

            raw = (base_per_100 / 100) * exp_pax * mult
            raw *= RNG.normal(1.0, 0.055)   # item-level variance
            portions = max(1, round(raw))

            # Concise context for this specific prediction
            base_context = (
                f"Base demand: {base_per_100} portions per 100 pax | "
                f"Expected pax: {exp_pax} | "
                f"Demand multiplier: {mult:.2f} | "
                f"Factors: {context}"
            )

            rows.append({
                "date":               d.isoformat(),
                "day_of_week":        dow_name,
                "week_number":        d.isocalendar()[1],
                "month":              d.month,
                "year":               d.year,
                "menu_item":          menu_item,
                "meal_type":          meal_type,
                "food_category":      category,
                "expected_pax":       exp_pax,
                "actual_portions":    portions,
                "weather":            weather,
                "academic_status":    ac_status,
                "is_public_holiday":  int(d in holidays),
                "is_long_weekend":    int(d in long_wknds),
                "is_wednesday_eve":   int(dow_idx == 2 and meal_type == "dinner"),
                "is_exam_period":     int(ac_status == "exam_period"),
                "is_semester_break":  int(ac_status == "semester_break"),
                "is_ramadan":         int(bool(is_ramadan(d))),
                "is_end_of_month":    int(d.day >= 25),
                "demand_multiplier":  round(mult, 4),
                "prediction_context": base_context,
                "split":              "train" if d <= TRAIN_END else "test",
            })

    return pd.DataFrame(rows)

# ── SAVE & REPORT ──────────────────────────────────────────────────────────────
def save_and_report(df):
    df.to_csv(f"{OUTPUT_DIR}/kitcheniq_sales_full.csv", index=False)
    df[df.split=="train"].to_csv(f"{OUTPUT_DIR}/kitcheniq_sales_train.csv", index=False)
    df[df.split=="test"].to_csv(f"{OUTPUT_DIR}/kitcheniq_sales_test.csv", index=False)

    print("\n" + "="*62)
    print("  KITCHENIQ SYNTHETIC DATA — SUMMARY REPORT")
    print("="*62)
    print(f"  Total rows          : {len(df):,}")
    print(f"  Training rows       : {len(df[df.split=='train']):,}  (2020–2022)")
    print(f"  Testing rows        : {len(df[df.split=='test']):,}  (2023–2024)")
    print(f"  Unique menu items   : {df.menu_item.nunique()}")

    # Rule verification
    print("\n  RULE VERIFICATION:")
    lunch = df[(df.meal_type=="lunch") & (df.is_semester_break==0) & (df.is_public_holiday==0)]
    rainy = lunch[lunch.weather=="rainy"]["actual_portions"].mean()
    sunny = lunch[lunch.weather=="sunny"]["actual_portions"].mean()
    print(f"  Rainy vs Sunny lunch  : {rainy:.1f} vs {sunny:.1f} ({(1-rainy/sunny)*100:.1f}% drop on rainy)")

    dinner = df[(df.meal_type=="dinner") & (df.is_semester_break==0) & (df.is_public_holiday==0)]
    wed   = dinner[dinner.day_of_week=="wednesday"]["actual_portions"].mean()
    other = dinner[dinner.day_of_week!="wednesday"]["actual_portions"].mean()
    print(f"  Wed vs other dinners  : {wed:.1f} vs {other:.1f} ({(1-wed/other)*100:.1f}% drop Wednesday)")

    normal = df[(df.is_public_holiday==0) & (df.is_semester_break==0) & (df.is_long_weekend==0)]
    lw     = df[(df.is_long_weekend==1)   & (df.is_semester_break==0)]
    norm_avg = normal["actual_portions"].mean()
    lw_avg   = lw["actual_portions"].mean()
    print(f"  Long wknd vs normal   : {lw_avg:.1f} vs {norm_avg:.1f} ({(1-lw_avg/norm_avg)*100:.1f}% drop long weekend)")

    print("\n  SAMPLE PREDICTION CONTEXTS:")
    sample = df[df.prediction_context.str.contains("rainy|long weekend|Ramadan", na=False)].head(3)
    for _, row in sample.iterrows():
        print(f"  [{row.date}] {row.menu_item} ({row.meal_type}): {row.actual_portions} portions")
        print(f"    → {row.prediction_context[:120]}...")
        print()

    print(f"  Files saved to: {OUTPUT_DIR}/")
    print("="*62)

if __name__ == "__main__":
    print("KitchenIQ Synthetic Data Generator starting...")
    df = generate()
    save_and_report(df)
    print("\nDone! Check your outputs folder.")
