/*
  Warnings:

  - Added the required column `releaseDate` to the `Books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "releaseDate" TIMESTAMP(3) NOT NULL;
