-- CreateEnum
CREATE TYPE "CatalogCategory" AS ENUM ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling', 'desktop_pc', 'promo_set');

-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive', 'preorder', 'discontinued');

-- CreateEnum
CREATE TYPE "AdminAccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SpecDataType" AS ENUM ('text', 'integer', 'decimal', 'boolean');

-- CreateEnum
CREATE TYPE "DesktopPcCategory" AS ENUM ('desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise');

-- CreateEnum
CREATE TYPE "PromoSetLifecycle" AS ENUM ('selling', 'closed');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('pending', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'preparing', 'shipping', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('hero', 'promo', 'popup');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'inventory_manager', 'sales_staff', 'content_moderator');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "category" "CatalogCategory" NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "promoPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "publishImmediately" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecField" (
    "id" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dataType" "SpecDataType" NOT NULL DEFAULT 'text',
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpecField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpecValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "ExtraSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVideoLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ProductVideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cpu" (
    "productId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "processorLine" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "processorNumber" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "threads" INTEGER NOT NULL,
    "baseFrequencyGhz" DECIMAL(4,2) NOT NULL,
    "maxTurboFrequencyGhz" DECIMAL(4,2) NOT NULL,
    "l2CacheMb" INTEGER NOT NULL,
    "l3CacheMb" INTEGER NOT NULL,
    "graphics" TEXT NOT NULL,
    "tdpWatts" INTEGER NOT NULL,
    "maxTdpWatts" INTEGER NOT NULL,
    "warrantyMonths" INTEGER NOT NULL,

    CONSTRAINT "Cpu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "CpuBenchmark" (
    "id" TEXT NOT NULL,
    "cpuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "CpuBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gpu" (
    "productId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "chipsetModel" TEXT NOT NULL,
    "memorySize" TEXT NOT NULL,

    CONSTRAINT "Gpu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Ram" (
    "productId" TEXT NOT NULL,
    "series" TEXT NOT NULL,

    CONSTRAINT "Ram_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Case" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Psu" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Psu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Cooling" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Cooling_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "DesktopPc" (
    "productId" TEXT NOT NULL,
    "category" "DesktopPcCategory" NOT NULL,
    "specSummary" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "warranty" TEXT NOT NULL,

    CONSTRAINT "DesktopPc_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "DesktopPcComponent" (
    "id" TEXT NOT NULL,
    "desktopPcId" TEXT NOT NULL,
    "slot" "PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "DesktopPcComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesktopPcHighlight" (
    "id" TEXT NOT NULL,
    "desktopPcId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "DesktopPcHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoSet" (
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "lifecycle" "PromoSetLifecycle" NOT NULL DEFAULT 'selling',
    "specSummary" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PromoSet_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "PromoSetComponent" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "slot" "PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "PromoSetComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoSetExtraPart" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PromoSetExtraPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoSetHighlight" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "PromoSetHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoSetVideoLink" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "PromoSetVideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CustomerStatus" NOT NULL DEFAULT 'active',
    "shippingAddress" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subdistrict" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "shippingNote" TEXT NOT NULL DEFAULT '',
    "paymentSlipFilename" TEXT NOT NULL DEFAULT '',
    "paymentSlipUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBuild" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "customerId" TEXT,
    "customerNameSnapshot" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBuildComponent" (
    "id" TEXT NOT NULL,
    "customBuildId" TEXT NOT NULL,
    "slot" "PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CustomBuildComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BannerType" NOT NULL,
    "targetLink" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "previewTone" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "imageFormat" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "role" "AdminRole" NOT NULL,
    "status" "AdminAccountStatus" NOT NULL DEFAULT 'active',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRoleHistory" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AdminRoleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLoginHistory" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "device" TEXT NOT NULL,

    CONSTRAINT "AdminLoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpecField_category_key_key" ON "SpecField"("category", "key");

-- CreateIndex
CREATE INDEX "ProductSpecValue_productId_idx" ON "ProductSpecValue"("productId");

-- CreateIndex
CREATE INDEX "ProductSpecValue_fieldId_idx" ON "ProductSpecValue"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecValue_productId_fieldId_key" ON "ProductSpecValue"("productId", "fieldId");

-- CreateIndex
CREATE INDEX "ExtraSpec_productId_idx" ON "ExtraSpec"("productId");

-- CreateIndex
CREATE INDEX "ProductVideoLink_productId_idx" ON "ProductVideoLink"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CpuBenchmark_cpuId_name_key" ON "CpuBenchmark"("cpuId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Case_displayCode_key" ON "Case"("displayCode");

-- CreateIndex
CREATE UNIQUE INDEX "Psu_displayCode_key" ON "Psu"("displayCode");

-- CreateIndex
CREATE UNIQUE INDEX "Cooling_displayCode_key" ON "Cooling"("displayCode");

-- CreateIndex
CREATE INDEX "DesktopPcComponent_productId_idx" ON "DesktopPcComponent"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopPcComponent_desktopPcId_slot_key" ON "DesktopPcComponent"("desktopPcId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PromoSet_code_key" ON "PromoSet"("code");

-- CreateIndex
CREATE INDEX "PromoSetComponent_productId_idx" ON "PromoSetComponent"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoSetComponent_promoSetId_slot_key" ON "PromoSetComponent"("promoSetId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_username_key" ON "Customer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_orderedAt_idx" ON "Order"("orderedAt");

-- CreateIndex
CREATE INDEX "OrderLineItem_orderId_idx" ON "OrderLineItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderLineItem_productId_idx" ON "OrderLineItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomBuild_orderNo_key" ON "CustomBuild"("orderNo");

-- CreateIndex
CREATE INDEX "CustomBuild_customerId_idx" ON "CustomBuild"("customerId");

-- CreateIndex
CREATE INDEX "CustomBuildComponent_productId_idx" ON "CustomBuildComponent"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomBuildComponent_customBuildId_slot_key" ON "CustomBuildComponent"("customBuildId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_email_key" ON "AdminAccount"("email");

-- AddForeignKey
ALTER TABLE "ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "SpecField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraSpec" ADD CONSTRAINT "ExtraSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVideoLink" ADD CONSTRAINT "ProductVideoLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cpu" ADD CONSTRAINT "Cpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CpuBenchmark" ADD CONSTRAINT "CpuBenchmark_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "Cpu"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gpu" ADD CONSTRAINT "Gpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ram" ADD CONSTRAINT "Ram_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Psu" ADD CONSTRAINT "Psu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooling" ADD CONSTRAINT "Cooling_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPc" ADD CONSTRAINT "DesktopPc_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "DesktopPc"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcHighlight" ADD CONSTRAINT "DesktopPcHighlight_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "DesktopPc"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSet" ADD CONSTRAINT "PromoSet_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetExtraPart" ADD CONSTRAINT "PromoSetExtraPart_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetHighlight" ADD CONSTRAINT "PromoSetHighlight_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetVideoLink" ADD CONSTRAINT "PromoSetVideoLink_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBuild" ADD CONSTRAINT "CustomBuild_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_customBuildId_fkey" FOREIGN KEY ("customBuildId") REFERENCES "CustomBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccount" ADD CONSTRAINT "AdminAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRoleHistory" ADD CONSTRAINT "AdminRoleHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLoginHistory" ADD CONSTRAINT "AdminLoginHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
