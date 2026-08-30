import csv
import random
import re
import sys
import pandas as pd
from pathlib import Path

from dataset_compatibility_rules import required_with_optional_constraint


for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


# ============================================================
# BuildCores OpenDB - BUILD VALIDATION DATASET
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

FEATURE_DIR = ROOT / "data" / "processed" / "features"
TRAINING_DIR = ROOT / "data" / "processed" / "training"
VALIDATED_DIR = ROOT / "data" / "processed" / "validated"

VALIDATED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# SETTINGS
# ============================================================

RANDOM_SEED = 42

random.seed(
    RANDOM_SEED
)

VALIDATION_PER_CLASS = 2000
CANDIDATE_POOL_PER_CLASS = VALIDATION_PER_CLASS * 5


class Reservoir(list):
    """Uniform bounded sample that avoids retaining millions of candidate rows."""

    def __init__(self, capacity):
        super().__init__()
        self.capacity = capacity
        self.seen = 0

    def append(self, item):
        self.seen += 1
        if len(self) < self.capacity:
            super().append(item)
            return
        position = random.randrange(self.seen)
        if position < self.capacity:
            self[position] = item


# ============================================================
# SOURCE FILES
# ============================================================

FILES = {

    "CPU": "cpu.csv",

    "GPU": "gpu.csv",

    "RAM": "ram.csv",

    "Motherboard": "motherboard.csv",

    "PSU": "psu.csv",

    "Cooler": "cpu_cooler.csv",

    "Case": "pc_case.csv",

    "Storage": "storage.csv",

}


# ============================================================
# DATASET ID CONFIG
# ============================================================

ID_PAIRS = {

    "cpu_motherboard": [
        "cpu_id",
        "motherboard_id"
    ],

    "cpu_cooler": [
        "cpu_id",
        "cooler_id"
    ],

    "ram_motherboard": [
        "ram_id",
        "motherboard_id"
    ],

    "gpu_case": [
        "gpu_id",
        "case_id"
    ],

    "cooler_case": [
        "cooler_id",
        "case_id"
    ],

    "motherboard_case": [
        "motherboard_id",
        "case_id"
    ],

    "psu_case": [
        "psu_id",
        "case_id"
    ],

    "storage_motherboard": [
        "storage_id",
        "motherboard_id"
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


def to_float(value):

    value = clean(
        value
    )

    if not value:
        return None

    try:

        return float(
            value
        )

    except (
        ValueError,
        TypeError
    ):

        return None


def load_csv(
    directory,
    filename
):

    path = (
        directory /
        filename
    )

    if not path.exists():

        print(
            f"❌ ไม่พบไฟล์: {path}"
        )

        return []

    try:

        with open(
            path,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            return list(
                csv.DictReader(f)
            )

    except Exception as e:

        print(
            f"❌ อ่านไฟล์ไม่ได้: {path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return []


def save_csv(
    filename,
    rows
):

    path = (
        VALIDATED_DIR /
        filename
    )

    if not rows:

        print(
            f"⚠️ ไม่มีข้อมูลสำหรับ: "
            f"{filename}"
        )

        return path

    fieldnames = list(rows[0].keys())
    training_path = TRAINING_DIR / filename
    if training_path.is_file():
        with training_path.open("r", encoding="utf-8-sig", newline="") as training_handle:
            training_fields = next(csv.reader(training_handle), [])
        if set(training_fields) == set(fieldnames):
            fieldnames = training_fields

    try:

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
                rows
            )

    except Exception as e:

        print(
            f"❌ บันทึกไฟล์ไม่ได้: "
            f"{path}"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

    return path


def get_values(value):

    value = clean(
        value
    )

    if not value:
        return set()

    value = (
        value
        .replace(",", "|")
        .replace(";", "|")
        .replace("/", "|")
    )

    return {
        item.strip().lower()
        for item in value.split("|")
        if item.strip()
    }


def supported_match(
    value,
    target
):

    supported = get_values(
        value
    )

    target = clean(
        target
    ).lower()

    if (
        not supported
        or
        not target
    ):
        return None

    return int(
        target in supported
    )


# ============================================================
# STORAGE NORMALIZATION
# ============================================================

def normalize_storage_interface(value):

    value = clean(
        value
    ).lower()

    if not value:
        return ""

    value = value.replace(
        "_",
        " "
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    ).strip()

    # NVMe / PCIe NVMe
    if (
        "nvme" in value
        or
        "pcie" in value
        or
        "pci express" in value
    ):
        return "nvme"

    # SATA
    if (
        "sata" in value
        or
        "serial ata" in value
    ):
        return "sata"

    # SAS
    if "sas" in value:
        return "sas"

    return value


def normalize_storage_form_factor(value):

    value = clean(
        value
    ).lower()

    if not value:
        return ""

    value = value.replace(
        " ",
        ""
    )

    value = value.replace(
        "-",
        ""
    )

    if (
        "m.2" in value
        or
        "m2" in value
    ):
        return "m2"

    if (
        "2.5" in value
        or
        "2.5inch" in value
        or
        '2.5"' in value
    ):
        return "2.5"

    if (
        "3.5" in value
        or
        "3.5inch" in value
        or
        '3.5"' in value
    ):
        return "3.5"

    return value


def parse_positive_number(value):

    value = clean(
        value
    )

    if not value:
        return 0

    try:

        return int(
            float(
                value
            )
        )

    except (
        ValueError,
        TypeError
    ):

        numbers = re.findall(
            r"\d+",
            value
        )

        if numbers:

            try:

                return int(
                    numbers[0]
                )

            except ValueError:

                return 0

    return 0


def motherboard_supports_storage(
    storage,
    motherboard
):

    storage_interface = normalize_storage_interface(
        storage.get(
            "interface"
        )
    )

    storage_form_factor = normalize_storage_form_factor(
        storage.get(
            "form_factor"
        )
    )

    if not storage_interface:
        return None

    # --------------------------------------------------------
    # Motherboard storage interface list
    # --------------------------------------------------------

    board_interfaces_raw = clean(
        motherboard.get(
            "storage_interfaces"
        )
    )

    board_interfaces = get_values(
        board_interfaces_raw
    )

    normalized_board_interfaces = {
        normalize_storage_interface(
            value
        )
        for value in board_interfaces
        if value
    }

    # --------------------------------------------------------
    # M.2 slots
    # --------------------------------------------------------

    m2_slots = parse_positive_number(
        motherboard.get("has_m2")
        or motherboard.get("m2_slot_count")
        or motherboard.get("m2_slots")
    )

    # --------------------------------------------------------
    # SATA ports
    # --------------------------------------------------------

    sata_ports = parse_positive_number(
        motherboard.get(
            "sata_ports"
        )
    )

    if sata_ports == 0:

        sata_ports = parse_positive_number(
            motherboard.get(
                "sata_ports_count"
            )
        )

    # --------------------------------------------------------
    # Determine interface compatibility
    # --------------------------------------------------------

    interface_ok = False

    interface_information_exists = bool(
        normalized_board_interfaces
        or
        m2_slots > 0
        or
        sata_ports > 0
    )

    if storage_interface == "nvme":

        if "nvme" in normalized_board_interfaces:

            interface_ok = True

        elif "pcie" in normalized_board_interfaces:

            interface_ok = True

        elif m2_slots > 0:

            interface_ok = True

    elif storage_interface == "sata":

        if "sata" in normalized_board_interfaces:

            interface_ok = True

        elif sata_ports > 0:

            interface_ok = True

    else:

        interface_ok = (
            storage_interface
            in
            normalized_board_interfaces
        )

    # --------------------------------------------------------
    # No motherboard storage information
    # --------------------------------------------------------

    if not interface_information_exists:

        return None

    if not interface_ok:

        return False

    # --------------------------------------------------------
    # Form factor compatibility
    # --------------------------------------------------------

    if storage_interface == "nvme":

        if storage_form_factor == "m2":

            return True

        if not storage_form_factor:

            return True

        return True

    if storage_interface == "sata":

        if storage_form_factor in {
            "2.5",
            "3.5",
            ""
        }:
            return True

        return True

    return True


# ============================================================
# REMOVE TRAINING OVERLAP
# ============================================================

def remove_training_overlap(
    compatible,
    incompatible,
    dataset_name
):

    training_file = (
        TRAINING_DIR /
        f"{dataset_name}.csv"
    )

    print()
    print("-" * 70)

    print(
        f"🔒 CHECK TRAINING OVERLAP: "
        f"{dataset_name.upper()}"
    )

    print("-" * 70)

    if not training_file.exists():

        print(
            "⚠️ Training file not found:"
        )

        print(
            f"   {training_file}"
        )

        print(
            "⚠️ Skip overlap removal"
        )

        return (
            compatible,
            incompatible
        )

    try:

        training_df = pd.read_csv(
            training_file,
            dtype=str
        )

    except Exception as e:

        print(
            "❌ Cannot read training file:"
        )

        print(
            f"   {type(e).__name__}: {e}"
        )

        return (
            compatible,
            incompatible
        )

    print(
        f"📥 Training records: "
        f"{len(training_df):,}"
    )

    columns = ID_PAIRS.get(
        dataset_name
    )

    if not columns:

        print(
            f"⚠️ Unknown dataset: "
            f"{dataset_name}"
        )

        return (
            compatible,
            incompatible
        )

    print()
    print(
        "🔑 ID Pair:"
    )

    for col in columns:

        print(
            f"   - {col}"
        )

    missing_columns = [
        col
        for col in columns
        if col not in training_df.columns
    ]

    if missing_columns:

        print()
        print(
            "❌ Training dataset "
            "missing ID columns:"
        )

        for col in missing_columns:

            print(
                f"   - {col}"
            )

        print(
            "⚠️ Skip overlap removal"
        )

        return (
            compatible,
            incompatible
        )

    training_pairs = set()

    for _, row in training_df.iterrows():

        pair = tuple(
            clean(
                row[col]
            )
            for col in columns
        )

        if all(pair):

            training_pairs.add(
                pair
            )

    print()
    print(
        f"🔑 Unique Training Pairs: "
        f"{len(training_pairs):,}"
    )

    def filter_rows(rows):

        result = []

        removed = 0

        for row in rows:

            pair = tuple(
                clean(
                    row.get(
                        col,
                        ""
                    )
                )
                for col in columns
            )

            if not all(pair):

                result.append(
                    row
                )

                continue

            if pair in training_pairs:

                removed += 1

            else:

                result.append(
                    row
                )

        return (
            result,
            removed
        )

    compatible, removed_c = (
        filter_rows(
            compatible
        )
    )

    incompatible, removed_i = (
        filter_rows(
            incompatible
        )
    )

    removed_total = (
        removed_c +
        removed_i
    )

    print()
    print(
        f"🚫 Removed Training Overlap: "
        f"{removed_total:,}"
    )

    print(
        f"   Compatible removed   : "
        f"{removed_c:,}"
    )

    print(
        f"   Incompatible removed : "
        f"{removed_i:,}"
    )

    print()
    print(
        f"📊 Remaining Compatible   : "
        f"{len(compatible):,}"
    )

    print(
        f"📊 Remaining Incompatible : "
        f"{len(incompatible):,}"
    )

    return (
        compatible,
        incompatible
    )


# ============================================================
# RANDOM SAMPLE
# ============================================================

def random_sample(
    compatible,
    incompatible,
    dataset_name
):

    compatible, incompatible = (
        remove_training_overlap(
            compatible,
            incompatible,
            dataset_name
        )
    )

    if len(compatible) < VALIDATION_PER_CLASS:

        print()
        print(
            "❌ Not enough compatible samples"
        )

        print(
            f"   Required : "
            f"{VALIDATION_PER_CLASS:,}"
        )

        print(
            f"   Available: "
            f"{len(compatible):,}"
        )

        return []

    if len(incompatible) < VALIDATION_PER_CLASS:

        print()
        print(
            "❌ Not enough incompatible samples"
        )

        print(
            f"   Required : "
            f"{VALIDATION_PER_CLASS:,}"
        )

        print(
            f"   Available: "
            f"{len(incompatible):,}"
        )

        return []

    compatible = random.sample(
        compatible,
        VALIDATION_PER_CLASS
    )

    incompatible = random.sample(
        incompatible,
        VALIDATION_PER_CLASS
    )

    result = (
        compatible +
        incompatible
    )

    random.shuffle(
        result
    )

    print()
    print(
        f"✅ Validation Sample: "
        f"{len(result):,}"
    )

    print(
        f"   Compatible   : "
        f"{VALIDATION_PER_CLASS:,}"
    )

    print(
        f"   Incompatible : "
        f"{VALIDATION_PER_CLASS:,}"
    )

    return result


# ============================================================
# CPU ↔ MOTHERBOARD
# ============================================================

def build_cpu_motherboard(
    cpu_rows,
    motherboard_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "cpu_motherboard"
    )

    print()
    print(
        "🔗 CPU ↔ MOTHERBOARD"
    )

    for cpu in cpu_rows:

        cpu_socket = clean(
            cpu.get(
                "socket"
            )
        )

        if not cpu_socket:
            continue

        cpu_id = clean(
            cpu.get(
                "opendb_id"
            )
        )

        if not cpu_id:
            continue

        for board in motherboard_rows:

            board_socket = clean(
                board.get(
                    "socket"
                )
            )

            if not board_socket:
                continue

            motherboard_id = clean(
                board.get(
                    "opendb_id"
                )
            )

            if not motherboard_id:
                continue

            label = int(
                cpu_socket.lower()
                ==
                board_socket.lower()
            )

            row = {

                "cpu_id": cpu_id,

                "motherboard_id":
                    motherboard_id,

                "cpu_socket":
                    cpu_socket,

                "motherboard_socket":
                    board_socket,

                "cpu_cores":
                    clean(
                        cpu.get(
                            "cores_total"
                        )
                    ),

                "cpu_threads":
                    clean(
                        cpu.get(
                            "threads"
                        )
                    ),

                "cpu_base_clock":
                    clean(
                        cpu.get(
                            "base_clock"
                        )
                    ),

                "cpu_boost_clock":
                    clean(
                        cpu.get(
                            "boost_clock"
                        )
                    ),

                "cpu_tdp":
                    clean(
                        cpu.get(
                            "tdp"
                        )
                    ),

                "motherboard_ram_type":
                    clean(
                        board.get(
                            "ram_type"
                        )
                    ),

                "motherboard_ram_slots":
                    clean(
                        board.get(
                            "memory_slots"
                        )
                    ),

                "motherboard_chipset":
                    clean(
                        board.get(
                            "chipset"
                        )
                    ),

                "socket_match":
                    label,

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# CPU ↔ COOLER
# ============================================================

def build_cpu_cooler(
    cpu_rows,
    cooler_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "cpu_cooler"
    )

    print()
    print(
        "🔗 CPU ↔ COOLER"
    )

    for cpu in cpu_rows:

        socket = clean(
            cpu.get(
                "socket"
            )
        )

        if not socket:
            continue

        cpu_id = clean(
            cpu.get(
                "opendb_id"
            )
        )

        if not cpu_id:
            continue

        for cooler in cooler_rows:

            supported = supported_match(
                cooler.get(
                    "cpu_sockets"
                ),
                socket
            )

            if supported is None:
                continue

            cooler_id = clean(
                cooler.get(
                    "opendb_id"
                )
            )

            if not cooler_id:
                continue

            row = {

                "cpu_id":
                    cpu_id,

                "cooler_id":
                    cooler_id,

                "cpu_socket":
                    socket,

                "cooler_sockets":
                    clean(
                        cooler.get(
                            "cpu_sockets"
                        )
                    ),

                "cpu_tdp":
                    clean(
                        cpu.get(
                            "tdp"
                        )
                    ),

                "fan_quantity":
                    clean(
                        cooler.get(
                            "fan_quantity"
                        )
                    ),

                "fan_size":
                    clean(
                        cooler.get(
                            "fan_size_mm"
                        )
                    ),

                "radiator_size":
                    clean(
                        cooler.get(
                            "radiator_size_mm"
                        )
                    ),

                "cooler_height":
                    clean(
                        cooler.get(
                            "height_mm"
                        )
                    ),

                "water_cooled":
                    clean(
                        cooler.get(
                            "water_cooled"
                        )
                    ),

                "socket_match":
                    supported,

                "label":
                    supported
            }

            if supported == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# RAM ↔ MOTHERBOARD
# ============================================================

def build_ram_motherboard(
    ram_rows,
    motherboard_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "ram_motherboard"
    )

    print()
    print(
        "🔗 RAM ↔ MOTHERBOARD"
    )

    for ram in ram_rows:

        ram_type = clean(
            ram.get(
                "ram_type"
            )
        )

        if not ram_type:
            continue

        ram_id = clean(
            ram.get(
                "opendb_id"
            )
        )

        if not ram_id:
            continue

        for board in motherboard_rows:

            board_type = clean(
                board.get(
                    "ram_type"
                )
            )

            if not board_type:
                continue

            motherboard_id = clean(
                board.get(
                    "opendb_id"
                )
            )

            if not motherboard_id:
                continue

            label = int(
                ram_type.lower()
                ==
                board_type.lower()
            )

            row = {

                "ram_id":
                    ram_id,

                "motherboard_id":
                    motherboard_id,

                "ram_type":
                    ram_type,

                "motherboard_ram_type":
                    board_type,

                "ram_speed":
                    clean(
                        ram.get(
                            "speed_mhz"
                        )
                    ),

                "ram_capacity":
                    clean(
                        ram.get(
                            "capacity_gb"
                        )
                    ),

                "ram_modules":
                    clean(
                        ram.get(
                            "module_quantity"
                        )
                    ),

                "ram_cas_latency":
                    clean(
                        ram.get(
                            "cas_latency"
                        )
                    ),

                "motherboard_memory_max":
                    clean(
                        board.get(
                            "memory_max_gb"
                        )
                    ),

                "motherboard_memory_slots":
                    clean(
                        board.get(
                            "memory_slots"
                        )
                    ),

                "ram_type_match":
                    label,

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# GPU ↔ CASE
# ============================================================

def build_gpu_case(
    gpu_rows,
    case_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "gpu_case"
    )

    print()
    print(
        "🔗 GPU ↔ CASE"
    )

    for gpu in gpu_rows:

        gpu_length = to_float(
            gpu.get(
                "length_mm"
            )
        )

        if gpu_length is None:
            continue

        gpu_id = clean(
            gpu.get(
                "opendb_id"
            )
        )

        if not gpu_id:
            continue

        for case in case_rows:

            max_length = to_float(
                case.get(
                    "gpu_clearance_mm"
                )
            )

            if max_length is None:
                continue

            case_id = clean(
                case.get(
                    "opendb_id"
                )
            )

            if not case_id:
                continue

            label = int(
                gpu_length <= max_length
            )

            length_difference = (
                max_length -
                gpu_length
            )

            row = {

                "gpu_id":
                    gpu_id,

                "case_id":
                    case_id,

                "gpu_memory":
                    clean(
                        gpu.get(
                            "memory_gb"
                        )
                    ),

                "gpu_memory_type":
                    clean(
                        gpu.get(
                            "memory_type"
                        )
                    ),

                "gpu_tdp":
                    clean(
                        gpu.get(
                            "tdp"
                        )
                    ),

                "gpu_slot_width":
                    clean(
                        gpu.get(
                            "slot_width"
                        )
                    ),

                "gpu_length":
                    gpu_length,

                "case_gpu_clearance":
                    max_length,

                "length_difference":
                    length_difference,

                "gpu_case_length_ok":
                    label,

                "case_form_factor":
                    clean(
                        case.get(
                            "form_factor"
                        )
                    ),

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# COOLER ↔ CASE
# ============================================================

def build_cooler_case(
    cooler_rows,
    case_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "cooler_case"
    )

    print()
    print(
        "🔗 COOLER ↔ CASE"
    )

    for cooler in cooler_rows:

        cooler_height = to_float(
            cooler.get(
                "height_mm"
            )
        )

        if cooler_height is None:
            continue

        cooler_id = clean(
            cooler.get(
                "opendb_id"
            )
        )

        if not cooler_id:
            continue

        for case in case_rows:

            max_height = to_float(
                case.get(
                    "cooler_clearance_mm"
                )
            )

            if max_height is None:
                continue

            case_id = clean(
                case.get(
                    "opendb_id"
                )
            )

            if not case_id:
                continue

            label = int(
                cooler_height <= max_height
            )

            height_difference = (
                max_height -
                cooler_height
            )

            row = {

                "cooler_id":
                    cooler_id,

                "case_id":
                    case_id,

                "cooler_fan_size":
                    clean(
                        cooler.get(
                            "fan_size_mm"
                        )
                    ),

                "cooler_fan_quantity":
                    clean(
                        cooler.get(
                            "fan_quantity"
                        )
                    ),

                "radiator_size":
                    clean(
                        cooler.get(
                            "radiator_size_mm"
                        )
                    ),

                "cooler_height":
                    cooler_height,

                "case_cooler_clearance":
                    max_height,

                "height_difference":
                    height_difference,

                "cooler_case_height_ok":
                    label,

                "case_form_factor":
                    clean(
                        case.get(
                            "form_factor"
                        )
                    ),

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# MOTHERBOARD ↔ CASE
# ============================================================

def build_motherboard_case(
    motherboard_rows,
    case_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "motherboard_case"
    )

    print()
    print(
        "🔗 MOTHERBOARD ↔ CASE"
    )

    for board in motherboard_rows:

        board_form = clean(
            board.get(
                "form_factor"
            )
        )

        if not board_form:
            continue

        motherboard_id = clean(
            board.get(
                "opendb_id"
            )
        )

        if not motherboard_id:
            continue

        for case in case_rows:

            supported_value = clean(
                case.get(
                    "supported_motherboards"
                )
            )

            supported = supported_match(
                supported_value,
                board_form
            )

            if supported is None:
                continue

            case_id = clean(
                case.get(
                    "opendb_id"
                )
            )

            if not case_id:
                continue

            row = {

                "motherboard_id":
                    motherboard_id,

                "case_id":
                    case_id,

                "motherboard_form_factor":
                    board_form,

                "case_supported_motherboards":
                    supported_value,

                "motherboard_ram_type":
                    clean(
                        board.get(
                            "ram_type"
                        )
                    ),

                "motherboard_memory_slots":
                    clean(
                        board.get(
                            "memory_slots"
                        )
                    ),

                "case_form_factor":
                    clean(
                        case.get(
                            "form_factor"
                        )
                    ),

                "form_factor_match":
                    supported,

                "label":
                    supported
            }

            if supported == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# PSU ↔ CASE
# ============================================================

def build_psu_case(
    psu_rows,
    case_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "psu_case"
    )

    print()
    print(
        "🔗 PSU ↔ CASE"
    )

    for psu in psu_rows:

        psu_form = clean(
            psu.get(
                "form_factor"
            )
        )

        if not psu_form:
            continue

        psu_id = clean(
            psu.get(
                "opendb_id"
            )
        )

        if not psu_id:
            continue

        for case in case_rows:

            supported_psu = clean(
                case.get(
                    "supported_psu"
                )
            )

            form_match = supported_match(
                supported_psu,
                psu_form
            )

            if form_match is None:
                continue

            psu_length = to_float(
                psu.get(
                    "length_mm"
                )
            )

            case_psu_clearance = to_float(
                case.get(
                    "psu_clearance_mm"
                )
            )

            if (
                psu_length is not None
                and
                case_psu_clearance is not None
            ):

                length_ok = int(
                    psu_length
                    <=
                    case_psu_clearance
                )

            else:

                # Unknown clearance is not a failure. Keep the same sentinel
                # used by the training builder so feature semantics stay equal.
                length_ok = -1

            label = required_with_optional_constraint(
                form_match,
                length_ok,
            )

            case_id = clean(
                case.get(
                    "opendb_id"
                )
            )

            if not case_id:
                continue

            row = {

                "psu_id":
                    psu_id,

                "case_id":
                    case_id,

                "psu_form_factor":
                    psu_form,

                "psu_length":
                    psu_length,

                "psu_wattage":
                    clean(
                        psu.get(
                            "wattage"
                        )
                    ),

                "psu_efficiency":
                    clean(
                        psu.get(
                            "efficiency_rating"
                        )
                    ),

                "case_psu_clearance":
                    clean(
                        case.get(
                            "psu_clearance_mm"
                        )
                    ),

                "case_supported_psu":
                    clean(
                        case.get(
                            "supported_psu"
                        )
                    ),

                "psu_form_factor_match":
                    form_match,

                "psu_length_ok":
                    length_ok,

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# STORAGE ↔ MOTHERBOARD
# ============================================================

def build_storage_motherboard(
    storage_rows,
    motherboard_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    dataset_name = (
        "storage_motherboard"
    )

    print()
    print(
        "🔗 STORAGE ↔ MOTHERBOARD"
    )

    skipped = 0

    interface_stats = {}

    for storage in storage_rows:

        storage_interface = normalize_storage_interface(
            storage.get(
                "interface"
            )
        )

        storage_form_factor = normalize_storage_form_factor(
            storage.get(
                "form_factor"
            )
        )

        if not storage_interface:

            skipped += 1

            continue

        interface_stats[
            storage_interface
        ] = (
            interface_stats.get(
                storage_interface,
                0
            )
            + 1
        )

        storage_id = clean(
            storage.get(
                "opendb_id"
            )
        )

        if not storage_id:

            skipped += 1

            continue

        for board in motherboard_rows:

            motherboard_id = clean(
                board.get(
                    "opendb_id"
                )
            )

            if not motherboard_id:

                skipped += 1

                continue

            compatibility = motherboard_supports_storage(
                storage,
                board
            )

            # ------------------------------------------------
            # Unknown compatibility is skipped.
            # ------------------------------------------------

            if compatibility is None:

                skipped += 1

                continue

            label = int(
                compatibility
            )

            # ------------------------------------------------
            # Storage M.2 slot check
            #
            # This is derived from the same compatibility
            # result because motherboard_supports_storage()
            # already evaluates NVMe/M.2 compatibility.
            # ------------------------------------------------

            storage_m2_slot_ok = label

            row = {

                "storage_id":
                    storage_id,

                "motherboard_id":
                    motherboard_id,

                "storage_capacity":
                    clean(
                        storage.get(
                            "capacity_gb"
                        )
                    ),

                "storage_type":
                    clean(
                        storage.get("storage_type")
                    ),

                "storage_form_factor":
                    clean(storage.get("form_factor")).lower(),

                "storage_interface":
                    clean(storage.get("interface")).lower(),

                "storage_nvme":
                    clean(storage.get("nvme")).lower(),

                "motherboard_m2_slots":
                    clean(
                        board.get("m2_slot_count")
                    ),

                "motherboard_pcie_slots":
                    clean(
                        board.get("pcie_total_slots")
                    ),

                "motherboard_pcie_x16_slots":
                    clean(board.get("pcie_x16_slots")),

                "motherboard_pcie_x8_slots":
                    clean(board.get("pcie_x8_slots")),

                "motherboard_pcie_x4_slots":
                    clean(board.get("pcie_x4_slots")),

                "motherboard_pcie_x1_slots":
                    clean(board.get("pcie_x1_slots")),

                "motherboard_pcie_gen3_slots":
                    clean(board.get("pcie_gen3_slots")),

                "motherboard_pcie_gen4_slots":
                    clean(board.get("pcie_gen4_slots")),

                "motherboard_pcie_gen5_slots":
                    clean(board.get("pcie_gen5_slots")),

                "motherboard_pcie_max_gen":
                    clean(board.get("pcie_max_gen")),

                "motherboard_form_factor":
                    clean(
                        board.get(
                            "form_factor"
                        )
                    ),

                "motherboard_ram_type":
                    clean(
                        board.get(
                            "ram_type"
                        )
                    ),

                "storage_m2_slot_ok":
                    storage_m2_slot_ok,

                "label":
                    label
            }

            if label == 1:

                compatible.append(
                    row
                )

            else:

                incompatible.append(
                    row
                )

    # --------------------------------------------------------
    # Debug information
    # --------------------------------------------------------

    print()
    print(
        "🔎 STORAGE INTERFACE DISTRIBUTION"
    )

    for interface, count in sorted(
        interface_stats.items()
    ):

        print(
            f"   - {interface:<10} "
            f"{count:,} storage records"
        )

    print()
    print(
        f"⚠️ Skipped records/pairs: "
        f"{skipped:,}"
    )

    print()
    print(
        "📊 BEFORE TRAINING OVERLAP"
    )

    print(
        f"   Compatible   : "
        f"{len(compatible):,}"
    )

    print(
        f"   Incompatible : "
        f"{len(incompatible):,}"
    )

    return random_sample(
        compatible,
        incompatible,
        dataset_name
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - "
        "BUILD VALIDATION DATASET"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Feature Data: "
        f"{FEATURE_DIR}"
    )

    print(
        f"📂 Training Data: "
        f"{TRAINING_DIR}"
    )

    print(
        f"📂 Validation Output: "
        f"{VALIDATED_DIR}"
    )

    # ========================================================
    # LOAD FEATURE DATA
    # ========================================================

    print()
    print("=" * 70)

    print(
        "1. LOAD FEATURE DATA"
    )

    print("=" * 70)

    data = {}

    for category, filename in FILES.items():

        rows = load_csv(
            FEATURE_DIR,
            filename
        )

        data[category] = rows

        print(
            f"📥 {category:<12}"
            f"{len(rows):,} records"
        )

    # ========================================================
    # BUILDERS
    # ========================================================

    builders = [

        (
            "cpu_motherboard.csv",
            build_cpu_motherboard,
            "CPU",
            "Motherboard"
        ),

        (
            "cpu_cooler.csv",
            build_cpu_cooler,
            "CPU",
            "Cooler"
        ),

        (
            "ram_motherboard.csv",
            build_ram_motherboard,
            "RAM",
            "Motherboard"
        ),

        (
            "gpu_case.csv",
            build_gpu_case,
            "GPU",
            "Case"
        ),

        (
            "cooler_case.csv",
            build_cooler_case,
            "Cooler",
            "Case"
        ),

        (
            "motherboard_case.csv",
            build_motherboard_case,
            "Motherboard",
            "Case"
        ),

        (
            "psu_case.csv",
            build_psu_case,
            "PSU",
            "Case"
        ),

        (
            "storage_motherboard.csv",
            build_storage_motherboard,
            "Storage",
            "Motherboard"
        ),

    ]

    # ========================================================
    # BUILD VALIDATION DATASETS
    # ========================================================

    print()
    print("=" * 70)

    print(
        "2. BUILD VALIDATION DATASETS"
    )

    print("=" * 70)

    summary = []

    for filename, builder, a, b in builders:

        print()
        print("=" * 70)

        print(
            f"📦 DATASET: "
            f"{filename}"
        )

        print("=" * 70)

        rows = builder(
            data[a],
            data[b]
        )

        compatible = sum(
            1
            for row in rows
            if row.get("label") == 1
        )

        incompatible = sum(
            1
            for row in rows
            if row.get("label") == 0
        )

        output = save_csv(
            filename,
            rows
        )

        summary.append({

            "dataset":
                filename,

            "compatible":
                compatible,

            "incompatible":
                incompatible,

            "total":
                len(rows)

        })

        print()
        print(
            f"📄 {output}"
        )

        print(
            f"   Compatible   : "
            f"{compatible:,}"
        )

        print(
            f"   Incompatible : "
            f"{incompatible:,}"
        )

        print(
            f"   Total        : "
            f"{len(rows):,}"
        )

    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    summary_path = (
        VALIDATED_DIR /
        "compatibility_summary.csv"
    )

    with open(
        summary_path,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "dataset",
                "compatible",
                "incompatible",
                "total"
            ]
        )

        writer.writeheader()

        writer.writerows(
            summary
        )

    # ========================================================
    # VALIDATION ISSUES
    # ========================================================

    issues = []

    for row in summary:

        if row["total"] == 0:

            issues.append({

                "dataset":
                    row["dataset"],

                "issue":
                    "No validation records"

            })

        elif row["compatible"] == 0:

            issues.append({

                "dataset":
                    row["dataset"],

                "issue":
                    "No compatible samples"

            })

        elif row["incompatible"] == 0:

            issues.append({

                "dataset":
                    row["dataset"],

                "issue":
                    "No incompatible samples"

            })

        elif row["total"] != (
            VALIDATION_PER_CLASS * 2
        ):

            issues.append({

                "dataset":
                    row["dataset"],

                "issue":
                    "Validation dataset is not balanced"

            })

    issues_path = (
        VALIDATED_DIR /
        "validation_issues.csv"
    )

    with open(
        issues_path,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "dataset",
                "issue"
            ]
        )

        writer.writeheader()

        writer.writerows(
            issues
        )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    total_records = sum(
        row["total"]
        for row in summary
    )

    total_compatible = sum(
        row["compatible"]
        for row in summary
    )

    total_incompatible = sum(
        row["incompatible"]
        for row in summary
    )

    print()
    print("=" * 70)

    print(
        "📊 VALIDATION DATASET SUMMARY"
    )

    print("=" * 70)

    print(
        f"Total Validation Records : "
        f"{total_records:,}"
    )

    print(
        f"Total Compatible         : "
        f"{total_compatible:,}"
    )

    print(
        f"Total Incompatible       : "
        f"{total_incompatible:,}"
    )

    print(
        f"Datasets                 : "
        f"{len(summary)}"
    )

    print()
    print(
        "📁 Validation Files"
    )

    print("-" * 70)

    for row in summary:

        print(
            f"📄 "
            f"{VALIDATED_DIR / row['dataset']}"
        )

    print()

    print(
        f"📄 {summary_path}"
    )

    print(
        f"📄 {issues_path}"
    )

    print()
    print("=" * 70)

    if issues:

        print(
            "⚠️ BUILD เสร็จแล้ว "
            "แต่พบ Validation Issues"
        )

        print()

        for issue in issues:

            print(
                f"   ⚠️ "
                f"{issue['dataset']}: "
                f"{issue['issue']}"
            )

    else:

        print(
            "✅ BUILD VALIDATION DATASET "
            "เสร็จสมบูรณ์"
        )

        print(
            f"✅ ทุก dataset มี "
            f"{VALIDATION_PER_CLASS:,} "
            f"Compatible + "
            f"{VALIDATION_PER_CLASS:,} "
            f"Incompatible"
        )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()
