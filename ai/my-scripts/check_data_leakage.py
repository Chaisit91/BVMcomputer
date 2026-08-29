import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# PATH
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

VALIDATION_DIR = ROOT / "data" / "processed" / "validated"
TRAINING_DIR = ROOT / "data" / "processed" / "training"

OUTPUT_DIR = ROOT / "data" / "processed" / "leakage_check"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

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
    "psu_case"
]


# ============================================================
# FUNCTIONS
# ============================================================

def clean_value(value):

    if pd.isna(value):
        return ""

    return str(value).strip().lower()


def normalize_dataframe(df):

    df = df.copy()

    for col in df.columns:

        if df[col].dtype == "object":

            df[col] = df[col].map(clean_value)

    return df


# ============================================================
# CHECK LABEL RELATIONSHIP
# ============================================================

def check_feature_label_relationship(
    df,
    dataset
):

    print()
    print("-" * 70)
    print(f"🔍 FEATURE ↔ LABEL CHECK: {dataset.upper()}")
    print("-" * 70)

    if "label" not in df.columns:

        print("❌ ไม่พบ label")

        return

    y = pd.to_numeric(
        df["label"],
        errors="coerce"
    )

    features = [
        col
        for col in df.columns
        if col != "label"
    ]

    results = []

    for col in features:

        # ----------------------------------------------------
        # Numeric
        # ----------------------------------------------------

        numeric = pd.to_numeric(
            df[col],
            errors="coerce"
        )

        valid_numeric = numeric.notna() & y.notna()

        if valid_numeric.sum() > 10:

            try:

                correlation = numeric[
                    valid_numeric
                ].corr(
                    y[
                        valid_numeric
                    ]
                )

                if pd.notna(correlation):

                    results.append({
                        "dataset": dataset,
                        "feature": col,
                        "type": "numeric",
                        "correlation": correlation
                    })

            except Exception:
                pass

        # ----------------------------------------------------
        # Categorical
        # ----------------------------------------------------

        if df[col].dtype == "object":

            try:

                grouped = pd.crosstab(
                    df[col],
                    y
                )

                if grouped.shape[0] > 0:

                    # หา category ที่สัมพันธ์กับ label เดียวแบบสมบูรณ์
                    pure_groups = 0

                    for _, row in grouped.iterrows():

                        total = row.sum()

                        if total > 0:

                            max_ratio = row.max() / total

                            if max_ratio >= 0.99:

                                pure_groups += 1

                    results.append({
                        "dataset": dataset,
                        "feature": col,
                        "type": "categorical",
                        "correlation": np.nan,
                        "pure_groups": pure_groups,
                        "unique_values": df[col].nunique()
                    })

            except Exception:
                pass

    result_df = pd.DataFrame(results)

    if result_df.empty:

        print("⚠️ ไม่พบข้อมูลสำหรับตรวจ")

        return

    # --------------------------------------------------------
    # Numeric suspicious
    # --------------------------------------------------------

    numeric_results = result_df[
        result_df["type"] == "numeric"
    ].copy()

    if not numeric_results.empty:

        numeric_results["abs_correlation"] = (
            numeric_results["correlation"].abs()
        )

        numeric_results = numeric_results.sort_values(
            "abs_correlation",
            ascending=False
        )

        print()
        print("📊 Numeric Features:")

        for _, row in numeric_results.iterrows():

            corr = row["correlation"]

            if abs(corr) >= 0.95:
                status = "🚨 VERY HIGH"

            elif abs(corr) >= 0.80:
                status = "⚠️ HIGH"

            elif abs(corr) >= 0.50:
                status = "🟡 MODERATE"

            else:
                status = "✅ NORMAL"

            print(
                f"   {row['feature']:<35}"
                f"corr={corr: .4f} "
                f"{status}"
            )

    # --------------------------------------------------------
    # Categorical suspicious
    # --------------------------------------------------------

    categorical_results = result_df[
        result_df["type"] == "categorical"
    ].copy()

    if not categorical_results.empty:

        print()
        print("📊 Categorical Features:")

        for _, row in categorical_results.iterrows():

            pure = row.get(
                "pure_groups",
                0
            )

            unique = row.get(
                "unique_values",
                0
            )

            if pure > 0:

                status = "⚠️ CHECK"

            else:

                status = "✅ NORMAL"

            print(
                f"   {row['feature']:<35}"
                f"unique={unique:<5} "
                f"pure_groups={pure:<5} "
                f"{status}"
            )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output = (
        OUTPUT_DIR /
        f"{dataset}_feature_label.csv"
    )

    result_df.to_csv(
        output,
        index=False,
        encoding="utf-8-sig"
    )

    print()
    print(f"📄 Saved: {output}")


