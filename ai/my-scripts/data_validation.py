import csv
from pathlib import Path
from collections import Counter


# ============================================================
# BuildCores OpenDB - DATA VALIDATION
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

INPUT_DIR = ROOT / "data" / "processed" / "normalized"
OUTPUT_DIR = ROOT / "data" / "processed" / "validated"

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
# BASIC HELPERS
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
        "-",
    }:
        return ""

    return value


def to_float(value):
    value = clean(value)

    if not value:
        return None

    # รองรับค่า เช่น "3200 MHz", "850 W", "170 mm"
    cleaned = value.replace(",", "")

    number = ""

    for char in cleaned:

        if char.isdigit() or char in ".-":

            number += char

        elif number:

            break

    try:
        return float(number)

    except ValueError:
        return None


def split_values(value):
    """
    รองรับ:

        AM4|AM5|LGA1700

        AM4, AM5, LGA1700

        AM4;AM5;LGA1700
    """

    value = clean(value)

    if not value:
        return set()

    value = value.replace(",", "|")
    value = value.replace(";", "|")
    value = value.replace("/", "|")

    result = set()

    for item in value.split("|"):

        item = clean(item)

        if item:
            result.add(item.upper())

    return result


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

        reader = csv.DictReader(f)

        return list(reader)


def get_field(row, *fields):

    for field in fields:

        if field not in row:
            continue

        value = clean(row.get(field))

        if value:
            return value

    return ""


# ============================================================
# COMPATIBILITY RESULT
# ============================================================

def count_status(
    status,
    counters
):

    if status == "COMPATIBLE":

        counters["compatible"] += 1

    elif status == "INCOMPATIBLE":

        counters["incompatible"] += 1

    elif status == "POTENTIAL":

        counters["potential"] += 1

    else:

        counters["unknown"] += 1


# ============================================================
# CPU SOCKET
# ============================================================

def socket_compatible(
    cpu_socket,
    motherboard_socket
):

    cpu_socket = split_values(cpu_socket)

    motherboard_socket = split_values(
        motherboard_socket
    )

    if not cpu_socket or not motherboard_socket:

        return "UNKNOWN"

    if cpu_socket & motherboard_socket:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# RAM TYPE
# ============================================================

def ram_type_compatible(
    ram_type,
    motherboard_type
):

    ram_type = split_values(ram_type)

    motherboard_type = split_values(
        motherboard_type
    )

    if not ram_type or not motherboard_type:

        return "UNKNOWN"

    if ram_type & motherboard_type:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# RAM CAPACITY
# ============================================================

def ram_capacity_validation(
    ram_capacity,
    motherboard_max
):

    ram_capacity = to_float(
        ram_capacity
    )

    motherboard_max = to_float(
        motherboard_max
    )

    if ram_capacity is None:

        return "UNKNOWN"

    # ถ้าไม่มีข้อมูล Max RAM
    # ไม่ควรตัดสินว่า incompatible
    if motherboard_max is None:

        return "UNKNOWN"

    if ram_capacity <= motherboard_max:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# GPU ↔ CASE
# ============================================================

def gpu_case_validation(
    gpu_length,
    case_max_gpu_length
):

    gpu_length = to_float(
        gpu_length
    )

    case_max_gpu_length = to_float(
        case_max_gpu_length
    )

    if (
        gpu_length is None
        or case_max_gpu_length is None
    ):

        return "UNKNOWN"

    if gpu_length <= case_max_gpu_length:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# COOLER ↔ CASE
# ============================================================

def cooler_case_validation(
    cooler_height,
    case_max_height
):

    cooler_height = to_float(
        cooler_height
    )

    case_max_height = to_float(
        case_max_height
    )

    if (
        cooler_height is None
        or case_max_height is None
    ):

        return "UNKNOWN"

    if cooler_height <= case_max_height:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# CPU ↔ COOLER
# ============================================================

def cooler_cpu_validation(
    cooler_sockets,
    cpu_socket
):

    cooler_sockets = split_values(
        cooler_sockets
    )

    cpu_socket = split_values(
        cpu_socket
    )

    if not cooler_sockets or not cpu_socket:

        return "UNKNOWN"

    if cooler_sockets & cpu_socket:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# FORM FACTOR
