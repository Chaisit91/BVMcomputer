"""เติมเฉพาะข้อมูลที่มีหลักฐาน: manufacturer correction หรือ exact-MPN consensus.

ไม่จับคู่ด้วยชื่อ ไม่ใช้ socket/chipset เดาว่ารุ่นย่อยเหมือนกัน ไม่ลบรายการใด
"""
import copy
import collections
import json
import re

FIELDS={
 'case':['supported_power_supply_form_factors','max_cpu_cooler_height','max_video_card_length','max_psu_length'],
 'gpu':['memory_bus','memory','length','total_slot_width','tdp'],
 'cpu':['specifications.memory.types','specifications.memory.maxSupport'],
 'ram':['form_factor','height'], 'psu':['length','wattage','form_factor'],
 'cpu_cooler':['height','radiator_size','cpu_sockets','water_cooled'],
 'motherboard':['socket','form_factor','memory.max','memory.slots','memory.ram_type']}
SIGNATURES={'gpu':['chipset','memory','memory_type'],
 'ram':['ram_type','capacity','speed','modules.quantity','modules.capacity_gb'],
 'cpu':['socket','cores.total'], 'motherboard':['socket','chipset','memory.ram_type'],
 'psu':['wattage','form_factor'], 'cpu_cooler':['water_cooled','radiator_size'],
 'case':['form_factor']}

def get(d,path):
    for k in path.split('.'):
        if not isinstance(d,dict):return None
        d=d.get(k)
    return d

def put(d,path,value):
    keys=path.split('.')
    for k in keys[:-1]:d=d.setdefault(k,{})
    d[keys[-1]]=copy.deepcopy(value)

def usable(v):
    if isinstance(v,bool):return True
    if isinstance(v,(int,float)):return v>0
    if isinstance(v,str):return v.strip().lower() not in ('','unknown','none','n/a')
    return isinstance(v,list) and bool(v)

def mpns(d):
    values=list(get(d,'metadata.part_numbers') or [])
    values += [i.get('value') for i in get(d,'identifiers.identifiers') or [] if i.get('type')=='mpn']
    name=str(get(d,'metadata.name') or '').strip().casefold()
    return sorted({v.strip().casefold() for v in values if isinstance(v,str) and len(v.strip())>=5 and v.strip().casefold()!=name and re.search('[a-zA-Z]',v) and re.search('[0-9]',v)})

def enrich(catalogs,corrections,reference_rules=()):
    # donor snapshot เป็นข้อมูลต้นทางเท่านั้น ไม่ต่อทอดค่าที่เพิ่งเติม
    result=copy.deepcopy(catalogs); index=collections.defaultdict(list); receipts=[];conflicts=[]
    for cat,rows in catalogs.items():
        for d in rows:
            maker=str(get(d,'metadata.manufacturer') or '').strip().casefold()
            if not maker:continue
            for mpn in mpns(d):index[(cat,maker,mpn)].append(d)
    for cat,rows in result.items():
        for d in rows:
            maker=str(get(d,'metadata.manufacturer') or '').strip().casefold()
            donors={x['opendb_id']:x for mpn in mpns(d) for x in index[(cat,maker,mpn)] if x['opendb_id']!=d['opendb_id']}
            # MPN ในฐานชุมชนอาจถูกผูกผิด ถ้ามีสเปกแยก variant ขัดกันต้องไม่เป็น donor
            donors={pid:x for pid,x in donors.items() if not any(usable(get(d,k)) and usable(get(x,k)) and get(d,k)!=get(x,k) for k in SIGNATURES.get(cat,[]))}
            for field in FIELDS.get(cat,[]):
                if usable(get(d,field)):continue
                options={}
                for donor in donors.values():
                    value=get(donor,field)
                    if usable(value):options.setdefault(json.dumps(value,sort_keys=True),[]).append(donor['opendb_id'])
                if len(options)>1:
                    conflicts.append(dict(part_id=d['opendb_id'],field=field,options=[dict(value=json.loads(k),donor_ids=sorted(v)) for k,v in sorted(options.items())]));continue
                if len(options)==1:
                    value,ids=next(iter(options.items()));before=get(d,field);put(d,field,json.loads(value))
                    receipts.append(dict(part_id=d['opendb_id'],field=field,before=before,after=json.loads(value),method='exact_manufacturer_mpn_consensus',donor_ids=sorted(ids),manufacturer_verified=False))
    # ขยายได้เฉพาะ memory bus ของ configuration ที่ตรงทุกเงื่อนไข ไม่ใช้ขนาด reference card กับการ์ด custom
    for d in result.get('gpu',[]):
        for rule in reference_rules:
            if rule['field']!='memory_bus':raise ValueError('Reference rule only supports memory_bus')
            if not all(get(d,k)==v for k,v in rule['match'].items()):continue
            old=get(d,'memory_bus')
            if usable(old):
                if old!=rule['value']:conflicts.append(dict(part_id=d['opendb_id'],field='memory_bus',options=[dict(value=old,donor_ids=['original_record']),dict(value=rule['value'],donor_ids=[rule['source_url']])]))
                continue
            put(d,'memory_bus',rule['value'])
            receipts.append(dict(part_id=d['opendb_id'],field='memory_bus',before=old,after=rule['value'],method='official_reference_configuration',manufacturer_verified=True,source_url=rule['source_url'],checked_on=rule['checked_on'],note=rule['note'],match=rule['match']))
    lookup={d['opendb_id']:(cat,d) for cat,rows in result.items() for d in rows}
    for correction in corrections:
        pid=correction['part_id']
        if pid not in lookup:raise ValueError('Unknown correction ID '+pid)
        cat,d=lookup[pid]
        supplied=list(get(d,'metadata.part_numbers') or [])+[i.get('value') for i in get(d,'identifiers.identifiers') or [] if i.get('type')=='mpn']
        if not {x.strip().casefold() for x in supplied if isinstance(x,str)}.intersection(x.casefold() for x in correction['expected_mpns']):raise ValueError('MPN mismatch '+pid)
        if not correction.get('source_url','').startswith('https://'):raise ValueError('Source URL required')
        field=correction['field'];before=get(d,field);put(d,field,correction['value'])
        receipts.append(dict(part_id=pid,field=field,before=before,after=correction['value'],method='manufacturer_specification',manufacturer_verified=True,source_url=correction['source_url'],checked_on=correction['checked_on'],note=correction['note']))
    return result,receipts,conflicts
