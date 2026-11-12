/*
  Warnings:

  - A unique constraint covering the columns `[userId,certName,issuer,issuedAt]` on the table `UserCertification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserCertification_userId_certName_issuer_issuedAt_key" ON "UserCertification"("userId", "certName", "issuer", "issuedAt") NULLS NOT DISTINCT;
