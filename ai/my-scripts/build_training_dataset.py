import csv
import random
import sys
from pathlib import Path

from dataset_compatibility_rules import required_with_optional_constraint


for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


# ============================================================
# BuildCores OpenDB - BUILD TRAINING DATASET
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

FEATURE_DIR = ROOT / "data" / "processed" / "features"
OUTPUT_DIR = ROOT / "data" / "processed" / "training"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SETTINGS
# ============================================================

RANDOM_SEED = 42
MAX_PER_CLASS = 10000
CANDIDATE_POOL_PER_CLASS = MAX_PER_CLASS * 5

random.seed(RANDOM_SEED)


class Reservoir(list):
    """Keep a uniform bounded sample instead of every Cartesian-product row."""

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
# HELPERS
# ============================================================

def clean(value):

    if value is None:
        return ""

    value = str(value).strip()

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

    value = clean(value)

    if not value:
        return None

    try:
        return float(value)

    except (ValueError, TypeError):
        return None


def load_csv(filename):

    path = FEATURE_DIR / filename

    if not path.exists():

        print(f"❌ ไม่พบไฟล์: {path}")

        return []

    with open(
        path,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        return list(csv.DictReader(f))


def save_csv(filename, rows):

    path = OUTPUT_DIR / filename

    if not rows:

        with open(
            path,
            "w",
            encoding="utf-8-sig",
            newline=""
        ):
            pass

        return path

    fieldnames = list(rows[0].keys())

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
        writer.writerows(rows)

    return path


def get_values(value):

    """
    รองรับข้อมูลรูปแบบ

    AM4|AM5|LGA1700

    หรือ

    ATX|Micro ATX|Mini ITX
    """

    value = clean(value)

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


def exact_match(value_a, value_b):

    value_a = clean(value_a).lower()
    value_b = clean(value_b).lower()

    if not value_a or not value_b:
        return -1

    return int(value_a == value_b)


def supported_match(supported_value, target_value):

    supported = get_values(supported_value)
    target = clean(target_value).lower()

    if not supported or not target:
        return -1

    return int(target in supported)


# ============================================================
# CPU ↔ MOTHERBOARD
# ============================================================

def build_cpu_motherboard(cpu_rows, motherboard_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 CPU ↔ MOTHERBOARD")

    for cpu in cpu_rows:

        cpu_socket = clean(
            cpu.get("socket")
        )

        if not cpu_socket:
            continue

        for board in motherboard_rows:

            board_socket = clean(
                board.get("socket")
            )

            if not board_socket:
                continue

            match = exact_match(
                cpu_socket,
                board_socket
            )

            row = {

                "cpu_id":
                    clean(cpu.get("opendb_id")),

                "motherboard_id":
                    clean(board.get("opendb_id")),

                "cpu_socket":
                    cpu_socket,

                "motherboard_socket":
                    board_socket,

                "cpu_cores":
                    clean(cpu.get("cores_total")),

                "cpu_threads":
                    clean(cpu.get("threads")),

                "cpu_base_clock":
                    clean(cpu.get("base_clock")),

                "cpu_boost_clock":
                    clean(cpu.get("boost_clock")),

                "cpu_tdp":
                    clean(cpu.get("tdp")),

                "motherboard_ram_type":
                    clean(board.get("ram_type")),

                "motherboard_ram_slots":
                    clean(board.get("memory_slots")),

                "motherboard_chipset":
                    clean(board.get("chipset")),

                "socket_match":
                    match,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# CPU ↔ COOLER
# ============================================================

def build_cpu_cooler(cpu_rows, cooler_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 CPU ↔ COOLER")

    for cpu in cpu_rows:

        cpu_socket = clean(
            cpu.get("socket")
        )

        if not cpu_socket:
            continue

        for cooler in cooler_rows:

            supported = supported_match(
                cooler.get("cpu_sockets"),
                cpu_socket
            )

            if supported == -1:
                continue

            row = {

                "cpu_id":
                    clean(cpu.get("opendb_id")),

                "cooler_id":
                    clean(cooler.get("opendb_id")),

                "cpu_socket":
                    cpu_socket,

                "cooler_sockets":
                    clean(cooler.get("cpu_sockets")),

                "cpu_tdp":
                    clean(cpu.get("tdp")),

                "cooler_height":
                    clean(cooler.get("height_mm")),

                "fan_quantity":
                    clean(cooler.get("fan_quantity")),

                "fan_size":
                    clean(cooler.get("fan_size_mm")),

                "radiator_size":
                    clean(cooler.get("radiator_size_mm")),

                "water_cooled":
                    clean(cooler.get("water_cooled")),

                "socket_match":
                    supported,

                "label":
                    supported
            }

            if supported == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# RAM ↔ MOTHERBOARD
# ============================================================

def build_ram_motherboard(ram_rows, motherboard_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 RAM ↔ MOTHERBOARD")

    for ram in ram_rows:

        ram_type = clean(
            ram.get("ram_type")
        )

        if not ram_type:
            continue

        for board in motherboard_rows:

            board_type = clean(
                board.get("ram_type")
            )

            match = exact_match(
                ram_type,
                board_type
            )

            if match == -1:
                continue

            row = {

                "ram_id":
                    clean(ram.get("opendb_id")),

                "motherboard_id":
                    clean(board.get("opendb_id")),

                "ram_type":
                    ram_type,

                "motherboard_ram_type":
                    board_type,

                "ram_speed":
                    clean(ram.get("speed_mhz")),

                "ram_capacity":
                    clean(ram.get("capacity_gb")),

                "ram_modules":
                    clean(ram.get("module_quantity")),

                "ram_cas_latency":
                    clean(ram.get("cas_latency")),

                "motherboard_memory_max":
                    clean(board.get("memory_max_gb")),

                "motherboard_memory_slots":
                    clean(board.get("memory_slots")),

                "ram_type_match":
                    match,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# GPU ↔ CASE
# ============================================================

def build_gpu_case(gpu_rows, case_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 GPU ↔ CASE")

    for gpu in gpu_rows:

        gpu_length = to_float(
            gpu.get("length_mm")
        )

        if gpu_length is None:
            continue

        for case in case_rows:

            max_length = to_float(
                case.get("gpu_clearance_mm")
            )

            if max_length is None:
                continue

            match = int(
                gpu_length <= max_length
            )

            row = {

                "gpu_id":
                    clean(gpu.get("opendb_id")),

                "case_id":
                    clean(case.get("opendb_id")),

                "gpu_memory":
                    clean(gpu.get("memory_gb")),

                "gpu_memory_type":
                    clean(gpu.get("memory_type")),

                "gpu_tdp":
                    clean(gpu.get("tdp")),

                "gpu_length":
                    gpu_length,

                "gpu_slot_width":
                    clean(gpu.get("slot_width")),

                "case_gpu_clearance":
                    max_length,

                "case_form_factor":
                    clean(case.get("form_factor")),

                "length_difference":
                    round(
                        max_length - gpu_length,
                        2
                    ),

                "gpu_case_length_ok":
                    match,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# COOLER ↔ CASE
# ============================================================

def build_cooler_case(cooler_rows, case_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 COOLER ↔ CASE")

    for cooler in cooler_rows:

        cooler_height = to_float(
            cooler.get("height_mm")
        )

        if cooler_height is None:
            continue

        for case in case_rows:

            max_height = to_float(
                case.get("cooler_clearance_mm")
            )

            if max_height is None:
                continue

            match = int(
                cooler_height <= max_height
            )

            row = {

                "cooler_id":
                    clean(cooler.get("opendb_id")),

                "case_id":
                    clean(case.get("opendb_id")),

                "cooler_height":
                    cooler_height,

                "case_cooler_clearance":
                    max_height,

                "cooler_fan_size":
                    clean(cooler.get("fan_size_mm")),

                "cooler_fan_quantity":
                    clean(cooler.get("fan_quantity")),

                "radiator_size":
                    clean(cooler.get("radiator_size_mm")),

                "case_form_factor":
                    clean(case.get("form_factor")),

                "height_difference":
                    round(
                        max_height - cooler_height,
                        2
                    ),

                "cooler_case_height_ok":
                    match,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# MOTHERBOARD ↔ CASE
# ============================================================

def build_motherboard_case(
    motherboard_rows,
    case_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 MOTHERBOARD ↔ CASE")

    for board in motherboard_rows:

        board_form = clean(
            board.get("form_factor")
        )

        if not board_form:
            continue

        for case in case_rows:

            supported = supported_match(
                case.get("supported_motherboards"),
                board_form
            )

            if supported == -1:
                continue

            row = {

                "motherboard_id":
                    clean(board.get("opendb_id")),

                "case_id":
                    clean(case.get("opendb_id")),

                "motherboard_form_factor":
                    board_form,

                "case_supported_motherboards":
                    clean(case.get("supported_motherboards")),

                "motherboard_ram_type":
                    clean(board.get("ram_type")),

                "motherboard_memory_slots":
                    clean(board.get("memory_slots")),

                "case_form_factor":
                    clean(case.get("form_factor")),

                "form_factor_match":
                    supported,

                "label":
                    supported
            }

            if supported == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# PSU ↔ CASE
# ============================================================

def build_psu_case(psu_rows, case_rows):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 PSU ↔ CASE")

    for psu in psu_rows:

        psu_form = clean(
            psu.get("form_factor")
        )

        if not psu_form:
            continue

        psu_length = to_float(
            psu.get("length_mm")
        )

        for case in case_rows:

            supported = supported_match(
                case.get("supported_psu"),
                psu_form
            )

            if supported == -1:
                continue

            case_psu_clearance = to_float(
                case.get("psu_clearance_mm")
            )

            if (
                psu_length is not None
                and case_psu_clearance is not None
            ):

                length_ok = int(
                    psu_length <= case_psu_clearance
                )

                match = required_with_optional_constraint(
                    supported,
                    length_ok,
                )

            else:

                length_ok = -1

                match = required_with_optional_constraint(
                    supported,
                    length_ok,
                )

            row = {

                "psu_id":
                    clean(psu.get("opendb_id")),

                "case_id":
                    clean(case.get("opendb_id")),

                "psu_wattage":
                    clean(psu.get("wattage")),

                "psu_form_factor":
                    psu_form,

                "psu_length":
                    clean(psu.get("length_mm")),

                "psu_efficiency":
                    clean(psu.get("efficiency_rating")),

                "case_supported_psu":
                    clean(case.get("supported_psu")),

                "case_psu_clearance":
                    clean(case.get("psu_clearance_mm")),

                "psu_form_factor_match":
                    supported,

                "psu_length_ok":
                    length_ok,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# STORAGE ↔ MOTHERBOARD
# ============================================================

def build_storage_motherboard(
    storage_rows,
    motherboard_rows
):

    compatible = Reservoir(CANDIDATE_POOL_PER_CLASS)
    incompatible = Reservoir(CANDIDATE_POOL_PER_CLASS)

    print()
    print("🔗 STORAGE ↔ MOTHERBOARD")

    for storage in storage_rows:

        storage_interface = clean(
            storage.get("interface")
        ).lower()

        storage_form_factor = clean(
            storage.get("form_factor")
        ).lower()

        storage_nvme = clean(
            storage.get("nvme")
        ).lower()

        if not storage_interface:
            continue

        for board in motherboard_rows:

            # ------------------------------------------------
            # IMPORTANT
            # Feature Engineering เปลี่ยนชื่อแล้ว
            #
            # m2_slots  -> m2_slot_count
            # pcie_slots -> pcie_total_slots
            # ------------------------------------------------

            m2_slots = to_float(
                board.get("m2_slot_count")
            )

            pcie_slots = to_float(
                board.get("pcie_total_slots")
            )

            pcie_x16_slots = to_float(
                board.get("pcie_x16_slots")
            )

            pcie_x8_slots = to_float(
                board.get("pcie_x8_slots")
            )

            pcie_x4_slots = to_float(
                board.get("pcie_x4_slots")
            )

            pcie_x1_slots = to_float(
                board.get("pcie_x1_slots")
            )

            pcie_gen3_slots = to_float(
                board.get("pcie_gen3_slots")
            )

            pcie_gen4_slots = to_float(
                board.get("pcie_gen4_slots")
            )

            pcie_gen5_slots = to_float(
                board.get("pcie_gen5_slots")
            )

            pcie_max_gen = clean(
                board.get("pcie_max_gen")
            )

            board_ram_type = clean(
                board.get("ram_type")
            )

            # ------------------------------------------------
            # ต้องมีข้อมูล storage interface
            # หรือ M.2 slot จึงจะประเมินได้
            # ------------------------------------------------

            has_m2_information = (
                m2_slots is not None
            )

            has_pcie_information = (
                pcie_slots is not None
            )

            # ------------------------------------------------
            # Compatibility rules
            # ------------------------------------------------

            match = 0

            # =================================================
            # NVMe
            # =================================================

            if storage_nvme in {
                "true",
                "1",
                "yes"
            }:

                # NVMe M.2 SSD
                if m2_slots is not None:

                    match = int(
                        m2_slots > 0
                    )

                # ถ้าไม่มี M.2 information
                # ไม่เดา
                else:

                    match = 0

            # =================================================
            # SATA
            # =================================================

            elif storage_interface == "sata":

                # SATA storage ไม่จำเป็นต้องใช้ M.2
                #
                # dataset ปัจจุบันไม่มี sata_ports
                # จึงไม่ควรเดาว่า incompatible
                #
                # ถือว่า compatible ตามกฎเดิม

                match = 1

            # =================================================
            # M.2 storage
            # =================================================

            elif "m.2" in storage_form_factor:

                if m2_slots is not None:

                    match = int(
                        m2_slots > 0
                    )

                else:

                    match = 0

            # =================================================
            # PCIe storage
            # =================================================

            elif "pcie" in storage_interface:

                if pcie_slots is not None:

                    match = int(
                        pcie_slots > 0
                    )

                else:

                    match = 0

            # =================================================
            # Unknown storage
            # =================================================

            else:

                continue

            # ------------------------------------------------
            # ถ้าไม่มีข้อมูล motherboard ที่เกี่ยวข้อง
            # ไม่ควรสร้าง label แบบเดาสุ่ม
            # ------------------------------------------------

            if (
                not has_m2_information
                and not has_pcie_information
                and storage_interface != "sata"
            ):

                continue

            # ------------------------------------------------
            # Build row
            # ------------------------------------------------

            row = {

                "storage_id":
                    clean(
                        storage.get("opendb_id")
                    ),

                "motherboard_id":
                    clean(
                        board.get("opendb_id")
                    ),

                "storage_type":
                    clean(
                        storage.get("storage_type")
                    ),

                "storage_capacity":
                    clean(
                        storage.get("capacity_gb")
                    ),

                "storage_form_factor":
                    storage_form_factor,

                "storage_interface":
                    storage_interface,

                "storage_nvme":
                    storage_nvme,

                # ------------------------------------------------
                # NEW FEATURE COLUMNS
                # ------------------------------------------------

                "motherboard_m2_slots":
                    clean(
                        board.get("m2_slot_count")
                    ),

                "motherboard_pcie_slots":
                    clean(
                        board.get("pcie_total_slots")
                    ),

                "motherboard_pcie_x16_slots":
                    clean(
                        board.get("pcie_x16_slots")
                    ),

                "motherboard_pcie_x8_slots":
                    clean(
                        board.get("pcie_x8_slots")
                    ),

                "motherboard_pcie_x4_slots":
                    clean(
                        board.get("pcie_x4_slots")
                    ),

                "motherboard_pcie_x1_slots":
                    clean(
                        board.get("pcie_x1_slots")
                    ),

                "motherboard_pcie_gen3_slots":
                    clean(
                        board.get("pcie_gen3_slots")
                    ),

                "motherboard_pcie_gen4_slots":
                    clean(
                        board.get("pcie_gen4_slots")
                    ),

                "motherboard_pcie_gen5_slots":
                    clean(
                        board.get("pcie_gen5_slots")
                    ),

                "motherboard_pcie_max_gen":
                    pcie_max_gen,

                "motherboard_form_factor":
                    clean(
                        board.get("form_factor")
                    ),

                "motherboard_ram_type":
                    board_ram_type,

                # ------------------------------------------------
                # LABEL
                # ------------------------------------------------

                "storage_m2_slot_ok":
                    match,

                "label":
                    match
            }

            if match == 1:
                compatible.append(row)

            else:
                incompatible.append(row)

    return compatible, incompatible


# ============================================================
# BALANCE DATASET
# ============================================================

def balance_dataset(
    compatible,
    incompatible
):

    random.shuffle(compatible)
    random.shuffle(incompatible)

    size = min(
        len(compatible),
        len(incompatible),
        MAX_PER_CLASS
    )

    compatible = compatible[:size]
    incompatible = incompatible[:size]

    result = compatible + incompatible

    random.shuffle(result)

    return result


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("BuildCores OpenDB - BUILD TRAINING DATASET")
    print("=" * 70)

    print()
    print(f"📂 Input : {FEATURE_DIR}")
    print(f"📂 Output: {OUTPUT_DIR}")

    # ========================================================
    # 1. LOAD
    # ========================================================

    print()
    print("=" * 70)
    print("1. LOAD FEATURE DATA")
    print("=" * 70)

    data = {}

    for category, filename in FILES.items():

        rows = load_csv(filename)

        data[category] = rows

        print(
            f"📥 {category:<12} "
            f"{len(rows):,} records"
        )

    # ========================================================
    # 1.1 COLUMN CHECK
    # ========================================================

    print()
    print("=" * 70)
    print("1.1 COLUMN CHECK")
    print("=" * 70)

    for category, rows in data.items():

        if rows:

            print(
                f"🔍 {category:<12} "
                f"{len(rows[0].keys())} columns"
            )

    # ========================================================
    # 2. BUILD DATASETS
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
            "storage_motherboard.csv",
            build_storage_motherboard,
            "Storage",
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
    ]

    print()
    print("=" * 70)
    print("2. BUILD COMPATIBILITY DATASETS")
    print("=" * 70)

    summary = []

    for filename, builder, a, b in builders:

        compatible, incompatible = builder(
            data[a],
            data[b]
        )

        original_compatible = len(
            compatible
        )

        original_incompatible = len(
            incompatible
        )

        result = balance_dataset(
            compatible,
            incompatible
        )

        output = save_csv(
            filename,
            result
        )

        positive = sum(
            1
            for row in result
            if str(row["label"]) == "1"
        )

        negative = sum(
            1
            for row in result
            if str(row["label"]) == "0"
        )

        summary.append({

            "dataset":
                filename,

            "original_compatible":
                original_compatible,

            "original_incompatible":
                original_incompatible,

            "training_compatible":
                positive,

            "training_incompatible":
                negative,

            "total_training_records":
                len(result)
        })

        print()
        print(f"📄 {output}")

        print(
            f"   Compatible   : "
            f"{original_compatible:,} → "
            f"{positive:,}"
        )

        print(
            f"   Incompatible : "
            f"{original_incompatible:,} → "
            f"{negative:,}"
        )

        print(
            f"   Total        : "
            f"{len(result):,}"
        )

        if len(result) == 0:

            print(
                "   ⚠️ WARNING: "
                "Dataset นี้ยังไม่มีข้อมูล"
            )

    # ========================================================
    # 3. SUMMARY
    # ========================================================

    summary_file = save_csv(
        "training_summary.csv",
        summary
    )

    print()
    print("=" * 70)
    print("📊 TRAINING DATASET SUMMARY")
    print("=" * 70)

    total = sum(
        int(row["total_training_records"])
        for row in summary
    )

    total_compatible = sum(
        int(row["training_compatible"])
        for row in summary
    )

    total_incompatible = sum(
        int(row["training_incompatible"])
        for row in summary
    )

    print(
        f"Total Training Records : "
        f"{total:,}"
    )

    print(
        f"Total Compatible       : "
        f"{total_compatible:,}"
    )

    print(
        f"Total Incompatible     : "
        f"{total_incompatible:,}"
    )

    print(
        f"Datasets               : "
        f"{len(summary)}"
    )

    print()
    print("📁 Training Files")
    print("-" * 70)

    for row in summary:

        print(
            f"📄 {OUTPUT_DIR / row['dataset']}"
        )

    print(
        f"📄 {summary_file}"
    )

    print()
    print("=" * 70)
    print("✅ BUILD TRAINING DATASET เสร็จแล้ว")
    print("=" * 70)


if __name__ == "__main__":
    main()
