import csv
from pathlib import Path


# ============================================================
# BuildCores OpenDB - PREPARE MODEL READY DATASET
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

TRAINING_DIR = (
    ROOT
    / "data"
    / "processed"
    / "training"
)

VALIDATION_DIR = (
    ROOT
    / "data"
    / "processed"
    / "validated"
)

MODEL_READY_DIR = (
    ROOT
    / "data"
    / "processed"
    / "model_ready"
)

MODEL_READY_TRAINING_DIR = (
    MODEL_READY_DIR
    / "training"
)

MODEL_READY_VALIDATION_DIR = (
    MODEL_READY_DIR
    / "validation"
)

MODEL_READY_TRAINING_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_READY_VALIDATION_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# SETTINGS
# ============================================================

DATASETS = [

    "cpu_motherboard.csv",
    "cpu_cooler.csv",
    "ram_motherboard.csv",
    "gpu_case.csv",
    "cooler_case.csv",
    "motherboard_case.csv",
    "psu_case.csv",
    "storage_motherboard.csv",

]


# ============================================================
# ID COLUMNS
#
# IDs are identifiers, not meaningful hardware features.
# They should NOT be used as model input.
# ============================================================

ID_COLUMNS = {

    "cpu_motherboard.csv": [
        "cpu_id",
        "motherboard_id",
    ],

    "cpu_cooler.csv": [
        "cpu_id",
        "cooler_id",
    ],

    "ram_motherboard.csv": [
        "ram_id",
        "motherboard_id",
    ],

    "gpu_case.csv": [
        "gpu_id",
        "case_id",
    ],

    "cooler_case.csv": [
        "cooler_id",
        "case_id",
    ],

    "motherboard_case.csv": [
        "motherboard_id",
        "case_id",
    ],

    "psu_case.csv": [
        "psu_id",
        "case_id",
    ],

    "storage_motherboard.csv": [
        "storage_id",
        "motherboard_id",
    ],

}


# ============================================================
# LABEL LEAKAGE COLUMNS
#
# These columns were directly used to create the label.
# They MUST NOT be used as model features.
# ============================================================

LEAKAGE_COLUMNS = {

    "cpu_motherboard.csv": [
        "socket_match",
    ],

    "cpu_cooler.csv": [
        "socket_match",
    ],

    "ram_motherboard.csv": [
        "ram_type_match",
    ],

    "gpu_case.csv": [
        "gpu_case_length_ok",
    ],

    "cooler_case.csv": [
        "cooler_case_height_ok",
    ],

    "motherboard_case.csv": [
        "form_factor_match",
    ],

    "psu_case.csv": [
        "psu_form_factor_match",
        "psu_length_ok",
    ],

    "storage_motherboard.csv": [
        "storage_m2_slot_ok",
    ],

}


# ============================================================
# TARGET
# ============================================================

TARGET_COLUMN = "label"


# ============================================================
# HELPERS
# ============================================================

