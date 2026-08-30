import csv
import pickle
import sys
from pathlib import Path

import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


# ============================================================
# BuildCores OpenDB - TRAIN AI MODELS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

TRAINING_DIR = ROOT / "data" / "processed" / "training"
MODEL_DIR = ROOT / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RANDOM_STATE = 42


# ============================================================
# DATASETS
# ============================================================

DATASETS = {

    "cpu_motherboard":
        "cpu_motherboard.csv",

    "cpu_cooler":
        "cpu_cooler.csv",

    "ram_motherboard":
        "ram_motherboard.csv",

    "gpu_case":
        "gpu_case.csv",

    "cooler_case":
        "cooler_case.csv",

    "motherboard_case":
        "motherboard_case.csv",

    "psu_case":
        "psu_case.csv",

}


# ============================================================
# TARGET-DERIVED / DATA LEAKAGE COLUMNS
# ============================================================
#
# IMPORTANT
#
# Raw product specifications (for example sockets, dimensions and clearances)
# are valid inference inputs. Remove only helper columns that already contain
# the compatibility decision, otherwise the model is forced to guess from
# unrelated proxy features.
# ============================================================

LEAKAGE_COLUMNS = {

    # --------------------------------------------------------
    # CPU ↔ Motherboard
    # --------------------------------------------------------

    "socket_match",

    # --------------------------------------------------------
    # RAM ↔ Motherboard
    # --------------------------------------------------------

    "ram_type_match",

    # --------------------------------------------------------
    # GPU ↔ Case
    # --------------------------------------------------------

    "gpu_case_length_ok",

    # --------------------------------------------------------
    # Cooler ↔ Case
    # --------------------------------------------------------

    "cooler_case_height_ok",

    # --------------------------------------------------------
    # Motherboard ↔ Case
    # --------------------------------------------------------

    "form_factor_match",

    # --------------------------------------------------------
    # PSU ↔ Case
    # --------------------------------------------------------

    "psu_form_factor_match",
    "psu_length_ok",

}


# ============================================================
# LOAD CSV
# ============================================================

def load_csv(filename):

    path = TRAINING_DIR / filename

    if not path.exists():

        print()
        print("❌ ไม่พบไฟล์:")
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
        print("❌ อ่านไฟล์ไม่ได้:")
        print(f"   {path}")
        print(
            f"   {type(e).__name__}: {e}"
        )

        return pd.DataFrame()


# ============================================================
# PREPARE DATA
# ============================================================

def prepare_data(df):

    if df.empty:

        return None, None

    df = df.copy()

    # ========================================================
    # CHECK LABEL
    # ========================================================

    if "label" not in df.columns:

        print(
            "❌ Dataset ไม่มี column: label"
        )

        return None, None

    # ========================================================
    # CONVERT LABEL
    # ========================================================

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

    # ========================================================
    # REMOVE ID COLUMNS
    # ========================================================

    remove_columns = []

    for column in df.columns:

        if column.endswith("_id"):

            remove_columns.append(
                column
            )

    # ========================================================
    # REMOVE LEAKAGE COLUMNS
    # ========================================================

    for column in LEAKAGE_COLUMNS:

        if column in df.columns:

            remove_columns.append(
                column
            )

    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    remove_columns = list(
        dict.fromkeys(
            remove_columns
        )
    )

    # ========================================================
    # DISPLAY REMOVED COLUMNS
    # ========================================================

    print()

    print(
        "🧹 Removed columns:"
    )

    if remove_columns:

        for column in remove_columns:

            print(
                f"   - {column}"
            )

    else:

        print(
            "   - ไม่มี"
        )

    # ========================================================
    # DROP
    # ========================================================

    df = df.drop(
        columns=remove_columns,
        errors="ignore"
    )

    # ========================================================
    # X / Y
    # ========================================================

    X = df.drop(
        columns=["label"]
    )

    y = df["label"]

    # ========================================================
    # REMOVE COMPLETELY EMPTY COLUMNS
    # ========================================================

    empty_columns = []

    for column in X.columns:

        if X[column].isna().all():

            empty_columns.append(
                column
            )

    if empty_columns:

        print()
        print(
            "🧹 Removed completely empty columns:"
        )

        for column in empty_columns:

            print(
                f"   - {column}"
            )

        X = X.drop(
            columns=empty_columns
        )

    # ========================================================
    # CHECK FEATURES
    # ========================================================

    if X.empty or X.shape[1] == 0:

        print()
        print(
            "❌ ไม่มี feature สำหรับ training"
        )

        return None, None

    return X, y


