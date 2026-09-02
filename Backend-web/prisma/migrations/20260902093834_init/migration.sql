-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CpuBrand" AS ENUM ('AMD', 'Intel');

-- CreateEnum
CREATE TYPE "GpuStatus" AS ENUM ('available', 'preorder', 'discontinued');

-- CreateEnum
CREATE TYPE "MotherboardStatus" AS ENUM ('available', 'low_stock', 'out_of_stock');

-- CreateEnum
CREATE TYPE "DesktopPcCategory" AS ENUM ('desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise');

-- CreateEnum
CREATE TYPE "DesktopPcStatus" AS ENUM ('selling', 'low_stock', 'out_of_stock', 'discontinued');

-- CreateEnum
CREATE TYPE "PromoSetStatus" AS ENUM ('selling', 'out_of_stock', 'closed');

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

-- CreateTable
CREATE TABLE "Cpu" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" "CpuBrand" NOT NULL,
    "series" TEXT NOT NULL,
    "processorLine" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "processorNumber" TEXT NOT NULL,
    "coresThreads" TEXT NOT NULL,
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
    "benchmarks" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gpu" (
    "id" TEXT NOT NULL,
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
    "specs" JSONB NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motherboard" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "publishImmediately" BOOLEAN NOT NULL DEFAULT true,
    "specs" JSONB NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motherboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ram" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "specs" JSONB NOT NULL,
    "extraSpecs" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "specs" JSONB NOT NULL,
    "extraSpecs" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "specs" JSONB NOT NULL,
    "extraSpecs" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Psu" (
    "id" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "specs" JSONB NOT NULL,
    "extraSpecs" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Psu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooling" (
    "id" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ActiveStatus" NOT NULL DEFAULT 'active',
    "specs" JSONB NOT NULL,
    "extraSpecs" JSONB NOT NULL DEFAULT '[]',
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cooling_pkey" PRIMARY KEY ("id")
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
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesktopPc_pkey" PRIMARY KEY ("id")
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
    "components" JSONB NOT NULL,
    "extraParts" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL DEFAULT '',
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoSet_pkey" PRIMARY KEY ("id")
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
    "components" JSONB NOT NULL,
    "prices" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBuild_pkey" PRIMARY KEY ("id")
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
    "roleHistory" JSONB NOT NULL DEFAULT '[]',
    "loginHistory" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "PromoSet_code_key" ON "PromoSet"("code");

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
CREATE UNIQUE INDEX "AdminAccount_email_key" ON "AdminAccount"("email");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
