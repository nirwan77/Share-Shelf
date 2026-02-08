/*
  Warnings:

  - Added the required column `rating` to the `UserBookReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBookReview" ADD COLUMN     "rating" INTEGER NOT NULL;
