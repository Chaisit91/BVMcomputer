import csv
import re
from pathlib import Path


# ============================================================
# BuildCores OpenDB - DATA NORMALIZATION
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

INPUT_DIR = ROOT / "data" / "processed"
OUTPUT_DIR = INPUT_DIR / "normalized"

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

def clean_text(value):
    """
    ทำความสะอาด string ทั่วไป
    """

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
        "--",
    }:
        return ""

    return value


def normalize_spaces(value):
    """
    ลดช่องว่างซ้ำ
    """

    value = clean_text(value)

    if not value:
        return ""

    return re.sub(r"\s+", " ", value).strip()


def to_number(value):
    """
    แปลงค่าเป็นตัวเลข

    รองรับ:
        850
        850W
        3.5 GHz
        3200 MHz
        16 GB
    """

    value = clean_text(value)

    if not value:
        return ""

    value = value.replace(",", "")

    match = re.search(r"-?\d+(?:\.\d+)?", value)

    if not match:
        return ""

    number = float(match.group())

    if number.is_integer():
        return str(int(number))

    return str(number)


def to_float(value):
    """
    แปลงค่าเป็น float
    """

    value = clean_text(value)

    if not value:
        return None

    value = value.replace(",", "")

    match = re.search(r"-?\d+(?:\.\d+)?", value)

    if not match:
        return None

    return float(match.group())


def normalize_boolean(value):
    """
    Normalize boolean
    """

    value = clean_text(value).lower()

    if value in {
        "true",
        "yes",
        "y",
        "1",
        "on",
        "enabled",
        "enable",
    }:
        return "true"

    if value in {
        "false",
        "no",
        "n",
        "0",
        "off",
        "disabled",
        "disable",
    }:
        return "false"

    return clean_text(value)


def normalize_unit_number(value, unit):
    """
    Normalize ตัวเลขที่มีหน่วย

    ตัวอย่าง:

        850W     -> 850
        3200 MHz -> 3200
        16 GB    -> 16
        170 mm   -> 170

    ถ้าไม่มีหน่วย เช่น 850
    จะใช้ to_number()
    """

    value = clean_text(value)

    if not value:
        return ""

    value = value.replace(",", "")

    unit_pattern = re.escape(unit)

    pattern = rf"(-?\d+(?:\.\d+)?)\s*{unit_pattern}\b"

    match = re.search(
        pattern,
        value,
        re.IGNORECASE
    )

    if match:
        number = float(match.group(1))

        if number.is_integer():
            return str(int(number))

        return str(number)

    return to_number(value)


# ============================================================
# SOCKET
# ============================================================

def normalize_socket(value):
    value = normalize_spaces(value)

    if not value:
        return ""

    value_upper = value.upper()

    patterns = [
        r"LGA\s*1851",
        r"LGA\s*1700",
        r"LGA\s*4677",
        r"LGA\s*2066",
        r"LGA\s*2011",
        r"LGA\s*1366",
        r"LGA\s*1356",
        r"LGA\s*1200",
        r"LGA\s*1156",
        r"LGA\s*1155",
        r"LGA\s*1151",
        r"LGA\s*1150",
        r"LGA\s*1121",
        r"LGA\s*775",

        r"AM5",
        r"AM4",
        r"AM3\+",
        r"AM3",
        r"AM2\+",
        r"AM2",
        r"AM1",

        r"FM2\+",
        r"FM2",
        r"FM1",

        r"TRX4",
        r"TR4",
        r"G34",
        r"SP5",
        r"STR5",
    ]

    for pattern in patterns:
        match = re.search(pattern, value_upper)

        if match:
            socket = match.group(0)

            # ลบช่องว่าง เช่น LGA 1700 -> LGA1700
            socket = socket.replace(" ", "")

            return socket

    return value


# ============================================================
# MEMORY TYPE
# ============================================================

def normalize_memory_type(value):
    """
    Normalize RAM / GPU memory type

    ตัวอย่าง:

        DDR5
        DDR4
        GDDR6X
        GDDR6
        GDDR5X
        HBM2
    """

    value = normalize_spaces(value)

    if not value:
        return ""

    value_upper = value.upper()

    patterns = [
        "GDDR7",
        "GDDR6X",
        "GDDR6",
        "GDDR5X",
        "GDDR5",

        "HBM3",
        "HBM2",
        "HBM",

        "DDR5",
        "DDR4",
        "DDR3",
        "DDR2",
        "DDR",
    ]

    for memory_type in patterns:

        if memory_type in value_upper:
            return memory_type

    return value_upper


