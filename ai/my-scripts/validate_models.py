import pandas as pd
import numpy as np
import joblib
import sys
from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

# ============================================================
# PATH
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

VALIDATION_DIR = ROOT / "data" / "processed" / "validated"
MODEL_DIR = ROOT / "models"

OUTPUT_FILE = MODEL_DIR / "validation_summary.csv"


# ============================================================
# DATASET CONFIG
# ============================================================

DATASETS = {

    "cpu_motherboard": {
        "file": "cpu_motherboard.csv",
        "model": "cpu_motherboard/model.pkl",

        "id_columns": [
            "cpu_id",
            "motherboard_id"
        ],

        "target": "label",

        "remove_columns": [
            "socket_match"
        ]
    },

    "cpu_cooler": {
        "file": "cpu_cooler.csv",
        "model": "cpu_cooler/model.pkl",

        "id_columns": [
            "cpu_id",
            "cooler_id"
        ],

        "target": "label",

        "remove_columns": [
            "socket_match"
        ]
    },

    "ram_motherboard": {
        "file": "ram_motherboard.csv",
        "model": "ram_motherboard/model.pkl",

        "id_columns": [
            "ram_id",
            "motherboard_id"
        ],

        "target": "label",

        "remove_columns": [
            "ram_type_match"
        ]
    },

    "gpu_case": {
        "file": "gpu_case.csv",
        "model": "gpu_case/model.pkl",

        "id_columns": [
            "gpu_id",
            "case_id"
        ],

        "target": "label",

        "remove_columns": [
            "gpu_case_length_ok",
            "case_max_gpu_length"
        ]
    },

    "cooler_case": {
        "file": "cooler_case.csv",
        "model": "cooler_case/model.pkl",

        "id_columns": [
            "cooler_id",
            "case_id"
        ],

        "target": "label",

        "remove_columns": [
            "cooler_case_height_ok",
            "case_max_cooler_height"
        ]
    },

    "motherboard_case": {
        "file": "motherboard_case.csv",
        "model": "motherboard_case/model.pkl",

        "id_columns": [
            "motherboard_id",
            "case_id"
        ],

        "target": "label",

        "remove_columns": [
            "form_factor_match",
            "case_supported_form_factors"
        ]
    },

    "psu_case": {
        "file": "psu_case.csv",
        "model": "psu_case/model.pkl",

        "id_columns": [
            "psu_id",
            "case_id"
        ],

        "target": "label",

        "remove_columns": [
            "psu_form_factor_match",
            "psu_length_ok"
        ]
    }
}


# ============================================================
# CLEAN DATAFRAME
# ============================================================

def clean_dataframe(df):

    df = df.copy()

    df = df.replace(
        [
            "",
            " ",
            "None",
            "none",
            "NULL",
            "null"
        ],
        np.nan
    )

    return df


# ============================================================
# CONVERT NUMERIC
# ============================================================

def convert_numeric_columns(df):

    df = df.copy()

    numeric_candidates = [

        # CPU
        "cpu_cores",
        "cpu_threads",
        "cpu_base_clock",
        "cpu_boost_clock",
        "cpu_tdp",

        # Cooler
        "cooler_tdp",
        "cooler_height",
        "fan_quantity",
        "fan_size",
        "radiator_size",

        # RAM
        "ram_speed",
        "ram_capacity",
        "ram_modules",
        "ram_cas_latency",

        # Motherboard
        "motherboard_memory_max",
        "motherboard_memory_slots",

        # GPU
        "gpu_memory",
        "gpu_tdp",
        "gpu_length",
        "gpu_slot_width",

        # Case
        "case_max_gpu_length",
        "length_difference",
        "case_max_cooler_height",
        "height_difference",

        # PSU
        "psu_wattage",
        "psu_length",
        "case_psu_clearance"
    ]

    for col in numeric_candidates:

        if col in df.columns:

            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            )

    return df


# ============================================================
# GET MODEL FEATURES
# ============================================================

def get_model_features(model):

    # --------------------------------------------------------
    # Direct model
    # --------------------------------------------------------

    if hasattr(model, "feature_names_in_"):

        return list(model.feature_names_in_)

    # --------------------------------------------------------
    # Pipeline
    # --------------------------------------------------------

    if hasattr(model, "named_steps"):

        for _, step in model.named_steps.items():

            if hasattr(step, "feature_names_in_"):

                return list(
                    step.feature_names_in_
                )

    return None


