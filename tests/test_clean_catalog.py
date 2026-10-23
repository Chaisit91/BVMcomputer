"""ตรวจข้อจำกัดข้อมูลที่มีผลต่อ compatibility และความครบของชุด cleaned"""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

REPO=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('clean_catalog',REPO/'scripts/data/clean_catalog.py')
clean=importlib.util.module_from_spec(spec);spec.loader.exec_module(clean)
ROOT=REPO/'data/pc-builder-starter'

class CleaningTests(unittest.TestCase):
    def test_socket_does_not_merge_different_platforms(self):
        self.assertEqual(clean.socket(' LGA 1700 '),'LGA1700')
        self.assertNotEqual(clean.socket('LGA2011-3'),clean.socket('LGA2011'))
        self.assertEqual(clean.form('Micro ATX'),'MICRO_ATX')

    def test_zero_measurement_and_connector_multiplicity(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'02_catalog/gpu').mkdir(parents=True);(root/'03_schemas').mkdir()
            row={'opendb_id':'11111111-1111-4111-8111-111111111111','length':0,'tdp':150,'total_slot_width':2,
                 'power_connectors':{'pcie_6_pin':0},'metadata':{'name':' Test   GPU '},'cpu_power':['8-pin','8-pin']}
            (root/'02_catalog/gpu/parts.json').write_text(json.dumps([row]))
            (root/'03_schemas/GPU.schema.json').write_text(json.dumps({'properties':{'length':{'type':['number','null']},'optional_field':{'type':['string','null']}}}))
            (root/'manifest.json').write_text(json.dumps({'commit':'fixture'}))
            with contextlib.redirect_stdout(io.StringIO()):clean.run(root)
            result=json.loads((root/'08_cleaned/gpu/parts.json').read_text())[0]
            self.assertIsNone(result['length_mm'])
            self.assertEqual(result['power_connectors__pcie_6_pin'],0)
            self.assertEqual(result['cpu_power'],['8-pin','8-pin'])
            self.assertEqual(result['name'],'Test GPU')
            self.assertIn('optional_field',result)
            self.assertIsNone(result['optional_field'])
            self.assertIn('nonpositive_measurement',result['quality_issue_codes'])

    def test_actual_catalog_integrity(self):
        ids=set();summary=json.loads((ROOT/'09_reports/summary.json').read_text())
        for p in (ROOT/'08_cleaned').glob('*/parts.json'):
            rows=json.loads(p.read_text(encoding='utf-8'));keys=set(rows[0])
            self.assertEqual(len(rows),summary['counts'][p.parent.name])
            for row in rows:
                self.assertEqual(set(row),keys)
                self.assertNotIn(row['part_id'],ids);ids.add(row['part_id'])
                self.assertEqual(row['category'],p.parent.name)
                self.assertEqual(row['quality_status']=='needs_review',bool(row['quality_issue_codes']))
        self.assertEqual(len(ids),26264)
        self.assertEqual(summary['counts']['sshd'],22)
        self.assertEqual(summary['counts']['storage_unknown'],2)
        self.assertEqual(summary['removed_records'],0)

if __name__=='__main__':unittest.main()
