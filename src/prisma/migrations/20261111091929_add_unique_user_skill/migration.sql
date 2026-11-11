/*
  Warnings:

  - A unique constraint covering the columns `[userId,skillName]` on the table `UserSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillName_key" ON "UserSkill"("userId", "skillName");
