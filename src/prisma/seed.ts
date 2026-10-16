import "temporal-polyfill/full/global";
import { db } from "./db";

async function main() {
    await db.orm.public.UserCertification.where({}).deleteAll();
    await db.orm.public.UserEducation.where({}).deleteAll();
    await db.orm.public.UserExperience.where({}).deleteAll();
    await db.orm.public.UserSkill.where({}).deleteAll();
    await db.orm.public.UserCV.where({}).deleteAll();
    await db.orm.public.UserProfile.where({}).deleteAll();
    await db.orm.public.User.where({}).deleteAll();

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
        ].map((user) => db.orm.public.User.create(user)),
    );

    await Promise.all([
        db.orm.public.UserProfile.create({
            userId: alex.id,
            cvEmail: alex.email,
            title: "Senior software engineer",
            position: "Backend engineer",
            yearsExp: 8,
            githubUrl: "https://github.com/alex-morgan",
            linkedinUrl: "https://www.linkedin.com/in/alex-morgan",
            bio: "Builds reliable APIs and distributed systems.",
        }),
        db.orm.public.UserProfile.create({
            userId: maya.id,
            cvEmail: maya.email,
            title: "Product designer",
            position: "UX/UI designer",
            yearsExp: 3,
        }),
    ]);

    await Promise.all([
        db.orm.public.UserCV.create({
            userId: alex.id,
            fileUrl: "https://example.com/cvs/alex-morgan.pdf",
            fileName: "alex-morgan-resume.pdf",
            fileSize: 248_320,
            parsedAt: Temporal.Instant.from("2026-01-15T10:00:00.000Z"),
        }),
        db.orm.public.UserCV.create({
            userId: maya.id,
            fileUrl: "https://example.com/cvs/maya-chen.docx",
            fileName: "maya-chen-resume.docx",
            fileSize: 91_648,
        }),
    ]);

    await Promise.all([
        db.orm.public.UserSkill.create({
            userId: alex.id,
            skillName: "TypeScript",
            proficiency: "Expert",
            yearsExp: 7,
        }),
        db.orm.public.UserSkill.create({
            userId: alex.id,
            skillName: "PostgreSQL",
            proficiency: "Advanced",
            yearsExp: 6,
        }),
        db.orm.public.UserSkill.create({
            userId: maya.id,
            skillName: "Figma",
            proficiency: "Advanced",
            yearsExp: 3,
        }),
        db.orm.public.UserSkill.create({
            userId: sam.id,
            skillName: "Python",
            proficiency: "Beginner",
            yearsExp: 1,
        }),
    ]);

    await Promise.all([
        db.orm.public.UserExperience.create({
            userId: alex.id,
            jobTitle: "Senior Software Engineer",
            companyName: "Northstar Labs",
            startDate: Temporal.Instant.from("2022-04-01T00:00:00.000Z"),
            isCurrent: true,
            description: "Leads backend development for a SaaS platform.",
        }),
        db.orm.public.UserExperience.create({
            userId: alex.id,
            jobTitle: "Software Engineer",
            companyName: "Bright Systems",
            startDate: Temporal.Instant.from("2018-06-01T00:00:00.000Z"),
            endDate: Temporal.Instant.from("2022-03-31T00:00:00.000Z"),
            isCurrent: false,
            description: "Built APIs and automated deployment workflows.",
        }),
        db.orm.public.UserExperience.create({
            userId: maya.id,
            jobTitle: "UX Designer",
            companyName: "Studio Finch",
            startDate: Temporal.Instant.from("2023-02-01T00:00:00.000Z"),
            endDate: Temporal.Instant.from("2025-08-31T00:00:00.000Z"),
            isCurrent: false,
            description: "Designed and tested web application experiences.",
        }),
        db.orm.public.UserExperience.create({
            userId: sam.id,
            jobTitle: "Junior Developer Intern",
            companyName: "Community Tech Hub",
            isCurrent: false,
            description: "Completed a short project-based internship.",
        }),
    ]);

    await Promise.all([
        db.orm.public.UserEducation.create({
            userId: alex.id,
            degree: "Master of Science",
            fieldOfStudy: "Computer Science",
            institution: "University of Washington",
            description: "Distributed systems concentration.",
            gradDate: Temporal.Instant.from("2018-05-20T00:00:00.000Z"),
        }),
        db.orm.public.UserEducation.create({
            userId: maya.id,
            degree: "Bachelor of Design",
            fieldOfStudy: "Interaction Design",
            institution: "Emily Carr University",
            gradDate: Temporal.Instant.from("2022-06-15T00:00:00.000Z"),
        }),
        db.orm.public.UserEducation.create({
            userId: sam.id,
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            institution: "University of Toronto",
        }),
    ]);

    await Promise.all([
        db.orm.public.UserCertification.create({
            userId: alex.id,
            certName: "AWS Certified Solutions Architect - Associate",
            issuer: "Amazon Web Services",
            issuedAt: Temporal.Instant.from("2024-09-10T00:00:00.000Z"),
        }),
        db.orm.public.UserCertification.create({
            userId: maya.id,
            certName: "Professional Scrum Master I",
            issuer: "Scrum.org",
        }),
    ]);
}


main().then(async () => {
    console.log("seeding completed successfully");
}).catch(async (e) => {
    console.log(e);
    process.exit(1);
}).finally(async () => {
    await db.close();
});