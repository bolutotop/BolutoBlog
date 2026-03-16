/*
  Warnings:

  - You are about to drop the `_PostTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN "category" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PostTags";
PRAGMA foreign_keys=on;