# ============================================================
# FORM FACTOR
# ============================================================

def normalize_form_factor(value):

    value = normalize_spaces(value)

    if not value:
        return ""

    value_lower = value.lower()

    replacements = {
        "micro-atx": "Micro ATX",
        "micro atx": "Micro ATX",

        "mini-itx": "Mini ITX",
        "mini itx": "Mini ITX",

        "mini-dtx": "Mini DTX",
        "mini dtx": "Mini DTX",

        "e-atx": "EATX",
        "e atx": "EATX",
        "eatx": "EATX",

        "atx": "ATX",

        "thin mini-itx": "Thin Mini-ITX",
        "thin mini itx": "Thin Mini-ITX",
    }

    if value_lower in replacements:
        return replacements[value_lower]

    return value


# ============================================================
# M.2 SLOT NORMALIZATION
# ============================================================

M2_SIZES = [
    "22110",
    "25110",
    "2580",
    "2280",
    "2260",
    "2242",
    "2230",
]


def normalize_m2_slots(value):
    """
    Normalize M.2 slot values

    ตัวอย่าง:

        2242
            ->
        2242

        2242,2260,2280
            ->
        2242|2260|2280

        22422260228022110
            ->
        2242|2260|2280|22110

    จะไม่เอา:

        3.0
        4.0
        5.0

    ซึ่งเป็น PCIe generation
    มาปนกับ M.2 size
    """

    value = clean_text(value)

    if not value:
        return ""

    # --------------------------------------------------------
    # Normalize separators
    # --------------------------------------------------------

    value = value.replace(",", "|")
    value = value.replace("/", "|")
    value = value.replace(";", "|")

    # --------------------------------------------------------
    # หา M.2 size
    # --------------------------------------------------------

    found = []

    # กรณีค่าต่อกัน เช่น
    # 22422260228022110
    #
    # ใช้ regex เพื่อหา pattern ที่เป็น M.2 size
    # --------------------------------------------------------

    pattern = r"(25110|2580|22110|2280|2260|2242|2230)"

    matches = re.findall(
        pattern,
        value
    )

    for item in matches:

        if item not in found:
            found.append(item)

    # --------------------------------------------------------
    # กรณีมี delimiter
    # --------------------------------------------------------

    parts = re.split(
        r"[|]+",
        value
    )

    for part in parts:

        part = part.strip()

        if part in M2_SIZES:

            if part not in found:
                found.append(part)

    # --------------------------------------------------------
    # ไม่มี M.2
    # --------------------------------------------------------

    if not found:
        return ""

    # --------------------------------------------------------
    # เรียงตามขนาด
    # --------------------------------------------------------

    found.sort(
        key=lambda x: int(x)
    )

    return "|".join(found)


# ============================================================
# CLOCK NORMALIZATION
# ============================================================

def normalize_clock_ghz(value):
    """
    Normalize CPU clock เป็น GHz

    ตัวอย่าง:

        3.5 GHz
            -> 3.5

        3500 MHz
            -> 3.5

        3.5
            -> 3.5

        3500
            -> 3.5
    """

    value = clean_text(value)

    if not value:
        return ""

    number = to_float(value)

    if number is None:
        return ""

    value_lower = value.lower()

    if "mhz" in value_lower:

        number = number / 1000

    elif "ghz" in value_lower:

        pass

    elif number > 100:

        # ไม่มีหน่วย
        # ถ้าค่ามากกว่า 100
        # ถือว่าเป็น MHz

        number = number / 1000

    return str(
        round(number, 3)
    )


def normalize_clock_mhz(value):
    """
    Normalize GPU clock เป็น MHz

    ตัวอย่าง:

        1920 MHz
            -> 1920

        1.92 GHz
            -> 1920

        1920
            -> 1920
    """

    value = clean_text(value)

    if not value:
        return ""

    number = to_float(value)

    if number is None:
        return ""

    value_lower = value.lower()

    if "ghz" in value_lower:

        number = number * 1000

    return (
        str(int(number))
        if number.is_integer()
        else str(round(number, 2))
    )


