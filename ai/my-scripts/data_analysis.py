import csv
from pathlib import Path
from collections import Counter


# ============================================================
# BuildCores OpenDB - DATA ANALYSIS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------
# SOURCE DATA
# ------------------------------------------------------------
# Component CSV อยู่ใน normalized
INPUT_DIR = ROOT / "data" / "processed" / "normalized"

# Validation report อยู่ใน validated
VALIDATED_DIR = ROOT / "data" / "processed" / "validated"

# Analysis output
OUTPUT_DIR = ROOT / "data" / "processed" / "analysis"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


FILES = {
    "CPU": "cpu.csv",
    "GPU": "gpu.csv",
    "RAM": "ram.csv",
    "Motherboard": "motherboard.csv",
    "PSU": "psu.csv",
    "Cooler": "cpu_cooler.csv",
    "Case": "pc_case.csv",
    "Storage": "storage.csv",
}


# ============================================================
# HELPERS
# ============================================================

EMPTY_VALUES = {
    "",
    "nan",
    "none",
    "null",
    "n/a",
    "na",
    "-",
}


def clean(value):
    if value is None:
        return ""

    value = str(value).strip()

    if value.lower() in EMPTY_VALUES:
        return ""

    return value


def to_float(value):
    value = clean(value)

    if not value:
        return None

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


# ============================================================
# LOAD CSV
# ============================================================

