import { AuthRepository } from "@/repository/auth-repository";
import { Role } from "@/generated/prisma/enums";
import { AuthService } from "@/services/auth-service";
import { EncryptService } from "@/services/encrypt-service";
import { NotFoundException } from "@/exceptions/notFoundException";
import { InvalidPasswordException } from "@/exceptions/http/AuthenticationException";

jest.mock("@/repository/auth-repository", () => ({
    AuthRepository: {
        register: jest.fn(),
        findUserByEmail: jest.fn()
    }
}));
jest.mock("@/services/encrypt-service", () => ({
    EncryptService: {
        encrypt: jest.fn(),
        compare: jest.fn()
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

describe("Authservice", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("registerUser should call AuthRepository.register and return the user", async () => {
        const mockedUser = {
            id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: Role.USER,
            createdAt: new Date("2026-10-19T21:08:32.275Z"),
        };

        (AuthRepository.register as jest.Mock).mockResolvedValue(mockedUser);

        const result = await AuthService.registerUser({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "secret123",
        });

        expect(AuthRepository.register).toHaveBeenCalledWith({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "secret123",
        });

        expect(result).toEqual(mockedUser);
    });
    it("login should return mapped user when password matches", async () => {
        const mockedUser = {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "hashed-password",
            role: Role.USER,
            isVerified: true,
            createdAt: new Date("2026-10-19T21:08:32.275Z"),
            updatedAt: new Date("2026-10-19T21:08:32.275Z"),
        };

        (AuthRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockedUser);
        (EncryptService.compare as jest.Mock).mockResolvedValue(true);

        const result = await AuthService.login({
            email: "john@example.com",
            password: "secret123",
        });

        expect(AuthRepository.findUserByEmail).toHaveBeenCalledWith("john@example.com");
        expect(EncryptService.compare).toHaveBeenCalledWith("secret123", "hashed-password");

        expect(result).toEqual({
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: Role.USER,
            createdAt: new Date("2026-10-19T21:08:32.275Z"),
        });
        it("login should throw NotFoundException if user does not exist", async () => {
            (AuthRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

            await expect(
                AuthService.login({
                    email: "missing@example.com",
                    password: "secret123",
                })
            ).rejects.toThrow(NotFoundException);
        });
        it("login should throw InvalidPasswordException if password does not match", async () => {
            const mockedUser = {
                id: "1",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "hashed-password",
                role: Role.USER,
                createdAt: new Date("2026-10-19T21:08:32.275Z"),
            };

            (AuthRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockedUser);
            (EncryptService.compare as jest.Mock).mockResolvedValue(false);
            await expect(
                AuthService.login({
                    email: "john@example.com",
                    password: "wrong-password",
                })
            ).rejects.toThrow(InvalidPasswordException);
        });
    });
});