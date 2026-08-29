import unittest

from compatibility_engine import (
    SelectionError,
    build_recommendations,
    effective_cooler_sockets,
    load_catalog,
    motherboard_fits_cpu,
    overall_status,
    ram_checks,
)


def row(part_id, name, **values):
    return {"opendb_id": part_id, "name": name, "manufacturer": "Test", **values}


class CompatibilityEngineTests(unittest.TestCase):
    def setUp(self):
        self.catalog = {
            "cpu": [row("cpu", "Test CPU", socket="AM5", memory_type="DDR5", tdp="65")],
            "motherboard": [
                row("board", "AM5 Board", socket="AM5", ram_type="DDR5", memory_slots="4", memory_max_gb="128", form_factor="ATX", pcie_x16_slots="1", pcie_max_gen="5", has_m2="1", sata_port_count="4", cpu_power_connectors="8-pin", main_power_connector="24-pin"),
                row("wrong-board", "LGA Board", socket="LGA1700", ram_type="DDR5", memory_slots="4", memory_max_gb="128", form_factor="ATX", pcie_x16_slots="1"),
            ],
            "ram": [row("ram", "DDR5 Kit", ram_type="DDR5", module_quantity="2", capacity_gb="32", speed_mhz="6000", cas_latency="30")],
            "gpu": [row("gpu", "Test GPU", tdp="200", length_mm="300", expansion_slots_required="3", power_12vhpwr="0", power_12v_2x6="0", power_6_pin="0", power_8_pin="2")],
            "psu": [
                row("psu", "Good PSU", wattage="750", form_factor="ATX", length_mm="150", atx_24_pin="1", eps_8_pin="2", pcie_12vhpwr="1", pcie_6_plus_2_pin="4", sata_connectors="6"),
                row("bad-psu", "Bad PSU", wattage="400", form_factor="ATX", length_mm="150", atx_24_pin="1", eps_8_pin="1", pcie_12vhpwr="0", pcie_6_plus_2_pin="1", sata_connectors="2"),
            ],
            "case": [row("case", "ATX Case", supported_motherboards="ATX", gpu_clearance_mm="350", expansion_slots="7", cooler_clearance_mm="170", supported_psu="ATX", psu_clearance_mm="200", internal_2_5_bays="2", internal_3_5_bays="2")],
            "cooler": [row("cooler", "AM5 Air", cpu_sockets="AM5", height_mm="155", radiator_size_mm="")],
            "storage": [row("storage", "M2 SSD", nvme="true", form_factor="M.2-2280", interface="M.2 PCIe")],
        }

    def queries(self, **overrides):
        values = {"cpu": "cpu", "motherboard": "board", "ram": "ram", "gpu": "gpu", "psu": "psu", "case": "case", "cooler": "cooler", "storage": "storage"}
        values.update(overrides)
        return values

    def test_complete_build_is_compatible(self):
        result = build_recommendations(self.catalog, self.queries(), 5)
        self.assertEqual(result["validation"]["status"], "compatible")
        self.assertEqual(result["validation"]["quality"]["color"], "green")
        self.assertEqual(result["validation"]["quality"]["score"], 100)
        self.assertTrue(result["validation"]["checks"])

    def test_wrong_socket_is_rejected(self):
        with self.assertRaisesRegex(SelectionError, "socket"):
            build_recommendations(self.catalog, self.queries(motherboard="wrong-board"), 5)

    def test_insufficient_psu_is_rejected(self):
        with self.assertRaisesRegex(SelectionError, "PSU"):
            build_recommendations(self.catalog, self.queries(psu="bad-psu"), 5)

    def test_ecc_ram_is_rejected_when_board_explicitly_disables_ecc(self):
        ecc_ram = row("ecc", "ECC RAM", ram_type="DDR5", module_quantity="2", capacity_gb="32", ecc="ECC")
        board = {**self.catalog["motherboard"][0], "ecc_support": "false"}
        self.assertEqual(overall_status(ram_checks(ecc_ram, board)), "incompatible")

    def test_socket_in_product_name_narrows_suspicious_cooler_list(self):
        cooler = row("named", "Example AM4 LP", cpu_sockets="AM2|AM3|AM4|AM5|FM1|FM2")
        self.assertEqual(effective_cooler_sockets(cooler), {"AM4"})

    def test_fm2_board_compatibility_is_directional(self):
        fm2_cpu = row("fm2", "FM2 CPU", socket="FM2")
        fm2_plus_cpu = row("fm2plus", "FM2+ CPU", socket="FM2+")
        fm2_board = row("fm2-board", "FM2 Board", socket="FM2")
        fm2_plus_board = row("fm2plus-board", "FM2+ Board", socket="FM2+")
        self.assertTrue(motherboard_fits_cpu(fm2_plus_board, fm2_cpu))
        self.assertFalse(motherboard_fits_cpu(fm2_board, fm2_plus_cpu))


class TrimmedCatalogRegressionTests(unittest.TestCase):
    def test_web_catalog_has_50_unique_products_per_category(self):
        catalog = load_catalog()
        for part_type, rows in catalog.items():
            with self.subTest(part_type=part_type):
                self.assertEqual(len(rows), 50)
                self.assertEqual(len({row["opendb_id"] for row in rows}), 50)


if __name__ == "__main__":
    unittest.main()
