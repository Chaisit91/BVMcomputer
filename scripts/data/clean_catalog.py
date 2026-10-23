"""เตรียมฐานสเปกแบบทำซ้ำได้: ไม่แก้ต้นฉบับ ไม่เดาสเปก ไม่ตัดสิน compatibility.

ใช้ Python 3.10+ standard library; รันจากโฟลเดอร์ใดก็ได้
python scripts/data/clean_catalog.py --check
"""
from pathlib import Path
import argparse
import collections
import csv
import hashlib
import json
import math
import re
import unicodedata
import uuid

VERSION = '1.0.0'
UPSTREAM = {'cpu':'CPU','gpu':'GPU','motherboard':'Motherboard','ram':'RAM',
            'psu':'PSU','cpu_cooler':'CPUCooler','case':'PCCase',
            'ssd':'Storage','hdd':'Storage','storage_other':'Storage'}
REQUIRED = {
 'cpu':['socket','cores.total','specifications.tdp','specifications.memory.types'],
 'motherboard':['socket','form_factor','memory.ram_type','memory.max','memory.slots'],
 'ram':['ram_type','form_factor','speed','capacity','modules.quantity','modules.capacity_gb'],
 'gpu':['length','total_slot_width','tdp','power_connectors'],
 'psu':['wattage','form_factor','length','connectors'],
 'case':['supported_motherboard_form_factors','max_video_card_length','max_cpu_cooler_height','supported_power_supply_form_factors'],
 'cpu_cooler':['cpu_sockets','water_cooled'],
 'ssd':['capacity','form_factor','interface','nvme'],
 'hdd':['capacity','form_factor','interface'], 'sshd':['capacity','form_factor','interface'],
 'storage_unknown':['storage_type','capacity','form_factor','interface']}
# ชื่อคอลัมน์หลักระบุหน่วยชัดเจน; คอลัมน์อื่นยังเก็บครบและอธิบายผ่าน dictionary
RENAMES = {
 'cpu':{'cores.total':'core_count','cores.threads':'thread_count',
  'clocks.performance.base':'performance_base_clock_ghz','clocks.performance.boost':'performance_boost_clock_ghz',
  'clocks.efficiency.base':'efficiency_base_clock_ghz','clocks.efficiency.boost':'efficiency_boost_clock_ghz',
  'specifications.tdp':'tdp_w','specifications.ppt':'power_limit_source_w',
  'specifications.memory.maxSupport':'max_memory_gb'},
 'gpu':{'length':'length_mm','memory':'vram_gb','memory_bus':'memory_bus_bits','tdp':'tdp_w',
  'core_base_clock':'base_clock_mhz','core_boost_clock':'boost_clock_mhz','effective_memory_clock':'source_effective_memory_clock_mhz'},
 'ram':{'speed':'source_speed_mhz','capacity':'kit_capacity_gb','modules.quantity':'module_count',
  'modules.capacity_gb':'module_capacity_gb','height':'height_mm','voltage':'voltage_v'},
 'motherboard':{'memory.max':'max_memory_gb','memory.slots':'memory_slot_count','memory.ram_type':'ram_type'},
 'psu':{'wattage':'wattage_w','length':'length_mm'},
 'case':{'max_video_card_length':'max_gpu_length_mm','max_cpu_cooler_height':'max_cpu_cooler_height_mm',
  'max_psu_length':'max_psu_length_mm','volume':'volume_l','weight':'source_weight_lb'},
 'cpu_cooler':{'height':'height_mm','radiator_size':'radiator_size_mm','fan_size':'fan_size_mm',
  'min_fan_rpm':'min_fan_rpm','max_fan_rpm':'max_fan_rpm','min_noise_level':'min_noise_dba','max_noise_level':'max_noise_dba'},
 'storage':{'capacity':'capacity_gb','cache':'cache_mb'}}
FORM = {'microatx':'MICRO_ATX','matx':'MICRO_ATX','miniitx':'MINI_ITX',
        'eatx':'E_ATX','extendedatx':'E_ATX','atx':'ATX','sfx':'SFX','sfxl':'SFX_L',
        'flexatx':'FLEX_ATX','tfx':'TFX','ssieeb':'SSI_EEB','ssiceb':'SSI_CEB'}

def get(d, path):
    for key in path.split('.'):
        if not isinstance(d,dict) or key not in d: return None
        d=d[key]
    return d

def snake(s):
    return re.sub(r'[^a-z0-9]+','_',re.sub(r'([a-z0-9])([A-Z])',r'\1_\2',s).lower()).strip('_')

