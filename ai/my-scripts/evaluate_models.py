import csv
import pickle
from pathlib import Path

import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# BuildCores OpenDB - EVALUATE AI MODELS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

VALIDATION_DIR = ROOT / "data" / "processed" / "validated"
MODEL_DIR = ROOT / "models"

RANDOM_STATE = 42


# ============================================================
# DATASETS
# ============================================================

DATASETS = {
    "cpu_motherboard": "cpu_motherboard.csv",
    "cpu_cooler": "cpu_cooler.csv",
    "ram_motherboard": "ram_motherboard.csv",
    "gpu_case": "gpu_case.csv",
    "cooler_case": "cooler_case.csv",
    "motherboard_case": "motherboard_case.csv",
    "psu_case": "psu_case.csv",
    "storage_motherboard": "storage_motherboard.csv",
}


# ============================================================
# LOAD CSV
# ============================================================

def load_validation_csv(filename):

    path = VALIDATION_DIR / filename

    if not path.exists():

        print()
        print("⚠️ Validation file not found:")
        print(f"   {path}")

        return pd.DataFrame()

    try:

        df = pd.read_csv(
            path,
            encoding="utf-8-sig"
        )

        return df

    except Exception as e:

        print()
        print("❌ Cannot read validation file:")
        print(f"   {path}")
        print(f"   Error: {type(e).__name__}: {e}")

        return pd.DataFrame()


# ============================================================
# LOAD MODEL
# ============================================================

def load_model(dataset_name):

    model_path = (
        MODEL_DIR
        / dataset_name
        / "model.pkl"
    )

    if not model_path.exists():

        print()
        print("❌ Model not found:")
        print(f"   {model_path}")

        return None

    try:

        with open(
            model_path,
            "rb"
        ) as f:

            model = pickle.load(f)

        return model

    except Exception as e:

        print()
        print("❌ Cannot load model:")
        print(f"   {model_path}")
        print(f"   Error: {type(e).__name__}: {e}")

        return None


# ============================================================
# GET MODEL FEATURES
# ============================================================

def get_model_features(model):

    try:

        preprocessor = model.named_steps["preprocessor"]

        model_features = []

        for transformer_name, transformer, columns in (
            preprocessor.transformers_
        ):

            if columns is None:
                continue

            if isinstance(columns, str):

                model_features.append(columns)

            else:

                model_features.extend(
                    list(columns)
                )

        return list(
            dict.fromkeys(
                model_features
            )
        )

    except Exception as e:

        print()
        print("❌ Cannot detect model features:")
        print(f"   {type(e).__name__}: {e}")

        return []


# ============================================================
# PREPARE VALIDATION DATA
# ============================================================

def prepare_validation_data(
    df,
    model_features
):

    if df.empty:

        return None, None

    df = df.copy()

    # --------------------------------------------------------
    # CHECK LABEL
    # --------------------------------------------------------

    if "label" not in df.columns:

        print()
        print(
            "❌ Validation dataset ไม่มี column 'label'"
        )

        return None, None

    # --------------------------------------------------------
    # CONVERT LABEL
    # --------------------------------------------------------

    df["label"] = pd.to_numeric(
        df["label"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["label"]
    )

    df["label"] = (
        df["label"]
        .astype(int)
    )

    # --------------------------------------------------------
    # REMOVE LABEL
    # --------------------------------------------------------

    y = df["label"]

    X = df.drop(
        columns=["label"]
    )

    # --------------------------------------------------------
    # SHOW ORIGINAL FEATURES
    # --------------------------------------------------------

    print()
    print(
        f"📊 Raw validation features: "
        f"{X.shape[1]}"
    )

    # --------------------------------------------------------
    # CHECK MISSING MODEL FEATURES
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in model_features
        if feature not in X.columns
    ]

    if missing_features:

        print()
        print(
            "❌ MISSING FEATURES"
        )

        print(
            "The validation dataset does not contain "
            "features required by the trained model:"
        )

        for feature in missing_features:

            print(
                f"   - {feature}"
            )

        return None, None

    # --------------------------------------------------------
    # SHOW EXTRA FEATURES
    # --------------------------------------------------------

    extra_features = [
        column
        for column in X.columns
        if column not in model_features
    ]

    if extra_features:

        print()
        print(
            "ℹ️ Extra validation features "
            "(will not be used):"
        )

        for feature in extra_features:

            print(
                f"   - {feature}"
            )

    # --------------------------------------------------------
    # ALIGN EXACTLY TO MODEL
    # --------------------------------------------------------

    X = X[
        model_features
    ].copy()

    return X, y


# ============================================================
# CHECK DATASET
# ============================================================

