-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AdminAccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('super_admin', 'inventory_manager', 'sales_staff', 'content_moderator');

-- CreateEnum
CREATE TYPE "public"."BannerType" AS ENUM ('hero', 'promo', 'popup');

-- CreateEnum
CREATE TYPE "public"."BuildStatus" AS ENUM ('pending', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."CatalogCategory" AS ENUM ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling', 'desktop_pc', 'promo_set');

-- CreateEnum
CREATE TYPE "public"."ChatSender" AS ENUM ('customer', 'admin');

-- CreateEnum
CREATE TYPE "public"."ComputerUpgradeStatus" AS ENUM ('pending_review', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "public"."DesktopPcCategory" AS ENUM ('desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('pending', 'preparing', 'shipping', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."PartCategory" AS ENUM ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('active', 'inactive', 'preorder', 'discontinued');

-- CreateEnum
CREATE TYPE "public"."SpecDataType" AS ENUM ('text', 'integer', 'decimal', 'boolean');

-- CreateTable
CREATE TABLE "public"."AdminAccount" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "role" "public"."AdminRole" NOT NULL,
    "status" "public"."AdminAccountStatus" NOT NULL DEFAULT 'active',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "sessionsInvalidatedAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "isTeamLead" BOOLEAN NOT NULL DEFAULT false,
    "personalEmail" TEXT NOT NULL DEFAULT '',
    "passwordSetupExpiresAt" TIMESTAMP(3),
    "passwordSetupTokenHash" TEXT,

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminLoginHistory" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "device" TEXT NOT NULL,

    CONSTRAINT "AdminLoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminRoleHistory" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AdminRoleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."BannerType" NOT NULL,
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
CREATE TABLE "public"."Case" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."ChatConversation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "public"."ChatSender" NOT NULL,
    "senderAdminId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComputerUpgrade" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "customerNameSnapshot" TEXT NOT NULL,
    "status" "public"."ComputerUpgradeStatus" NOT NULL DEFAULT 'pending_review',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerPhone" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ComputerUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComputerUpgradeItem" (
    "id" TEXT NOT NULL,
    "upgradeId" TEXT NOT NULL,
    "slot" "public"."PartCategory" NOT NULL,
    "oldItemDescription" TEXT NOT NULL DEFAULT '',
    "oldItemPhotoUrl" TEXT,
    "newProductId" TEXT,
    "aiRecommendation" TEXT,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "newProductPrice" DECIMAL(10,2),
    "customerWantsUpgrade" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ComputerUpgradeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cooling" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Cooling_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."Cpu" (
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
CREATE TABLE "public"."CpuBenchmark" (
    "id" TEXT NOT NULL,
    "cpuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "CpuBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomBuild" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "customerId" TEXT,
    "customerNameSnapshot" TEXT NOT NULL,
    "status" "public"."BuildStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiPreviewImageUrl" TEXT,

    CONSTRAINT "CustomBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomBuildComponent" (
    "id" TEXT NOT NULL,
    "customBuildId" TEXT NOT NULL,
    "slot" "public"."PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CustomBuildComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'active',
    "shippingAddress" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DesktopPc" (
    "productId" TEXT NOT NULL,
    "category" "public"."DesktopPcCategory" NOT NULL,
    "specSummary" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "warranty" TEXT NOT NULL,

    CONSTRAINT "DesktopPc_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."DesktopPcComponent" (
    "id" TEXT NOT NULL,
    "desktopPcId" TEXT NOT NULL,
    "slot" "public"."PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "DesktopPcComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DesktopPcHighlight" (
    "id" TEXT NOT NULL,
    "desktopPcId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "DesktopPcHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExtraSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "ExtraSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Gpu" (
    "productId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "chipsetModel" TEXT NOT NULL,
    "memorySize" TEXT NOT NULL,

    CONSTRAINT "Gpu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."Order" (
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
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending',
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "shippingNote" TEXT NOT NULL DEFAULT '',
    "paymentSlipFilename" TEXT NOT NULL DEFAULT '',
    "paymentSlipUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderLineItem" (
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
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "category" "public"."CatalogCategory" NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "promoPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'active',
    "publishImmediately" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
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
CREATE TABLE "public"."ProductSpecValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpecValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVideoLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ProductVideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoSet" (
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "specSummary" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PromoSet_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."PromoSetComponent" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "slot" "public"."PartCategory" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "PromoSetComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoSetExtraPart" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PromoSetExtraPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoSetHighlight" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "PromoSetHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoSetVideoLink" (
    "id" TEXT NOT NULL,
    "promoSetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "PromoSetVideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Psu" (
    "productId" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,

    CONSTRAINT "Psu_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."Ram" (
    "productId" TEXT NOT NULL,
    "series" TEXT NOT NULL,

    CONSTRAINT "Ram_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."SpecField" (
    "id" TEXT NOT NULL,
    "category" "public"."PartCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dataType" "public"."SpecDataType" NOT NULL DEFAULT 'text',
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpecField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_email_key" ON "public"."AdminAccount"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_passwordSetupTokenHash_key" ON "public"."AdminAccount"("passwordSetupTokenHash" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Case_displayCode_key" ON "public"."Case"("displayCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_customerId_key" ON "public"."ChatConversation"("customerId" ASC);

-- CreateIndex
CREATE INDEX "ComputerUpgrade_customerId_idx" ON "public"."ComputerUpgrade"("customerId" ASC);

-- CreateIndex
CREATE INDEX "ComputerUpgradeItem_newProductId_idx" ON "public"."ComputerUpgradeItem"("newProductId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ComputerUpgradeItem_upgradeId_slot_key" ON "public"."ComputerUpgradeItem"("upgradeId" ASC, "slot" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Cooling_displayCode_key" ON "public"."Cooling"("displayCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CpuBenchmark_cpuId_name_key" ON "public"."CpuBenchmark"("cpuId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "CustomBuild_customerId_idx" ON "public"."CustomBuild"("customerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomBuild_orderNo_key" ON "public"."CustomBuild"("orderNo" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomBuildComponent_customBuildId_slot_key" ON "public"."CustomBuildComponent"("customBuildId" ASC, "slot" ASC);

-- CreateIndex
CREATE INDEX "CustomBuildComponent_productId_idx" ON "public"."CustomBuildComponent"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "public"."Customer"("customerCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_username_key" ON "public"."Customer"("username" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DesktopPcComponent_desktopPcId_slot_key" ON "public"."DesktopPcComponent"("desktopPcId" ASC, "slot" ASC);

-- CreateIndex
CREATE INDEX "DesktopPcComponent_productId_idx" ON "public"."DesktopPcComponent"("productId" ASC);

-- CreateIndex
CREATE INDEX "ExtraSpec_productId_idx" ON "public"."ExtraSpec"("productId" ASC);

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "public"."Order"("customerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "public"."Order"("orderCode" ASC);

-- CreateIndex
CREATE INDEX "Order_orderedAt_idx" ON "public"."Order"("orderedAt" ASC);

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "public"."Order"("paymentStatus" ASC);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status" ASC);

-- CreateIndex
CREATE INDEX "OrderLineItem_orderId_idx" ON "public"."OrderLineItem"("orderId" ASC);

-- CreateIndex
CREATE INDEX "OrderLineItem_productId_idx" ON "public"."OrderLineItem"("productId" ASC);

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "public"."Product"("category" ASC);

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "public"."Product"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku" ASC);

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "public"."Product"("status" ASC);

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "public"."ProductImage"("productId" ASC);

-- CreateIndex
CREATE INDEX "ProductSpecValue_fieldId_idx" ON "public"."ProductSpecValue"("fieldId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecValue_productId_fieldId_key" ON "public"."ProductSpecValue"("productId" ASC, "fieldId" ASC);

-- CreateIndex
CREATE INDEX "ProductSpecValue_productId_idx" ON "public"."ProductSpecValue"("productId" ASC);

-- CreateIndex
CREATE INDEX "ProductVideoLink_productId_idx" ON "public"."ProductVideoLink"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PromoSet_code_key" ON "public"."PromoSet"("code" ASC);

-- CreateIndex
CREATE INDEX "PromoSetComponent_productId_idx" ON "public"."PromoSetComponent"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PromoSetComponent_promoSetId_slot_key" ON "public"."PromoSetComponent"("promoSetId" ASC, "slot" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Psu_displayCode_key" ON "public"."Psu"("displayCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SpecField_category_key_key" ON "public"."SpecField"("category" ASC, "key" ASC);

-- AddForeignKey
ALTER TABLE "public"."AdminAccount" ADD CONSTRAINT "AdminAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminLoginHistory" ADD CONSTRAINT "AdminLoginHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminRoleHistory" ADD CONSTRAINT "AdminRoleHistory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Case" ADD CONSTRAINT "Case_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatConversation" ADD CONSTRAINT "ChatConversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderAdminId_fkey" FOREIGN KEY ("senderAdminId") REFERENCES "public"."AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComputerUpgrade" ADD CONSTRAINT "ComputerUpgrade_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComputerUpgradeItem" ADD CONSTRAINT "ComputerUpgradeItem_newProductId_fkey" FOREIGN KEY ("newProductId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComputerUpgradeItem" ADD CONSTRAINT "ComputerUpgradeItem_upgradeId_fkey" FOREIGN KEY ("upgradeId") REFERENCES "public"."ComputerUpgrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComputerUpgradeItem" ADD CONSTRAINT "ComputerUpgradeItem_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cooling" ADD CONSTRAINT "Cooling_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cpu" ADD CONSTRAINT "Cpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CpuBenchmark" ADD CONSTRAINT "CpuBenchmark_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "public"."Cpu"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomBuild" ADD CONSTRAINT "CustomBuild_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_customBuildId_fkey" FOREIGN KEY ("customBuildId") REFERENCES "public"."CustomBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomBuildComponent" ADD CONSTRAINT "CustomBuildComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DesktopPc" ADD CONSTRAINT "DesktopPc_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "public"."DesktopPc"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DesktopPcComponent" ADD CONSTRAINT "DesktopPcComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DesktopPcHighlight" ADD CONSTRAINT "DesktopPcHighlight_desktopPcId_fkey" FOREIGN KEY ("desktopPcId") REFERENCES "public"."DesktopPc"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExtraSpec" ADD CONSTRAINT "ExtraSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gpu" ADD CONSTRAINT "Gpu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderLineItem" ADD CONSTRAINT "OrderLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."SpecField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVideoLink" ADD CONSTRAINT "ProductVideoLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSet" ADD CONSTRAINT "PromoSet_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSetComponent" ADD CONSTRAINT "PromoSetComponent_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "public"."PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSetExtraPart" ADD CONSTRAINT "PromoSetExtraPart_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "public"."PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSetHighlight" ADD CONSTRAINT "PromoSetHighlight_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "public"."PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoSetVideoLink" ADD CONSTRAINT "PromoSetVideoLink_promoSetId_fkey" FOREIGN KEY ("promoSetId") REFERENCES "public"."PromoSet"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Psu" ADD CONSTRAINT "Psu_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ram" ADD CONSTRAINT "Ram_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

