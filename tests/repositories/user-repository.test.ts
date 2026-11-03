import { NotFoundException } from "@/exceptions/notFoundException";
import { UserProfile } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        userProfile: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));


describe("User repository test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("profile repository", () => {
        it("should find the profile by userId and return the profile", async () => {
            const mockedUserId = "42b4cef5-8349-4786-bccf-a4ac3ad8da2e";
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
            (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockedReturnedProfile);

            const result  = await  UserRepository.findProfileById(mockedUserId);
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
            
            (prisma.userProfile.update as jest.Mock).mockResolvedValue(mockedReturnedProfile);

            const result = await UserRepository.updateProfile(mockedUserId, mockedProfileData);
            expect(result).toEqual(mockedReturnedProfile);
            expect(prisma.userProfile.update).toHaveBeenCalledWith({
                where: { userId: mockedUserId },
                data: mockedProfileData
            });
        });
    });
});