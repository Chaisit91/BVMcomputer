import unittest

from compatibility_engine import SelectionError
from upgrade_recommender import build_issues, recommend_upgrades


def row(part_id, name, **values):
    return {"opendb_id": part_id, "name": name, "manufacturer": "Test", **values}


class UpgradeRecommenderTests(unittest.TestCase):
    def setUp(self):
        self.catalog = {
            "cpu": [
                row("cpu-old", "Old CPU", socket="AM4", memory_type="DDR4", tdp="65", cores_total="6", threads="12", boost_clock="4.0", performance_score="20"),
                row("cpu-new", "New Gaming CPU", socket="AM5", memory_type="DDR5", tdp="120", cores_total="8", threads="16", boost_clock="5.4", performance_score="60"),
            ],
            "motherboard": [
                row("board-old", "AM4 Board", socket="AM4", ram_type="DDR4", memory_slots="4", memory_max_gb="128", form_factor="ATX", pcie_x16_slots="1", pcie_max_gen="4", has_m2="true", m2_slot_count="2", sata_port_count="4", cpu_power_connectors="8-pin", main_power_connector="24-pin"),
                row("board-new", "AM5 Board", socket="AM5", ram_type="DDR5", memory_slots="4", memory_max_gb="192", form_factor="ATX", pcie_x16_slots="1", pcie_max_gen="5", has_m2="true", m2_slot_count="3", sata_port_count="4", cpu_power_connectors="8-pin", main_power_connector="24-pin"),
            ],
            "ram": [
                row("ram-old", "DDR4 16GB", ram_type="DDR4", module_quantity="2", capacity_gb="16", speed_mhz="3200", speed_score="100", cas_latency="16"),
                row("ram-new", "DDR5 32GB", ram_type="DDR5", module_quantity="2", capacity_gb="32", speed_mhz="6000", speed_score="200", cas_latency="30"),
            ],
            "gpu": [
                row("gpu-old", "Old GPU", memory_gb="8", compute_score="5000000", performance_per_watt="30000", tdp="100", length_mm="220", expansion_slots_required="2", power_12vhpwr="0", power_12v_2x6="0", power_6_pin="0", power_8_pin="1"),
                row("gpu-new", "Fast Gaming GPU", memory_gb="16", compute_score="20000000", performance_per_watt="65000", tdp="300", length_mm="330", expansion_slots_required="3", power_12vhpwr="0", power_12v_2x6="0", power_6_pin="0", power_8_pin="2"),
            ],
            "psu": [
                row("psu-old", "500W PSU", wattage="500", form_factor="ATX", length_mm="140", atx_24_pin="1", eps_8_pin="1", pcie_12vhpwr="0", pcie_6_plus_2_pin="1", sata_connectors="4", efficiency_rating="80+ BRONZE"),
                row("psu-new", "850W PSU", wattage="850", form_factor="ATX", length_mm="150", atx_24_pin="1", eps_8_pin="2", pcie_12vhpwr="1", pcie_6_plus_2_pin="4", sata_connectors="8", efficiency_rating="80+ GOLD"),
            ],
            "case": [
                row("case-old", "Small ATX Case", supported_motherboards="ATX", gpu_clearance_mm="250", expansion_slots="7", cooler_clearance_mm="170", supported_psu="ATX", psu_clearance_mm="180", internal_2_5_bays="2", internal_3_5_bays="2"),
                row("case-new", "Large ATX Case", supported_motherboards="ATX", gpu_clearance_mm="380", expansion_slots="8", cooler_clearance_mm="190", supported_psu="ATX", psu_clearance_mm="220", internal_2_5_bays="4", internal_3_5_bays="2"),
            ],
            "cooler": [
                row("cooler-old", "AM4 Cooler", cpu_sockets="AM4", height_mm="150", fan_quantity="1", water_cooled="false"),
                row("cooler-new", "AM5 Cooler", cpu_sockets="AM5", height_mm="155", fan_quantity="2", water_cooled="false"),
            ],
            "storage": [
                row("storage", "NVMe SSD", capacity_gb="1000", storage_type="SSD", nvme="true", form_factor="M.2-2280", interface="M.2 PCIe 4.0 x4"),
            ],
        }
        self.current = {
            "cpu": "cpu-old",
            "motherboard": "board-old",
            "ram": "ram-old",
            "gpu": "gpu-old",
            "psu": "psu-old",
            "case": "case-old",
            "cooler": "cooler-old",
            "storage": "storage",
        }

    def test_current_build_has_no_explicit_issue(self):
        selected = {
            part: next(row for row in self.catalog[part] if row["opendb_id"] == part_id)
            for part, part_id in self.current.items()
        }
        self.assertEqual(build_issues(selected), [])

    def test_gaming_gpu_upgrade_lists_psu_and_case_changes(self):
        result = recommend_upgrades(self.catalog, self.current, "gaming", "gpu", 5)
        recommendation = result["recommendations"][0]

        self.assertEqual(recommendation["product"]["opendb_id"], "gpu-new")
        self.assertGreater(recommendation["estimated_gain_percent"], 100)
        self.assertEqual(
            {item["part_type"] for item in recommendation["required_changes"]},
            {"case", "psu"},
        )

    def test_cpu_platform_upgrade_lists_board_ram_and_cooler(self):
        result = recommend_upgrades(self.catalog, self.current, "gaming", "cpu", 5)
        recommendation = result["recommendations"][0]

        self.assertEqual(recommendation["product"]["opendb_id"], "cpu-new")
        self.assertEqual(
            {item["part_type"] for item in recommendation["required_changes"]},
            {"motherboard", "ram", "cooler"},
        )

    def test_empty_current_build_is_rejected(self):
        with self.assertRaises(SelectionError):
            recommend_upgrades(self.catalog, {}, "gaming", "auto", 5)


if __name__ == "__main__":
    unittest.main()
