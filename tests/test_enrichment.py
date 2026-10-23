import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts/data'))
from enrichment import enrich

class EnrichmentTests(unittest.TestCase):
    def gpu(self,pid,mpn,length):
        return {'opendb_id':pid,'metadata':{'name':'GPU '+pid,'manufacturer':'Maker','part_numbers':[mpn]},'length':length}

    def test_exact_identity_fill_keeps_input_unchanged(self):
        original={'gpu':[self.gpu('a','SKU-123',0),self.gpu('b','SKU-123',240)]}
        before=copy.deepcopy(original)
        rows,proof,conflicts=enrich(original,[])
        self.assertEqual(rows['gpu'][0]['length'],240)
        self.assertEqual(original,before)
        self.assertFalse(proof[0]['manufacturer_verified'])
        self.assertEqual(conflicts,[])

    def test_conflicting_donors_stay_unknown(self):
        data={'gpu':[self.gpu('a','SKU-123',None),self.gpu('b','SKU-123',240),self.gpu('c','SKU-123',280)]}
        rows,proof,conflicts=enrich(data,[])
        self.assertIsNone(rows['gpu'][0]['length'])
        self.assertTrue(conflicts)
        self.assertFalse(proof)

    def test_same_name_different_part_is_not_donor(self):
        a=self.gpu('a','SKU-123',None);b=self.gpu('b','SKU-456',240)
        a['metadata']['name']=b['metadata']['name']='same marketing name'
        rows,proof,_=enrich({'gpu':[a,b]},[])
        self.assertIsNone(rows['gpu'][0]['length']);self.assertFalse(proof)

    def test_reference_rule_respects_memory_variant_and_existing_values(self):
        rule={'field':'memory_bus','match':{'chipset':'GeForce RTX 3060','memory':12,'memory_type':'GDDR6'},'value':192,'source_url':'https://www.nvidia.com/','checked_on':'2026-10-23','note':'fixture'}
        a=self.gpu('a','SKU-123',240);a.update(rule['match']);a['memory_bus']=0
        b=copy.deepcopy(a);b['opendb_id']='b';b['memory']=8;b['metadata']['part_numbers']=['SKU-456']
        c=copy.deepcopy(a);c['opendb_id']='c';c['memory_bus']=128;c['metadata']['part_numbers']=['SKU-789']
        rows,proof,conflicts=enrich({'gpu':[a,b,c]},[],[rule])
        self.assertEqual(rows['gpu'][0]['memory_bus'],192)
        self.assertEqual(rows['gpu'][1]['memory_bus'],0)
        self.assertEqual(rows['gpu'][2]['memory_bus'],128)
        self.assertEqual(len(proof),1);self.assertEqual(len(conflicts),1)

    def test_manufacturer_override_rejects_wrong_sku(self):
        correction={'part_id':'a','expected_mpns':['OTHER-123'],'field':'length','value':999,'source_url':'https://manufacturer.example/spec','checked_on':'2026-10-23','note':'fixture'}
        with self.assertRaises(ValueError):enrich({'gpu':[self.gpu('a','SKU-123',240)]},[correction])

if __name__=='__main__':unittest.main()

