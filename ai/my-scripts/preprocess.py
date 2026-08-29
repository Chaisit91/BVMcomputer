import csv
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ============================================================
# BuildCores OpenDB - PREPROCESSING / ENCODING
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

MODEL_READY_DIR = (
    ROOT
    / "data"
    / "processed"
    / "model_ready"
)

PREPROCESSED_DIR = (
    ROOT
    / "data"
    / "processed"
    / "preprocessed"
)

TRAINING_DIR = PREPROCESSED_DIR / "training"
VALIDATION_DIR = PREPROCESSED_DIR / "validation"
PREPROCESSOR_DIR = PREPROCESSED_DIR / "preprocessors"


# ============================================================
# DATASETS
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


TARGET_COLUMN = "label"


# ============================================================
# CREATE DIRECTORIES
# ============================================================

TRAINING_DIR.mkdir(parents=True, exist_ok=True)
VALIDATION_DIR.mkdir(parents=True, exist_ok=True)
PREPROCESSOR_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# PRINT HEADER
# ============================================================

print("=" * 70)
print("BuildCores OpenDB - PREPROCESSING / ENCODING")
print("=" * 70)

print()
print("📂 Model Ready Input:")
print(f"   {MODEL_READY_DIR}")

print()
print("📂 Preprocessed Output:")
print(f"   {PREPROCESSED_DIR}")

print()
print("=" * 70)


summary = []


# ============================================================
# PROCESS EACH DATASET
# ============================================================

