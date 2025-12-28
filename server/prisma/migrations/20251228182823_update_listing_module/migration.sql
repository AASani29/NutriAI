/*
  Warnings:

  - You are about to drop the column `actionRequired` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `dismissedAt` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `isDismissed` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `recommendation` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `riskScore` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `weatherHumidity` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `weatherLocation` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the column `weatherTemp` on the `FoodSafetyAlert` table. All the data in the column will be lost.
  - You are about to drop the `WeatherData` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tag]` on the table `ResourceTag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ConsumptionLog" DROP CONSTRAINT "ConsumptionLog_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "FoodSafetyAlert" DROP CONSTRAINT "FoodSafetyAlert_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "FoodSafetyAlert" DROP CONSTRAINT "FoodSafetyAlert_userId_fkey";

-- DropIndex
DROP INDEX "FoodListing_inventoryItemId_key";

-- DropIndex
DROP INDEX "FoodSafetyAlert_createdAt_idx";

-- DropIndex
DROP INDEX "FoodSafetyAlert_inventoryItemId_idx";

-- DropIndex
DROP INDEX "FoodSafetyAlert_isDismissed_idx";

-- DropIndex
DROP INDEX "FoodSafetyAlert_userId_idx";

-- AlterTable
ALTER TABLE "ConsumptionLog" ADD COLUMN     "calories" DOUBLE PRECISION,
ADD COLUMN     "carbohydrates" DOUBLE PRECISION,
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "fiber" DOUBLE PRECISION,
ADD COLUMN     "protein" DOUBLE PRECISION,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "sugar" DOUBLE PRECISION,
ALTER COLUMN "inventoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "nutritionBasis" DOUBLE PRECISION,
ADD COLUMN     "nutritionPerUnit" JSONB,
ADD COLUMN     "nutritionUnit" TEXT;

-- AlterTable
ALTER TABLE "FoodSafetyAlert" DROP COLUMN "actionRequired",
DROP COLUMN "dismissedAt",
DROP COLUMN "expiresAt",
DROP COLUMN "isDismissed",
DROP COLUMN "recommendation",
DROP COLUMN "riskScore",
DROP COLUMN "userId",
DROP COLUMN "weatherHumidity",
DROP COLUMN "weatherLocation",
DROP COLUMN "weatherTemp",
ADD COLUMN     "foodItemId" TEXT,
ADD COLUMN     "isResolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ALTER COLUMN "inventoryItemId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "healthConditions" TEXT;

-- DropTable
DROP TABLE "WeatherData";

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTag_tag_key" ON "ResourceTag"("tag");

-- AddForeignKey
ALTER TABLE "ConsumptionLog" ADD CONSTRAINT "ConsumptionLog_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSafetyAlert" ADD CONSTRAINT "FoodSafetyAlert_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSafetyAlert" ADD CONSTRAINT "FoodSafetyAlert_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
