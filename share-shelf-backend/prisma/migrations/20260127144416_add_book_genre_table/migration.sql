/*
  Warnings:

  - You are about to drop the column `genre` on the `Books` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('READING', 'PLAN_TO_READ', 'READ');

-- AlterTable
ALTER TABLE "Books" DROP COLUMN "genre";

-- CreateTable
CREATE TABLE "BookGenre" (
    "bookId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "BookGenre_pkey" PRIMARY KEY ("bookId","genreId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBookStatus" (
    "id" TEXT NOT NULL,
    "status" "BookStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "UserBookStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBookReview" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "UserBookReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ratingUserId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- AddForeignKey
ALTER TABLE "BookGenre" ADD CONSTRAINT "BookGenre_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookGenre" ADD CONSTRAINT "BookGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookStatus" ADD CONSTRAINT "UserBookStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookStatus" ADD CONSTRAINT "UserBookStatus_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookReview" ADD CONSTRAINT "UserBookReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookReview" ADD CONSTRAINT "UserBookReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_ratingUserId_fkey" FOREIGN KEY ("ratingUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
