import csv
from pathlib import Path
from collections import Counter

import pandas as pd


# ============================================================
# BuildCores OpenDB
# VALIDATION DATASET QUALITY CHECK
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

VALIDATED_DIR = (
    ROOT /
    "data" /
    "processed" /
    "validated"
)

TRAINING_DIR = (
    ROOT /
    "data" /
    "processed" /
    "training"
)


# ============================================================
# SETTINGS
# ============================================================

DATASETS = {

    "cpu_motherboard": {
        "file": "cpu_motherboard.csv",
        "ids": [
            "cpu_id",
            "motherboard_id"
        ]
    },

    "cpu_cooler": {
        "file": "cpu_cooler.csv",
        "ids": [
            "cpu_id",
            "cooler_id"
        ]
    },

    "ram_motherboard": {
        "file": "ram_motherboard.csv",
        "ids": [
            "ram_id",
            "motherboard_id"
        ]
    },

    "gpu_case": {
        "file": "gpu_case.csv",
        "ids": [
            "gpu_id",
            "case_id"
        ]
    },

    "cooler_case": {
        "file": "cooler_case.csv",
        "ids": [
            "cooler_id",
            "case_id"
        ]
    },

    "motherboard_case": {
        "file": "motherboard_case.csv",
        "ids": [
            "motherboard_id",
            "case_id"
        ]
    },

    "psu_case": {
        "file": "psu_case.csv",
        "ids": [
            "psu_id",
            "case_id"
        ]
    },

    "storage_motherboard": {
        "file": "storage_motherboard.csv",
        "ids": [
            "storage_id",
            "motherboard_id"
        ]
    }

}


# ============================================================
# COLUMNS THAT CAN CAUSE LABEL LEAKAGE
# ============================================================

LEAKAGE_COLUMNS = {

    "cpu_motherboard": [
        "socket_match"
    ],

    "cpu_cooler": [
        "socket_match"
    ],

    "ram_motherboard": [
        "ram_type_match"
    ],

    "gpu_case": [
        "gpu_case_length_ok"
    ],

    "cooler_case": [
        "cooler_case_height_ok"
    ],

    "motherboard_case": [
        "form_factor_match"
    ],

    "psu_case": [
        "psu_form_factor_match",
        "psu_length_ok"
    ],

    "storage_motherboard": [
        "storage_m2_slot_ok"
    ]

}


# ============================================================
# HELPERS
# ============================================================

def clean(value):

    if value is None:
        return ""

    value = str(
        value
    ).strip()

    if value.lower() in {
        "",
        "nan",
        "none",
        "null",
        "n/a",
        "na",
        "-"
    }:
        return ""

    return value


