-- CreateEnum
CREATE TYPE "BanAppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ban_appeals" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "BanAppealStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ban_appeals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ban_appeals_userId_status_createdAt_idx" ON "ban_appeals"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ban_appeals_status_createdAt_idx" ON "ban_appeals"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ban_appeals" ADD CONSTRAINT "ban_appeals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