def load_csv(path):

    if not path.exists():

        print(
            f"❌ File not found: {path}"
        )

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

        print(
            f"❌ Cannot read: {path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return []


def save_csv(
    path,
    rows,
    fieldnames
):

    try:

        with open(
            path,
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

        return True

    except Exception as e:

        print(
            f"❌ Cannot save: {path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return False


def get_columns(rows):

    if not rows:
        return []

    return list(rows[0].keys())


def clean_rows(
    rows,
    dataset_name
):

    if not rows:

        return [], []

    columns = get_columns(rows)

    id_columns = set(
        ID_COLUMNS.get(
            dataset_name,
            []
        )
    )

    leakage_columns = set(
        LEAKAGE_COLUMNS.get(
            dataset_name,
            []
        )
    )

    remove_columns = (
        id_columns
        |
        leakage_columns
    )

    # --------------------------------------------------------
    # Make sure label exists
    # --------------------------------------------------------

    if TARGET_COLUMN not in columns:

        print(
            f"❌ Missing target column "
            f"'{TARGET_COLUMN}'"
        )

        return [], []

    # --------------------------------------------------------
    # Keep normal features + label
    # --------------------------------------------------------

    output_columns = [

        column

        for column in columns

        if column not in remove_columns

    ]

    # --------------------------------------------------------
    # Make sure label is last
    # --------------------------------------------------------

    output_columns = [

        column

        for column in output_columns

        if column != TARGET_COLUMN

    ]

    output_columns.append(
        TARGET_COLUMN
    )

    # --------------------------------------------------------
    # Build cleaned rows
    # --------------------------------------------------------

    cleaned = []

    for row in rows:

        new_row = {

            column:
            row.get(
                column,
                ""
            )

            for column in output_columns

        }

        cleaned.append(
            new_row
        )

    return (
        cleaned,
        output_columns
    )


def validate_labels(
    rows,
    dataset_name
):

    invalid = 0

    compatible = 0
    incompatible = 0

    for row in rows:

        label = str(
            row.get(
                TARGET_COLUMN,
                ""
            )
        ).strip()

        if label == "1":

            compatible += 1

        elif label == "0":

            incompatible += 1

        else:

            invalid += 1

    print(
        f"   Compatible   : "
        f"{compatible:,}"
    )

    print(
        f"   Incompatible : "
        f"{incompatible:,}"
    )

    if invalid:

        print(
            f"   ❌ Invalid labels: "
            f"{invalid:,}"
        )

        return False

    print(
        "   ✅ Labels valid"
    )

    return True


def check_leakage(
    fieldnames,
    dataset_name
):

    leakage = set(
        LEAKAGE_COLUMNS.get(
            dataset_name,
            []
        )
    )

    found = [

        column

        for column in fieldnames

        if column in leakage

    ]

    if found:

        print(
            "   ❌ Leakage columns still present:"
        )

        for column in found:

            print(
                f"      - {column}"
            )

        return False

    print(
        "   ✅ No known label leakage columns"
    )

    return True


def check_ids(
    fieldnames,
    dataset_name
):

    ids = set(
        ID_COLUMNS.get(
            dataset_name,
            []
        )
    )

    found = [

        column

        for column in fieldnames

        if column in ids

    ]

    if found:

        print(
            "   ❌ ID columns still present:"
        )

        for column in found:

            print(
                f"      - {column}"
            )

        return False

    print(
        "   ✅ No ID columns"
    )

    return True


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - "
        "PREPARE MODEL READY DATASET"
    )

    print("=" * 70)

    print()

    print(
        "📂 Training Input:"
    )

    print(
        f"   {TRAINING_DIR}"
    )

    print()

    print(
        "📂 Validation Input:"
    )

    print(
        f"   {VALIDATION_DIR}"
    )

    print()

    print(
        "📂 Model Ready Output:"
    )

    print(
        f"   {MODEL_READY_DIR}"
    )


    # ========================================================
    # SUMMARY
    # ========================================================

    summary = []

    all_passed = True


    # ========================================================
    # PROCESS EACH DATASET
    # ========================================================

    for dataset_name in DATASETS:

        print()
        print("=" * 70)

        print(
            f"📦 DATASET: "
            f"{dataset_name}"
        )

        print("=" * 70)


        training_path = (
            TRAINING_DIR
            / dataset_name
        )

        validation_path = (
            VALIDATION_DIR
            / dataset_name
        )


        # ----------------------------------------------------
        # LOAD
        # ----------------------------------------------------

        print()
        print(
            "1️⃣ LOAD DATA"
        )

        training_rows = load_csv(
            training_path
        )

        validation_rows = load_csv(
            validation_path
        )

        print(
            f"   Training   : "
            f"{len(training_rows):,}"
        )

        print(
            f"   Validation : "
            f"{len(validation_rows):,}"
        )


        if not training_rows:

            print(
                "❌ Training dataset empty"
            )

            all_passed = False

            continue


        if not validation_rows:

            print(
                "❌ Validation dataset empty"
            )

            all_passed = False

            continue


        # ----------------------------------------------------
        # SHOW COLUMNS TO REMOVE
        # ----------------------------------------------------

        id_columns = ID_COLUMNS.get(
            dataset_name,
            []
        )

        leakage_columns = LEAKAGE_COLUMNS.get(
            dataset_name,
            []
        )

        print()
        print(
            "2️⃣ REMOVE NON-FEATURE COLUMNS"
        )

        print()
        print(
            "   🔑 ID columns:"
        )

        for column in id_columns:

            print(
                f"      - {column}"
            )

        print()
        print(
            "   🚨 Label leakage columns:"
        )

        for column in leakage_columns:

            print(
                f"      - {column}"
            )


        # ----------------------------------------------------
        # CLEAN TRAINING
        # ----------------------------------------------------

        (
            clean_training,
            training_columns
        ) = clean_rows(
            training_rows,
            dataset_name
        )


        # ----------------------------------------------------
        # CLEAN VALIDATION
        # ----------------------------------------------------

        (
            clean_validation,
            validation_columns
        ) = clean_rows(
            validation_rows,
            dataset_name
        )


        # ----------------------------------------------------
        # CHECK CLEANING RESULT
        # ----------------------------------------------------

        if not training_columns:

            print(
                "❌ Training columns are empty"
            )

            all_passed = False

            continue


        if not validation_columns:

            print(
                "❌ Validation columns are empty"
            )

            all_passed = False

            continue


        # ----------------------------------------------------
        # SCHEMA CHECK
        # ----------------------------------------------------

        print()
        print(
            "3️⃣ SCHEMA CHECK"
        )

        training_column_set = set(
            training_columns
        )

        validation_column_set = set(
            validation_columns
        )


        # ----------------------------------------------------
        # Compare column names
        # ----------------------------------------------------

        if training_column_set != validation_column_set:

            print(
                "❌ Training / Validation "
                "columns are different"
            )

            training_only = (
                training_column_set
                -
                validation_column_set
            )

            validation_only = (
                validation_column_set
                -
                training_column_set
            )


            if training_only:

                print()
                print(
                    "Training only:"
                )

                for column in sorted(
                    training_only
                ):

                    print(
                        f"   - {column}"
                    )


            if validation_only:

                print()
                print(
                    "Validation only:"
                )

                for column in sorted(
                    validation_only
                ):

                    print(
                        f"   - {column}"
                    )


            all_passed = False

            continue


        # ----------------------------------------------------
        # Column names match.
        #
        # Order may differ because Training and Validation
        # were generated independently.
        #
        # Training order becomes the standard.
        # ----------------------------------------------------

        if training_columns != validation_columns:

            print(
                "   ℹ️ Column order differs"
            )

            print(
                "   → Reordering Validation "
                "columns to match Training"
            )


        validation_columns = list(
            training_columns
        )


        reordered_validation = []

        for row in clean_validation:

            reordered_row = {

                column:
                row.get(
                    column,
                    ""
                )

                for column in validation_columns

            }

            reordered_validation.append(
                reordered_row
            )


        clean_validation = (
            reordered_validation
        )


        print(
            f"   Columns: "
            f"{len(training_columns)}"
        )

        print(
            "   ✅ Training / Validation schema match"
        )


        # ----------------------------------------------------
        # TARGET CHECK
        # ----------------------------------------------------

        print()
        print(
            "4️⃣ TARGET CHECK"
        )

        if TARGET_COLUMN not in training_columns:

            print(
                "❌ label column missing"
            )

            all_passed = False

            continue


        print(
            "   ✅ label column exists"
        )

        print()

        print(
            "   Training:"
        )

        train_labels_ok = validate_labels(
            clean_training,
            dataset_name
        )

        print()

        print(
            "   Validation:"
        )

        validation_labels_ok = validate_labels(
            clean_validation,
            dataset_name
        )


        if not (
            train_labels_ok
            and
            validation_labels_ok
        ):

            all_passed = False


        # ----------------------------------------------------
        # LEAKAGE CHECK
        # ----------------------------------------------------

        print()
        print(
            "5️⃣ LABEL LEAKAGE CHECK"
        )

        leakage_ok = check_leakage(
            training_columns,
            dataset_name
        )

        if not leakage_ok:

            all_passed = False


        # ----------------------------------------------------
        # ID CHECK
        # ----------------------------------------------------

        print()
        print(
            "6️⃣ ID COLUMN CHECK"
        )

        id_ok = check_ids(
            training_columns,
            dataset_name
        )

        if not id_ok:

            all_passed = False


        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        print()
        print(
            "7️⃣ SAVE MODEL READY DATA"
        )

        training_output = (
            MODEL_READY_TRAINING_DIR
            / dataset_name
        )

        validation_output = (
            MODEL_READY_VALIDATION_DIR
            / dataset_name
        )


        training_saved = save_csv(
            training_output,
            clean_training,
            training_columns
        )


        validation_saved = save_csv(
            validation_output,
            clean_validation,
            validation_columns
        )


        if training_saved:

            print(
                "   ✅ Training:"
            )

            print(
                f"      {training_output}"
            )

        else:

            all_passed = False


        if validation_saved:

            print(
                "   ✅ Validation:"
            )

            print(
                f"      {validation_output}"
            )

        else:

            all_passed = False


        # ----------------------------------------------------
        # SUMMARY
        # ----------------------------------------------------

        summary.append({

            "dataset":
                dataset_name,

            "training_rows":
                len(clean_training),

            "validation_rows":
                len(clean_validation),

            "columns":
                len(training_columns),

            "leakage_removed":
                len(leakage_columns),

            "ids_removed":
                len(id_columns),

        })


    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    summary_path = (
        MODEL_READY_DIR
        / "model_ready_summary.csv"
    )


    save_csv(
        summary_path,
        summary,
        [
            "dataset",
            "training_rows",
            "validation_rows",
            "columns",
            "leakage_removed",
            "ids_removed",
        ]
    )


    # ========================================================
    # FINAL CHECK
    # ========================================================

    print()
    print("=" * 70)

    print(
        "📊 MODEL READY DATASET SUMMARY"
    )

    print("=" * 70)


    total_training = sum(
        row["training_rows"]
        for row in summary
    )


    total_validation = sum(
        row["validation_rows"]
        for row in summary
    )


    print(
        f"Training Records   : "
        f"{total_training:,}"
    )

    print(
        f"Validation Records : "
        f"{total_validation:,}"
    )

    print(
        f"Datasets           : "
        f"{len(summary)}"
    )


    print()

    print(
        "📁 Output:"
    )

    print(
        f"   {MODEL_READY_TRAINING_DIR}"
    )

    print(
        f"   {MODEL_READY_VALIDATION_DIR}"
    )


    print()

    print(
        "📄 Summary:"
    )

    print(
        f"   {summary_path}"
    )


    print()
    print("=" * 70)


    if all_passed:

        print(
            "✅ MODEL READY DATASET "
            "สร้างเสร็จสมบูรณ์"
        )

        print()

        print(
            "✅ ID columns removed"
        )

        print(
            "✅ Label leakage columns removed"
        )

        print(
            "✅ Training / Validation schema match"
        )

        print(
            "✅ Validation column order matched "
            "with Training"
        )

        print(
            "✅ Labels valid"
        )

        print()

        print(
            "➡️ ขั้นต่อไป:"
        )

        print(
            "   PREPROCESSING → ENCODING → "
            "TRAIN AI → EVALUATION"
        )

    else:

        print(
            "⚠️ MODEL READY DATASET "
            "สร้างเสร็จ แต่พบปัญหา"
        )

        print(
            "กรุณาตรวจข้อความด้านบน"
        )


    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()