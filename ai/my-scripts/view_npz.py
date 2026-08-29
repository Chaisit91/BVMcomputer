import numpy as np
from pathlib import Path


# ============================================================
# BuildCores OpenDB - NPZ DATA VIEWER
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


DATASETS = [
    "cooler_case",
    "cpu_cooler",
    "cpu_motherboard",
    "gpu_case",
    "motherboard_case",
    "psu_case",
    "ram_motherboard",
    "storage_motherboard",
]


# ============================================================
# Helper
# ============================================================

def clear_screen():
    print("\033[2J\033[H", end="")


def pause():
    input("\nกด Enter เพื่อกลับเมนู...")


def print_separator():
    print("=" * 70)


# ============================================================
# Show NPZ Information
# ============================================================

def show_npz(file_path, dataset_name, split_name):

    print_separator()
    print("BuildCores OpenDB - NPZ DATA VIEWER")
    print_separator()

    print(f"\nDataset : {dataset_name}")
    print(f"Split   : {split_name}")
    print(f"File    : {file_path.name}")

    print("\n" + "-" * 70)
    print("DATASET INFO")
    print("-" * 70)

    try:
        data = np.load(file_path, allow_pickle=False)

        print(f"\nArrays : {list(data.files)}")

        for key in data.files:

            arr = data[key]

            print(f"\n[{key}]")
            print(f"  Shape : {arr.shape}")
            print(f"  Dtype : {arr.dtype}")

            if arr.ndim >= 1:
                print(f"  Rows  : {arr.shape[0]}")

            if arr.ndim >= 2:
                print(f"  Columns : {arr.shape[1]}")

        # ----------------------------------------------------
        # Detect X
        # ----------------------------------------------------

        if "X" in data.files:

            X = data["X"]

            print("\n" + "-" * 70)
            print("FEATURE DATA (X)")
            print("-" * 70)

            print(f"\nRows     : {X.shape[0]}")

            if X.ndim >= 2:
                print(f"Columns  : {X.shape[1]}")
                print(f"Shape    : {X.shape}")
            else:
                print(f"Shape    : {X.shape}")

            print(f"Dtype    : {X.dtype}")

            print("\nFirst 10 rows:")

            rows_to_show = min(10, len(X))

            for i in range(rows_to_show):

                row = X[i]

                if np.ndim(row) == 0:
                    print(f"{i:4d} | {row}")
                else:
                    values = " | ".join(
                        f"{value:.6f}" if isinstance(value, (float, np.floating))
                        else str(value)
                        for value in row
                    )

                    print(f"{i:4d} | {values}")

        # ----------------------------------------------------
        # Detect y
        # ----------------------------------------------------

        if "y" in data.files:

            y = data["y"]

            print("\n" + "-" * 70)
            print("TARGET DATA (y)")
            print("-" * 70)

            print(f"\nShape : {y.shape}")
            print(f"Dtype : {y.dtype}")

            print("\nFirst 20 targets:")

            print(y[:20])

            # Target distribution
            print("\nTarget Distribution:")

            unique, counts = np.unique(y, return_counts=True)

            for value, count in zip(unique, counts):

                percentage = (count / len(y)) * 100

                print(
                    f"  {value} : {count:,} "
                    f"({percentage:.2f}%)"
                )

        # ----------------------------------------------------
        # Other arrays
        # ----------------------------------------------------

        other_arrays = [
            key for key in data.files
            if key not in ["X", "y"]
        ]

        if other_arrays:

            print("\n" + "-" * 70)
            print("OTHER ARRAYS")
            print("-" * 70)

            for key in other_arrays:

                arr = data[key]

                print(
                    f"\n{key}: "
                    f"shape={arr.shape}, "
                    f"dtype={arr.dtype}"
                )

        data.close()

        print("\n" + "-" * 70)
        print("STATUS")
        print("-" * 70)

        print("\n✅ อ่าน NPZ สำเร็จ")
        print("✅ ไฟล์ไม่ได้ถูกแก้ไข")
        print("✅ สามารถนำข้อมูลไปตรวจสอบต่อได้")

    except Exception as e:

        print("\n❌ ERROR")
        print(f"\n{type(e).__name__}: {e}")


# ============================================================
# Dataset Selection
# ============================================================

def select_dataset():

    print_separator()
    print("SELECT DATASET")
    print_separator()

    for i, dataset in enumerate(DATASETS, start=1):

        print(f"[{i}] {dataset}")

    print("[0] Exit")

    while True:

        choice = input("\nSelect dataset: ").strip()

        if choice == "0":
            return None

        try:

            index = int(choice)

            if 1 <= index <= len(DATASETS):
                return DATASETS[index - 1]

        except ValueError:
            pass

        print("❌ กรุณาเลือกหมายเลขที่ถูกต้อง")


# ============================================================
# Split Selection
# ============================================================

def select_split():

    print("\n" + "-" * 70)
    print("SELECT DATA SPLIT")
    print("-" * 70)

    print("[1] Training")
    print("[2] Validation")
    print("[0] Back")

    while True:

        choice = input("\nSelect split: ").strip()

        if choice == "0":
            return None

        if choice == "1":
            return "training"

        if choice == "2":
            return "validation"

        print("❌ กรุณาเลือก 1, 2 หรือ 0")


# ============================================================
# Main
# ============================================================

def main():

    while True:

        clear_screen()

        dataset = select_dataset()

        if dataset is None:
            break

        clear_screen()

        split = select_split()

        if split is None:
            continue

        if split == "training":
            directory = TRAINING_DIR
        else:
            directory = VALIDATION_DIR

        file_path = directory / f"{dataset}.npz"

        clear_screen()

        if not file_path.exists():

            print_separator()
            print("❌ FILE NOT FOUND")
            print_separator()

            print(f"\nไม่พบไฟล์:")
            print(file_path)

            pause()
            continue

        show_npz(
            file_path,
            dataset,
            split
        )

        pause()


# ============================================================
# Run
# ============================================================

if __name__ == "__main__":
    main()