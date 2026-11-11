import { AlreadyExistsException } from "@/exceptions/AlreadyExistException";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";
import { UserService } from "@/services/user-service";
import { createSkillSchema, createUserExperienceSchema, updateSkillSchema } from "@/types/user";

jest.mock("@/repository/user-repository", () => ({
    UserRepository: {
        findProfileById: jest.fn(),
        updateProfile: jest.fn(),
        getAllSkills: jest.fn(),
        createSkill: jest.fn(),
        updateSkill: jest.fn(),
        deleteSkill: jest.fn(),
        getAllUsersExperiences: jest.fn(),
        createUserExperience: jest.fn(),
        updateUserExperience: jest.fn(),
        deleteUserExperience: jest.fn(),
    }
}));

jest.mock("@/lib/prisma", () => ({
    prisma: {
        userSkill: {
            findFirst: jest.fn(),
        },
        userExperience: {
            findFirst: jest.fn(),
        },
    },
}));


describe("user service test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("user profile test", () => {
        it("should call UserRepository.findProfileById and return the user profile", async () => {
            const mockedProfile = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                cvEmail: "john.doe@example.com",
                title: "Software Engineer",
                position: "Frontend Developer",
                yearsExp: 5,
                githubUrl: "https://github.com/johndoe",
                linkedinUrl: "https://linkedin.com/in/johndoe",
                bio: "Passionate about building web applications.",
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
                updatedAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (UserRepository.findProfileById as jest.Mock).mockResolvedValue(mockedProfile);

            const result = await UserService.getProfile(mockedProfile.userId);

            expect(UserRepository.findProfileById).toHaveBeenCalledWith(mockedProfile.userId);
            expect(result).toEqual(mockedProfile);
        });
        it("should call UserRepository.updateProfile and return the updated user profile", async () => {
            const mockedProfile = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                cvEmail: "john.doe@example.com",
                title: "Software Engineer",
                position: "Frontend Developer",
                yearsExp: 5,
                githubUrl: "https://github.com/johndoe",
                linkedinUrl: "https://linkedin.com/in/johndoe",
                bio: "Passionate about building web applications.",
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
                updatedAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (UserRepository.updateProfile as jest.Mock).mockResolvedValue(mockedProfile);

            const result = await UserService.updateProfile(mockedProfile.userId, mockedProfile);

            expect(UserRepository.updateProfile).toHaveBeenCalledWith(mockedProfile.userId, mockedProfile);
            expect(result).toEqual(mockedProfile);
        });
    });
    describe("user skills test", () => {
        it("should call UserRepository.getAllSkills and return the user skills", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedSkills = [
                {
                    id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    skillName: "JavaScript",
                    proficiency: "advanced",
                    yearsExp: 5,
                    createdAt: new Date("2026-10-19T21:08:32.275Z"),
                    updatedAt: new Date("2026-10-19T21:08:32.275Z"),
                },
                {
                    id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    skillName: "TypeScript",
                    proficiency: "intermediate",
                    yearsExp: 3,
                    createdAt: new Date("2026-10-19T21:08:32.275Z"),
                    updatedAt: new Date("2026-10-19T21:08:32.275Z"),
                }
            ];

            (UserRepository.getAllSkills as jest.Mock).mockResolvedValue(mockedSkills);

            const result = await UserService.getAllSkills(mockedUserId);

            expect(UserRepository.getAllSkills).toHaveBeenCalledWith(mockedUserId);
            expect(result).toEqual(mockedSkills);
        });
        it("should call UserRepository.createSkill and return the created skill", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const createSkillMockedData: createSkillSchema = {
                skill_name: "JavaScript",
                proficiency: "advanced",
                years_exp: 5
            }
            const mockedReturnSkill = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                skillName: "JavaScript",
                proficiency: "advanced",
                yearsExp: 5,
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
                updatedAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (prisma.userSkill.findFirst as jest.Mock).mockResolvedValue(null);

            (UserRepository.createSkill as jest.Mock).mockResolvedValue(mockedReturnSkill);

            const result = await UserService.addSkill(mockedUserId, createSkillMockedData);

            expect(UserRepository.createSkill).toHaveBeenCalledWith(mockedUserId, createSkillMockedData);
            expect(prisma.userSkill.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: mockedUserId,
                    skillName: createSkillMockedData.skill_name
                }
            });
            expect(result).toEqual(mockedReturnSkill);
        });
        it("should throw AlreadyExistsException when skill already exists", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const createSkillMockedData: createSkillSchema = {
                skill_name: "JavaScript",
                proficiency: "advanced",
                years_exp: 5
            };
            const mockedExistingSkill = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: mockedUserId,
                skillName: "JavaScript",
                proficiency: "advanced",
                yearsExp: 5,
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
                updatedAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (prisma.userSkill.findFirst as jest.Mock).mockResolvedValue(mockedExistingSkill);

            await expect(UserService.addSkill(mockedUserId, createSkillMockedData)).rejects.toThrow(AlreadyExistsException);
            expect(UserRepository.createSkill).not.toHaveBeenCalled();
        });
        it("should call UserRepository.updateSkill and return the updated skill", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedSkillId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const updateSkillMockedData: updateSkillSchema = {
                proficiency: "advanced",
                years_exp: 5
            };
            const mockedUpdatedSkill = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: mockedUserId,
                skillName: "JavaScript",
                proficiency: "advanced",
                yearsExp: 5,
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
                updatedAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (UserRepository.updateSkill as jest.Mock).mockResolvedValue(mockedUpdatedSkill);

            const result = await UserService.updateSkill(mockedUserId,mockedSkillId, updateSkillMockedData);

            expect(UserRepository.updateSkill).toHaveBeenCalledWith(mockedUserId, mockedSkillId, updateSkillMockedData);
            expect(result).toEqual(mockedUpdatedSkill);
        });
        it("should call UserRepository.deleteSkill and return void", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedSkillId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";

            (UserRepository.deleteSkill as jest.Mock).mockResolvedValue(undefined);

            const result = await UserService.deleteSkill(mockedUserId, mockedSkillId);

            expect(UserRepository.deleteSkill).toHaveBeenCalledWith(mockedUserId, mockedSkillId);
            expect(result).toBeUndefined();
        });
    });
    describe("user experiences test", () => {
        it("should call UserRepository.getAllUsersExperiences and return the user experiences", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedExperiences = [
                {
                    id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                    userId: mockedUserId,
                    title: "Software Engineer",
                    company: "Tech Corp",
                    description: "Developed web applications using JavaScript and React.",
                    startDate: new Date("2020-01-01"),
                    endDate: new Date("2023-01-01"),
                    createdAt: new Date("2023-01-01T00:00:00.000Z"),
                    updatedAt: new Date("2023-01-01T00:00:00.000Z")
                }
            ];

            (UserRepository.getAllUsersExperiences as jest.Mock).mockResolvedValue(mockedExperiences);

            const result = await UserService.getAllUsersExperiences(mockedUserId);

            expect(UserRepository.getAllUsersExperiences).toHaveBeenCalledWith(mockedUserId);
            expect(result).toEqual(mockedExperiences);
        });
        it("should call UserRepository.createUserExperience and return the created user experience", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const createExperienceMockedData : createUserExperienceSchema = {
                job_title: "Software Engineer",
                company_name: "Tech Corp",
                description: "Developed web applications using JavaScript and React.",
                start_date: new Date("2020-01-01"),
                end_date: new Date("2023-01-01"),
                is_current: false,
            };
            const mockedCreatedExperience = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: mockedUserId,
                jobTitle: "Software Engineer",
                companyName: "Tech Corp",
                description: "Developed web applications using JavaScript and React.",
                startDate: new Date("2020-01-01"),
                endDate: new Date("2023-01-01"),
                isCurrent: false,
                createdAt: new Date("2023-01-01T00:00:00.000Z"),
                updatedAt: new Date("2023-01-01T00:00:00.000Z")
            };
            (prisma.userExperience.findFirst as jest.Mock).mockResolvedValue(null);
            (UserRepository.createUserExperience as jest.Mock).mockResolvedValue(mockedCreatedExperience);

            const result = await UserService.addUserExperience(mockedUserId, createExperienceMockedData);

            expect(UserRepository.createUserExperience).toHaveBeenCalledWith(mockedUserId, createExperienceMockedData);
            expect(result).toEqual(mockedCreatedExperience);
        });
        it("should throw AlreadyExistsException when user experience already exists", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const createExperienceMockedData : createUserExperienceSchema = {
                job_title: "Software Engineer",
                company_name: "Tech Corp",
                description: "Developed web applications using JavaScript and React.",
                start_date: new Date("2020-01-01"),
                end_date: new Date("2023-01-01"),
                is_current: false,
            };
            const mockedExistingExperience = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                userId: mockedUserId,
                jobTitle: "Software Engineer",
                companyName: "Tech Corp",
                description: "Developed web applications using JavaScript and React.",
                startDate: new Date("2020-01-01"),
                endDate: new Date("2023-01-01"),
                isCurrent: false,
                createdAt: new Date("2023-01-01T00:00:00.000Z"),
                updatedAt: new Date("2023-01-01T00:00:00.000Z")
            };

            (prisma.userExperience.findFirst as jest.Mock).mockResolvedValue(mockedExistingExperience);

            await expect(UserService.addUserExperience(mockedUserId, createExperienceMockedData)).rejects.toThrow(AlreadyExistsException);
            expect(UserRepository.createUserExperience).not.toHaveBeenCalled();
        });
        it("should call UserRepository.updateUserExperience and return the updated user experience", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedExperienceId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const updateExperienceMockedData : createUserExperienceSchema = {
                job_title: "Senior Software Engineer",
                company_name: "Tech Corp",
                description: "Led development of web applications using JavaScript and React.",
                start_date: new Date("2020-01-01"),
                end_date: new Date("2023-01-01"),
                is_current: false,
            };

            const mockedUpdatedExperience = {
                id: mockedExperienceId,
                userId: mockedUserId,
                jobTitle: "Senior Software Engineer",
                companyName: "Tech Corp",
                description: "Led development of web applications using JavaScript and React.",
                startDate: new Date("2020-01-01"),
                endDate: new Date("2023-01-01"),
                isCurrent: false,
                createdAt: new Date("2023-01-01T00:00:00.000Z"),
                updatedAt: new Date("2023-01-01T00:00:00.000Z")
            };

            (UserRepository.updateUserExperience as jest.Mock).mockResolvedValue(mockedUpdatedExperience);

            const result = await UserService.updateUserExperience(mockedUserId, mockedExperienceId, updateExperienceMockedData);

            expect(UserRepository.updateUserExperience).toHaveBeenCalledWith(mockedUserId, mockedExperienceId, updateExperienceMockedData);
            expect(result).toEqual(mockedUpdatedExperience);
        });
        it("should call UserRepository.deleteUserExperience and return void", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
            const mockedExperienceId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";

            (UserRepository.deleteUserExperience as jest.Mock).mockResolvedValue(undefined);

            const result = await UserService.deleteUserExperience(mockedUserId, mockedExperienceId);

            expect(UserRepository.deleteUserExperience).toHaveBeenCalledWith(mockedUserId, mockedExperienceId);
            expect(result).toBeUndefined();
        });
       
    });
});