# ============================================================
# DETECT COLUMN TYPES
# ============================================================

def detect_columns(X):

    numeric_columns = (
        X.select_dtypes(
            include=["number"]
        )
        .columns
        .tolist()
    )

    categorical_columns = (
        X.select_dtypes(
            exclude=["number"]
        )
        .columns
        .tolist()
    )

    return (
        numeric_columns,
        categorical_columns
    )


# ============================================================
# BUILD MODEL
# ============================================================

def build_model(
    numeric_columns,
    categorical_columns
):

    # ========================================================
    # NUMERIC PIPELINE
    # ========================================================

    numeric_pipeline = Pipeline([

        (
            "imputer",

            SimpleImputer(
                strategy="median"
            )
        )

    ])

    # ========================================================
    # CATEGORICAL PIPELINE
    # ========================================================

    categorical_pipeline = Pipeline([

        (
            "imputer",

            SimpleImputer(
                strategy="most_frequent"
            )
        ),

        (
            "encoder",

            OneHotEncoder(
                handle_unknown="ignore"
            )
        )

    ])

    # ========================================================
    # PREPROCESSOR
    # ========================================================

    transformers = []

    if numeric_columns:

        transformers.append(
            (
                "numeric",
                numeric_pipeline,
                numeric_columns
            )
        )

    if categorical_columns:

        transformers.append(
            (
                "categorical",
                categorical_pipeline,
                categorical_columns
            )
        )

    preprocessor = ColumnTransformer(
        transformers=transformers
    )

    # ========================================================
    # RANDOM FOREST
    # ========================================================

    classifier = RandomForestClassifier(

        n_estimators=200,

        random_state=RANDOM_STATE,

        class_weight="balanced",

        n_jobs=-1

    )

    # ========================================================
    # PIPELINE
    # ========================================================

    model = Pipeline([

        (
            "preprocessor",
            preprocessor
        ),

        (
            "classifier",
            classifier
        )

    ])

    return model


# ============================================================
# TRAIN MODEL
# ============================================================