def load_csv_from(directory, filename):
    """
    โหลด CSV จาก directory ที่กำหนด

    ตัวอย่าง:
        load_csv_from(INPUT_DIR, "cpu.csv")
    """

    path = directory / filename

    if not path.exists():
        print(f"❌ ไม่พบไฟล์: {path}")
        return []

    try:

        with open(
            path,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            reader = csv.DictReader(f)

            return list(reader)

    except Exception as e:

        print(f"❌ อ่านไฟล์ไม่ได้: {path}")
        print(f"   Error: {e}")

        return []


def load_csv(filename):
    """
    โหลด Component CSV จาก normalized
    """

    return load_csv_from(
        INPUT_DIR,
        filename
    )


def save_csv(filename, rows, fieldnames):

    output_file = OUTPUT_DIR / filename

    with open(
        output_file,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames,
            extrasaction="ignore"
        )

        writer.writeheader()
        writer.writerows(rows)

    return output_file


# ============================================================
# VALIDATION REPORT LOADING
# ============================================================

def load_validation_report(filename):

    return load_csv_from(
        VALIDATED_DIR,
        filename
    )


# ============================================================
# BASIC DATASET SUMMARY
# ============================================================

def analyze_dataset(category, rows):

    if not rows:
        return []

    total = len(rows)

    fieldnames = list(rows[0].keys())

    results = []

    for field in fieldnames:

        values = [
            clean(row.get(field))
            for row in rows
        ]

        filled_values = [
            value
            for value in values
            if value
        ]

        empty_count = (
            total - len(filled_values)
        )

        unique_count = len(
            set(filled_values)
        )

        numeric_values = []

        for value in filled_values:

            number = to_float(value)

            if number is not None:
                numeric_values.append(number)

        numeric_count = len(
            numeric_values
        )

        minimum = ""
        maximum = ""
        average = ""

        if numeric_values:

            minimum = min(
                numeric_values
            )

            maximum = max(
                numeric_values
            )

            average = (
                sum(numeric_values)
                / numeric_count
            )

        # ----------------------------------------------------
        # FIX:
        # คำนวณ numeric_percent แยกออกมา
        # เพื่อไม่ให้ round() รับ tuple
        # ----------------------------------------------------

        if filled_values:

            numeric_percent = round(
                (
                    numeric_count
                    / len(filled_values)
                ) * 100,
                2
            )

        else:

            numeric_percent = 0

        results.append({

            "category": category,

            "column": field,

            "total_records": total,

            "filled": len(
                filled_values
            ),

            "empty": empty_count,

            "empty_percent": round(
                (
                    empty_count
                    / total
                ) * 100,
                2
            ),

            "unique_values": unique_count,

            "numeric_values": numeric_count,

            "numeric_percent": numeric_percent,

            "min": minimum,

            "max": maximum,

            "average": round(
                average,
                4
            )
            if average != ""
            else "",
        })

    return results


# ============================================================
# DUPLICATE / ID ANALYSIS
# ============================================================

def analyze_ids(category, rows):

    ids = [

        clean(
            row.get("opendb_id")
        )

        for row in rows

    ]

    ids = [

        value

        for value in ids

        if value

    ]

    counter = Counter(ids)

    duplicate_ids = {

        key: value

        for key, value
        in counter.items()

        if value > 1

    }

    return {

        "category": category,

        "total_records": len(rows),

        "id_filled": len(ids),

        "unique_ids": len(counter),

        "duplicate_id_count": len(
            duplicate_ids
        ),

        "duplicate_records": sum(

            count - 1

            for count
            in duplicate_ids.values()

        ),
    }


# ============================================================
# IMPORTANT FEATURE ANALYSIS
# ============================================================

IMPORTANT_FIELDS = {

    "CPU": [

        "socket",

        "microarchitecture",

        "specifications_memory_types",

        "specifications_tdp",

        "clocks_performance_base",

        "clocks_performance_boost",

        "cores_total",

        "cores_threads",

    ],

    "GPU": [

        "chipset_manufacturer",

        "memory",

        "memory_type",

        "core_count",

        "tdp",

        "length",

        "total_slot_width",

        "core_base_clock",

        "core_boost_clock",

    ],

    "RAM": [

        "ram_type",

        "speed",

        "capacity",

        "modules_capacity_gb",

        "modules_quantity",

        "cas_latency",

        "voltage",

    ],

    "Motherboard": [

        "socket",

        "memory_ram_type",

        "memory_max",

        "memory_slots",

        "form_factor",

        "m2_slots",

        "chipset",

    ],

    "PSU": [

        "wattage",

        "efficiency_rating",

        "modular",

        "form_factor",

        "length",

    ],

    "Cooler": [

        "cpu_sockets",

        "height",

        "fan_quantity",

        "fan_size",

        "radiator_size",

        "water_cooled",

    ],

    "Case": [

        "form_factor",

        "max_video_card_length",

        "max_cpu_cooler_height",

        "max_psu_length",

        "supported_motherboard_form_factors",

        "supported_power_supply_form_factors",

        "volume",

    ],

    "Storage": [

        "capacity",

        "storage_type",

        "type",

        "form_factor",

        "interface",

        "nvme",

    ],
}


def analyze_important_fields(
    category,
    rows
):

    results = []

    fields = IMPORTANT_FIELDS.get(
        category,
        []
    )

    total = len(rows)

    for field in fields:

        values = [

            clean(
                row.get(field)
            )

            for row in rows

        ]

        filled = [

            value

            for value in values

            if value

        ]

        unique = Counter(
            filled
        )

        top_values = unique.most_common(
            10
        )

        results.append({

            "category": category,

            "column": field,

            "total": total,

            "filled": len(filled),

            "empty": (
                total - len(filled)
            ),

            "empty_percent": round(

                (
                    (
                        total
                        - len(filled)
                    )
                    / total
                ) * 100,

                2

            ) if total else 0,

            "unique": len(unique),

            "top_values": " | ".join(

                f"{value} ({count})"

                for value, count
                in top_values

            ),
        })

    return results


# ============================================================
# OUTLIER ANALYSIS
# ============================================================

NUMERIC_FIELDS = {

    "CPU": [

        "specifications_tdp",

        "clocks_performance_base",

        "clocks_performance_boost",

        "cores_total",

        "cores_threads",

    ],

    "GPU": [

        "memory",

        "core_count",

        "tdp",

        "length",

        "core_base_clock",

        "core_boost_clock",

    ],

    "RAM": [

        "speed",

        "capacity",

        "modules_capacity_gb",

        "modules_quantity",

        "cas_latency",

        "voltage",

    ],

    "Motherboard": [

        "memory_max",

        "memory_slots",

    ],

    "PSU": [

        "wattage",

        "length",

    ],

    "Cooler": [

        "height",

        "fan_quantity",

        "fan_size",

        "radiator_size",

    ],

    "Case": [

        "max_video_card_length",

        "max_cpu_cooler_height",

        "max_psu_length",

        "volume",

    ],

    "Storage": [

        "capacity",

    ],
}


def analyze_numeric_field(
    category,
    field,
    rows
):

    values = []

    for row in rows:

        number = to_float(
            row.get(field)
        )

        if number is not None:

            values.append(number)

    if not values:

        return None

    values.sort()

    count = len(values)

    minimum = values[0]

    maximum = values[-1]

    average = (
        sum(values)
        / count
    )

    q1_index = int(
        count * 0.25
    )

    q3_index = int(
        count * 0.75
    )

    q1 = values[q1_index]

    q3 = values[q3_index]

    iqr = q3 - q1

    lower_bound = (
        q1
        - (1.5 * iqr)
    )

    upper_bound = (
        q3
        + (1.5 * iqr)
    )

    outliers = [

        value

        for value in values

        if (
            value < lower_bound
            or value > upper_bound
        )

    ]

    return {

        "category": category,

        "column": field,

        "count": count,

        "min": minimum,

        "max": maximum,

        "average": round(
            average,
            4
        ),

        "q1": q1,

        "q3": q3,

        "iqr": iqr,

        "lower_bound": round(
            lower_bound,
            4
        ),

        "upper_bound": round(
            upper_bound,
            4
        ),

        "outlier_count": len(
            outliers
        ),

        "outlier_percent": round(

            (
                len(outliers)
                / count
            ) * 100,

            2

        ),
    }


# ============================================================
# LOGICAL VALIDATION
# ============================================================

def analyze_logical_rules(
    category,
    rows
):

    issues = []

    for row in rows:

        opendb_id = clean(
            row.get("opendb_id")
        )

        # ----------------------------------------------------
        # CPU
        # ----------------------------------------------------

        if category == "CPU":

            base = to_float(
                row.get(
                    "clocks_performance_base"
                )
            )

            boost = to_float(
                row.get(
                    "clocks_performance_boost"
                )
            )

            if (
                base is not None
                and boost is not None
                and boost < base
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "BOOST_CLOCK_LOWER_THAN_BASE",

                    "details":
                        f"base={base}, boost={boost}",
                })

            tdp = to_float(
                row.get(
                    "specifications_tdp"
                )
            )

            if tdp is not None and tdp <= 0:

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_CPU_TDP",

                    "details":
                        str(tdp),
                })

        # ----------------------------------------------------
        # GPU
        # ----------------------------------------------------

        elif category == "GPU":

            base = to_float(
                row.get(
                    "core_base_clock"
                )
            )

            boost = to_float(
                row.get(
                    "core_boost_clock"
                )
            )

            if (
                base is not None
                and boost is not None
                and boost < base
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "BOOST_CLOCK_LOWER_THAN_BASE",

                    "details":
                        f"base={base}, boost={boost}",
                })

            length = to_float(
                row.get("length")
            )

            if length is not None and length <= 0:

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_GPU_LENGTH",

                    "details":
                        str(length),
                })

        # ----------------------------------------------------
        # RAM
        # ----------------------------------------------------

        elif category == "RAM":

            speed = to_float(
                row.get("speed")
            )

            capacity = to_float(
                row.get("capacity")
            )

            if speed is not None and speed <= 0:

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_RAM_SPEED",

                    "details":
                        str(speed),
                })

            if (
                capacity is not None
                and capacity <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_RAM_CAPACITY",

                    "details":
                        str(capacity),
                })

        # ----------------------------------------------------
        # MOTHERBOARD
        # ----------------------------------------------------

        elif category == "Motherboard":

            memory_max = to_float(
                row.get("memory_max")
            )

            memory_slots = to_float(
                row.get("memory_slots")
            )

            if (
                memory_max is not None
                and memory_max <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_MEMORY_MAX",

                    "details":
                        str(memory_max),
                })

            if (
                memory_slots is not None
                and memory_slots <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_MEMORY_SLOTS",

                    "details":
                        str(memory_slots),
                })

        # ----------------------------------------------------
        # PSU
        # ----------------------------------------------------

        elif category == "PSU":

            wattage = to_float(
                row.get("wattage")
            )

            if (
                wattage is not None
                and wattage <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_PSU_WATTAGE",

                    "details":
                        str(wattage),
                })

        # ----------------------------------------------------
        # COOLER
        # ----------------------------------------------------

        elif category == "Cooler":

            height = to_float(
                row.get("height")
            )

            if (
                height is not None
                and height <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_COOLER_HEIGHT",

                    "details":
                        str(height),
                })

        # ----------------------------------------------------
        # CASE
        # ----------------------------------------------------

        elif category == "Case":

            gpu_length = to_float(
                row.get(
                    "max_video_card_length"
                )
            )

            cooler_height = to_float(
                row.get(
                    "max_cpu_cooler_height"
                )
            )

            if (
                gpu_length is not None
                and gpu_length <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_MAX_GPU_LENGTH",

                    "details":
                        str(gpu_length),
                })

            if (
                cooler_height is not None
                and cooler_height <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_MAX_COOLER_HEIGHT",

                    "details":
                        str(cooler_height),
                })

        # ----------------------------------------------------
        # STORAGE
        # ----------------------------------------------------

        elif category == "Storage":

            capacity = to_float(
                row.get("capacity")
            )

            if (
                capacity is not None
                and capacity <= 0
            ):

                issues.append({

                    "category": category,

                    "opendb_id": opendb_id,

                    "issue":
                        "INVALID_STORAGE_CAPACITY",

                    "details":
                        str(capacity),
                })

    return issues


