/*
  Warnings:

  - A unique constraint covering the columns `[cvId]` on the table `UserCertification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId]` on the table `UserEducation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId]` on the table `UserExperience` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserCertification" ADD COLUMN     "cvId" TEXT;

-- AlterTable
ALTER TABLE "UserEducation" ADD COLUMN     "cvId" TEXT;

-- AlterTable
ALTER TABLE "UserExperience" ADD COLUMN     "cvId" TEXT;

-- AlterTable
ALTER TABLE "UserSkill" ADD COLUMN     "cvId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserCertification_cvId_key" ON "UserCertification"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEducation_cvId_key" ON "UserEducation"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExperience_cvId_key" ON "UserExperience"("cvId");

-- CreateIndex
CREATE INDEX "UserSkill_cvId_idx" ON "UserSkill"("cvId");

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "UserCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExperience" ADD CONSTRAINT "UserExperience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "UserCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "UserCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCertification" ADD CONSTRAINT "UserCertification_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "UserCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
