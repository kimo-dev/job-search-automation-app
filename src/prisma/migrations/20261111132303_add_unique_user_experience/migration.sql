/*
  Warnings:

  - A unique constraint covering the columns `[userId,companyName,startDate]` on the table `UserExperience` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserExperience_userId_companyName_startDate_key" ON "UserExperience"("userId", "companyName", "startDate");