def column(category,path):
    group='storage' if category in ('ssd','hdd','sshd','storage_unknown') else category
    if path=='weight' and category!='case': return 'source_weight_g'
    return RENAMES.get(group,{}).get(path,'__'.join(snake(x) for x in path.split('.')))

def flatten(d, prefix=''):
    out={}
    for k,v in d.items():
        path=prefix+k
        if isinstance(v,dict): out.update(flatten(v,path+'.'))
        else: out[path]=v
    return out

def schema_leaves(node,prefix=''):
    out={}
    for key,child in node.get('properties',{}).items():
        path=prefix+key
        if child.get('properties'):out.update(schema_leaves(child,path+'.'))
        else:out[path]=None
    return out

def text(v):
    # ไม่ซ่อม mojibake ด้วยการเดา; เก็บปัญหา encoding ในรายงาน
    return re.sub(r'\s+',' ',unicodedata.normalize('NFC',v)).strip()

def socket(v):
    v=text(v).upper()
    return re.sub(r'^(LGA|PGA|BGA)\s*-?\s*',r'\1',v)

def form(v):
    return FORM.get(re.sub(r'[^a-z0-9]','',v.lower()),text(v))

def absent(v):
    return v is None or v=='' or v==[] or v=={}

def write_json(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')

def write_csv(p, rows, keys):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=keys); w.writeheader()
        for row in rows:
            w.writerow({k:json.dumps(v,ensure_ascii=False,allow_nan=False) if isinstance(v,(list,dict)) else v for k,v in row.items()})

