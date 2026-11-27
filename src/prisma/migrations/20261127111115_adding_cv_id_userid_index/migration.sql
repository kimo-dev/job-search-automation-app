/*
  Warnings:

  - A unique constraint covering the columns `[userId,cvId]` on the table `UserCertification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,cvId]` on the table `UserEducation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,cvId]` on the table `UserExperience` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserCertification_cvId_key";

-- DropIndex
DROP INDEX "UserEducation_cvId_key";

-- DropIndex
DROP INDEX "UserExperience_cvId_key";

-- DropIndex
DROP INDEX "UserSkill_cvId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "UserCertification_userId_cvId_key" ON "UserCertification"("userId", "cvId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEducation_userId_cvId_key" ON "UserEducation"("userId", "cvId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExperience_userId_cvId_key" ON "UserExperience"("userId", "cvId");

-- CreateIndex
CREATE INDEX "UserSkill_userId_cvId_idx" ON "UserSkill"("userId", "cvId");