# ============================================================

def form_factor_compatible(
    component_form_factor,
    supported_form_factors
):

    component_form_factor = split_values(
        component_form_factor
    )

    supported_form_factors = split_values(
        supported_form_factors
    )

    if (
        not component_form_factor
        or not supported_form_factors
    ):

        return "UNKNOWN"

    if component_form_factor & supported_form_factors:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# PSU ↔ CASE LENGTH
# ============================================================

def psu_case_length_validation(
    psu_length,
    case_max_psu_length
):

    psu_length = to_float(
        psu_length
    )

    case_max_psu_length = to_float(
        case_max_psu_length
    )

    if (
        psu_length is None
        or case_max_psu_length is None
    ):

        return "UNKNOWN"

    if psu_length <= case_max_psu_length:

        return "COMPATIBLE"

    return "INCOMPATIBLE"


# ============================================================
# BASIC DATA QUALITY
# ============================================================

def validate_required_fields(
    category,
    rows
):

    required_fields = [
        "opendb_id",
        "metadata_name",
    ]

    results = []

    for row in rows:

        missing = []

        for field in required_fields:

            if not clean(
                row.get(field)
            ):

                missing.append(field)

        if missing:

            results.append({
                "category": category,
                "opendb_id": row.get(
                    "opendb_id",
                    ""
                ),
                "issue": "MISSING_REQUIRED_FIELD",
                "fields": "|".join(
                    missing
                ),
            })

    return results


# ============================================================
# DUPLICATE ID
# ============================================================

def validate_duplicate_ids(
    category,
    rows
):

    ids = []

    for row in rows:

        opendb_id = clean(
            row.get("opendb_id")
        )

        if opendb_id:

            ids.append(opendb_id)

    counter = Counter(ids)

    results = []

    for opendb_id, count in counter.items():

        if count > 1:

            results.append({
                "category": category,
                "opendb_id": opendb_id,
                "issue": "DUPLICATE_ID",
                "fields": str(count),
            })

    return results


# ============================================================
# CPU ↔ MOTHERBOARD
# ============================================================

def validate_cpu_motherboard(
    cpus,
    motherboards
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("CPU ↔ MOTHERBOARD")
    print("-" * 70)

    for cpu in cpus:

        cpu_socket = get_field(
            cpu,
            "socket"
        )

        for motherboard in motherboards:

            motherboard_socket = get_field(
                motherboard,
                "socket"
            )

            status = socket_compatible(
                cpu_socket,
                motherboard_socket
            )

            count_status(
                status,
                counters
            )

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "CPU_MOTHERBOARD",

        "total":
            total,

        **counters,
    }


# ============================================================
# RAM ↔ MOTHERBOARD
# ============================================================

def validate_ram_motherboard(
    rams,
    motherboards
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("RAM ↔ MOTHERBOARD")
    print("-" * 70)

    for ram in rams:

        ram_type = get_field(
            ram,
            "ram_type"
        )

        ram_capacity = get_field(
            ram,
            "capacity",
            "modules_capacity_gb"
        )

        for motherboard in motherboards:

            motherboard_type = get_field(
                motherboard,
                "memory_ram_type"
            )

            motherboard_max = get_field(
                motherboard,
                "memory_max"
            )

            # ------------------------------------------------
            # RAM TYPE
            # ------------------------------------------------

            type_status = ram_type_compatible(
                ram_type,
                motherboard_type
            )

            if type_status == "INCOMPATIBLE":

                counters["incompatible"] += 1

                continue

            if type_status == "UNKNOWN":

                counters["unknown"] += 1

                continue

            # ------------------------------------------------
            # CAPACITY
            # ------------------------------------------------

            capacity_status = (
                ram_capacity_validation(
                    ram_capacity,
                    motherboard_max
                )
            )

            if capacity_status == "INCOMPATIBLE":

                counters["incompatible"] += 1

                continue

            # ------------------------------------------------
            # CAPACITY UNKNOWN
            # ------------------------------------------------

            if capacity_status == "UNKNOWN":

                # RAM Type ตรง
                # แต่ไม่มี Max RAM
                # จึงถือเป็น Potential
                counters["potential"] += 1

                continue

            # ------------------------------------------------
            # EVERYTHING PASSED
            # ------------------------------------------------

            counters["compatible"] += 1

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Potential           : "
        f"{counters['potential']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "RAM_MOTHERBOARD",

        "total":
            total,

        **counters,
    }