# ============================================================
# VALIDATION SUMMARY ANALYSIS
# ============================================================

def analyze_compatibility_summary():

    rows = load_validation_report(
        "compatibility_summary.csv"
    )

    results = []

    for row in rows:

        results.append({

            "relationship":
                clean(row.get("relationship")),

            "total":
                clean(row.get("total")),

            "compatible":
                clean(row.get("compatible")),

            "potential":
                clean(row.get("potential")),

            "incompatible":
                clean(row.get("incompatible")),

            "unknown":
                clean(row.get("unknown")),

        })

    return results


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - DATA ANALYSIS"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Input : {INPUT_DIR}"
    )

    print(
        f"📂 Validation : {VALIDATED_DIR}"
    )

    print(
        f"📂 Output: {OUTPUT_DIR}"
    )

    # ========================================================
    # 1. LOAD DATA
    # ========================================================

    print()

    print("=" * 70)

    print("1. LOAD DATA")

    print("=" * 70)

    data = {}

    for category, filename in FILES.items():

        rows = load_csv(
            filename
        )

        data[category] = rows

        print(

            f"📥 {category:<12} "

            f"{len(rows):>5} records"

        )

    total_records = sum(

        len(rows)

        for rows in data.values()

    )

    # ========================================================
    # 2. COLUMN ANALYSIS
    # ========================================================

    print()

    print("=" * 70)

    print("2. COLUMN ANALYSIS")

    print("=" * 70)

    column_results = []

    for category, rows in data.items():

        print(

            f"🔍 {category:<12} "

            f"{len(rows):>5} records"

        )

        results = analyze_dataset(

            category,

            rows

        )

        column_results.extend(
            results
        )

    column_file = save_csv(

        "column_analysis.csv",

        column_results,

        [

            "category",

            "column",

            "total_records",

            "filled",

            "empty",

            "empty_percent",

            "unique_values",

            "numeric_values",

            "numeric_percent",

            "min",

            "max",

            "average",

        ]

    )

    print()

    print(
        f"📄 {column_file}"
    )

    # ========================================================
    # 3. ID ANALYSIS
    # ========================================================

    print()

    print("=" * 70)

    print("3. ID ANALYSIS")

    print("=" * 70)

    id_results = []

    for category, rows in data.items():

        result = analyze_ids(

            category,

            rows

        )

        id_results.append(
            result
        )

        print(

            f"{category:<12} "

            f"Records={result['total_records']:,} | "

            f"Unique={result['unique_ids']:,} | "

            f"Duplicate={result['duplicate_id_count']:,}"

        )

    id_file = save_csv(

        "id_analysis.csv",

        id_results,

        [

            "category",

            "total_records",

            "id_filled",

            "unique_ids",

            "duplicate_id_count",

            "duplicate_records",

        ]

    )

    print()

    print(
        f"📄 {id_file}"
    )

    # ========================================================
    # 4. IMPORTANT FEATURES
    # ========================================================

    print()

    print("=" * 70)

    print(
        "4. IMPORTANT FEATURE ANALYSIS"
    )

    print("=" * 70)

    important_results = []

    for category, rows in data.items():

        results = analyze_important_fields(

            category,

            rows

        )

        important_results.extend(
            results
        )

    important_file = save_csv(

        "important_features.csv",

        important_results,

        [

            "category",

            "column",

            "total",

            "filled",

            "empty",

            "empty_percent",

            "unique",

            "top_values",

        ]

    )

    print()

    print(
        f"📄 {important_file}"
    )

    # ========================================================
    # 5. NUMERIC / OUTLIER
    # ========================================================

    print()

    print("=" * 70)

    print(
        "5. NUMERIC & OUTLIER ANALYSIS"
    )

    print("=" * 70)

    numeric_results = []

    for category, rows in data.items():

        fields = NUMERIC_FIELDS.get(

            category,

            []

        )

        for field in fields:

            result = analyze_numeric_field(

                category,

                field,

                rows

            )

            if result:

                numeric_results.append(
                    result
                )

                print(

                    f"{category:<12} "

                    f"{field:<35} "

                    f"Outliers="

                    f"{result['outlier_count']:,}"

                )

    numeric_file = save_csv(

        "numeric_outliers.csv",

        numeric_results,

        [

            "category",

            "column",

            "count",

            "min",

            "max",

            "average",

            "q1",

            "q3",

            "iqr",

            "lower_bound",

            "upper_bound",

            "outlier_count",

            "outlier_percent",

        ]

    )

    print()

    print(
        f"📄 {numeric_file}"
    )

    # ========================================================
    # 6. LOGICAL VALIDATION
    # ========================================================

    print()

    print("=" * 70)

    print("6. LOGICAL VALIDATION")

    print("=" * 70)

    logical_results = []

    for category, rows in data.items():

        issues = analyze_logical_rules(

            category,

            rows

        )

        logical_results.extend(
            issues
        )

        if issues:

            print(

                f"⚠️ {category:<12} "

                f"{len(issues):,} issues"

            )

        else:

            print(

                f"✅ {category:<12} "

                f"ไม่มี logical issue"

            )

    logical_file = save_csv(

        "logical_issues.csv",

        logical_results,

        [

            "category",

            "opendb_id",

            "issue",

            "details",

        ]

    )

    print()

    print(
        f"📄 {logical_file}"
    )

    # ========================================================
    # 7. COMPATIBILITY SUMMARY
    # ========================================================

    print()

    print("=" * 70)

    print(
        "7. COMPATIBILITY SUMMARY"
    )

    print("=" * 70)

    compatibility_results = (
        analyze_compatibility_summary()
    )

    compatibility_file = save_csv(

        "compatibility_analysis.csv",

        compatibility_results,

        [

            "relationship",

            "total",

            "compatible",

            "potential",

            "incompatible",

            "unknown",

        ]

    )

    for row in compatibility_results:

        print(

            f"{row['relationship']:<22} "

            f"Compatible={row['compatible']} | "

            f"Potential={row['potential']} | "

            f"Incompatible={row['incompatible']} | "

            f"Unknown={row['unknown']}"

        )

    print()

    print(
        f"📄 {compatibility_file}"
    )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()

    print("=" * 70)

    print(
        "📊 DATA ANALYSIS SUMMARY"
    )

    print("=" * 70)

    print(

        f"Total Records : "

        f"{total_records:,}"

    )

    print(

        f"Datasets      : "

        f"{len(data)}"

    )

    print(

        f"Column Checks : "

        f"{len(column_results):,}"

    )

    print(

        f"Important Features : "

        f"{len(important_results):,}"

    )

    print(

        f"Numeric Fields : "

        f"{len(numeric_results):,}"

    )

    print(

        f"Logical Issues : "

        f"{len(logical_results):,}"

    )

    print(

        f"Compatibility Checks : "

        f"{len(compatibility_results):,}"

    )

    print()

    print(
        "📁 Analysis Files"
    )

    print("-" * 70)

    print(
        f"📄 {column_file}"
    )

    print(
        f"📄 {id_file}"
    )

    print(
        f"📄 {important_file}"
    )

    print(
        f"📄 {numeric_file}"
    )

    print(
        f"📄 {logical_file}"
    )

    print(
        f"📄 {compatibility_file}"
    )

    print()

    print("=" * 70)

    print(
        "✅ DATA ANALYSIS เสร็จแล้ว"
    )

    print("=" * 70)


if __name__ == "__main__":

    main()