def load_csv(path):

    if not path.exists():

        print(
            f"❌ File not found: {path}"
        )

        return None

    try:

        return pd.read_csv(
            path,
            dtype=str
        )

    except Exception as e:

        print(
            f"❌ Cannot read: {path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return None


# ============================================================
# 1. BASIC CHECK
# ============================================================

def check_basic(
    dataset_name,
    df
):

    print()
    print(
        "1️⃣ BASIC DATA CHECK"
    )

    print(
        f"   Rows    : {len(df):,}"
    )

    print(
        f"   Columns : {len(df.columns):,}"
    )

    if "label" not in df.columns:

        print(
            "   ❌ Missing label column"
        )

        return False

    labels = (
        df["label"]
        .fillna("")
        .astype(str)
        .str.strip()
    )

    counts = Counter(
        labels
    )

    compatible = counts.get(
        "1",
        0
    )

    incompatible = counts.get(
        "0",
        0
    )

    print(
        f"   Compatible   : "
        f"{compatible:,}"
    )

    print(
        f"   Incompatible : "
        f"{incompatible:,}"
    )

    if compatible == incompatible:

        print(
            "   ✅ Balanced"
        )

    else:

        print(
            "   ⚠️ Not balanced"
        )

    invalid_labels = (
        set(labels)
        -
        {"0", "1"}
        -
        {""}
    )

    if invalid_labels:

        print(
            f"   ❌ Invalid labels: "
            f"{invalid_labels}"
        )

    else:

        print(
            "   ✅ Labels valid"
        )

    return True


# ============================================================
# 2. DUPLICATE CHECK
# ============================================================

def check_duplicates(
    dataset_name,
    df,
    id_columns
):

    print()
    print(
        "2️⃣ DUPLICATE ID PAIR CHECK"
    )

    missing = [
        col
        for col in id_columns
        if col not in df.columns
    ]

    if missing:

        print(
            f"   ❌ Missing ID columns: "
            f"{missing}"
        )

        return

    pair_df = df[
        id_columns
    ].copy()

    for col in id_columns:

        pair_df[col] = (
            pair_df[col]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    duplicate_mask = (
        pair_df
        .duplicated(
            keep=False
        )
    )

    duplicate_count = int(
        duplicate_mask.sum()
    )

    unique_pairs = (
        len(
            pair_df.drop_duplicates()
        )
    )

    print(
        f"   Total rows   : "
        f"{len(pair_df):,}"
    )

    print(
        f"   Unique pairs : "
        f"{unique_pairs:,}"
    )

    print(
        f"   Duplicate rows: "
        f"{duplicate_count:,}"
    )

    if duplicate_count == 0:

        print(
            "   ✅ No duplicate ID pairs"
        )

    else:

        print(
            "   ⚠️ Duplicate ID pairs found"
        )

        duplicates = (
            pair_df[
                duplicate_mask
            ]
            .drop_duplicates()
            .head(10)
        )

        print()

        print(
            duplicates.to_string(
                index=False
            )
        )


# ============================================================
# 3. MISSING VALUE CHECK
# ============================================================

def check_missing(
    dataset_name,
    df
):

    print()
    print(
        "3️⃣ MISSING VALUE CHECK"
    )

    results = []

    for column in df.columns:

        values = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        missing = int(
            (
                values == ""
            ).sum()
        )

        percentage = (
            missing /
            len(df) *
            100
        )

        if missing > 0:

            results.append(
                (
                    column,
                    missing,
                    percentage
                )
            )

    if not results:

        print(
            "   ✅ No missing values"
        )

        return

    results.sort(
        key=lambda x: x[1],
        reverse=True
    )

    print(
        f"   Columns with missing values: "
        f"{len(results)}"
    )

    for column, missing, percentage in results:

        print(
            f"   ⚠️ {column:<30}"
            f"{missing:>7,} "
            f"({percentage:>6.2f}%)"
        )


# ============================================================
# 4. LABEL LEAKAGE CHECK
# ============================================================

def check_label_leakage(
    dataset_name,
    df
):

    print()
    print(
        "4️⃣ LABEL LEAKAGE CHECK"
    )

    leakage_columns = (
        LEAKAGE_COLUMNS.get(
            dataset_name,
            []
        )
    )

    found = []

    for column in leakage_columns:

        if column in df.columns:

            found.append(
                column
            )

    if not found:

        print(
            "   ✅ No known leakage columns"
        )

        return

    print(
        "   ⚠️ Potential label leakage detected:"
    )

    for column in found:

        print(
            f"      - {column}"
        )

    print()

    print(
        "   Reason:"
    )

    print(
        "   Column นี้ถูกใช้เป็นส่วนหนึ่งของ"
    )

    print(
        "   กฎที่สร้าง label โดยตรง"
    )

    print()

    print(
        "   ❗ ไม่ควรใช้ column เหล่านี้"
    )

    print(
        "   เป็น input feature ตอน Train AI"
    )


# ============================================================
# 5. LABEL ↔ LEAKAGE RELATIONSHIP
# ============================================================

def check_leakage_relationship(
    dataset_name,
    df
):

    print()
    print(
        "5️⃣ LABEL ↔ RULE RELATIONSHIP"
    )

    leakage_columns = (
        LEAKAGE_COLUMNS.get(
            dataset_name,
            []
        )
    )

    for column in leakage_columns:

        if column not in df.columns:

            continue

        comparison = pd.crosstab(
            df[column],
            df["label"]
        )

        print()

        print(
            f"   {column}"
        )

        print(
            comparison.to_string()
        )

        values = set(
            df[column]
            .dropna()
            .astype(str)
        )

        if values.issubset(
            {"0", "1"}
        ):

            mismatch = (
                df[column]
                .astype(str)
                !=
                df["label"]
                .astype(str)
            ).sum()

            if mismatch == 0:

                print(
                    "   ⚠️ EXACT MATCH WITH LABEL"
                )

                print(
                    "   → Data leakage confirmed"
                )

            else:

                print(
                    f"   ℹ️ Different from label "
                    f"in {mismatch:,} rows"
                )


# ============================================================
# 6. TRAINING OVERLAP CHECK
# ============================================================

def check_training_overlap(
    dataset_name,
    df,
    id_columns
):

    print()
    print(
        "6️⃣ TRAINING ↔ VALIDATION OVERLAP"
    )

    training_path = (
        TRAINING_DIR /
        f"{dataset_name}.csv"
    )

    if not training_path.exists():

        print(
            "   ⚠️ Training file not found"
        )

        return

    training_df = load_csv(
        training_path
    )

    if training_df is None:

        return

    missing_training_columns = [
        col
        for col in id_columns
        if col not in training_df.columns
    ]

    missing_validation_columns = [
        col
        for col in id_columns
        if col not in df.columns
    ]

    if (
        missing_training_columns
        or
        missing_validation_columns
    ):

        print(
            "   ❌ ID columns missing"
        )

        return

    training_pairs = set()

    for _, row in training_df.iterrows():

        pair = tuple(
            clean(
                row[col]
            )
            for col in id_columns
        )

        if all(pair):

            training_pairs.add(
                pair
            )

    validation_pairs = set()

    for _, row in df.iterrows():

        pair = tuple(
            clean(
                row[col]
            )
            for col in id_columns
        )

        if all(pair):

            validation_pairs.add(
                pair
            )

    overlap = (
        training_pairs
        &
        validation_pairs
    )

    print(
        f"   Training unique pairs   : "
        f"{len(training_pairs):,}"
    )

    print(
        f"   Validation unique pairs : "
        f"{len(validation_pairs):,}"
    )

    print(
        f"   Overlap pairs           : "
        f"{len(overlap):,}"
    )

    if not overlap:

        print(
            "   ✅ No Training ↔ Validation overlap"
        )

    else:

        print(
            "   ❌ DATA LEAKAGE!"
        )


# ============================================================
# 7. FEATURE CONSTANT CHECK
# ============================================================

def check_constant_columns(
    dataset_name,
    df
):

    print()
    print(
        "7️⃣ CONSTANT / LOW-VARIANCE CHECK"
    )

    constant_columns = []

    for column in df.columns:

        unique_count = (
            df[column]
            .fillna("")
            .astype(str)
            .nunique()
        )

        if unique_count <= 1:

            constant_columns.append(
                column
            )

    if not constant_columns:

        print(
            "   ✅ No constant columns"
        )

        return

    print(
        "   ⚠️ Constant columns:"
    )

    for column in constant_columns:

        print(
            f"      - {column}"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - "
        "VALIDATION DATASET QUALITY CHECK"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Validation: "
        f"{VALIDATED_DIR}"
    )

    print(
        f"📂 Training  : "
        f"{TRAINING_DIR}"
    )

    total_rows = 0

    total_overlap = 0

    total_duplicates = 0

    dataset_results = []

    # ========================================================
    # PROCESS DATASETS
    # ========================================================

    for dataset_name, config in DATASETS.items():

        print()
        print("=" * 70)

        print(
            f"📦 DATASET: "
            f"{dataset_name}.csv"
        )

        print("=" * 70)

        path = (
            VALIDATED_DIR /
            config["file"]
        )

        df = load_csv(
            path
        )

        if df is None:

            dataset_results.append({

                "dataset":
                    dataset_name,

                "status":
                    "FILE NOT FOUND"

            })

            continue

        total_rows += len(df)

        # ----------------------------------------------------
        # Basic
        # ----------------------------------------------------

        check_basic(
            dataset_name,
            df
        )

        # ----------------------------------------------------
        # Duplicate
        # ----------------------------------------------------

        check_duplicates(
            dataset_name,
            df,
            config["ids"]
        )

        pair_df = df[
            config["ids"]
        ].copy()

        duplicate_count = int(
            pair_df.duplicated(
                keep=False
            ).sum()
        )

        total_duplicates += (
            duplicate_count
        )

        # ----------------------------------------------------
        # Missing
        # ----------------------------------------------------

        check_missing(
            dataset_name,
            df
        )

        # ----------------------------------------------------
        # Leakage
        # ----------------------------------------------------

        check_label_leakage(
            dataset_name,
            df
        )

        # ----------------------------------------------------
        # Leakage relationship
        # ----------------------------------------------------

        check_leakage_relationship(
            dataset_name,
            df
        )

        # ----------------------------------------------------
        # Training overlap
        # ----------------------------------------------------

        training_path = (
            TRAINING_DIR /
            f"{dataset_name}.csv"
        )

        overlap_count = 0

        if training_path.exists():

            training_df = load_csv(
                training_path
            )

            if training_df is not None:

                training_pairs = set()

                for _, row in training_df.iterrows():

                    pair = tuple(
                        clean(
                            row[col]
                        )
                        for col in config["ids"]
                    )

                    if all(pair):

                        training_pairs.add(
                            pair
                        )

                validation_pairs = set()

                for _, row in df.iterrows():

                    pair = tuple(
                        clean(
                            row[col]
                        )
                        for col in config["ids"]
                    )

                    if all(pair):

                        validation_pairs.add(
                            pair
                        )

                overlap = (
                    training_pairs
                    &
                    validation_pairs
                )

                overlap_count = len(
                    overlap
                )

        total_overlap += (
            overlap_count
        )

        check_training_overlap(
            dataset_name,
            df,
            config["ids"]
        )

        # ----------------------------------------------------
        # Constant columns
        # ----------------------------------------------------

        check_constant_columns(
            dataset_name,
            df
        )

        dataset_results.append({

            "dataset":
                dataset_name,

            "rows":
                len(df),

            "duplicates":
                duplicate_count,

            "training_overlap":
                overlap_count,

            "status":
                "PASS"
                if (
                    duplicate_count == 0
                    and
                    overlap_count == 0
                )
                else
                "CHECK"

        })

    # ========================================================
    # SAVE REPORT
    # ========================================================

    report_path = (
        VALIDATED_DIR /
        "validation_quality_report.csv"
    )

    with open(
        report_path,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "dataset",
                "rows",
                "duplicates",
                "training_overlap",
                "status"
            ]
        )

        writer.writeheader()

        writer.writerows(
            dataset_results
        )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 70)

    print(
        "📊 FINAL QUALITY CHECK SUMMARY"
    )

    print("=" * 70)

    print(
        f"Total Validation Rows : "
        f"{total_rows:,}"
    )

    print(
        f"Total Duplicate Rows  : "
        f"{total_duplicates:,}"
    )

    print(
        f"Total Training Overlap: "
        f"{total_overlap:,}"
    )

    print()

    failed = [
        row
        for row in dataset_results
        if row["status"] != "PASS"
    ]

    if not failed:

        print(
            "✅ STRUCTURAL QUALITY CHECK PASSED"
        )

        print(
            "✅ No duplicate ID pairs"
        )

        print(
            "✅ No Training ↔ Validation overlap"
        )

    else:

        print(
            "⚠️ QUALITY CHECK NEEDS REVIEW"
        )

        print()

        for row in failed:

            print(
                f"   ⚠️ {row['dataset']}"
            )

            print(
                f"      Duplicates: "
                f"{row['duplicates']:,}"
            )

            print(
                f"      Training overlap: "
                f"{row['training_overlap']:,}"
            )

    print()

    print(
        f"📄 Report:"
    )

    print(
        f"   {report_path}"
    )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()