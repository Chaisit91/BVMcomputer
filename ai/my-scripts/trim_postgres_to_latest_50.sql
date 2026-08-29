-- Keep only the 50 newest products in each BuildCores product table.
-- Newest means release_year DESC, then updated_at DESC for products in the same year.
-- Run this file in pgAdmin while connected to the buildcores_db database.

BEGIN;

DO $trim$
DECLARE
    target_schema CONSTANT text := 'buildcores_clean';
    target_table text;
    deleted_rows bigint;
BEGIN
    FOREACH target_table IN ARRAY ARRAY[
        'cpu',
        'motherboard',
        'ram',
        'gpu',
        'psu',
        'pc_case',
        'cpu_cooler',
        'storage'
    ]
    LOOP
        EXECUTE format(
            'WITH ranked AS (
                SELECT opendb_id,
                       ROW_NUMBER() OVER (
                           ORDER BY release_year DESC NULLS LAST,
                                    updated_at DESC NULLS LAST,
                                    opendb_id DESC
                       ) AS position
                FROM %I.%I
             ),
             deleted AS (
                 DELETE FROM %I.%I AS product
                 USING ranked
                 WHERE product.opendb_id = ranked.opendb_id
                   AND ranked.position > 50
                 RETURNING 1
             )
             SELECT COUNT(*) FROM deleted',
            target_schema,
            target_table,
            target_schema,
            target_table
        ) INTO deleted_rows;

        RAISE NOTICE '%.%: deleted % row(s)', target_schema, target_table, deleted_rows;
    END LOOP;
END
$trim$;

COMMIT;

SELECT 'cpu' AS table_name, COUNT(*) AS remaining_rows FROM buildcores_clean.cpu
UNION ALL SELECT 'motherboard', COUNT(*) FROM buildcores_clean.motherboard
UNION ALL SELECT 'ram', COUNT(*) FROM buildcores_clean.ram
UNION ALL SELECT 'gpu', COUNT(*) FROM buildcores_clean.gpu
UNION ALL SELECT 'psu', COUNT(*) FROM buildcores_clean.psu
UNION ALL SELECT 'pc_case', COUNT(*) FROM buildcores_clean.pc_case
UNION ALL SELECT 'cpu_cooler', COUNT(*) FROM buildcores_clean.cpu_cooler
UNION ALL SELECT 'storage', COUNT(*) FROM buildcores_clean.storage
ORDER BY table_name;