# ============================================================
# CPU
# ============================================================

def normalize_cpu(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
        "microarchitecture",
        "coreFamily",
    ]

    for field in text_fields:

        if field in row:
            row[field] = normalize_spaces(
                row.get(field)
            )

    # Socket

    if "socket" in row:

        row["socket"] = normalize_socket(
            row["socket"]
        )

    # --------------------------------------------------------
    # Numeric
    # --------------------------------------------------------

    numeric_fields = [
        "cores_efficiency",
        "cores_performance",
        "cores_threads",
        "cores_total",

        "cache_l1",
        "cache_l2",
        "cache_l3",

        "specifications_memory_channels",
        "specifications_memory_maxSupport",

        "specifications_integratedGraphics_shaderCount",
    ]

    for field in numeric_fields:

        if field in row:

            row[field] = to_number(
                row[field]
            )

    # --------------------------------------------------------
    # Clock
    # --------------------------------------------------------

    clock_fields = [
        "clocks_performance_base",
        "clocks_performance_boost",
        "clocks_efficiency_base",
        "clocks_efficiency_boost",
    ]

    for field in clock_fields:

        if field in row:

            row[field] = normalize_clock_ghz(
                row[field]
            )

    # --------------------------------------------------------
    # TDP
    # --------------------------------------------------------

    if "specifications_tdp" in row:

        row["specifications_tdp"] = normalize_unit_number(
            row["specifications_tdp"],
            "W"
        )

    # --------------------------------------------------------
    # Memory
    # --------------------------------------------------------

    if "specifications_memory_types" in row:

        row["specifications_memory_types"] = (
            normalize_memory_type(
                row["specifications_memory_types"]
            )
        )

    # --------------------------------------------------------
    # Boolean
    # --------------------------------------------------------

    boolean_fields = [
        "specifications_eccSupport",
        "specifications_includesCooler",
        "specifications_simultaneousMultithreading",
    ]

    for field in boolean_fields:

        if field in row:

            row[field] = normalize_boolean(
                row[field]
            )

    return row


# ============================================================
# GPU
# ============================================================