# ============================================================
# CHECK DUPLICATES
# ============================================================

def check_duplicates(
    train_df,
    validation_df,
    dataset
):

    print()
    print("-" * 70)
    print(f"🔁 DUPLICATE CHECK: {dataset.upper()}")
    print("-" * 70)

    # --------------------------------------------------------
    # Internal duplicates
    # --------------------------------------------------------

    train_duplicates = train_df.duplicated().sum()

    validation_duplicates = validation_df.duplicated().sum()

    print(
        f"Training duplicates   : {train_duplicates:,}"
    )

    print(
        f"Validation duplicates : {validation_duplicates:,}"
    )

    # --------------------------------------------------------
    # Cross dataset duplicates
    # --------------------------------------------------------

    common_columns = [
        col
        for col in validation_df.columns
        if col in train_df.columns
        and col != "label"
    ]

    if not common_columns:

        print(
            "⚠️ ไม่พบ columns ที่ใช้เปรียบเทียบ"
        )

        return

    train_compare = train_df[
        common_columns
    ].copy()

    validation_compare = validation_df[
        common_columns
    ].copy()

    train_compare = normalize_dataframe(
        train_compare
    )

    validation_compare = normalize_dataframe(
        validation_compare
    )

    # --------------------------------------------------------
    # Hash rows
    # --------------------------------------------------------

    train_hash = pd.util.hash_pandas_object(
        train_compare,
        index=False
    )

    validation_hash = pd.util.hash_pandas_object(
        validation_compare,
        index=False
    )

    train_hash_set = set(
        train_hash.tolist()
    )

    overlap = sum(
        value in train_hash_set
        for value in validation_hash
    )

    print()
    print(
        f"Cross Train/Validation overlap : {overlap:,}"
    )

    if overlap > 0:

        print(
            "🚨 WARNING: พบข้อมูลซ้ำระหว่าง Training และ Validation"
        )

    else:

        print(
            "✅ ไม่พบข้อมูลซ้ำระหว่าง Training และ Validation"
        )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    result = pd.DataFrame([{

        "dataset": dataset,

        "training_records": len(train_df),

        "validation_records": len(validation_df),

        "training_duplicates": train_duplicates,

        "validation_duplicates": validation_duplicates,

        "cross_overlap": overlap

    }])

    output = (
        OUTPUT_DIR /
        f"{dataset}_duplicates.csv"
    )

    result.to_csv(
        output,
        index=False,
        encoding="utf-8-sig"
    )


# ============================================================
# CHECK DIRECT LABEL LEAKAGE
# ============================================================