# ============================================================
# GPU ↔ CASE
# ============================================================

def validate_gpu_case(
    gpus,
    cases
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("GPU ↔ CASE")
    print("-" * 70)

    for gpu in gpus:

        gpu_length = get_field(
            gpu,
            "length"
        )

        for case in cases:

            case_gpu_length = get_field(
                case,
                "max_video_card_length"
            )

            status = gpu_case_validation(
                gpu_length,
                case_gpu_length
            )

            count_status(
                status,
                counters
            )

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "GPU_CASE",

        "total":
            total,

        **counters,
    }


# ============================================================
# COOLER ↔ CASE
# ============================================================

def validate_cooler_case(
    coolers,
    cases
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("COOLER ↔ CASE")
    print("-" * 70)

    for cooler in coolers:

        cooler_height = get_field(
            cooler,
            "height"
        )

        for case in cases:

            case_height = get_field(
                case,
                "max_cpu_cooler_height"
            )

            status = cooler_case_validation(
                cooler_height,
                case_height
            )

            count_status(
                status,
                counters
            )

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "COOLER_CASE",

        "total":
            total,

        **counters,
    }


# ============================================================
# CPU ↔ COOLER
# ============================================================

def validate_cpu_cooler(
    cpus,
    coolers
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("CPU ↔ COOLER")
    print("-" * 70)

    for cpu in cpus:

        cpu_socket = get_field(
            cpu,
            "socket"
        )

        for cooler in coolers:

            cooler_sockets = get_field(
                cooler,
                "cpu_sockets"
            )

            status = cooler_cpu_validation(
                cooler_sockets,
                cpu_socket
            )

            count_status(
                status,
                counters
            )

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "CPU_COOLER",

        "total":
            total,

        **counters,
    }


# ============================================================
# MOTHERBOARD ↔ CASE
# ============================================================

def validate_motherboard_case(
    motherboards,
    cases
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("MOTHERBOARD ↔ CASE")
    print("-" * 70)

    for motherboard in motherboards:

        motherboard_form_factor = get_field(
            motherboard,
            "form_factor"
        )

        for case in cases:

            supported_form_factors = get_field(
                case,
                "supported_motherboard_form_factors"
            )

            status = form_factor_compatible(
                motherboard_form_factor,
                supported_form_factors
            )

            count_status(
                status,
                counters
            )

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "MOTHERBOARD_CASE",

        "total":
            total,

        **counters,
    }


# ============================================================
# PSU ↔ CASE
# ============================================================

def validate_psu_case(
    psus,
    cases
):

    counters = {
        "compatible": 0,
        "potential": 0,
        "incompatible": 0,
        "unknown": 0,
    }

    print()
    print("PSU ↔ CASE")
    print("-" * 70)

    for psu in psus:

        psu_form_factor = get_field(
            psu,
            "form_factor"
        )

        psu_length = get_field(
            psu,
            "length"
        )

        for case in cases:

            supported_psu_forms = get_field(
                case,
                "supported_power_supply_form_factors"
            )

            max_psu_length = get_field(
                case,
                "max_psu_length"
            )

            # ------------------------------------------------
            # FORM FACTOR
            # ------------------------------------------------

            form_status = form_factor_compatible(
                psu_form_factor,
                supported_psu_forms
            )

            if form_status == "INCOMPATIBLE":

                counters["incompatible"] += 1

                continue

            if form_status == "UNKNOWN":

                counters["unknown"] += 1

                continue

            # ------------------------------------------------
            # LENGTH
            # ------------------------------------------------

            length_status = (
                psu_case_length_validation(
                    psu_length,
                    max_psu_length
                )
            )

            if length_status == "INCOMPATIBLE":

                counters["incompatible"] += 1

            elif length_status == "UNKNOWN":

                counters["potential"] += 1

            else:

                counters["compatible"] += 1

    total = sum(
        counters.values()
    )

    print(
        f"Total combinations : {total:,}"
    )

    print(
        f"Compatible          : "
        f"{counters['compatible']:,}"
    )

    print(
        f"Potential           : "
        f"{counters['potential']:,}"
    )

    print(
        f"Incompatible        : "
        f"{counters['incompatible']:,}"
    )

    print(
        f"Unknown             : "
        f"{counters['unknown']:,}"
    )

    return {
        "relationship":
            "PSU_CASE",

        "total":
            total,

        **counters,
    }


