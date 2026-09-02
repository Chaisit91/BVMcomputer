-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CpuBrand" AS ENUM ('AMD', 'Intel');

-- CreateEnum
CREATE TYPE "GpuStatus" AS ENUM ('available', 'preorder', 'discontinued');

-- CreateEnum
CREATE TYPE "DesktopPcCategory" AS ENUM ('desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise');

-- CreateEnum
CREATE TYPE "DesktopPcStatus" AS ENUM ('selling', 'discontinued');

-- CreateEnum
CREATE TYPE "PromoSetStatus" AS ENUM ('selling', 'closed');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('pending', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending_payment', 'paid', 'preparing', 'shipping', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('hero', 'promo', 'popup');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'inventory_manager', 'sales_staff', 'content_moderator');

-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecField" (
    "id" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
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
CREATE TABLE "Cpu" (
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" "CpuBrand" NOT NULL,
    "series" TEXT NOT NULL,
    "processorLine" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "processorNumber" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "threads" INTEGER NOT NULL,
    "baseFrequency" TEXT NOT NULL,
    "maxTurboFrequency" TEXT NOT NULL,
    "l2Cache" TEXT NOT NULL,
    "l3Cache" TEXT NOT NULL,
    "graphics" TEXT NOT NULL,
    "tdp" TEXT NOT NULL,
    "maxTdp" TEXT NOT NULL,
    "warranty" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "publishImmediately" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cpu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "CpuBenchmark" (
    "id" TEXT NOT NULL,
    "cpuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "CpuBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gpu" (
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "chipsetModel" TEXT NOT NULL,
    "memorySize" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "GpuStatus" NOT NULL DEFAULT 'available',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gpu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Motherboard" (
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "publishImmediately" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motherboard_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Ram" (
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ram_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Storage" (
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Case" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Psu" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Psu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Cooling" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cooling_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "DesktopPc" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DesktopPcCategory" NOT NULL,
    "status" "DesktopPcStatus" NOT NULL DEFAULT 'selling',
    "specSummary" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "os" TEXT NOT NULL,
    "warranty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesktopPc_pkey" PRIMARY KEY ("id")
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
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PromoSetStatus" NOT NULL DEFAULT 'selling',
    "specSummary" TEXT NOT NULL,
    "regularPrice" DECIMAL(10,2) NOT NULL,
    "promoPrice" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoSet_pkey" PRIMARY KEY ("id")
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
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending_payment',
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
    "customer" TEXT NOT NULL,
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
    "imageFilename" TEXT NOT NULL DEFAULT '',
    "imageDimensions" TEXT NOT NULL DEFAULT '',
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
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT '',
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
CREATE UNIQUE INDEX "SpecField_category_key_key" ON "SpecField"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecValue_productId_fieldId_key" ON "ProductSpecValue"("productId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "Cpu_sku_key" ON "Cpu"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Gpu_sku_key" ON "Gpu"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Motherboard_sku_key" ON "Motherboard"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Ram_sku_key" ON "Ram"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Storage_sku_key" ON "Storage"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Case_displayCode_key" ON "Case"("displayCode");

-- CreateIndex
CREATE UNIQUE INDEX "Case_sku_key" ON "Case"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Psu_displayCode_key" ON "Psu"("displayCode");

-- CreateIndex
CREATE UNIQUE INDEX "Psu_sku_key" ON "Psu"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Cooling_displayCode_key" ON "Cooling"("displayCode");

-- CreateIndex
CREATE UNIQUE INDEX "Cooling_sku_key" ON "Cooling"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopPc_sku_key" ON "DesktopPc"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopPcComponent_desktopPcId_slot_key" ON "DesktopPcComponent"("desktopPcId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PromoSet_code_key" ON "PromoSet"("code");

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
CREATE UNIQUE INDEX "CustomBuild_orderNo_key" ON "CustomBuild"("orderNo");

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
ALTER TABLE "Cpu" ADD CONSTRAINT "Cpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CpuBenchmark" ADD CONSTRAINT "CpuBenchmark_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "Cpu"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gpu" ADD CONSTRAINT "Gpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motherboard" ADD CONSTRAINT "Motherboard_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ram" ADD CONSTRAINT "Ram_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Psu" ADD CONSTRAINT "Psu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooling" ADD CONSTRAINT "Cooling_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "DesktopPc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesktopPcHighlight" ADD CONSTRAINT "DesktopPcHighlight_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "DesktopPc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetExtraPart" ADD CONSTRAINT "PromoSetExtraPart_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetHighlight" ADD CONSTRAINT "PromoSetHighlight_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoSetVideoLink" ADD CONSTRAINT "PromoSetVideoLink_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "PromoSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_customBuildId_fkey" FOREIGN KEY ("customBuildId") REFERENCES "CustomBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRoleHistory" ADD CONSTRAINT "AdminRoleHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLoginHistory" ADD CONSTRAINT "AdminLoginHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