# ============================================================
# VALIDATE ONE MODEL
# ============================================================

def validate_model(name, config):

    print()
    print("=" * 70)
    print(f"🤖 VALIDATE MODEL: {name.upper()}")
    print("=" * 70)

    validation_file = VALIDATION_DIR / config["file"]
    model_file = MODEL_DIR / config["model"]

    # ========================================================
    # CHECK FILE
    # ========================================================

    if not validation_file.exists():

        print()
        print("❌ ไม่พบ validation file:")
        print(f"   {validation_file}")

        return None

    if not model_file.exists():

        print()
        print("❌ ไม่พบ model:")
        print(f"   {model_file}")

        return None

    # ========================================================
    # LOAD DATA
    # ========================================================

    df = pd.read_csv(validation_file)

    print()
    print(f"📥 Records: {len(df):,}")

    df = clean_dataframe(df)

    print(f"✅ Valid records: {len(df):,}")

    # ========================================================
    # TARGET
    # ========================================================

    target = config["target"]

    if target not in df.columns:

        print()
        print(f"❌ ไม่พบ target column: {target}")

        return None

    y = pd.to_numeric(
        df[target],
        errors="coerce"
    )

    valid_target = y.notna()

    df = df.loc[valid_target].copy()

    y = y.loc[valid_target].astype(int)

    print()
    print(f"🎯 Target: {target}")

    # ========================================================
    # CLASS DISTRIBUTION
    # ========================================================

    print()
    print("📊 Class Distribution")

    counts = y.value_counts().sort_index()

    for cls, count in counts.items():

        label = (
            "Compatible"
            if cls == 1
            else "Incompatible"
        )

        print(
            f"   {label:<15}: {count:,}"
        )

    # ========================================================
    # REMOVE ID + TARGET + TRAINING HELPERS
    # ========================================================

    remove_columns = []

    for col in config["id_columns"]:

        if col in df.columns:
            remove_columns.append(col)

    if target in df.columns:
        remove_columns.append(target)

    for col in config.get(
        "remove_columns",
        []
    ):

        if col in df.columns:
            remove_columns.append(col)

    remove_columns = list(
        dict.fromkeys(remove_columns)
    )

    print()
    print("🧹 Remove columns:")

    if remove_columns:

        for col in remove_columns:
            print(f"   - {col}")

    else:

        print("   - None")

    # ========================================================
    # BUILD X
    # ========================================================

    X = df.drop(
        columns=remove_columns,
        errors="ignore"
    )

    X = convert_numeric_columns(X)

    # ========================================================
    # LOAD MODEL
    # ========================================================

    print()
    print("📦 Loading model...")

    try:

        model = joblib.load(
            model_file
        )

    except Exception as e:

        print()
        print("❌ Model Load Error")
        print(
            f"   {type(e).__name__}: {e}"
        )

        return None

    print("✅ Model loaded")

    # ========================================================
    # MODEL FEATURES
    # ========================================================

    print()
    print("🔍 Checking model features...")

    model_features = get_model_features(model)

    if model_features is None:

        print(
            "⚠️ ไม่สามารถอ่าน model feature names ได้"
        )

        print(
            "⚠️ ใช้ features จาก validation dataset"
        )

    else:

        print(
            f"   Model Features : {len(model_features)}"
        )

        print(
            f"   Input Features : {len(X.columns)}"
        )

        # ----------------------------------------------------
        # Missing
        # ----------------------------------------------------

        missing = [
            col
            for col in model_features
            if col not in X.columns
        ]

        if missing:

            print()
            print("❌ Missing features:")

            for col in missing:
                print(f"   - {col}")

            print()
            print(
                "❌ ไม่สามารถ validation model นี้ได้"
            )

            return None

        # ----------------------------------------------------
        # Extra
        # ----------------------------------------------------

        extra = [
            col
            for col in X.columns
            if col not in model_features
        ]

        if extra:

            print()
            print("⚠️ Extra features:")

            for col in extra:
                print(f"   - {col}")

            print()
            print(
                "🧹 Removing extra features..."
            )

        # ----------------------------------------------------
        # EXACT MODEL FEATURE ORDER
        # ----------------------------------------------------

        X = X[
            model_features
        ]

        print()
        print(
            "✅ Feature structure matches model"
        )

    # ========================================================
    # DATA SHAPE
    # ========================================================

    print()
    print(
        f"📊 Validation Features: {X.shape[1]}"
    )

    print()
    print("🔢 Data shape:")

    print(
        f"   Rows    : {X.shape[0]:,}"
    )

    print(
        f"   Columns : {X.shape[1]}"
    )

    print()
    print("📋 Features:")

    for col in X.columns:
        print(f"   - {col}")

    # ========================================================
    # CHECK MISSING VALUES
    # ========================================================

    missing_values = X.isna().sum()

    missing_total = missing_values.sum()

    if missing_total > 0:

        print()
        print(
            f"⚠️ Missing values: {missing_total:,}"
        )

        for col, count in missing_values.items():

            if count > 0:

                print(
                    f"   - {col}: {count:,}"
                )

    # ========================================================
    # PREDICT
    # ========================================================

    print()
    print("🔮 Predicting...")

    try:

        predictions = model.predict(X)

        predictions = np.asarray(
            predictions
        ).astype(int)

    except Exception as e:

        print()
        print("❌ Prediction Error")

        print(
            f"   {type(e).__name__}: {e}"
        )

        print()
        print("🔍 X type:")
        print(f"   {type(X)}")

        print()
        print("🔍 X shape:")
        print(f"   {X.shape}")

        print()
        print("🔍 X columns:")
        print(
            list(X.columns)
        )

        return None

    # ========================================================
    # METRICS
    # ========================================================

    accuracy = accuracy_score(
        y,
        predictions
    )

    precision = precision_score(
        y,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y,
        predictions,
        zero_division=0
    )

    cm = confusion_matrix(
        y,
        predictions
    )

    # ========================================================
    # PERFORMANCE
    # ========================================================

    print()
    print("📊 VALIDATION PERFORMANCE")
    print("-" * 70)

    print(
        f"Accuracy : {accuracy:.4f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall   : {recall:.4f}"
    )

    print(
        f"F1 Score : {f1:.4f}"
    )

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

    print()
    print("Confusion Matrix:")

    print(cm)

    # ========================================================
    # CLASSIFICATION REPORT
    # ========================================================

    print()
    print("Classification Report:")

    print(
        classification_report(
            y,
            predictions,
            labels=[0, 1],
            target_names=[
                "Incompatible",
                "Compatible"
            ],
            zero_division=0
        )
    )

    # ========================================================
    # RESULT
    # ========================================================

    return {

        "dataset": name,

        "records": len(df),

        "features": X.shape[1],

        "accuracy": accuracy,

        "precision": precision,

        "recall": recall,

        "f1_score": f1
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("BuildCores OpenDB - VALIDATE AI MODELS")
    print("=" * 70)

    print()
    print(
        f"📂 Validation Data: {VALIDATION_DIR}"
    )

    print(
        f"📂 Models: {MODEL_DIR}"
    )

    print(
        f"📄 Output: {OUTPUT_FILE}"
    )

    results = []

    # ========================================================
    # VALIDATE ALL MODELS
    # ========================================================

    print()
    print("=" * 70)
    print("1. VALIDATE MODELS")
    print("=" * 70)

    for name, config in DATASETS.items():

        print()
        print(
            f"📄 Validation: {config['file']}"
        )

        result = validate_model(
            name,
            config
        )

        if result is not None:

            results.append(result)

    # ========================================================
    # SUMMARY
    # ========================================================

    print()
    print("=" * 70)
    print("📊 VALIDATION SUMMARY")
    print("=" * 70)

    if not results:

        print()
        print(
            "❌ ไม่มี model ที่ validation สำเร็จ"
        )

        return

    summary = pd.DataFrame(
        results
    )

    # ========================================================
    # SAVE
    # ========================================================

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    summary.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    # ========================================================
    # PRINT SUMMARY
    # ========================================================

    print()

    for _, row in summary.iterrows():

        print(
            f"{row['dataset']:<25}"
            f"Accuracy={row['accuracy']:.4f}  "
            f"Precision={row['precision']:.4f}  "
            f"Recall={row['recall']:.4f}  "
            f"F1={row['f1_score']:.4f}"
        )

    print()
    print(
        "📄 Validation Summary:"
    )

    print(
        f"   {OUTPUT_FILE}"
    )

    print()
    print(
        f"✅ Validated Models: {len(results)}"
    )

    print()
    print("=" * 70)
    print("✅ MODEL VALIDATION เสร็จแล้ว")
    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()
