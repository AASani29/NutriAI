-- CreateTable
CREATE TABLE "WeatherData" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodSafetyAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT,
    "actionRequired" TEXT,
    "riskScore" INTEGER NOT NULL,
    "weatherTemp" DOUBLE PRECISION,
    "weatherHumidity" DOUBLE PRECISION,
    "weatherLocation" TEXT,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FoodSafetyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherData_location_idx" ON "WeatherData"("location");

-- CreateIndex
CREATE INDEX "WeatherData_expiresAt_idx" ON "WeatherData"("expiresAt");

-- CreateIndex
CREATE INDEX "FoodSafetyAlert_userId_idx" ON "FoodSafetyAlert"("userId");

-- CreateIndex
CREATE INDEX "FoodSafetyAlert_inventoryItemId_idx" ON "FoodSafetyAlert"("inventoryItemId");

-- CreateIndex
CREATE INDEX "FoodSafetyAlert_isDismissed_idx" ON "FoodSafetyAlert"("isDismissed");

-- CreateIndex
CREATE INDEX "FoodSafetyAlert_createdAt_idx" ON "FoodSafetyAlert"("createdAt");

-- AddForeignKey
ALTER TABLE "FoodSafetyAlert" ADD CONSTRAINT "FoodSafetyAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSafetyAlert" ADD CONSTRAINT "FoodSafetyAlert_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