# ============================================================
# SAVE CSV
# ============================================================

def save_csv(
    filename,
    rows,
    fieldnames
):

    output_file = (
        OUTPUT_DIR / filename
    )

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


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("BuildCores OpenDB - DATA VALIDATION")
    print("=" * 70)

    print()
    print(
        f"📂 Input : {INPUT_DIR}"
    )

    print(
        f"📂 Output: {OUTPUT_DIR}"
    )

    print()

    # ========================================================
    # LOAD DATA
    # ========================================================

    data = {}

    for category, filename in FILES.items():

        rows = load_csv(
            filename
        )

        data[category] = rows

        print(
            f"📥 {category:<12} "
            f"{len(rows):>5} records"
        )

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    print()
    print("=" * 70)
    print("1. BASIC DATA VALIDATION")
    print("=" * 70)

    quality_results = []

    for category, rows in data.items():

        quality_results.extend(
            validate_required_fields(
                category,
                rows
            )
        )

        quality_results.extend(
            validate_duplicate_ids(
                category,
                rows
            )
        )

    quality_file = save_csv(
        "validation_issues.csv",
        quality_results,
        [
            "category",
            "opendb_id",
            "issue",
            "fields",
        ]
    )

    print()

    if quality_results:

        print(
            f"⚠️ พบปัญหา Data Quality "
            f"{len(quality_results):,} รายการ"
        )

    else:

        print(
            "✅ ไม่พบปัญหา Data Quality"
        )

    print(
        f"📄 Report: {quality_file}"
    )

    # ========================================================
    # COMPATIBILITY
    # ========================================================

    print()
    print("=" * 70)
    print(
        "2. COMPONENT COMPATIBILITY VALIDATION"
    )
    print("=" * 70)

    relationship_results = []

    relationship_results.append(
        validate_cpu_motherboard(
            data["CPU"],
            data["Motherboard"]
        )
    )

    relationship_results.append(
        validate_ram_motherboard(
            data["RAM"],
            data["Motherboard"]
        )
    )

    relationship_results.append(
        validate_gpu_case(
            data["GPU"],
            data["Case"]
        )
    )

    relationship_results.append(
        validate_cooler_case(
            data["Cooler"],
            data["Case"]
        )
    )

    relationship_results.append(
        validate_cpu_cooler(
            data["CPU"],
            data["Cooler"]
        )
    )

    relationship_results.append(
        validate_motherboard_case(
            data["Motherboard"],
            data["Case"]
        )
    )

    relationship_results.append(
        validate_psu_case(
            data["PSU"],
            data["Case"]
        )
    )

    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    relationship_file = save_csv(
        "compatibility_summary.csv",
        relationship_results,
        [
            "relationship",
            "total",
            "compatible",
            "potential",
            "incompatible",
            "unknown",
        ]
    )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 70)
    print("📊 VALIDATION SUMMARY")
    print("=" * 70)

    total_records = sum(
        len(rows)
        for rows in data.values()
    )

    print(
        f"Total Records : "
        f"{total_records:,}"
    )

    print(
        f"Quality Issues: "
        f"{len(quality_results):,}"
    )

    print()

    for result in relationship_results:

        print(
            f"{result['relationship']:<22} "
            f"Compatible={result['compatible']:,} | "
            f"Potential={result['potential']:,} | "
            f"Incompatible={result['incompatible']:,} | "
            f"Unknown={result['unknown']:,}"
        )

    print()

    print(
        f"📄 {quality_file}"
    )

    print(
        f"📄 {relationship_file}"
    )

    print()
    print("=" * 70)
    print(
        "✅ DATA VALIDATION เสร็จแล้ว"
    )
    print("=" * 70)


if __name__ == "__main__":

    main()