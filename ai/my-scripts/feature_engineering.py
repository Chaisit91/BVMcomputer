import csv
import json
import sys
from pathlib import Path


# ============================================================
# BuildCores OpenDB - FEATURE ENGINEERING
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

INPUT_DIR = ROOT / "data" / "processed" / "normalized"
OUTPUT_DIR = ROOT / "data" / "processed" / "features"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


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

EMPTY_VALUES = {
    "",
    "nan",
    "none",
    "null",
    "n/a",
    "na",
    "-",
}


def clean(value):

    if value is None:
        return ""

    value = str(value).strip()

    if value.lower() in EMPTY_VALUES:
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


def to_int(value):

    number = to_float(value)

    if number is None:
        return None

    return int(number)


def int_or_blank(value):

    result = to_int(value)

    return "" if result is None else result


def sum_known_ints(*values):

    numbers = [to_int(value) for value in values]

    if all(value is None for value in numbers):
        return ""

    return sum(value or 0 for value in numbers)


def load_csv(filename):

    path = INPUT_DIR / filename

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

    if not rows:

        print(
            f"⚠️ ไม่มีข้อมูลสำหรับ {filename}"
        )

        return None

    output_file = OUTPUT_DIR / filename

    fieldnames = list(rows[0].keys())

    with open(
        output_file,
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

    return output_file


def get_value(row, field):

    return clean(row.get(field))


# ============================================================
# PCIe / M.2 FEATURE ENGINEERING
# ============================================================

def parse_pcie_slots(value):

    """
    Convert PCIe JSON string into Python list.

    Example:

    [
        {"gen":"4.0","quantity":2,"lanes":1},
        {"gen":"4.0","quantity":1,"lanes":16}
    ]
    """

    value = clean(value)

    if not value:

        return []

    try:

        data = json.loads(value)

        if isinstance(data, list):

            return data

    except (
        json.JSONDecodeError,
        TypeError,
        ValueError
    ):

        pass

    return []


def build_pcie_features(value):

    """
    Convert complex PCIe JSON into numerical features.

    This prevents OneHotEncoder from creating thousands
    of categorical columns from raw PCIe JSON strings.
    """

    slots = parse_pcie_slots(value)

    result = {

        "pcie_total_slots": 0,

        "pcie_x16_slots": 0,

        "pcie_x8_slots": 0,

        "pcie_x4_slots": 0,

        "pcie_x1_slots": 0,

        "pcie_gen3_slots": 0,

        "pcie_gen4_slots": 0,

        "pcie_gen5_slots": 0,

        "pcie_max_gen": 0,
    }

    for slot in slots:

        if not isinstance(slot, dict):

            continue

        try:

            gen = float(
                slot.get(
                    "gen",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            gen = 0

        try:

            quantity = int(
                slot.get(
                    "quantity",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            quantity = 0

        try:

            lanes = int(
                slot.get(
                    "lanes",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            lanes = 0

        if quantity <= 0:

            continue

        # ----------------------------------------------------
        # Total slots
        # ----------------------------------------------------

        result[
            "pcie_total_slots"
        ] += quantity

        # ----------------------------------------------------
        # Lane width
        # ----------------------------------------------------

        if lanes == 16:

            result[
                "pcie_x16_slots"
            ] += quantity

        elif lanes == 8:

            result[
                "pcie_x8_slots"
            ] += quantity

        elif lanes == 4:

            result[
                "pcie_x4_slots"
            ] += quantity

        elif lanes == 1:

            result[
                "pcie_x1_slots"
            ] += quantity

        # ----------------------------------------------------
        # PCIe Generation
        # ----------------------------------------------------

        if gen == 3:

            result[
                "pcie_gen3_slots"
            ] += quantity

        elif gen == 4:

            result[
                "pcie_gen4_slots"
            ] += quantity

        elif gen == 5:

            result[
                "pcie_gen5_slots"
            ] += quantity

        # ----------------------------------------------------
        # Maximum generation
        # ----------------------------------------------------

        result[
            "pcie_max_gen"
        ] = max(
            result["pcie_max_gen"],
            gen
        )

    return result


def build_m2_features(value):

    """
    Convert normalized M.2 supported-size string:

        2242|2260|2280

    into:

        has_m2 = 1
        m2_supported_sizes = 2242|2260|2280

    The normalized source contains supported card sizes, not the physical slot
    count.  Treating the three sizes above as three slots overstates capacity.
    """

    value = clean(value)

    if not value:

        return {
            "has_m2": "",
            "m2_slot_count": "",
            "m2_supported_sizes": "",
        }

    slots = [

        x.strip()

        for x in value.split("|")

        if x.strip()
    ]

    return {
        "has_m2": 1,
        # The exact count was lost during normalization. One is the only safe
        # lower bound and preserves compatibility with older pipeline stages.
        "m2_slot_count": 1,
        "m2_supported_sizes": "|".join(dict.fromkeys(slots)),
    }


# ============================================================
# CPU FEATURES
# ============================================================

def build_cpu_features(rows):

    results = []

    for row in rows:

        base = to_float(
            row.get(
                "clocks_performance_base"
            )
        )

        boost = to_float(
            row.get(
                "clocks_performance_boost"
            )
        )

        cores = to_int(
            row.get(
                "cores_total"
            )
        )

        threads = to_int(
            row.get(
                "cores_threads"
            )
        )

        tdp = to_float(
            row.get(
                "specifications_tdp"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "socket": get_value(
                row,
                "socket"
            ),

            "microarchitecture": get_value(
                row,
                "microarchitecture"
            ),

            "memory_type": get_value(
                row,
                "specifications_memory_types"
            ),

            "cores_total": cores or "",

            "threads": threads or "",

            "base_clock": base or "",

            "boost_clock": boost or "",

            "tdp": tdp or "",

            "clock_gain": (

                round(
                    boost - base,
                    2
                )

                if (
                    base is not None
                    and boost is not None
                )

                else ""
            ),

            "threads_per_core": (

                round(
                    threads / cores,
                    2
                )

                if (
                    cores
                    and threads
                )

                else ""
            ),

            "performance_score": (

                round(
                    cores * boost,
                    2
                )

                if (
                    cores
                    and boost
                )

                else ""
            ),
        }

        results.append(feature)

    return results


# ============================================================
# GPU FEATURES
# ============================================================

def build_gpu_features(rows):

    results = []

    for row in rows:

        memory = to_float(
            row.get("memory")
        )

        core_count = to_int(
            row.get("core_count")
        )

        base = to_float(
            row.get("core_base_clock")
        )

        boost = to_float(
            row.get("core_boost_clock")
        )

        tdp = to_float(
            row.get("tdp")
        )

        length = to_float(
            row.get("length")
        )

        slot_width = to_float(
            row.get("total_slot_width")
        )

        expansion_slots = to_float(
            row.get("case_expansion_slot_width")
        ) or slot_width

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "chipset": get_value(
                row,
                "chipset"
            ),

            "chipset_manufacturer": get_value(
                row,
                "chipset_manufacturer"
            ),

            "memory_gb": memory or "",

            "memory_type": get_value(
                row,
                "memory_type"
            ),

            "core_count": core_count or "",

            "base_clock": base or "",

            "boost_clock": boost or "",

            "tdp": tdp or "",

            "length_mm": length or "",

            "slot_width": slot_width or "",

            "expansion_slots_required": expansion_slots or "",

            "interface": get_value(row, "interface"),

            "power_12vhpwr": int_or_blank(row.get("power_connectors_pcie_12VHPWR")),

            "power_12v_2x6": int_or_blank(row.get("power_connectors_pcie_12V_2x6")),

            "power_6_pin": int_or_blank(row.get("power_connectors_pcie_6_pin")),

            "power_8_pin": int_or_blank(row.get("power_connectors_pcie_8_pin")),

            "radiator_size_mm": to_float(row.get("radiator_size")) or "",

            "clock_gain": (

                round(
                    boost - base,
                    2
                )

                if (
                    base is not None
                    and boost is not None
                )

                else ""
            ),

            "compute_score": (

                round(
                    core_count * boost,
                    2
                )

                if (
                    core_count
                    and boost
                )

                else ""
            ),

            "performance_per_watt": (

                round(
                    (
                        core_count
                        * boost
                    ) / tdp,
                    4
                )

                if (
                    core_count
                    and boost
                    and tdp
                    and tdp > 0
                )

                else ""
            ),
        }

        results.append(feature)

    return results


# ============================================================
# RAM FEATURES
# ============================================================

def build_ram_features(rows):

    results = []

    for row in rows:

        speed = to_float(
            row.get("speed")
        )

        capacity = to_float(
            row.get("capacity")
        )

        module_capacity = to_float(
            row.get(
                "modules_capacity_gb"
            )
        )

        module_quantity = to_int(
            row.get(
                "modules_quantity"
            )
        )

        cas = to_float(
            row.get(
                "cas_latency"
            )
        )

        voltage = to_float(
            row.get(
                "voltage"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "ram_type": get_value(
                row,
                "ram_type"
            ),

            "speed_mhz": speed or "",

            "capacity_gb": capacity or "",

            "module_capacity_gb":
                module_capacity or "",

            "module_quantity":
                module_quantity or "",

            "cas_latency": cas or "",

            "voltage": voltage or "",

            "ecc": get_value(row, "ecc"),

            "registered": get_value(row, "registered"),

            "form_factor": get_value(row, "form_factor"),

            "total_capacity_check": (

                round(
                    module_capacity
                    * module_quantity,
                    2
                )

                if (
                    module_capacity
                    and module_quantity
                )

                else ""
            ),

            "speed_score": (

                round(
                    speed / cas,
                    4
                )

                if (
                    speed
                    and cas
                    and cas > 0
                )

                else ""
            ),
        }

        results.append(feature)

    return results


# ============================================================
# MOTHERBOARD FEATURES
# ============================================================

def build_motherboard_features(rows):

    results = []

    for row in rows:

        memory_max = to_float(
            row.get(
                "memory_max"
            )
        )

        memory_slots = to_int(
            row.get(
                "memory_slots"
            )
        )

        # ----------------------------------------------------
        # PCIe
        # ----------------------------------------------------

        pcie_features = build_pcie_features(

            get_value(
                row,
                "pcie_slots"
            )
        )

        # ----------------------------------------------------
        # M.2
        # ----------------------------------------------------

        m2_features = build_m2_features(

            get_value(
                row,
                "m2_slots"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "socket": get_value(
                row,
                "socket"
            ),

            "chipset": get_value(
                row,
                "chipset"
            ),

            "ram_type": get_value(
                row,
                "memory_ram_type"
            ),

            "memory_max_gb":
                memory_max or "",

            "memory_slots":
                memory_slots or "",

            "form_factor": get_value(
                row,
                "form_factor"
            ),

            "wireless": get_value(
                row,
                "wireless_networking"
            ),

            "ecc_support": get_value(row, "ecc_support"),

            "cpu_power_connectors": get_value(
                row,
                "power_connectors_cpu_power"
            ),

            "main_power_connector": get_value(
                row,
                "power_connectors_main_power"
            ),

            "sata_port_count": sum_known_ints(
                row.get("storage_devices_sata_3_gb_s"),
                row.get("storage_devices_sata_6_gb_s"),
            ),

            "sata_ports": sum_known_ints(
                row.get("storage_devices_sata_3_gb_s"),
                row.get("storage_devices_sata_6_gb_s"),
            ),

            # ------------------------------------------------
            # M.2 numerical features
            # ------------------------------------------------

            **m2_features,

            # ------------------------------------------------
            # PCIe numerical features
            # ------------------------------------------------

            **pcie_features,
        }

        results.append(feature)

    return results


# ============================================================
# PSU FEATURES
# ============================================================

def build_psu_features(rows):

    results = []

    for row in rows:

        wattage = to_float(
            row.get(
                "wattage"
            )
        )

        length = to_float(
            row.get(
                "length"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "wattage":
                wattage or "",

            "efficiency_rating":
                get_value(
                    row,
                    "efficiency_rating"
                ),

            "modular":
                get_value(
                    row,
                    "modular"
                ),

            "form_factor":
                get_value(
                    row,
                    "form_factor"
                ),

            "length_mm":
                length or "",

            "atx_24_pin": int_or_blank(row.get("connectors_atx_24_pin")),

            "eps_8_pin": int_or_blank(row.get("connectors_eps_8_pin")),

            "pcie_12vhpwr": int_or_blank(row.get("connectors_pcie_12vhpwr")),

            "pcie_6_plus_2_pin": int_or_blank(row.get("connectors_pcie_6_plus_2_pin")),

            "sata_connectors": int_or_blank(row.get("connectors_sata")),
        }

        results.append(feature)

    return results


# ============================================================
# COOLER FEATURES
# ============================================================

def build_cooler_features(rows):

    results = []

    for row in rows:

        height = to_float(
            row.get(
                "height"
            )
        )

        fan_quantity = to_int(
            row.get(
                "fan_quantity"
            )
        )

        fan_size = to_float(
            row.get(
                "fan_size"
            )
        )

        radiator_size = to_float(
            row.get(
                "radiator_size"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "cpu_sockets":
                get_value(
                    row,
                    "cpu_sockets"
                ),

            "height_mm":
                height or "",

            "fan_quantity":
                fan_quantity or "",

            "fan_size_mm":
                fan_size or "",

            "radiator_size_mm":
                radiator_size or "",

            "water_cooled":
                get_value(
                    row,
                    "water_cooled"
                ),

            "fanless":
                get_value(
                    row,
                    "fanless"
                ),
        }

        results.append(feature)

    return results


# ============================================================
# CASE FEATURES
# ============================================================

def build_case_features(rows):

    results = []

    for row in rows:

        gpu_length = to_float(
            row.get(
                "max_video_card_length"
            )
        )

        cooler_height = to_float(
            row.get(
                "max_cpu_cooler_height"
            )
        )

        psu_length = to_float(
            row.get(
                "max_psu_length"
            )
        )

        volume = to_float(
            row.get(
                "volume"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "form_factor":
                get_value(
                    row,
                    "form_factor"
                ),

            "expansion_slots": to_int(row.get("expansion_slots")) or "",

            "internal_2_5_bays": int_or_blank(row.get("internal_2_5_bays")),

            "internal_3_5_bays": int_or_blank(row.get("internal_3_5_bays")),

            "gpu_clearance_mm":
                gpu_length or "",

            "cooler_clearance_mm":
                cooler_height or "",

            "psu_clearance_mm":
                psu_length or "",

            "volume_liters":
                volume or "",

            "supported_motherboards":
                get_value(
                    row,
                    "supported_motherboard_form_factors"
                ),

            "supported_psu":
                get_value(
                    row,
                    "supported_power_supply_form_factors"
                ),

            "transparent_side_panel":
                get_value(
                    row,
                    "has_transparent_side_panel"
                ),
        }

        results.append(feature)

    return results


# ============================================================
# STORAGE FEATURES
# ============================================================

def build_storage_features(rows):

    results = []

    for row in rows:

        capacity = to_float(
            row.get(
                "capacity"
            )
        )

        feature = {

            "opendb_id": get_value(
                row,
                "opendb_id"
            ),

            "name": get_value(
                row,
                "metadata_name"
            ),

            "manufacturer": get_value(
                row,
                "metadata_manufacturer"
            ),

            "capacity_gb":
                capacity or "",

            "storage_type":
                get_value(
                    row,
                    "storage_type"
                ),

            "type":
                get_value(
                    row,
                    "type"
                ),

            "form_factor":
                get_value(
                    row,
                    "form_factor"
                ),

            "interface":
                get_value(
                    row,
                    "interface"
                ),

            "nvme":
                get_value(
                    row,
                    "nvme"
                ),
        }

        results.append(feature)

    return results


# ============================================================
# BUILDERS
# ============================================================

BUILDERS = {

    "CPU":
        build_cpu_features,

    "GPU":
        build_gpu_features,

    "RAM":
        build_ram_features,

    "Motherboard":
        build_motherboard_features,

    "PSU":
        build_psu_features,

    "Cooler":
        build_cooler_features,

    "Case":
        build_case_features,

    "Storage":
        build_storage_features,
}


# ============================================================
# MAIN
# ============================================================

def main():

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    print("=" * 70)

    print(
        "BuildCores OpenDB - FEATURE ENGINEERING"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Input : {INPUT_DIR}"
    )

    print(
        f"📂 Output: {OUTPUT_DIR}"
    )

    total_records = 0

    print()

    print("=" * 70)

    print(
        "1. BUILD FEATURES"
    )

    print("=" * 70)

    for category, filename in FILES.items():

        rows = load_csv(
            filename
        )

        print(
            f"📥 {category:<12} "
            f"{len(rows):>5} records"
        )

        if not rows:

            continue

        builder = BUILDERS[
            category
        ]

        features = builder(
            rows
        )

        output_file = save_csv(
            filename,
            features
        )

        total_records += len(
            features
        )

        if output_file:

            print(
                f"   ✅ Features: "
                f"{len(features):,} "
                f"→ {output_file}"
            )

    print()

    print("=" * 70)

    print(
        "📊 FEATURE ENGINEERING SUMMARY"
    )

    print("=" * 70)

    print(
        f"Total Records : "
        f"{total_records:,}"
    )

    print(
        f"Datasets      : "
        f"{len(FILES)}"
    )

    print()

    print(
        "📁 Feature Files"
    )

    print(
        "-" * 70
    )

    for filename in FILES.values():

        output_file = (
            OUTPUT_DIR / filename
        )

        if output_file.exists():

            print(
                f"📄 {output_file}"
            )

    print()

    print("=" * 70)

    print(
        "✅ FEATURE ENGINEERING เสร็จแล้ว"
    )

    print("=" * 70)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()