def check_validation_dataset(
    X,
    y,
    model_features
):

    if X is None or y is None:

        return False

    # --------------------------------------------------------
    # FEATURE COUNT
    # --------------------------------------------------------

    if len(X.columns) != len(model_features):

        print()
        print(
            "❌ Feature count mismatch"
        )

        print(
            f"   Model     : {len(model_features)}"
        )

        print(
            f"   Validation: {len(X.columns)}"
        )

        return False

    # --------------------------------------------------------
    # FEATURE ORDER
    # --------------------------------------------------------

    if list(X.columns) != list(model_features):

        print()
        print(
            "❌ Feature order mismatch"
        )

        print()
        print(
            "Model features:"
        )

        for feature in model_features:

            print(
                f"   - {feature}"
            )

        print()
        print(
            "Validation features:"
        )

        for feature in X.columns:

            print(
                f"   - {feature}"
            )

        return False

    # --------------------------------------------------------
    # CHECK LABELS
    # --------------------------------------------------------

    labels = sorted(
        y.unique().tolist()
    )

    if labels != [0, 1]:

        print()
        print(
            "❌ Validation dataset ต้องมี label 0 และ 1"
        )

        print(
            f"   Found: {labels}"
        )

        return False

    return True


# ============================================================
# EVALUATE MODEL
# ============================================================

def evaluate_model(
    dataset_name,
    filename
):

    print()
    print("=" * 70)

    print(
        f"🧪 EVALUATE MODEL: "
        f"{dataset_name.upper()}"
    )

    print("=" * 70)

    # --------------------------------------------------------
    # LOAD MODEL
    # --------------------------------------------------------

    print()
    print(
        "🤖 Loading model..."
    )

    model = load_model(
        dataset_name
    )

    if model is None:

        return None

    print(
        "✅ Model loaded"
    )

    # --------------------------------------------------------
    # GET MODEL FEATURES
    # --------------------------------------------------------

    model_features = get_model_features(
        model
    )

    if not model_features:

        print()
        print(
            "❌ ไม่สามารถอ่าน features จาก model ได้"
        )

        return None

    print()
    print(
        f"🔎 Model Features: "
        f"{len(model_features)}"
    )

    for feature in model_features:

        print(
            f"   - {feature}"
        )

    # --------------------------------------------------------
    # LOAD VALIDATION
    # --------------------------------------------------------

    print()
    print(
        "📥 Loading validation data..."
    )

    df = load_validation_csv(
        filename
    )

    if df.empty:

        print()
        print(
            "⚠️ Skip dataset"
        )

        return None

    print(
        f"📊 Validation records: "
        f"{len(df):,}"
    )

    # --------------------------------------------------------
    # PREPARE
    # --------------------------------------------------------

    X, y = prepare_validation_data(
        df,
        model_features
    )

    if X is None or y is None:

        print()
        print(
            "❌ Cannot prepare validation data"
        )

        return None

    # --------------------------------------------------------
    # CHECK DATA
    # --------------------------------------------------------

    if not check_validation_dataset(
        X,
        y,
        model_features
    ):

        print()
        print(
            "❌ Validation dataset is not compatible "
            "with this model"
        )

        return None

    print()
    print(
        "✅ Feature validation passed"
    )

    print(
        f"   Model features     : {len(model_features)}"
    )

    print(
        f"   Validation features: {len(X.columns)}"
    )

    # --------------------------------------------------------
    # CLASS DISTRIBUTION
    # --------------------------------------------------------

    print()
    print(
        "📊 Validation Class Distribution"
    )

    print(
        "-" * 70
    )

    class_counts = y.value_counts()

    for label, count in sorted(
        class_counts.items()
    ):

        if label == 1:

            name = "Compatible"

        else:

            name = "Incompatible"

        print(
            f"   {name:<15}: "
            f"{count:,}"
        )

    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    print()
    print(
        "🔮 Predicting validation data..."
    )

    try:

        predictions = model.predict(
            X
        )

    except Exception as e:

        print()
        print(
            "❌ Prediction failed:"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return None

    print(
        "✅ Prediction complete"
    )

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # PERFORMANCE
    # --------------------------------------------------------

    print()
    print(
        "📊 VALIDATION PERFORMANCE"
    )

    print(
        "-" * 70
    )

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

    # --------------------------------------------------------
    # CONFUSION MATRIX
    # --------------------------------------------------------

    print()
    print(
        "Confusion Matrix:"
    )

    cm = confusion_matrix(
        y,
        predictions,
        labels=[0, 1]
    )

    print(
        cm
    )

    # --------------------------------------------------------
    # CLASSIFICATION REPORT
    # --------------------------------------------------------

    print()
    print(
        "Classification Report:"
    )

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

    # --------------------------------------------------------
    # ERROR COUNT
    # --------------------------------------------------------

    errors = int(
        (y != predictions).sum()
    )

    correct = (
        len(y) - errors
    )

    print()
    print(
        f"❌ Incorrect predictions: "
        f"{errors:,}"
    )

    print(
        f"✅ Correct predictions  : "
        f"{correct:,}"
    )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "dataset":
            dataset_name,

        "validation_records":
            len(df),

        "features":
            len(model_features),

        "compatible":
            int(
                (y == 1).sum()
            ),

        "incompatible":
            int(
                (y == 0).sum()
            ),

        "correct":
            correct,

        "incorrect":
            errors,

        "accuracy":
            round(
                accuracy,
                6
            ),

        "precision":
            round(
                precision,
                6
            ),

        "recall":
            round(
                recall,
                6
            ),

        "f1_score":
            round(
                f1,
                6
            )
    }


