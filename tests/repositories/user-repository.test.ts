import { NotFoundException } from "@/exceptions/notFoundException";
import { Prisma as clientPrisma, UserExperience, UserProfile, UserSkill } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";
import { createSkillSchema, createUserExperienceSchema, updateSkillSchema } from "@/types/user";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        userProfile: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        userSkill: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userExperience: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    },
}));


describe("User repository test", () => {
    const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
    const mockedSkillId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
    const prismaError = new clientPrisma.PrismaClientKnownRequestError(
        "Record not found",
        {
            code: "P2025",
            clientVersion: "test"
        }
    );
    const mockedUpdateSkillSchema: updateSkillSchema = {
        proficiency: "expert",
        years_exp: 5
    }
    const mockedReturnedSkill: UserSkill = {
        id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        skillName: "JavaScript",
        proficiency: "expert",
        yearsExp: 5,
        createdAt: new Date("2026-10-19T21:08:32.275Z"),
        updatedAt: new Date("2026-10-19T21:08:32.275Z")
    };
    const mockedReturnedProfile: UserProfile = {
        id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        cvEmail: "john.doe@example.com",
        title: "Software Engineer",
        position: "Frontend Developer",
        bio: "Passionate about building user-friendly web applications.",
        yearsExp: 5,
        githubUrl: "https://github.com/johndoe",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        createdAt: new Date("2026-10-19T21:08:32.275Z"),
        updatedAt: new Date("2026-10-19T21:08:32.275Z")
    };
    const mockedProfileData = {
        title: "Senior Software Engineer",
        position: "Backend Developer",
        bio: "Experienced in building scalable backend systems.",
        yearsExp: 7,
        githubUrl: "https://github.com/johndoe",
        linkedinUrl: "https://linkedin.com/in/johndoe"
    };

    const mockedReturnedUserExperience: UserExperience = {
        id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        jobTitle: "Senior Software Engineer",
        companyName: "expert",
        startDate: new Date("2026-10-19T21:08:32.275Z"),
        endDate: new Date("2026-10-19T21:08:32.275Z"),
        description: "Passionate about building user-friendly web applications.",
        isCurrent: true,
        createdAt: new Date("2026-10-19T21:08:32.275Z"),
        updatedAt: new Date("2026-10-19T21:08:32.275Z")
    };

    const mockedCreateExperienceSchema: createUserExperienceSchema = {
        job_title: "Senior Software Engineer",
        company_name: "expert",
        start_date: new Date("2026-10-19T21:08:32.275Z"),
        end_date: new Date("2026-10-19T21:08:32.275Z"),
        description: "Passionate about building user-friendly web applications.",
        is_current: true
    };
    const mockedExperienceId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";


    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("profile repository", () => {
        it("should find the profile by userId and return the profile", async () => {

            (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockedReturnedProfile);

            const result = await UserRepository.findProfileById(mockedUserId);
            expect(result).toEqual(mockedReturnedProfile);
            expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
        });
        it("should throw NotFoundException if the profile does not exist", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";

            (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(UserRepository.findProfileById(mockedUserId)).rejects.toThrow(NotFoundException);
            expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
        });
        it("should update the profile and return the updated profile", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";



            (prisma.userProfile.update as jest.Mock).mockResolvedValue(mockedReturnedProfile);

            const result = await UserRepository.updateProfile(mockedUserId, mockedProfileData);
            expect(result).toEqual(mockedReturnedProfile);
            expect(prisma.userProfile.update).toHaveBeenCalledWith({
                where: { userId: mockedUserId },
                data: mockedProfileData
            });
        });
        it("should throw not found exception if prisma return P2025 error", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            (prisma.userProfile.update as jest.Mock).mockRejectedValue(prismaError);

            await expect(UserRepository.updateProfile(mockedUserId, mockedProfileData)).rejects.toThrow(NotFoundException);
            expect(prisma.userProfile.update).toHaveBeenCalledWith({
                where: { userId: mockedUserId },
                data: {
                    title: mockedProfileData.title,
                    position: mockedProfileData.position,
                    bio: mockedProfileData.bio,
                    yearsExp: mockedProfileData.yearsExp,
                    githubUrl: mockedProfileData.githubUrl,
                    linkedinUrl: mockedProfileData.linkedinUrl
                }
            });
        });
    });
    describe("User skills repository function  test", () => {
        it("should get all skills for a user", async () => {
            const mockedSkills: UserSkill[] = [
                {
                    id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    skillName: "JavaScript",
                    proficiency: "expert",
                    yearsExp: 5,
                    createdAt: new Date("2026-10-19T21:08:32.275Z"),
                    updatedAt: new Date("2026-10-19T21:08:32.275Z")
                }
            ];
            (prisma.userSkill.findMany as jest.Mock).mockResolvedValue(mockedSkills);

            const result = await UserRepository.getAllSkills(mockedUserId);
            expect(result).toEqual(mockedSkills);
            expect(prisma.userSkill.findMany).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
        });
        it("should create a new sill and return the created skill", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedCreateSkillSchema: createSkillSchema = {
                skill_name: "JavaScript",
                proficiency: "expert",
                years_exp: 5
            };
            (prisma.userSkill.create as jest.Mock).mockResolvedValue(mockedReturnedSkill);
            const result = await UserRepository.createSkill("42b4cef5-8349-4786-bccf-a4ac3ad8da2e", mockedCreateSkillSchema);

            expect(result).toEqual(mockedReturnedSkill);
            expect(prisma.userSkill.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    skillName: mockedCreateSkillSchema.skill_name,
                    proficiency: mockedCreateSkillSchema.proficiency ?? "beginner",
                    yearsExp: mockedCreateSkillSchema.years_exp ?? 0
                }
            });
        });
        it("should update the skill and return the updated skill", async () => {

            (prisma.userSkill.update as jest.Mock).mockResolvedValue(mockedReturnedSkill);

            const result = await UserRepository.updateSkill(mockedUserId, mockedSkillId, mockedUpdateSkillSchema);
            expect(result).toEqual(mockedReturnedSkill);
            expect(prisma.userSkill.update).toHaveBeenCalledWith({
                where: { id: mockedSkillId, userId: mockedUserId },
                data: {
                    proficiency: mockedUpdateSkillSchema.proficiency,
                    yearsExp: mockedUpdateSkillSchema.years_exp,
                }
            });
        });
        it("should throw not found exception if prisma return P2025 error", async () => {
            (prisma.userSkill.update as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.updateSkill(mockedUserId, mockedSkillId, mockedUpdateSkillSchema)).rejects.toThrow(NotFoundException);
            expect(prisma.userSkill.update).toHaveBeenCalledWith({
                where: { id: mockedSkillId, userId: mockedUserId },
                data: {
                    proficiency: mockedUpdateSkillSchema.proficiency,
                    yearsExp: mockedUpdateSkillSchema.years_exp,
                }
            });
        });
        it("should delete the skill", async () => {
            (prisma.userSkill.delete as jest.Mock).mockResolvedValue(undefined);
            const result = await UserRepository.deleteSkill(mockedUserId, mockedSkillId);
            expect(result).toBeUndefined();
            expect(prisma.userSkill.delete).toHaveBeenCalledWith({
                where: { id: mockedSkillId, userId: mockedUserId }
            });
        });
        it("should throw not found exception if prisma return P2025 error", async () => {
            (prisma.userSkill.delete as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.deleteSkill(mockedUserId, mockedSkillId)).rejects.toThrow(NotFoundException);
            expect(prisma.userSkill.delete).toHaveBeenCalledWith({
                where: { id: mockedSkillId, userId: mockedUserId }
            });
        });
    });
    describe("User experience repository function test", () => {
        it("should get all experiences for a user", async () => {
            const mockedUserExperiences: UserExperience[] = [
                {
                    id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    jobTitle: "Senior Software Engineer",
                    companyName: "expert",
                    startDate: new Date("2026-10-19T21:08:32.275Z"),
                    endDate: new Date("2026-10-19T21:08:32.275Z"),
                    isCurrent: true,
                    description: "Passionate about building user-friendly web applications.",
                    createdAt: new Date("2026-10-19T21:08:32.275Z"),
                    updatedAt: new Date("2026-10-19T21:08:32.275Z")
                }
            ];
            (prisma.userExperience.findMany as jest.Mock).mockResolvedValue(mockedUserExperiences);

            const result = await UserRepository.getAllUsersExperiences(mockedUserId);
            expect(result).toEqual(mockedUserExperiences);
            expect(prisma.userExperience.findMany).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
        });
        it("should create a new User experience and return the created experience", async () => {

            (prisma.userExperience.create as jest.Mock).mockResolvedValue(mockedReturnedUserExperience);
            const result = await UserRepository.createUserExperience(mockedUserId, mockedCreateExperienceSchema);

            expect(result).toEqual(mockedReturnedUserExperience);
            expect(prisma.userExperience.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    jobTitle: mockedCreateExperienceSchema.job_title,
                    companyName: mockedCreateExperienceSchema.company_name,
                    startDate: mockedCreateExperienceSchema.start_date,
                    endDate: mockedCreateExperienceSchema.end_date,
                    isCurrent: mockedCreateExperienceSchema.is_current,
                    description: mockedCreateExperienceSchema.description
                }
            });
        });



        it("should update the user experience and return the updated experience", async () => {

            (prisma.userExperience.update as jest.Mock).mockResolvedValue(mockedReturnedUserExperience);

            const result = await UserRepository.updateUserExperience(mockedUserId, mockedExperienceId, mockedCreateExperienceSchema);
            expect(result).toEqual(mockedReturnedUserExperience);
            expect(prisma.userExperience.update).toHaveBeenCalledWith({
                where: { id: mockedExperienceId, userId: mockedUserId },
                data: {
                    jobTitle: mockedCreateExperienceSchema.job_title,
                    companyName: mockedCreateExperienceSchema.company_name,
                    startDate: mockedCreateExperienceSchema.start_date,
                    endDate: mockedCreateExperienceSchema.end_date,
                    description: mockedCreateExperienceSchema.description,
                    isCurrent: mockedCreateExperienceSchema.is_current ?? false
                }
            });
        });
        it("should throw not found exception if prisma return P2025 error", async () => {
            (prisma.userExperience.update as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.updateUserExperience(mockedUserId, mockedExperienceId, mockedCreateExperienceSchema)).rejects.toThrow(NotFoundException);
            expect(prisma.userExperience.update).toHaveBeenCalledWith({
                where: { id: mockedExperienceId, userId: mockedUserId },
                data: {
                    jobTitle: mockedCreateExperienceSchema.job_title,
                    companyName: mockedCreateExperienceSchema.company_name,
                    startDate: mockedCreateExperienceSchema.start_date,
                    endDate: mockedCreateExperienceSchema.end_date,
                    description: mockedCreateExperienceSchema.description,
                    isCurrent: mockedCreateExperienceSchema.is_current ?? false
                }
            });
        });
        it("should delete the user experience", async () => {
            (prisma.userExperience.delete as jest.Mock).mockResolvedValue(undefined);
            const result = await UserRepository.deleteUserExperience(mockedUserId, mockedExperienceId);
            expect(result).toBeUndefined();
            expect(prisma.userExperience.delete).toHaveBeenCalledWith({
                where: { id: mockedExperienceId, userId: mockedUserId }
            });
        });
        it("should throw not found exception if prisma return P2025 error", async () => {
            (prisma.userExperience.delete as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.deleteUserExperience(mockedUserId, mockedSkillId)).rejects.toThrow(NotFoundException);
            expect(prisma.userExperience.delete).toHaveBeenCalledWith({
                where: { id: mockedExperienceId, userId: mockedUserId }
            });
        });
    });
});