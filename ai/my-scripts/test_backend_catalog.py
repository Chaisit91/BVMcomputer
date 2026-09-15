import unittest
from unittest.mock import patch
from backend_catalog import load_backend_catalog, normalize_catalog

class BackendCatalogTests(unittest.TestCase):
    def test_database_identity_and_admin_edits_override_clean_specs(self):
        result = normalize_catalog({'version': 1, 'items': [{
            'id': 'product-1', 'name': 'Edited RAM', 'category': 'ram', 'brand': 'Brand',
            'specs': {'opendb_id': 'spoof', 'name': 'old', 'ram_type': 'DDR4', 'memoryType': 'DDR5', 'capacity': '32GB', 'capacity_gb': '16', 'speed': '6000MHz', 'casLatency': '30'},
        }]})
        ram = result['ram'][0]
        self.assertEqual((ram['opendb_id'], ram['name'], ram['ram_type'], ram['capacity_gb']), ('product-1', 'Edited RAM', 'DDR5', '32'))
        self.assertEqual(float(ram['speed_score']), 200)

    def test_empty_database_is_valid_and_does_not_use_local_catalog(self):
        self.assertTrue(all(not rows for rows in normalize_catalog({'version': 1, 'items': []}).values()))

    def test_ambiguous_values_remain_unknown(self):
        item = {'id': 'mb', 'name': 'Board', 'category': 'motherboard', 'specs': {'memorySlots': '4x DIMM', 'maxMemory': '64 or 128 GB', 'memory_max_gb': '128'}}
        row = normalize_catalog({'version': 1, 'items': [item]})['motherboard'][0]
        self.assertEqual(row['memory_slots'], '4')
        self.assertEqual(row['memory_max_gb'], '')

    def test_duplicate_product_ids_rejected(self):
        item = {'id': 'same', 'name': 'Part', 'category': 'cpu', 'specs': {}}
        with self.assertRaises(ValueError):
            normalize_catalog({'version': 1, 'items': [item, item]})

    def test_pcie_slot_edit_and_missing_latency_do_not_keep_old_scores(self):
        result = normalize_catalog({'version': 1, 'items': [
            {'id': 'board', 'name': 'Board', 'category': 'motherboard', 'specs': {'pcie_x16_slots': '2', 'pcieSlots': '1x PCIe 4.0 x16'}},
            {'id': 'ram', 'name': 'RAM', 'category': 'ram', 'specs': {'speed': '6000MHz', 'casLatency': '', 'speed_score': '200'}},
        ]})
        self.assertEqual(result['motherboard'][0]['pcie_x16_slots'], '1')
        self.assertEqual(result['ram'][0]['speed_score'], '')

    def test_service_token_not_sent_to_plaintext_remote_host(self):
        with patch('backend_catalog.build_opener') as opener:
            with self.assertRaises(ValueError):
                load_backend_catalog('http://example.com', 'x' * 32)
            opener.assert_not_called()

    def test_connected_mode_never_falls_back_on_database_failure(self):
        import compatibility_api as api
        with patch.dict('os.environ', {'AI_BACKEND_URL': 'http://127.0.0.1:8080', 'AI_CATALOG_TOKEN': 'x' * 32}):
            with patch.object(api, 'load_backend_catalog', side_effect=OSError('offline')), patch.object(api, 'load_catalog') as local:
                with self.assertRaises(OSError):
                    api.load_runtime_catalog()
                local.assert_not_called()

    def test_refresh_invalidates_ids_and_cached_results(self):
        import compatibility_api as api
        original = {kind: list(rows) for kind, rows in api.CATALOG.items()}
        updated = {kind: list(rows) for kind, rows in original.items()}
        updated['gpu'] = [{**updated['gpu'][0], 'name': 'Updated in admin'}]
        try:
            with patch.object(api, 'CATALOG_SOURCE', 'backend-postgres'), patch.object(api, 'CATALOG_CHECKED_AT', 0), patch.dict('os.environ', {'AI_BACKEND_URL': 'http://127.0.0.1:8080', 'AI_CATALOG_TOKEN': 'x' * 32}), patch.object(api, 'load_backend_catalog', return_value=updated):
                api.compatible_ids('gpu', *([''] * 8))
                with api.CATALOG_LOCK:
                    api.refresh_catalog_if_needed()
                self.assertEqual(len(api.BY_ID['gpu']), 1)
                self.assertEqual(api.CATALOG['gpu'][0]['name'], 'Updated in admin')
                self.assertEqual(api.compatible_ids.cache_info().currsize, 0)
        finally:
            api.CATALOG.clear()
            api.CATALOG.update(original)
            api.BY_ID.clear()
            api.BY_ID.update({kind: {row['opendb_id']: row for row in rows} for kind, rows in original.items()})
            api.compatible_ids.cache_clear()

if __name__ == '__main__':
    unittest.main()
