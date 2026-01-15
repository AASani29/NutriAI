-- DropIndex
DROP INDEX "FoodListing_inventoryItemId_key";

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cuisine" TEXT,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "servings" INTEGER,
    "ingredients" JSONB NOT NULL,
    "instructions" JSONB NOT NULL,
    "nutrition" JSONB,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'AI_SCOUT',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_name_idx" ON "Recipe"("name");