def check_direct_leakage(
    df,
    dataset
):

    print()
    print("-" * 70)
    print(f"🚨 DIRECT LABEL LEAKAGE CHECK: {dataset.upper()}")
    print("-" * 70)

    if "label" not in df.columns:

        return

    y = pd.to_numeric(
        df["label"],
        errors="coerce"
    )

    suspicious = []

    for col in df.columns:

        if col == "label":
            continue

        # ----------------------------------------------------
        # Exact equality
        # ----------------------------------------------------

        numeric = pd.to_numeric(
            df[col],
            errors="coerce"
        )

        valid = numeric.notna() & y.notna()

        if valid.sum() > 0:

            same = (
                numeric[valid].astype(float)
                ==
                y[valid].astype(float)
            ).mean()

            inverse = (
                numeric[valid].astype(float)
                ==
                (1 - y[valid].astype(float))
            ).mean()

            if same >= 0.95:

                suspicious.append({
                    "dataset": dataset,
                    "feature": col,
                    "issue": "same_as_label",
                    "score": same
                })

            elif inverse >= 0.95:

                suspicious.append({
                    "dataset": dataset,
                    "feature": col,
                    "issue": "inverse_of_label",
                    "score": inverse
                })

    if suspicious:

        print()

        for item in suspicious:

            print(
                f"🚨 {item['feature']}"
                f" → {item['issue']}"
                f" ({item['score']:.4f})"
            )

    else:

        print(
            "✅ ไม่พบ feature ที่เหมือน label โดยตรง"
        )

    if suspicious:

        pd.DataFrame(
            suspicious
        ).to_csv(
            OUTPUT_DIR /
            f"{dataset}_direct_leakage.csv",
            index=False,
            encoding="utf-8-sig"
        )


# ============================================================
# MAIN DATASET CHECK
# ============================================================

def check_dataset(dataset):

    print()
    print("=" * 70)
    print(f"📦 DATASET: {dataset.upper()}")
    print("=" * 70)

    validation_file = (
        VALIDATION_DIR /
        f"{dataset}.csv"
    )

    if not validation_file.exists():

        print(
            f"❌ Validation file not found:"
        )

        print(
            f"   {validation_file}"
        )

        return

    # --------------------------------------------------------
    # Find training file
    # --------------------------------------------------------

    possible_training_files = [

        TRAINING_DIR /
        f"{dataset}.csv",

        TRAINING_DIR /
        dataset /
        "train.csv",

        TRAINING_DIR /
        dataset /
        f"{dataset}.csv"
    ]

    training_file = None

    for file in possible_training_files:

        if file.exists():

            training_file = file

            break

    if training_file is None:

        print()
        print(
            "⚠️ ไม่พบ Training CSV สำหรับ dataset นี้"
        )

        print(
            f"   Training directory: {TRAINING_DIR}"
        )

        # อย่างน้อยตรวจ validation
        validation_df = pd.read_csv(
            validation_file
        )

        check_feature_label_relationship(
            validation_df,
            dataset
        )

        check_direct_leakage(
            validation_df,
            dataset
        )

        return

    # --------------------------------------------------------
    # Load
    # --------------------------------------------------------

    print()
    print(
        f"📥 Training: {training_file}"
    )

    print(
        f"📥 Validation: {validation_file}"
    )

    train_df = pd.read_csv(
        training_file
    )

    validation_df = pd.read_csv(
        validation_file
    )

    print()
    print(
        f"Training records   : {len(train_df):,}"
    )

    print(
        f"Validation records : {len(validation_df):,}"
    )

    # --------------------------------------------------------
    # Checks
    # --------------------------------------------------------

    check_feature_label_relationship(
        validation_df,
        dataset
    )

    check_direct_leakage(
        validation_df,
        dataset
    )

    check_duplicates(
        train_df,
        validation_df,
        dataset
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("BuildCores OpenDB - DATA LEAKAGE CHECK")
    print("=" * 70)

    print()
    print(
        f"📂 Training Data:"
    )

    print(
        f"   {TRAINING_DIR}"
    )

    print()
    print(
        f"📂 Validation Data:"
    )

    print(
        f"   {VALIDATION_DIR}"
    )

    print()
    print(
        f"📂 Output:"
    )

    print(
        f"   {OUTPUT_DIR}"
    )

    for dataset in DATASETS:

        check_dataset(
            dataset
        )

    print()
    print("=" * 70)
    print("📊 DATA LEAKAGE CHECK COMPLETE")
    print("=" * 70)

    print()
    print(
        f"📁 Results:"
    )

    print(
        f"   {OUTPUT_DIR}"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()