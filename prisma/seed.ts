import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;

export const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString })
});

async function main() {
  await prisma.userCertification.deleteMany();
  await prisma.userEducation.deleteMany();
  await prisma.userExperience.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userCV.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash =
    "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225";

  const [alex, maya, sam] = await Promise.all(
    [
      {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@example.com",
        password: passwordHash,
        role: "ADMIN",
        isVerified: true,
      },
      {
        firstName: "Maya",
        lastName: "Chen",
        email: "maya.chen@example.com",
        password: passwordHash,
        role: "USER",
        isVerified: true,
      },
      {
        firstName: "Sam",
        lastName: "Patel",
        email: "sam.patel@example.com",
        password: passwordHash,
        role: "USER",
        isVerified: false,
      },
    ].map((user) =>
      prisma.user.create({
        data: user,
      })
    )
  );

  await Promise.all([
    prisma.userProfile.create({
      data: {
        userId: alex.id,
        cvEmail: alex.email,
        title: "Senior software engineer",
        position: "Backend engineer",
        yearsExp: 8,
        githubUrl: "https://github.com/alex-morgan",
        linkedinUrl: "https://www.linkedin.com/in/alex-morgan",
        bio: "Builds reliable APIs and distributed systems.",
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: maya.id,
        cvEmail: maya.email,
        title: "Product designer",
        position: "UX/UI designer",
        yearsExp: 3,
      },
    }),
  ]);

  await Promise.all([
    prisma.userCV.create({
      data: {
        userId: alex.id,
        fileUrl: "https://example.com/cvs/alex-morgan.pdf",
        fileName: "alex-morgan-resume.pdf",
        fileSize: 248_320,
        parsedAt: new Date("2026-01-15T10:00:00.000Z"),
      },
    }),
    prisma.userCV.create({
      data: {
        userId: maya.id,
        fileUrl: "https://example.com/cvs/maya-chen.docx",
        fileName: "maya-chen-resume.docx",
        fileSize: 91_648,
      },
    }),
  ]);

  await Promise.all([
    prisma.userSkill.create({
      data: {
        userId: alex.id,
        skillName: "TypeScript",
        proficiency: "Expert",
        yearsExp: 7,
      },
    }),
    prisma.userSkill.create({
      data: {
        userId: alex.id,
        skillName: "PostgreSQL",
        proficiency: "Advanced",
        yearsExp: 6,
      },
    }),
    prisma.userSkill.create({
      data: {
        userId: maya.id,
        skillName: "Figma",
        proficiency: "Advanced",
        yearsExp: 3,
      },
    }),
    prisma.userSkill.create({
      data: {
        userId: sam.id,
        skillName: "Python",
        proficiency: "Beginner",
        yearsExp: 1,
      },
    }),
  ]);

  await Promise.all([
    prisma.userExperience.create({
      data: {
        userId: alex.id,
        jobTitle: "Senior Software Engineer",
        companyName: "Northstar Labs",
        startDate: new Date("2022-04-01T00:00:00.000Z"),
        isCurrent: true,
        description: "Leads backend development for a SaaS platform.",
      },
    }),
    prisma.userExperience.create({
      data: {
        userId: alex.id,
        jobTitle: "Software Engineer",
        companyName: "Bright Systems",
        startDate: new Date("2018-06-01T00:00:00.000Z"),
        endDate: new Date("2022-03-31T00:00:00.000Z"),
        isCurrent: false,
        description: "Built APIs and automated deployment workflows.",
      },
    }),
    prisma.userExperience.create({
      data: {
        userId: maya.id,
        jobTitle: "UX Designer",
        companyName: "Studio Finch",
        startDate: new Date("2023-02-01T00:00:00.000Z"),
        endDate: new Date("2025-08-31T00:00:00.000Z"),
        isCurrent: false,
        description: "Designed and tested web application experiences.",
      },
    }),
    prisma.userExperience.create({
      data: {
        userId: sam.id,
        jobTitle: "Junior Developer Intern",
        companyName: "Community Tech Hub",
        isCurrent: false,
        description: "Completed a short project-based internship.",
      },
    }),
  ]);

  await Promise.all([
    prisma.userEducation.create({
      data: {
        userId: alex.id,
        degree: "Master of Science",
        fieldOfStudy: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        gradDate: new Date("2018-05-20T00:00:00.000Z"),
      },
    }),
    prisma.userEducation.create({
      data: {
        userId: maya.id,
        degree: "Bachelor of Design",
        fieldOfStudy: "Interaction Design",
        institution: "Emily Carr University",
        gradDate: new Date("2022-06-15T00:00:00.000Z"),
      },
    }),
    prisma.userEducation.create({
      data: {
        userId: sam.id,
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        institution: "University of Toronto",
      },
    }),
  ]);

  await Promise.all([
    prisma.userCertification.create({
      data: {
        userId: alex.id,
        certName: "AWS Certified Solutions Architect - Associate",
        issuer: "Amazon Web Services",
        issuedAt: new Date("2024-09-10T00:00:00.000Z"),
      },
    }),
    prisma.userCertification.create({
      data: {
        userId: maya.id,
        certName: "Professional Scrum Master I",
        issuer: "Scrum.org",
      },
    }),
  ]);
}

main()
  .then(() => {
    console.log("seeding completed successfully");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });