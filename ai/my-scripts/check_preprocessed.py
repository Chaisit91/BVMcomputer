from pathlib import Path

import json
import numpy as np


# ============================================================
# BuildCores OpenDB - PREPROCESSED DATA CHECK
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

PREPROCESSED_DIR = (
    ROOT
    / "data"
    / "processed"
    / "preprocessed"
)

TRAINING_DIR = PREPROCESSED_DIR / "training"
VALIDATION_DIR = PREPROCESSED_DIR / "validation"
PREPROCESSOR_DIR = PREPROCESSED_DIR / "preprocessors"


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


EXPECTED_TRAINING_RECORDS = 20_000
EXPECTED_VALIDATION_RECORDS = 4_000


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("BuildCores OpenDB - PREPROCESSED DATA CHECK")
print("=" * 70)

print()
print("📂 Preprocessed:")
print(f"   {PREPROCESSED_DIR}")

print()
print("=" * 70)


# ============================================================
# GLOBAL SUMMARY
# ============================================================

total_datasets = len(DATASETS)

passed_datasets = 0
failed_datasets = 0

total_training = 0
total_validation = 0

summary = []


# ============================================================
# CHECK EACH DATASET
# ============================================================

for index, dataset in enumerate(DATASETS, start=1):

    print()
    print("=" * 70)
    print(f"📦 DATASET {index}/{total_datasets}: {dataset}")
    print("=" * 70)

    dataset_pass = True

    train_file = TRAINING_DIR / f"{dataset}.npz"
    val_file = VALIDATION_DIR / f"{dataset}.npz"

    preprocessor_file = (
        PREPROCESSOR_DIR
        / f"{dataset}_preprocessor.joblib"
    )

    feature_file = (
        PREPROCESSOR_DIR
        / f"{dataset}_features.json"
    )

    # --------------------------------------------------------
    # 1. FILE CHECK
    # --------------------------------------------------------

    print()
    print("1️⃣ FILE CHECK")

    if train_file.exists():
        print("   ✅ Training .npz")
    else:
        print("   ❌ Training .npz not found")
        dataset_pass = False

    if val_file.exists():
        print("   ✅ Validation .npz")
    else:
        print("   ❌ Validation .npz not found")
        dataset_pass = False

    if preprocessor_file.exists():
        print("   ✅ Preprocessor")
    else:
        print("   ❌ Preprocessor not found")
        dataset_pass = False

    if feature_file.exists():
        print("   ✅ Feature names")
    else:
        print("   ❌ Feature names not found")
        dataset_pass = False

    if not dataset_pass:
        failed_datasets += 1
        continue

    # --------------------------------------------------------
    # 2. LOAD NPZ
    # --------------------------------------------------------

    print()
    print("2️⃣ LOAD PREPROCESSED DATA")

    try:

        train_data = np.load(train_file)
        val_data = np.load(val_file)

        X_train = train_data["X"]
        y_train = train_data["y"]

        X_val = val_data["X"]
        y_val = val_data["y"]

        print("   ✅ Training data loaded")
        print("   ✅ Validation data loaded")

    except Exception as e:

        print(f"   ❌ Failed to load data: {e}")
        failed_datasets += 1
        continue

    # --------------------------------------------------------
    # 3. RECORD COUNT
    # --------------------------------------------------------

    print()
    print("3️⃣ RECORD COUNT")

    train_records = X_train.shape[0]
    val_records = X_val.shape[0]

    print(f"   Training   : {train_records:,}")
    print(f"   Validation : {val_records:,}")

    total_training += train_records
    total_validation += val_records

    if train_records == EXPECTED_TRAINING_RECORDS:

        print("   ✅ Training record count correct")

    else:

        print(
            f"   ❌ Expected {EXPECTED_TRAINING_RECORDS:,}"
        )

        dataset_pass = False

    if val_records == EXPECTED_VALIDATION_RECORDS:

        print("   ✅ Validation record count correct")

    else:

        print(
            f"   ❌ Expected {EXPECTED_VALIDATION_RECORDS:,}"
        )

        dataset_pass = False

    # --------------------------------------------------------
    # 4. SHAPE CHECK
    # --------------------------------------------------------

    print()
    print("4️⃣ SHAPE CHECK")

    print(f"   Training X : {X_train.shape}")
    print(f"   Training y : {y_train.shape}")

    print(f"   Validation X : {X_val.shape}")
    print(f"   Validation y : {y_val.shape}")

    if X_train.ndim == 2:

        print("   ✅ Training X is 2D")

    else:

        print("   ❌ Training X must be 2D")
        dataset_pass = False

    if X_val.ndim == 2:

        print("   ✅ Validation X is 2D")

    else:

        print("   ❌ Validation X must be 2D")
        dataset_pass = False

    if y_train.ndim == 1:

        print("   ✅ Training y is 1D")

    else:

        print("   ❌ Training y must be 1D")
        dataset_pass = False

    if y_val.ndim == 1:

        print("   ✅ Validation y is 1D")

    else:

        print("   ❌ Validation y must be 1D")
        dataset_pass = False

    # --------------------------------------------------------
    # 5. FEATURE COUNT MATCH
    # --------------------------------------------------------

    print()
    print("5️⃣ FEATURE COUNT CHECK")

    train_features = X_train.shape[1]
    val_features = X_val.shape[1]

    print(f"   Training features   : {train_features:,}")
    print(f"   Validation features : {val_features:,}")

    if train_features == val_features:

        print("   ✅ Feature count matches")

    else:

        print("   ❌ Feature count mismatch")
        dataset_pass = False

    # --------------------------------------------------------
    # 6. FEATURE NAMES CHECK
    # --------------------------------------------------------

    print()
    print("6️⃣ FEATURE NAMES CHECK")

    try:

        with open(
            feature_file,
            "r",
            encoding="utf-8",
        ) as f:

            feature_names = json.load(f)

        feature_name_count = len(feature_names)

        print(
            f"   Feature names : {feature_name_count:,}"
        )

        if feature_name_count == train_features:

            print("   ✅ Feature names count matches")

        else:

            print(
                "   ❌ Feature names count does not match"
            )

            dataset_pass = False

    except Exception as e:

        print(f"   ❌ Failed to read feature names: {e}")
        dataset_pass = False

    # --------------------------------------------------------
    # 7. TARGET CHECK
    # --------------------------------------------------------

    print()
    print("7️⃣ TARGET CHECK")

    train_unique = np.unique(y_train)
    val_unique = np.unique(y_val)

    print(f"   Training labels   : {train_unique}")
    print(f"   Validation labels : {val_unique}")

    valid_labels = {0.0, 1.0}

    if set(train_unique).issubset(valid_labels):

        print("   ✅ Training labels valid")

    else:

        print("   ❌ Invalid Training labels")
        dataset_pass = False

    if set(val_unique).issubset(valid_labels):

        print("   ✅ Validation labels valid")

    else:

        print("   ❌ Invalid Validation labels")
        dataset_pass = False

    # --------------------------------------------------------
    # 8. CLASS BALANCE
    # --------------------------------------------------------

    print()
    print("8️⃣ CLASS BALANCE")

    train_compatible = int(np.sum(y_train == 1))
    train_incompatible = int(np.sum(y_train == 0))

    val_compatible = int(np.sum(y_val == 1))
    val_incompatible = int(np.sum(y_val == 0))

    print()
    print("   Training:")
    print(f"      Compatible   : {train_compatible:,}")
    print(f"      Incompatible : {train_incompatible:,}")

    print()
    print("   Validation:")
    print(f"      Compatible   : {val_compatible:,}")
    print(f"      Incompatible : {val_incompatible:,}")

    if train_compatible > 0 and train_incompatible > 0:

        print("   ✅ Training contains both classes")

    else:

        print("   ❌ Training missing a class")
        dataset_pass = False

    if val_compatible > 0 and val_incompatible > 0:

        print("   ✅ Validation contains both classes")

    else:

        print("   ❌ Validation missing a class")
        dataset_pass = False

    # --------------------------------------------------------
    # 9. NaN / INF CHECK
    # --------------------------------------------------------

    print()
    print("9️⃣ NaN / INF CHECK")

    train_nan = int(np.isnan(X_train).sum())
    val_nan = int(np.isnan(X_val).sum())

    train_inf = int(np.isinf(X_train).sum())
    val_inf = int(np.isinf(X_val).sum())

    print(f"   Training NaN : {train_nan:,}")
    print(f"   Training INF : {train_inf:,}")

    print(f"   Validation NaN : {val_nan:,}")
    print(f"   Validation INF : {val_inf:,}")

    if train_nan == 0 and train_inf == 0:

        print("   ✅ Training contains no NaN / INF")

    else:

        print("   ❌ Training contains NaN / INF")
        dataset_pass = False

    if val_nan == 0 and val_inf == 0:

        print("   ✅ Validation contains no NaN / INF")

    else:

        print("   ❌ Validation contains NaN / INF")
        dataset_pass = False

    # --------------------------------------------------------
    # 10. DATA TYPE CHECK
    # --------------------------------------------------------

    print()
    print("🔟 DATA TYPE CHECK")

    print(f"   X Training dtype   : {X_train.dtype}")
    print(f"   X Validation dtype : {X_val.dtype}")
    print(f"   y Training dtype   : {y_train.dtype}")
    print(f"   y Validation dtype : {y_val.dtype}")

    if np.issubdtype(X_train.dtype, np.floating):

        print("   ✅ Training X numeric")

    else:

        print("   ❌ Training X is not numeric")
        dataset_pass = False

    if np.issubdtype(X_val.dtype, np.floating):

        print("   ✅ Validation X numeric")

    else:

        print("   ❌ Validation X is not numeric")
        dataset_pass = False

    # --------------------------------------------------------
    # 11. BASIC RANGE CHECK
    # --------------------------------------------------------

    print()
    print("1️⃣1️⃣ FEATURE RANGE CHECK")

    train_min = float(np.min(X_train))
    train_max = float(np.max(X_train))

    val_min = float(np.min(X_val))
    val_max = float(np.max(X_val))

    print(f"   Training   : {train_min:.4f} → {train_max:.4f}")
    print(f"   Validation : {val_min:.4f} → {val_max:.4f}")

    print("   ✅ Numeric range readable")

    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    print()
    print("-" * 70)

    if dataset_pass:

        print(f"✅ {dataset} : PASS")
        passed_datasets += 1

    else:

        print(f"❌ {dataset} : FAIL")
        failed_datasets += 1

    summary.append(
        {
            "dataset": dataset,
            "training_records": train_records,
            "validation_records": val_records,
            "training_features": train_features,
            "validation_features": val_features,
            "training_compatible": train_compatible,
            "training_incompatible": train_incompatible,
            "validation_compatible": val_compatible,
            "validation_incompatible": val_incompatible,
            "status": "PASS" if dataset_pass else "FAIL",
        }
    )


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 70)
print("📊 PREPROCESSED DATASET SUMMARY")
print("=" * 70)

print()
print(f"Datasets checked : {total_datasets}")
print(f"Datasets passed  : {passed_datasets}")
print(f"Datasets failed  : {failed_datasets}")

print()
print(f"Training records   : {total_training:,}")
print(f"Validation records : {total_validation:,}")

print()
print("-" * 70)

for item in summary:

    print(
        f"{item['dataset']:<25}"
        f"Train: {item['training_records']:>6,}  "
        f"Val: {item['validation_records']:>5,}  "
        f"Features: {item['training_features']:>5,}  "
        f"{item['status']}"
    )


# ============================================================
# FINAL DECISION
# ============================================================

print()
print("=" * 70)

if failed_datasets == 0:

    print("🎉 ALL 8 DATASETS PASSED")
    print("=" * 70)

    print()
    print("✅ Files exist")
    print("✅ Training / Validation records correct")
    print("✅ Shapes correct")
    print("✅ Feature counts match")
    print("✅ Feature names match")
    print("✅ Labels valid")
    print("✅ Both classes exist")
    print("✅ No NaN")
    print("✅ No INF")
    print("✅ Features are numeric")

    print()
    print("➡️ DATA IS READY FOR TRAINING")
    print("➡️ ขั้นต่อไป: TRAIN AI")

else:

    print("⚠️ SOME DATASETS FAILED")
    print("=" * 70)

    print()
    print("❌ ตรวจสอบ Dataset ที่มีสถานะ FAIL ก่อน Train AI")


print()
print("=" * 70)
print("CHECK COMPLETE")
print("=" * 70)