# ============================================================
# SAVE SUMMARY
# ============================================================

def save_summary(results):

    if not results:

        print()
        print(
            "⚠️ ไม่มีผลลัพธ์สำหรับบันทึก"
        )

        return

    path = (
        MODEL_DIR
        / "validation_results.csv"
    )

    fieldnames = [

        "dataset",

        "validation_records",

        "features",

        "compatible",

        "incompatible",

        "correct",

        "incorrect",

        "accuracy",

        "precision",

        "recall",

        "f1_score"
    ]

    with open(
        path,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames
        )

        writer.writeheader()

        writer.writerows(
            results
        )

    print()
    print(
        "📄 Validation summary saved:"
    )

    print(
        f"   {path}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - "
        "EVALUATE AI MODELS"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Validation Data: "
        f"{VALIDATION_DIR}"
    )

    print(
        f"📂 Models: "
        f"{MODEL_DIR}"
    )

    print()

    results = []

    failed = []

    # ========================================================
    # EVALUATE ALL MODELS
    # ========================================================

    for dataset_name, filename in DATASETS.items():

        result = evaluate_model(
            dataset_name,
            filename
        )

        if result:

            results.append(
                result
            )

        else:

            failed.append(
                dataset_name
            )

    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    save_summary(
        results
    )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 70)

    print(
        "📊 FINAL VALIDATION SUMMARY"
    )

    print("=" * 70)

    if results:

        for result in results:

            print(
                f"{result['dataset']:<25}"
                f"Accuracy="
                f"{result['accuracy']:.4f}  "
                f"Precision="
                f"{result['precision']:.4f}  "
                f"Recall="
                f"{result['recall']:.4f}  "
                f"F1="
                f"{result['f1_score']:.4f}"
            )

        # ----------------------------------------------------
        # AVERAGE
        # ----------------------------------------------------

        avg_accuracy = sum(
            r["accuracy"]
            for r in results
        ) / len(results)

        avg_precision = sum(
            r["precision"]
            for r in results
        ) / len(results)

        avg_recall = sum(
            r["recall"]
            for r in results
        ) / len(results)

        avg_f1 = sum(
            r["f1_score"]
            for r in results
        ) / len(results)

        print()
        print(
            "-" * 70
        )

        print(
            f"{'AVERAGE':<25}"
            f"Accuracy="
            f"{avg_accuracy:.4f}  "
            f"Precision="
            f"{avg_precision:.4f}  "
            f"Recall="
            f"{avg_recall:.4f}  "
            f"F1="
            f"{avg_f1:.4f}"
        )

    else:

        print(
            "❌ ไม่มี model ที่สามารถ evaluate ได้"
        )

    # ========================================================
    # FAILED DATASETS
    # ========================================================

    if failed:

        print()
        print(
            "⚠️ Failed datasets:"
        )

        for dataset_name in failed:

            print(
                f"   - {dataset_name}"
            )

    # ========================================================
    # FINAL STATUS
    # ========================================================

    print()
    print(
        f"✅ Evaluated Models: "
        f"{len(results)}/{len(DATASETS)}"
    )

    print(
        f"📁 Results: "
        f"{MODEL_DIR}"
    )

    print()
    print("=" * 70)

    if len(results) == len(DATASETS):

        print(
            "✅ AI MODEL EVALUATION เสร็จสมบูรณ์"
        )

        print(
            "✅ Models และ Validation Features ตรงกันทั้งหมด"
        )

    elif len(results) > 0:

        print(
            "⚠️ AI MODEL EVALUATION เสร็จแล้ว "
            "แต่มีบาง dataset ไม่ผ่าน"
        )

    else:

        print(
            "❌ AI MODEL EVALUATION ไม่สำเร็จ"
        )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()