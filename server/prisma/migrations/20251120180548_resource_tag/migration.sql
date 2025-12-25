/*
  Warnings:

  - Added the required column `type` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('Article', 'Video');

-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "type" "ResourceType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ResourceTag" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ResourceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceTagOnResource" (
    "resourceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceTagOnResource_pkey" PRIMARY KEY ("resourceId","tagId")
);

-- AddForeignKey
ALTER TABLE "ResourceTagOnResource" ADD CONSTRAINT "ResourceTagOnResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTagOnResource" ADD CONSTRAINT "ResourceTagOnResource_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ResourceTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
