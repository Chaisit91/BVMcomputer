import csv
from pathlib import Path


# ============================================================
# BuildCores OpenDB - TRAINING / VALIDATION CHECK
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

TRAINING_DIR = ROOT / "data" / "processed" / "training"
VALIDATED_DIR = ROOT / "data" / "processed" / "validated"


# ============================================================
# DATASETS
# ============================================================

DATASETS = [
    "cpu_motherboard",
    "cpu_cooler",
    "ram_motherboard",
    "gpu_case",
    "cooler_case",
    "motherboard_case",
    "psu_case",
    "storage_motherboard",
]


# ============================================================
# LOAD CSV
# ============================================================

def load_csv(path):

    if not path.exists():

        return None

    try:

        with open(
            path,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            reader = csv.DictReader(f)

            rows = list(reader)

            columns = reader.fieldnames or []

        return {
            "rows": rows,
            "columns": columns
        }

    except Exception as e:

        print(
            f"❌ อ่านไฟล์ไม่ได้: {path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return None


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print(
        "BuildCores OpenDB - "
        "TRAINING / VALIDATION CHECK"
    )
    print("=" * 70)

    print()
    print(
        f"📂 Training  : {TRAINING_DIR}"
    )

    print(
        f"📂 Validation: {VALIDATED_DIR}"
    )

    all_passed = True

    summary = []

    # ========================================================
    # CHECK DATASETS
    # ========================================================

    for dataset in DATASETS:

        print()
        print("=" * 70)

        print(
            f"📦 DATASET: {dataset}"
        )

        print("=" * 70)

        training_path = (
            TRAINING_DIR /
            f"{dataset}.csv"
        )

        validation_path = (
            VALIDATED_DIR /
            f"{dataset}.csv"
        )

        # ----------------------------------------------------
        # LOAD
        # ----------------------------------------------------

        training = load_csv(
            training_path
        )

        validation = load_csv(
            validation_path
        )

        if training is None:

            print()
            print(
                "❌ Training file not found"
            )

            print(
                f"   {training_path}"
            )

            all_passed = False

            continue

        if validation is None:

            print()
            print(
                "❌ Validation file not found"
            )

            print(
                f"   {validation_path}"
            )

            all_passed = False

            continue

        # ----------------------------------------------------
        # BASIC INFO
        # ----------------------------------------------------

        training_rows = training["rows"]
        validation_rows = validation["rows"]

        training_columns = training["columns"]
        validation_columns = validation["columns"]

        print()
        print(
            f"📥 Training records   : "
            f"{len(training_rows):,}"
        )

        print(
            f"📥 Validation records : "
            f"{len(validation_rows):,}"
        )

        # ----------------------------------------------------
        # LABEL
        # ----------------------------------------------------

        if "label" not in training_columns:

            print()
            print(
                "❌ Training ไม่มี column: label"
            )

            all_passed = False

        if "label" not in validation_columns:

            print()
            print(
                "❌ Validation ไม่มี column: label"
            )

            all_passed = False

        # ----------------------------------------------------
        # FEATURES
        # ----------------------------------------------------

        training_features = [

            col

            for col in training_columns

            if col != "label"

        ]

        validation_features = [

            col

            for col in validation_columns

            if col != "label"

        ]

        print()
        print(
            f"🔢 Training features   : "
            f"{len(training_features)}"
        )

        print(
            f"🔢 Validation features : "
            f"{len(validation_features)}"
        )

        # ----------------------------------------------------
        # MISSING
        # ----------------------------------------------------

        missing_features = [

            col

            for col in training_features

            if col not in validation_features

        ]

        if missing_features:

            print()
            print(
                "❌ Feature ที่หายจาก Validation:"
            )

            for col in missing_features:

                print(
                    f"   - {col}"
                )

            all_passed = False

        else:

            print(
                "✅ ไม่มี Feature "
                "ที่หายจาก Validation"
            )

        # ----------------------------------------------------
        # EXTRA
        # ----------------------------------------------------

        extra_features = [

            col

            for col in validation_features

            if col not in training_features

        ]

        if extra_features:

            print()
            print(
                "❌ Feature ที่เกินใน Validation:"
            )

            for col in extra_features:

                print(
                    f"   - {col}"
                )

            all_passed = False

        else:

            print(
                "✅ ไม่มี Feature "
                "เกินใน Validation"
            )

        # ----------------------------------------------------
        # ORDER
        # ----------------------------------------------------

        if training_features == validation_features:

            print(
                "✅ Feature order ตรงกัน"
            )

        else:

            print(
                "❌ Feature order ไม่ตรงกัน"
            )

            all_passed = False

        # ----------------------------------------------------
        # LABEL DISTRIBUTION
        # ----------------------------------------------------

        training_compatible = sum(

            1

            for row in training_rows

            if str(
                row.get(
                    "label",
                    ""
                )
            ).strip() == "1"

        )

        training_incompatible = sum(

            1

            for row in training_rows

            if str(
                row.get(
                    "label",
                    ""
                )
            ).strip() == "0"

        )

        validation_compatible = sum(

            1

            for row in validation_rows

            if str(
                row.get(
                    "label",
                    ""
                )
            ).strip() == "1"

        )

        validation_incompatible = sum(

            1

            for row in validation_rows

            if str(
                row.get(
                    "label",
                    ""
                )
            ).strip() == "0"

        )

        print()
        print(
            "🏷️ LABEL DISTRIBUTION"
        )

        print(
            f"   Training Compatible    : "
            f"{training_compatible:,}"
        )

        print(
            f"   Training Incompatible  : "
            f"{training_incompatible:,}"
        )

        print(
            f"   Validation Compatible  : "
            f"{validation_compatible:,}"
        )

        print(
            f"   Validation Incompatible: "
            f"{validation_incompatible:,}"
        )

        # ----------------------------------------------------
        # VALIDATION BALANCE
        # ----------------------------------------------------

        balanced = (

            validation_compatible
            ==
            2000

            and

            validation_incompatible
            ==
            2000

        )

        if balanced:

            print(
                "✅ Validation balance = "
                "2,000 / 2,000"
            )

        else:

            print(
                "❌ Validation ไม่สมดุล"
            )

            all_passed = False

        # ----------------------------------------------------
        # DATASET STATUS
        # ----------------------------------------------------

        dataset_passed = (

            "label" in training_columns

            and

            "label" in validation_columns

            and

            not missing_features

            and

            not extra_features

            and

            training_features
            ==
            validation_features

            and

            balanced

        )

        print()

        if dataset_passed:

            print(
                "🎉 DATASET CHECK: PASS"
            )

        else:

            print(
                "❌ DATASET CHECK: FAIL"
            )

            all_passed = False

        summary.append({

            "dataset":
                dataset,

            "training_records":
                len(training_rows),

            "validation_records":
                len(validation_rows),

            "training_features":
                len(training_features),

            "validation_features":
                len(validation_features),

            "status":
                "PASS"
                if dataset_passed
                else
                "FAIL"

        })

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 70)

    print(
        "📊 TRAINING / VALIDATION "
        "CHECK SUMMARY"
    )

    print("=" * 70)

    for row in summary:

        print(

            f"{row['dataset']:<25}"

            f"Training: "
            f"{row['training_records']:>7,} | "

            f"Validation: "
            f"{row['validation_records']:>5,} | "

            f"Features: "
            f"{row['training_features']:>3} | "

            f"{row['status']}"

        )

    print()
    print("=" * 70)

    if all_passed:

        print(
            "✅ ALL DATASETS PASSED"
        )

        print()

        print(
            "🚀 Training และ Validation "
            "พร้อมสำหรับขั้นตอน Train AI"
        )

    else:

        print(
            "❌ พบปัญหาใน Dataset"
        )

        print()

        print(
            "⚠️ ยังไม่ควร Train AI "
            "จนกว่าจะแก้ปัญหาทั้งหมด"
        )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()