def run(root):
    source=root/'02_catalog'; out=root/'08_cleaned'; reports=root/'09_reports'
    manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
    issues=[]; changes=[]; datasets=collections.defaultdict(list); dictionaries={}; hashes={}
    duplicates=collections.defaultdict(list); seen=set(); rows_in=0
    def issue(cat,pid,path,code,value=None):
        issues.append(dict(category=cat,part_id=pid,field=path,code=code,source_value=value))
    for file in sorted(source.glob('*/parts.json')):
        original_cat=file.parent.name
        if original_cat not in UPSTREAM: raise ValueError('Unexpected category '+original_cat)
        raw=file.read_bytes(); hashes[str(file.relative_to(root))]=hashlib.sha256(raw).hexdigest()
        schema=json.loads((root/'03_schemas'/(UPSTREAM[original_cat]+'.schema.json')).read_text(encoding='utf-8'))
        for d in json.loads(raw):
            rows_in+=1; pid=d.get('opendb_id'); uuid.UUID(pid)
            if pid in seen: raise ValueError('Duplicate primary ID '+pid)
            seen.add(pid)
            cat=original_cat
            if cat in ('ssd','hdd','storage_other'):
                cat={'SSD':'ssd','HDD':'hdd','SSHD':'sshd'}.get(str(d.get('storage_type','')).upper(),'storage_unknown')
            if cat!=original_cat: changes.append(dict(part_id=pid,field='category',before=original_cat,after=cat,rule='explicit_storage_type'))
            row={'part_id':pid,'category':cat,'source_category':original_cat,
                 'source_record':f'01_raw/buildcores/{UPSTREAM[original_cat]}/{pid}.json',
                 'source_commit':manifest['commit'],'pipeline_version':VERSION}
            mapping=dictionaries.setdefault(cat,{})
            # ทุกฟิลด์ที่ schema กำหนดมีคอลัมน์แม้ข้อมูลทั้งหมวดจะยังไม่มีค่า
            flat={**schema_leaves(schema),**flatten(d)}
            for path,old in flat.items():
                if path=='opendb_id':continue
                name=column(cat,path)
                if name in row: raise ValueError('Column collision '+cat+' '+path+' '+name)
                node=schema
                for part in path.split('.'): node=node.get('properties',{}).get(part,{})
                value=old
                expected=node.get('type',[])
                expected=[expected] if isinstance(expected,str) else expected
                valid={'number':lambda x:isinstance(x,(int,float)) and not isinstance(x,bool),
                       'integer':lambda x:isinstance(x,int) and not isinstance(x,bool),
                       'boolean':lambda x:isinstance(x,bool),'string':lambda x:isinstance(x,str),
                       'array':lambda x:isinstance(x,list),'object':lambda x:isinstance(x,dict)}
                if value is not None and expected and not any(valid[t](value) for t in expected if t in valid):
                    issue(cat,pid,path,'invalid_source_type',old);value=None
                if isinstance(value,str):
                    value=text(value)
                    if value.lower() in ('','unknown','n/a','not specified','unspecified'): value=None
                    # คำว่า None อาจหมายถึงไม่มีอุปกรณ์/ฟีเจอร์จริง จึงห้ามเปลี่ยนทั้งหมดเป็น null
                    if value is not None and path=='socket': value=socket(value)
                    if value is not None and (path=='form_factor' and cat in ('motherboard','psu')):value=form(value)
                    if '\ufffd' in old:issue(cat,pid,path,'encoding_replacement_character',old)
                elif isinstance(value,list) and all(isinstance(x,str) for x in value):
                    value=[text(x) for x in value]
                    if path=='cpu_sockets':value=[socket(x) for x in value]
                    if path in ('supported_motherboard_form_factors','supported_power_supply_form_factors'):value=[form(x) for x in value]
                    # ห้าม unique รายการขั้วต่อ เช่น ['8-pin','8-pin'] เพราะจำนวนมีความหมาย
                    if path in ('cpu_sockets','supported_motherboard_form_factors','supported_power_supply_form_factors','profile_support','color','lighting','specifications.memory.types'):
                        value=sorted(set(value))
                if isinstance(value,float) and not math.isfinite(value):
                    issue(cat,pid,path,'non_finite_number',str(value));value=None
                # ใช้ข้อกำหนดเชิงความหมายเฉพาะฟิลด์ ไม่เปลี่ยนศูนย์ของขั้วต่อ/ฟีเจอร์
                positive=path in ('length','height','wattage','capacity','speed','memory','memory_bus','total_slot_width','max_video_card_length','max_cpu_cooler_height','max_psu_length','volume','modules.quantity','modules.capacity_gb','memory.max','memory.slots','cores.total','cores.threads','specifications.tdp','specifications.ppt','specifications.memory.maxSupport') or path.startswith('dimensions_mm.')
                if isinstance(value,(int,float)) and not isinstance(value,bool):
                    if value<0 or (positive and value==0):
                        issue(cat,pid,path,'nonpositive_measurement' if positive else 'negative_number',value);value=None
                if value!=old:changes.append(dict(part_id=pid,field=path,before=old,after=value,rule='normalize_or_flag_invalid_measurement'))
                row[name]=value
                info={'source_path':path,'description':node.get('description','Source field; see upstream schema/raw record'),
                      'source_type':node.get('type'),'observed_types':set()}
                entry=mapping.setdefault(name,info);entry['observed_types'].add(type(value).__name__)
            # คอลัมน์ใช้งานหลักที่มีชื่ออ่านง่าย โดยคง metadata ทั้งหมดไว้
            row['name']=row.get('metadata__name');row['manufacturer']=row.get('metadata__manufacturer')
            row['manufacturer_url']=row.get('general_product_information__manufacturer_url')
            missing=[p for p in REQUIRED[cat] if absent(row.get(column(cat,p))) and (p not in ('power_connectors','connectors') or absent(d.get(p)))]
            for path in missing:issue(cat,pid,path,'missing_required_for_initial_checks')
            # ตรวจค่าขัดแย้ง ไม่เลือกค่าใดค่าหนึ่งมาทับโดยพลการ
            if cat=='ram':
                a=row.get('module_count');b=row.get('module_capacity_gb');total=row.get('kit_capacity_gb')
                if all(isinstance(x,(int,float)) for x in (a,b,total)) and not math.isclose(a*b,total):issue(cat,pid,'capacity','kit_capacity_conflict',{'total':total,'modules':a,'per_module':b})
                ff=str(row.get('form_factor','')).upper()
                row['module_format']='SO_DIMM' if 'SO-DIMM' in ff else ('DIMM' if 'DIMM' in ff else None)
            if cat=='cpu_cooler':
                water=row.get('water_cooled');row['cooler_type']='liquid' if water is True else ('air' if water is False else 'unknown')
                needed='radiator_size_mm' if water is True else ('height_mm' if water is False else None)
                if needed and absent(row.get(needed)):issue(cat,pid,needed,'missing_conditional_measurement')
            if cat in ('ssd','hdd','sshd','storage_unknown'):
                interface=str(row.get('interface') or '').upper()
                row['interface_family']=next((x for x in ('SAS','SATA','PCIE') if x in interface.replace('PCI-E','PCIE')),None)
                if 'SATA' in interface and row.get('nvme') is True:issue(cat,pid,'nvme','interface_nvme_conflict')
            if cat=='cpu':
                row['demo_scope']='modern_desktop_socket' if row.get('socket') in ('AM4','AM5','LGA1700') else 'other_or_unknown'
            # ไม่แปลงหน่วย weight อัตโนมัติ: สเปกบางรายการดูผิดหน่วยแม้ schema ระบุแล้ว
            if 'weight' in flat and flat['weight'] is not None:issue(cat,pid,'weight','source_unit_requires_verification',flat['weight'])
            datasets[cat].append(row)
            manufacturer=str(row.get('manufacturer') or '').casefold()
            for mpn in get(d,'metadata.part_numbers') or []:
                if isinstance(mpn,str) and mpn.strip():duplicates[(manufacturer,text(mpn).casefold())].append(pid)
    by_id=collections.defaultdict(list)
    for item in issues:by_id[item['part_id']].append(item['code'])
    coverage=[]; dictionary=[]; counts={}
    for cat,rows in sorted(datasets.items()):
        for row in rows:
            row['quality_issue_codes']=sorted(set(by_id[row['part_id']]))
            row['quality_status']='needs_review' if row['quality_issue_codes'] else 'no_issues_detected'
            # ไม่ใช้ชื่อ ready/compatible เพราะ cleaning ยังไม่ใช่การยืนยันสเปกจากผู้ผลิต
        keys=sorted(set().union(*(r.keys() for r in rows)))
        rows=[{k:r.get(k) for k in keys} for r in sorted(rows,key=lambda r:r['part_id'])]
        counts[cat]=len(rows)
        write_json(out/cat/'parts.json',rows)
        write_csv(out/cat/'parts.csv',rows,keys)
        json_types={'NoneType':'null','str':'string','int':'integer','float':'number','bool':'boolean','list':'array','dict':'object'}
        # Contract ครอบคลุมคอลัมน์ทั้งหมด; null รองรับข้อมูลที่ยังไม่มี ไม่สร้างค่า default เทียม
        properties={k:{'type':sorted(set(['null']+[json_types[type(r[k]).__name__] for r in rows]))} for k in keys}
        write_json(out/cat/'schema.json',{'$schema':'https://json-schema.org/draft/2020-12/schema','title':cat+' cleaned v'+VERSION,'type':'object','additionalProperties':False,'required':keys,'properties':properties})
        for key in keys:
            count=sum(not absent(r[key]) for r in rows)
            coverage.append(dict(category=cat,column=key,total_rows=len(rows),nonempty_rows=count,nonempty_percent=round(count/len(rows)*100,2)))
            info=dictionaries[cat].get(key,{'source_path':None,'description':'Derived/provenance column; see README_TH.md','source_type':None,'observed_types':set(type(r[key]).__name__ for r in rows)})
            dictionary.append(dict(category=cat,column=key,**{**info,'observed_types':sorted(info['observed_types'])}))
    duplicate_groups=[dict(manufacturer=k[0],part_number=k[1],part_ids=sorted(set(v))) for k,v in sorted(duplicates.items()) if len(set(v))>1]
    write_json(reports/'issues.json',issues);write_json(reports/'changes.json',changes)
    write_json(reports/'possible_duplicates.json',duplicate_groups)
    write_json(out/'data_dictionary.json',dictionary)
    write_csv(reports/'column_coverage.csv',coverage,['category','column','total_rows','nonempty_rows','nonempty_percent'])
    summary=dict(pipeline_version=VERSION,input_sha256=hashes,source_commit=manifest['commit'],input_rows=rows_in,output_rows=sum(counts.values()),counts=counts,issues_by_code=dict(sorted(collections.Counter(i['code'] for i in issues).items())),records_with_issues=sum(bool(v) for v in by_id.values()),changes=len(changes),possible_duplicate_groups=len(duplicate_groups),removed_records=0)
    assert rows_in==sum(counts.values())
    write_json(reports/'summary.json',summary)
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    return summary

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]/'data/pc-builder-starter');p.add_argument('--check',action='store_true');args=p.parse_args()
    root=args.root.resolve()
    if args.check:
        # เปรียบเทียบผลทั้งหมดกับ build ใหม่ใน temp; ตรวจว่าต้นทางและ pipeline ทำซ้ำได้จริง
        import tempfile,shutil
        with tempfile.TemporaryDirectory() as temp:
            tmp=Path(temp)
            for name in ('02_catalog','03_schemas'):shutil.copytree(root/name,tmp/name)
            shutil.copy2(root/'manifest.json',tmp/'manifest.json');run(tmp)
            for folder in ('08_cleaned','09_reports'):
                expected={str(f.relative_to(tmp/folder)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (tmp/folder).rglob('*') if f.is_file()}
                # README เป็นเอกสารที่เขียนแยก ไม่ใช่ผลของ pipeline
                actual={str(f.relative_to(root/folder)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (root/folder).rglob('*') if f.is_file() and f.suffix!='.md'}
                assert expected==actual,folder+' differs; rerun cleaning'
        print('PASS: deterministic output, source hashes, counts and unique primary IDs')
    else:run(root)

if __name__=='__main__':main()
