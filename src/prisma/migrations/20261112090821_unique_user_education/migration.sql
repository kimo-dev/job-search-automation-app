/*
  Warnings:

  - A unique constraint covering the columns `[userId,degree,fieldOfStudy,institution,gradDate]` on the table `UserEducation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserEducation_userId_degree_fieldOfStudy_institution_gradDa_key" ON "UserEducation"("userId", "degree", "fieldOfStudy", "institution", "gradDate") NULLS NOT DISTINCT;