-- Manual constraints Prisma's schema language can't express: partial unique
-- indexes and CHECK constraints. Not tracked by `prisma migrate` — re-run this
-- file by hand (via `prisma db execute --file prisma/manual/constraints.sql
-- --schema prisma/schema.prisma`) after any `db push`/reset that recreates
-- these tables, since those operations don't know about it.

-- At most one primary image per product.
CREATE UNIQUE INDEX IF NOT EXISTS "ProductImage_productId_primary_idx"
  ON "ProductImage" ("productId")
  WHERE "isPrimary" = true;

-- Stock can't go negative.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_stock_nonnegative";
ALTER TABLE "Product" ADD CONSTRAINT "Product_stock_nonnegative" CHECK ("stock" >= 0);

-- No negative prices.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_sellingPrice_nonnegative";
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellingPrice_nonnegative" CHECK ("sellingPrice" >= 0);

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_costPrice_nonnegative";
ALTER TABLE "Product" ADD CONSTRAINT "Product_costPrice_nonnegative" CHECK ("costPrice" IS NULL OR "costPrice" >= 0);

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_promoPrice_nonnegative";
ALTER TABLE "Product" ADD CONSTRAINT "Product_promoPrice_nonnegative" CHECK ("promoPrice" IS NULL OR "promoPrice" >= 0);

-- A promo price can't exceed the regular selling price.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_promoPrice_lte_sellingPrice";
ALTER TABLE "Product" ADD CONSTRAINT "Product_promoPrice_lte_sellingPrice"
  CHECK ("promoPrice" IS NULL OR "promoPrice" <= "sellingPrice");

-- An order line can't have zero/negative quantity or a negative unit price.
ALTER TABLE "OrderLineItem" DROP CONSTRAINT IF EXISTS "OrderLineItem_quantity_positive";
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "OrderLineItem" DROP CONSTRAINT IF EXISTS "OrderLineItem_unitPrice_nonnegative";
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_unitPrice_nonnegative" CHECK ("unitPrice" >= 0);

-- A custom-build component's snapshotted price can't be negative.
ALTER TABLE "CustomBuildComponent" DROP CONSTRAINT IF EXISTS "CustomBuildComponent_price_nonnegative";
ALTER TABLE "CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_price_nonnegative" CHECK ("price" >= 0);

-- A banner's end date must be after its start date.
ALTER TABLE "Banner" DROP CONSTRAINT IF EXISTS "Banner_endDate_after_startDate";
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_endDate_after_startDate" CHECK ("endDate" > "startDate");