for dataset_name in DATASETS:

    print()
    print("=" * 70)
    print(f"📦 DATASET: {dataset_name}")
    print("=" * 70)

    training_file = MODEL_READY_DIR / "training" / dataset_name
    validation_file = MODEL_READY_DIR / "validation" / dataset_name

    # --------------------------------------------------------
    # 1. LOAD DATA
    # --------------------------------------------------------

    print()
    print("1️⃣ LOAD DATA")

    if not training_file.exists():
        print(f"❌ Training file not found: {training_file}")
        continue

    if not validation_file.exists():
        print(f"❌ Validation file not found: {validation_file}")
        continue

    train_df = pd.read_csv(training_file)
    val_df = pd.read_csv(validation_file)

    print(f"   Training   : {len(train_df):,}")
    print(f"   Validation : {len(val_df):,}")

    # --------------------------------------------------------
    # 2. TARGET CHECK
    # --------------------------------------------------------

    print()
    print("2️⃣ TARGET CHECK")

    if TARGET_COLUMN not in train_df.columns:
        print("❌ Training: label column not found")
        continue

    if TARGET_COLUMN not in val_df.columns:
        print("❌ Validation: label column not found")
        continue

    print("   ✅ label column exists")

    # --------------------------------------------------------
    # 3. SCHEMA CHECK
    # --------------------------------------------------------

    print()
    print("3️⃣ SCHEMA CHECK")

    if list(train_df.columns) != list(val_df.columns):

        print("   ⚠️ Column order differs")
        print("   → Reordering Validation columns")

        try:
            val_df = val_df[train_df.columns]
        except KeyError as e:
            print(f"   ❌ Schema mismatch: {e}")
            continue

    if list(train_df.columns) == list(val_df.columns):
        print("   ✅ Training / Validation schema match")

    # --------------------------------------------------------
    # 4. SEPARATE FEATURES / TARGET
    # --------------------------------------------------------

    print()
    print("4️⃣ SEPARATE FEATURES / TARGET")

    X_train = train_df.drop(columns=[TARGET_COLUMN])
    y_train = train_df[TARGET_COLUMN]

    X_val = val_df.drop(columns=[TARGET_COLUMN])
    y_val = val_df[TARGET_COLUMN]

    print(f"   Features: {X_train.shape[1]}")
    print(f"   Target  : {TARGET_COLUMN}")

    # --------------------------------------------------------
    # 5. CHECK DATA TYPES
    # --------------------------------------------------------

    print()
    print("5️⃣ DETECT FEATURE TYPES")

    numerical_columns = X_train.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_columns = X_train.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    print()
    print("   🔢 Numerical features:")

    if numerical_columns:
        for column in numerical_columns:
            print(f"      - {column}")
    else:
        print("      None")

    print()
    print("   🔤 Categorical features:")

    if categorical_columns:
        for column in categorical_columns:
            print(f"      - {column}")
    else:
        print("      None")

    # --------------------------------------------------------
    # 6. MISSING VALUE CHECK
    # --------------------------------------------------------

    print()
    print("6️⃣ MISSING VALUE CHECK")

    train_missing = int(X_train.isna().sum().sum())
    val_missing = int(X_val.isna().sum().sum())

    print(f"   Training missing values   : {train_missing:,}")
    print(f"   Validation missing values : {val_missing:,}")

    if train_missing == 0 and val_missing == 0:
        print("   ✅ No missing values")
    else:
        print("   ⚠️ Missing values detected")
        print("   → Filling missing values")

        for column in numerical_columns:

            median_value = X_train[column].median()

            X_train[column] = X_train[column].fillna(median_value)
            X_val[column] = X_val[column].fillna(median_value)

        for column in categorical_columns:

            if X_train[column].mode().empty:
                fill_value = "UNKNOWN"
            else:
                fill_value = X_train[column].mode()[0]

            X_train[column] = X_train[column].fillna(fill_value)
            X_val[column] = X_val[column].fillna(fill_value)

    # --------------------------------------------------------
    # 7. CREATE PREPROCESSOR
    # --------------------------------------------------------

    print()
    print("7️⃣ CREATE PREPROCESSOR")

    transformers = []

    if numerical_columns:

        transformers.append(
            (
                "num",
                StandardScaler(),
                numerical_columns,
            )
        )

    if categorical_columns:

        transformers.append(
            (
                "cat",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                categorical_columns,
            )
        )

    if not transformers:
        print("   ❌ No usable features found")
        continue

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop",
    )

    # --------------------------------------------------------
    # 8. FIT TRAINING ONLY
    # --------------------------------------------------------

    print()
    print("8️⃣ FIT PREPROCESSOR")

    print("   🔵 Fitting Training data...")
    
    X_train_processed = preprocessor.fit_transform(X_train)

    print("   ✅ Training fitted")

    # --------------------------------------------------------
    # 9. TRANSFORM VALIDATION
    # --------------------------------------------------------

    print()
    print("9️⃣ TRANSFORM VALIDATION")

    print("   🟢 Transforming Validation data...")

    X_val_processed = preprocessor.transform(X_val)

    print("   ✅ Validation transformed")

    # --------------------------------------------------------
    # 10. CONVERT TO NUMPY
    # --------------------------------------------------------

    X_train_processed = np.asarray(
        X_train_processed,
        dtype=np.float32,
    )

    X_val_processed = np.asarray(
        X_val_processed,
        dtype=np.float32,
    )

    y_train = np.asarray(
        y_train,
        dtype=np.float32,
    )

    y_val = np.asarray(
        y_val,
        dtype=np.float32,
    )

    # --------------------------------------------------------
    # 11. CHECK OUTPUT SHAPE
    # --------------------------------------------------------

    print()
    print("🔟 OUTPUT SHAPE")

    print(f"   Training X : {X_train_processed.shape}")
    print(f"   Training y : {y_train.shape}")

    print(f"   Validation X : {X_val_processed.shape}")
    print(f"   Validation y : {y_val.shape}")

    # --------------------------------------------------------
    # 12. SAVE NUMPY DATA
    # --------------------------------------------------------

    print()
    print("1️⃣1️⃣ SAVE PREPROCESSED DATA")

    dataset_key = Path(dataset_name).stem

    train_output = TRAINING_DIR / f"{dataset_key}.npz"
    val_output = VALIDATION_DIR / f"{dataset_key}.npz"

    np.savez_compressed(
        train_output,
        X=X_train_processed,
        y=y_train,
    )

    np.savez_compressed(
        val_output,
        X=X_val_processed,
        y=y_val,
    )

    print(f"   ✅ Training:")
    print(f"      {train_output}")

    print(f"   ✅ Validation:")
    print(f"      {val_output}")

    # --------------------------------------------------------
    # 13. SAVE PREPROCESSOR
    # --------------------------------------------------------

    print()
    print("1️⃣2️⃣ SAVE PREPROCESSOR")

    preprocessor_file = (
        PREPROCESSOR_DIR
        / f"{dataset_key}_preprocessor.joblib"
    )

    joblib.dump(
        preprocessor,
        preprocessor_file,
    )

    print(f"   ✅ Preprocessor:")
    print(f"      {preprocessor_file}")

    # --------------------------------------------------------
    # 14. SAVE FEATURE NAMES
    # --------------------------------------------------------

    try:

        feature_names = (
            preprocessor
            .get_feature_names_out()
            .tolist()
        )

    except Exception:

        feature_names = [
            f"feature_{i}"
            for i in range(X_train_processed.shape[1])
        ]

    feature_file = (
        PREPROCESSOR_DIR
        / f"{dataset_key}_features.json"
    )

    with open(
        feature_file,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            feature_names,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"   ✅ Feature names:")
    print(f"      {feature_file}")

    # --------------------------------------------------------
    # 15. SUMMARY
    # --------------------------------------------------------

    summary.append(
        {
            "dataset": dataset_name,
            "training_records": len(train_df),
            "validation_records": len(val_df),
            "original_features": X_train.shape[1],
            "processed_features": X_train_processed.shape[1],
            "numerical_features": len(numerical_columns),
            "categorical_features": len(categorical_columns),
            "training_output": str(train_output),
            "validation_output": str(val_output),
            "preprocessor": str(preprocessor_file),
        }
    )

    print()
    print("   ✅ DATASET PREPROCESSING COMPLETE")


# ============================================================
# SAVE SUMMARY
# ============================================================

print()
print("=" * 70)
print("📊 PREPROCESSING SUMMARY")
print("=" * 70)

summary_file = PREPROCESSED_DIR / "preprocessing_summary.csv"

if summary:

    summary_df = pd.DataFrame(summary)

    summary_df.to_csv(
        summary_file,
        index=False,
        encoding="utf-8-sig",
    )

    print()
    print(
        f"Datasets processed : {len(summary):,}"
    )

    print(
        f"Training records   : "
        f"{summary_df['training_records'].sum():,}"
    )

    print(
        f"Validation records : "
        f"{summary_df['validation_records'].sum():,}"
    )

    print()
    print("📄 Summary:")
    print(f"   {summary_file}")

else:

    print("❌ No datasets were processed")


print()
print("=" * 70)
print("✅ PREPROCESSING / ENCODING COMPLETE")
print("=" * 70)

print()
print("➡️ ขั้นต่อไป:")
print("   TRAIN AI → EVALUATION")