def normalize_gpu(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # Memory
    # --------------------------------------------------------

    if "memory" in row:

        row["memory"] = normalize_unit_number(
            row["memory"],
            "GB"
        )

    # --------------------------------------------------------
    # Core Count
    # --------------------------------------------------------

    if "core_count" in row:

        row["core_count"] = to_number(
            row["core_count"]
        )

    # --------------------------------------------------------
    # Clock
    # --------------------------------------------------------

    clock_fields = [
        "core_base_clock",
        "core_boost_clock",
        "effective_memory_clock",
    ]

    for field in clock_fields:

        if field in row:

            row[field] = normalize_clock_mhz(
                row[field]
            )

    # --------------------------------------------------------
    # TDP
    # --------------------------------------------------------

    if "tdp" in row:

        row["tdp"] = normalize_unit_number(
            row["tdp"],
            "W"
        )

    # --------------------------------------------------------
    # Memory Type
    # --------------------------------------------------------

    if "memory_type" in row:

        row["memory_type"] = normalize_memory_type(
            row["memory_type"]
        )

    # --------------------------------------------------------
    # Length
    # --------------------------------------------------------

    if "length" in row:

        row["length"] = normalize_unit_number(
            row["length"],
            "mm"
        )

    # --------------------------------------------------------
    # Slot Width
    # --------------------------------------------------------

    if "total_slot_width" in row:

        row["total_slot_width"] = to_number(
            row["total_slot_width"]
        )

    if "case_expansion_slot_width" in row:

        row["case_expansion_slot_width"] = to_number(
            row["case_expansion_slot_width"]
        )

    # --------------------------------------------------------
    # Frame Sync
    # --------------------------------------------------------

    if "frame_sync" in row:

        row["frame_sync"] = normalize_spaces(
            row["frame_sync"]
        )

    return row


# ============================================================
# RAM
# ============================================================

def normalize_ram(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # RAM Type
    # --------------------------------------------------------

    if "ram_type" in row:

        row["ram_type"] = normalize_memory_type(
            row["ram_type"]
        )

    # --------------------------------------------------------
    # Speed
    # --------------------------------------------------------

    if "speed" in row:

        row["speed"] = normalize_unit_number(
            row["speed"],
            "MHz"
        )

    # --------------------------------------------------------
    # Capacity
    # --------------------------------------------------------

    if "capacity" in row:

        row["capacity"] = normalize_unit_number(
            row["capacity"],
            "GB"
        )

    if "modules_capacity_gb" in row:

        row["modules_capacity_gb"] = normalize_unit_number(
            row["modules_capacity_gb"],
            "GB"
        )

    # --------------------------------------------------------
    # Module Quantity
    # --------------------------------------------------------

    if "modules_quantity" in row:

        row["modules_quantity"] = to_number(
            row["modules_quantity"]
        )

    # --------------------------------------------------------
    # CAS Latency
    # --------------------------------------------------------

    if "cas_latency" in row:

        row["cas_latency"] = to_number(
            row["cas_latency"]
        )

    # --------------------------------------------------------
    # Height
    # --------------------------------------------------------

    if "height" in row:

        row["height"] = normalize_unit_number(
            row["height"],
            "mm"
        )

    # --------------------------------------------------------
    # Boolean
    # --------------------------------------------------------

    boolean_fields = [
        "ecc",
        "registered",
        "rgb",
        "heat_spreader",
    ]

    for field in boolean_fields:

        if field in row:

            row[field] = normalize_boolean(
                row[field]
            )

    return row


# ============================================================
# MOTHERBOARD
# ============================================================

def normalize_motherboard(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # Socket
    # --------------------------------------------------------

    if "socket" in row:

        row["socket"] = normalize_socket(
            row["socket"]
        )

    # --------------------------------------------------------
    # RAM Type
    # --------------------------------------------------------

    if "memory_ram_type" in row:

        row["memory_ram_type"] = normalize_memory_type(
            row["memory_ram_type"]
        )

    # --------------------------------------------------------
    # RAM Slots
    # --------------------------------------------------------

    if "memory_slots" in row:

        row["memory_slots"] = to_number(
            row["memory_slots"]
        )

    # --------------------------------------------------------
    # Maximum RAM
    # --------------------------------------------------------

    if "memory_max" in row:

        row["memory_max"] = normalize_unit_number(
            row["memory_max"],
            "GB"
        )

    # --------------------------------------------------------
    # M.2 Slots
    # --------------------------------------------------------

    if "m2_slots" in row:

        row["m2_slots"] = normalize_m2_slots(
            row["m2_slots"]
        )

    # --------------------------------------------------------
    # Form Factor
    # --------------------------------------------------------

    if "form_factor" in row:

        row["form_factor"] = normalize_form_factor(
            row["form_factor"]
        )

    return row


# ============================================================
# PSU
# ============================================================

def normalize_psu(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # Wattage
    # --------------------------------------------------------

    if "wattage" in row:

        row["wattage"] = normalize_unit_number(
            row["wattage"],
            "W"
        )

    # --------------------------------------------------------
    # Efficiency
    # --------------------------------------------------------

    if "efficiency_rating" in row:

        value = normalize_spaces(
            row["efficiency_rating"]
        ).upper()

        value = value.replace(
            "80 PLUS",
            "80+"
        )

        value = value.replace(
            "80PLUS",
            "80+"
        )

        value = re.sub(
            r"\s+",
            " ",
            value
        )

        row["efficiency_rating"] = value

    # --------------------------------------------------------
    # Modular
    # --------------------------------------------------------

    if "modular" in row:

        value = normalize_spaces(
            row["modular"]
        ).lower()

        if "non" in value:

            row["modular"] = "non-modular"

        elif "semi" in value:

            row["modular"] = "semi-modular"

        elif "full" in value:

            row["modular"] = "full"

        else:

            row["modular"] = value

    # --------------------------------------------------------
    # Length
    # --------------------------------------------------------

    if "length" in row:

        row["length"] = normalize_unit_number(
            row["length"],
            "mm"
        )

    # --------------------------------------------------------
    # Fanless
    # --------------------------------------------------------

    if "fanless" in row:

        row["fanless"] = normalize_boolean(
            row["fanless"]
        )

    return row


# ============================================================
# COOLER
# ============================================================

def normalize_cooler(row):
    row["metadata_name"] = normalize_spaces(
        row.get("metadata_name")
    )

    row["metadata_manufacturer"] = normalize_spaces(
        row.get("metadata_manufacturer")
    )

    row["metadata_series"] = normalize_spaces(
        row.get("metadata_series")
    )

    row["metadata_variant"] = normalize_spaces(
        row.get("metadata_variant")
    )

    # ========================================================
    # CPU SOCKETS
    # ========================================================
    if "cpu_sockets" in row:
        value = clean_text(row["cpu_sockets"])

        parts = re.split(r"[,;/|]+", value)

        sockets = []

        for part in parts:
            socket = normalize_socket(part)

            if socket and socket not in sockets:
                sockets.append(socket)

        row["cpu_sockets"] = "|".join(sockets)

    # ========================================================
    # FAN QUANTITY
    # ========================================================
    if "fan_quantity" in row:
        row["fan_quantity"] = to_number(
            row["fan_quantity"]
        )

    # ========================================================
    # FAN SIZE
    # ========================================================
    if "fan_size" in row:
        row["fan_size"] = normalize_unit_number(
            row["fan_size"],
            "mm"
        )

    # ========================================================
    # RPM
    # ========================================================
    if "min_fan_rpm" in row:
        row["min_fan_rpm"] = to_number(
            row["min_fan_rpm"]
        )

    if "max_fan_rpm" in row:
        row["max_fan_rpm"] = to_number(
            row["max_fan_rpm"]
        )

    # ========================================================
    # HEIGHT
    # ========================================================
    if "height" in row:
        row["height"] = normalize_unit_number(
            row["height"],
            "mm"
        )

    # ========================================================
    # RADIATOR SIZE
    # ========================================================
    if "radiator_size" in row:
        row["radiator_size"] = normalize_unit_number(
            row["radiator_size"],
            "mm"
        )

    # ========================================================
    # WATER COOLED
    # ========================================================
    if "water_cooled" in row:
        row["water_cooled"] = normalize_boolean(
            row["water_cooled"]
        )

    # ========================================================
    # FANLESS
    # ========================================================
    if "fanless" in row:
        row["fanless"] = normalize_boolean(
            row["fanless"]
        )

    return row


# ============================================================
# CASE
# ============================================================

def normalize_case(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # Form Factor
    # --------------------------------------------------------

    if "form_factor" in row:

        row["form_factor"] = normalize_form_factor(
            row["form_factor"]
        )

    # --------------------------------------------------------
    # Dimensions
    # --------------------------------------------------------

    dimension_fields = [
        "max_cpu_cooler_height",
        "max_psu_length",
        "max_video_card_length",
    ]

    for field in dimension_fields:

        if field in row:

            row[field] = normalize_unit_number(
                row[field],
                "mm"
            )

    # --------------------------------------------------------
    # Weight
    #
    # สำคัญ:
    # weight ไม่ใช่ mm
    # --------------------------------------------------------

    if "weight" in row:

        value = clean_text(
            row["weight"]
        )

        if value:

            value = value.replace(
                ",",
                ""
            )

            match = re.search(
                r"-?\d+(?:\.\d+)?",
                value
            )

            if match:

                number = float(
                    match.group()
                )

                # ถ้าเป็น kg ให้เก็บเป็น kg
                # ไม่แปลงเป็น mm
                if "kg" in value.lower():

                    row["weight"] = str(
                        round(number, 3)
                    )

                # ถ้าเป็น g ให้แปลงเป็น kg
                elif re.search(
                    r"\bg\b",
                    value.lower()
                ):

                    row["weight"] = str(
                        round(
                            number / 1000,
                            3
                        )
                    )

                else:

                    row["weight"] = (
                        str(int(number))
                        if number.is_integer()
                        else str(number)
                    )

            else:

                row["weight"] = ""

    # --------------------------------------------------------
    # Volume
    # --------------------------------------------------------

    if "volume" in row:

        row["volume"] = to_number(
            row["volume"]
        )

    # --------------------------------------------------------
    # Boolean
    # --------------------------------------------------------

    boolean_fields = [
        "has_transparent_side_panel",
        "power_supply_included",
        "power_supply_shroud",
        "supports_rear_connecting_motherboard",
    ]

    for field in boolean_fields:

        if field in row:

            row[field] = normalize_boolean(
                row[field]
            )

    return row


# ============================================================
# STORAGE
# ============================================================

def normalize_storage(row):

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    text_fields = [
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
    ]

    for field in text_fields:

        if field in row:

            row[field] = normalize_spaces(
                row.get(field)
            )

    # --------------------------------------------------------
    # Capacity
    # --------------------------------------------------------

    if "capacity" in row:

        row["capacity"] = normalize_unit_number(
            row["capacity"],
            "GB"
        )

    # --------------------------------------------------------
    # Storage Type
    # --------------------------------------------------------

    if "storage_type" in row:

        value = normalize_spaces(
            row["storage_type"]
        ).upper()

        if "SSHD" in value:

            row["storage_type"] = "SSHD"

        elif "SSD" in value:

            row["storage_type"] = "SSD"

        elif "HDD" in value:

            row["storage_type"] = "HDD"

        else:

            row["storage_type"] = value

    # --------------------------------------------------------
    # Type
    # --------------------------------------------------------

    if "type" in row:

        value = normalize_spaces(
            row["type"]
        ).upper()

        if "SSHD" in value:

            row["type"] = "SSHD"

        elif "SSD" in value:

            row["type"] = "SSD"

        elif "HDD" in value:

            row["type"] = "HDD"

        else:

            row["type"] = value

    # --------------------------------------------------------
    # NVMe
    # --------------------------------------------------------

    if "nvme" in row:

        row["nvme"] = normalize_boolean(
            row["nvme"]
        )

    # --------------------------------------------------------
    # Interface
    # --------------------------------------------------------

    if "interface" in row:

        row["interface"] = normalize_spaces(
            row["interface"]
        )

    return row


# ============================================================
# NORMALIZE DISPATCHER
# ============================================================

NORMALIZERS = {
    "CPU": normalize_cpu,
    "GPU": normalize_gpu,
    "RAM": normalize_ram,
    "Motherboard": normalize_motherboard,
    "PSU": normalize_psu,
    "Cooler": normalize_cooler,
    "Case": normalize_case,
    "Storage": normalize_storage,
}


# ============================================================
# PROCESS FILE
# ============================================================

def process_file(category, filename):

    input_file = INPUT_DIR / filename
    output_file = OUTPUT_DIR / filename

    if not input_file.exists():

        print(
            f"❌ {category}: ไม่พบไฟล์ {input_file}"
        )

        return

    # --------------------------------------------------------
    # Read
    # --------------------------------------------------------

    with open(
        input_file,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        reader = csv.DictReader(f)

        rows = list(reader)

        fieldnames = reader.fieldnames or []

    # --------------------------------------------------------
    # Normalize
    # --------------------------------------------------------

    normalizer = NORMALIZERS.get(
        category
    )

    normalized_rows = []

    for row in rows:

        try:

            if normalizer:

                row = normalizer(row)

        except Exception as e:

            print(
                f"⚠️ {category}: "
                f"normalization error "
                f"opendb_id="
                f"{row.get('opendb_id')} "
                f"| {e}"
            )

        normalized_rows.append(row)

    # --------------------------------------------------------
    # Write
    # --------------------------------------------------------

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

        writer.writerows(
            normalized_rows
        )

    print(
        f"✅ {category:<12} "
        f"{len(normalized_rows):>5} records → "
        f"{output_file}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "BuildCores OpenDB - DATA NORMALIZATION"
    )

    print("=" * 70)

    print()

    print(
        f"📂 Input : {INPUT_DIR}"
    )

    print(
        f"📂 Output: {OUTPUT_DIR}"
    )

    print()

    for category, filename in FILES.items():

        process_file(
            category,
            filename
        )

    print()

    print("=" * 70)

    print(
        "✅ DATA NORMALIZATION เสร็จแล้ว"
    )

    print("=" * 70)


if __name__ == "__main__":

    main()