def train_model(
    dataset_name,
    filename
):

    print()
    print("=" * 70)

    print(
        f"🤖 TRAIN MODEL: "
        f"{dataset_name.upper()}"
    )

    print("=" * 70)

    # ========================================================
    # LOAD
    # ========================================================

    df = load_csv(
        filename
    )

    if df.empty:

        print(
            "⚠️ Dataset ไม่มีข้อมูล"
        )

        return None

    print(
        f"📥 Records: "
        f"{len(df):,}"
    )

    # ========================================================
    # PREPARE
    # ========================================================

    X, y = prepare_data(
        df
    )

    if X is None or X.empty:

        print(
            "❌ ไม่สามารถเตรียมข้อมูลได้"
        )

        return None

    print(
        f"📊 Features: "
        f"{X.shape[1]}"
    )

    # ========================================================
    # SHOW FEATURES
    # ========================================================

    print()
    print(
        "🔎 Model Features:"
    )

    for feature in X.columns:

        print(
            f"   - {feature}"
        )

    # ========================================================
    # COLUMN TYPES
    # ========================================================

    (
        numeric_columns,
        categorical_columns
    ) = detect_columns(
        X
    )

    print()
    print(
        f"🔢 Numeric: "
        f"{len(numeric_columns)}"
    )

    print(
        f"🔤 Categorical: "
        f"{len(categorical_columns)}"
    )

    # ========================================================
    # CLASS DISTRIBUTION
    # ========================================================

    print()
    print(
        "📊 Class Distribution"
    )

    print(
        "-" * 70
    )

    class_counts = (
        y.value_counts()
    )

    for label, count in sorted(
        class_counts.items()
    ):

        name = (
            "Compatible"
            if label == 1
            else "Incompatible"
        )

        print(
            f"   {name:<15}: "
            f"{count:,}"
        )

    # ========================================================
    # CHECK TWO CLASSES
    # ========================================================

    if len(class_counts) < 2:

        print()
        print(
            "❌ Dataset มี class ไม่ครบ 2 class"
        )

        return None

    # ========================================================
    # TRAIN / TEST SPLIT
    # ========================================================

    (
        X_train,
        X_test,
        y_train,
        y_test
    ) = train_test_split(

        X,

        y,

        test_size=0.20,

        random_state=RANDOM_STATE,

        stratify=y

    )

    print()
    print(
        f"Training: "
        f"{len(X_train):,}"
    )

    print(
        f"Testing : "
        f"{len(X_test):,}"
    )

    # ========================================================
    # BUILD MODEL
    # ========================================================

    model = build_model(

        numeric_columns,

        categorical_columns

    )

    # ========================================================
    # TRAIN
    # ========================================================

    print()
    print(
        "🚀 Training..."
    )

    model.fit(
        X_train,
        y_train
    )

    print(
        "✅ Training complete"
    )

    # ========================================================
    # PREDICT
    # ========================================================

    print()
    print(
        "🔮 Predicting..."
    )

    predictions = model.predict(
        X_test
    )

    # ========================================================
    # METRICS
    # ========================================================

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    # ========================================================
    # PERFORMANCE
    # ========================================================

    print()
    print(
        "📊 MODEL PERFORMANCE"
    )

    print(
        "-" * 70
    )

    print(
        f"Accuracy : "
        f"{accuracy:.4f}"
    )

    print(
        f"Precision: "
        f"{precision:.4f}"
    )

    print(
        f"Recall   : "
        f"{recall:.4f}"
    )

    print(
        f"F1 Score : "
        f"{f1:.4f}"
    )

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

    print()
    print(
        "Confusion Matrix:"
    )

    cm = confusion_matrix(
        y_test,
        predictions
    )

    print(cm)

    # ========================================================
    # CLASSIFICATION REPORT
    # ========================================================

    print()
    print(
        "Classification Report:"
    )

    print(
        classification_report(

            y_test,

            predictions,

            target_names=[
                "Incompatible",
                "Compatible"
            ],

            zero_division=0

        )
    )

    # ========================================================
    # SAVE MODEL
    # ========================================================

    model_directory = (
        MODEL_DIR /
        dataset_name
    )

    model_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    model_path = (
        model_directory /
        "model.pkl"
    )

    with open(
        model_path,
        "wb"
    ) as f:

        pickle.dump(
            model,
            f
        )

    print()
    print(
        "💾 Model saved:"
    )

    print(
        f"   {model_path}"
    )

    # ========================================================
    # RETURN RESULTS
    # ========================================================

    return {

        "dataset":
            dataset_name,

        "records":
            len(df),

        "training_records":
            len(X_train),

        "testing_records":
            len(X_test),

        "features":
            X.shape[1],

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

        return

    path = (
        MODEL_DIR /
        "model_summary.csv"
    )

    fieldnames = [

        "dataset",

        "records",

        "training_records",

        "testing_records",

        "features",

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
        "📄 Summary saved:"
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
        "TRAIN AI MODELS"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Training Data: "
        f"{TRAINING_DIR}"
    )

    print(
        f"📂 Model Output : "
        f"{MODEL_DIR}"
    )

    results = []

    # ========================================================
    # TRAIN ALL MODELS
    # ========================================================

    for dataset_name, filename in DATASETS.items():

        result = train_model(

            dataset_name,

            filename

        )

        if result:

            results.append(
                result
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
        "📊 TRAINING SUMMARY"
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

    print()

    print(
        f"✅ Trained Models: "
        f"{len(results)}"
    )

    print(
        f"📁 Models: "
        f"{MODEL_DIR}"
    )

    print()
    print("=" * 70)

    if len(results) == len(DATASETS):

        print(
            "✅ AI TRAINING เสร็จสมบูรณ์"
        )

    else:

        print(
            "⚠️ AI TRAINING เสร็จแล้ว "
            "แต่มีบาง dataset ไม่สำเร็จ"
        )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()
