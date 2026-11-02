import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { prisma as appPrisma } from "@/lib/prisma";
import { AuthRepository } from "@/repository/auth-repository";
import { EncryptService } from "@/services/encrypt-service";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("@/services/encrypt-service", () => ({
    EncryptService: {
        encrypt: jest.fn()
    }
}));

jest.mock("@/mappers/user-mapper", () => {
    return {
        UserMapper: jest.fn().mockImplementation(() => ({
            map: jest.fn((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }))
        }))
    }
});


describe("Auth repository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("register", () => {
        it("create a user and return a mapped user", async () => {
            const now = new Date("2026-10-19T21:08:32.275Z");
            const mockedUser = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "secret123",
            };

            (EncryptService.encrypt as jest.Mock).mockResolvedValue("hashed-password");

            (appPrisma.user.create as jest.Mock).mockResolvedValue({
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "hashed-password",
                isVerified: false,
                role: Role.USER,
                createdAt: now,
                updatedAt: now
            });
            const result = await AuthRepository.register(mockedUser);

            expect(EncryptService.encrypt).toHaveBeenCalledWith("secret123", 12);
            expect(appPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    password: "hashed-password",
                }
            });
            expect(result).toEqual({
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                role: Role.USER,
                createdAt: now,
            });
        });

        it("should throws Unique constraints fails when email already exist", async () => {
            const mockedUser = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "secret123",
            };

            (EncryptService.encrypt as jest.Mock).mockResolvedValue("hashed-password");
            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                {
                    code: "P2002",
                    clientVersion: "test",
                }
            );
            (appPrisma.user.create as jest.Mock).mockRejectedValue(prismaError);

            await expect(AuthRepository.register(mockedUser)).rejects.toThrow(
                UniqueConstraintException
            );
        });

        it("should throw an error when prisma fail in unexpected way", async () => {
            const mockedUser = {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "secret123",
            };

            (EncryptService.encrypt as jest.Mock).mockResolvedValue("hashed-password");

            (appPrisma.user.create as jest.Mock).mockRejectedValue(new Error("DB failure"));
            await expect(AuthRepository.register(mockedUser)).rejects.toThrow("Failed to create user");
        });

    });

    describe("findUserByEmail", () => {
        it("should find the user and return it", async () => {
            const now = new Date("2026-10-19T21:08:32.275Z");
            const mockedUser = {
                id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "hashed-password",
                isVerified: false,
                role: Role.USER,
                createdAt: now,
                updatedAt: now
            };
            (appPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockedUser);
            const result = await AuthRepository.findUserByEmail("john@example.com");

            expect(appPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "john@example.com" },
            });

            expect(result).toEqual(mockedUser);
        });

        it("throws when the user is not found", async () => {
            (appPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                AuthRepository.findUserByEmail("missing@example.com")
            ).rejects.toThrow();
        });
    })
});