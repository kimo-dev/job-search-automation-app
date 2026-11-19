import { AlreadyExistsException } from "@/exceptions/AlreadyExistsException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { Prisma as clientPrisma, UserCertification, UserEducation } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";
import { createUserCertificationsSchema, createUserEducationSchema, updateUserCertificationsSchema, updateUserEducationSchema } from "@/types/user";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        userEducation: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userCertification: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }
}));


describe("User repository - Education and certification test", () => {
    const mockedUserId = "51e89c26-72ec-4e27-b606-a4899cbdce15";
    const mockedUserEducationId = "2edb5897-bccf-4fc4-a1f1-dd36574f6445";
    const mockedUserCertificationId = "0eeb9e9d-1750-4904-96b9-f3bbc1fddc34";
    const mockedUserEducation : UserEducation = {
        id: mockedUserEducationId,
        userId: mockedUserId,
        degree: "Master of Science",
        fieldOfStudy: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        gradDate: new Date("2018-05-20 00:00:00"),
        createdAt: new Date("2026-10-19 21:08:34.898"),
        updatedAt: new Date("2026-10-19 21:08:34.898")
    }
    const mockedCreateUserEducationSchema : createUserEducationSchema = {
        degree: "Master of Science",
        field_of_study: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        grad_date: new Date("2018-05-20 00:00:00"),
    }
    const mockedUpdateUserEducationSchema : updateUserEducationSchema = {
        degree: "Master of Science",
        field_of_study: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        grad_date: new Date("2018-05-20 00:00:00"),
    }
    const mockedUserCertification : UserCertification = {
        id: mockedUserEducationId,
        userId: mockedUserId,
        certName: "Certification1",
        issuer: "SE2",
        issuedAt: new Date("2026-11-04 00:00:00"),
        createdAt: new Date("2026-10-19 21:08:34.898"),
        updatedAt: new Date("2026-10-19 21:08:34.898")
    }
    const mockedCreateUserCertificationSchema : createUserCertificationsSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: new Date("2026-11-03 00:00:00"),
    }
    const mockedUpdateUserCertificationSchema : updateUserCertificationsSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: new Date("2026-11-03 00:00:00"),
    }


    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("User education repository functions test", () => {
        it("should get all user educations of a user", async () => {
            (prisma.userEducation.findMany as jest.Mock).mockResolvedValue([mockedUserEducation]);
            const result = await UserRepository.getAllUserEducations(mockedUserId);

            expect(prisma.userEducation.findMany).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
            expect(result).toEqual([mockedUserEducation]);
        });
        it("should create a new user education and return it", async () => {
            (prisma.userEducation.create as jest.Mock).mockResolvedValue(mockedUserEducation);
            const result  = await UserRepository.createUserEducation(mockedUserId, mockedCreateUserEducationSchema);

            expect(prisma.userEducation.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    degree: mockedCreateUserEducationSchema.degree,
                    fieldOfStudy: mockedCreateUserEducationSchema.field_of_study,
                    institution: mockedCreateUserEducationSchema.institution,
                    description: mockedCreateUserEducationSchema.description,
                    gradDate: mockedCreateUserEducationSchema.grad_date
                }
            });
            expect(result).toEqual(mockedUserEducation);
        });
        it("should throw an error if the user education being inserted already exist", async () => {
            const PrismaError = new clientPrisma.PrismaClientKnownRequestError(
                "This user education already exist",
                {
                    code: "P2002",
                    clientVersion: "test"
                }
            );
            (prisma.userEducation.create as jest.Mock).mockRejectedValue(PrismaError);

            expect(UserRepository.createUserEducation(mockedUserId, mockedCreateUserEducationSchema)).rejects.toThrow(AlreadyExistsException)
            expect(prisma.userEducation.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    degree: mockedCreateUserEducationSchema.degree,
                    fieldOfStudy: mockedCreateUserEducationSchema.field_of_study,
                    institution: mockedCreateUserEducationSchema.institution,
                    description: mockedCreateUserEducationSchema.description,
                    gradDate: mockedCreateUserEducationSchema.grad_date
                }
            });

        });
        it("should update the user education and return the updated educaiton", async () => {
            (prisma.userEducation.update as jest.Mock).mockResolvedValue(mockedUserEducation);
            const result = await UserRepository.updateUserEducation(mockedUserId, mockedUserEducationId, mockedUpdateUserEducationSchema);

            expect(prisma.userEducation.update).toHaveBeenCalledWith({
                where: { id: mockedUserEducationId, userId: mockedUserId  },
                data: {
                    degree: mockedUpdateUserEducationSchema.degree,
                    fieldOfStudy: mockedUpdateUserEducationSchema.field_of_study,
                    institution: mockedUpdateUserEducationSchema.institution,
                    description: mockedUpdateUserEducationSchema.description,
                    gradDate: mockedUpdateUserEducationSchema.grad_date
                }
            });
            expect(result).toEqual(mockedUserEducation);
        });
        it("should throw an error if the updated user education was not found", async () => {
            const prismaError = new clientPrisma.PrismaClientKnownRequestError(
                "User education not found",
                {
                    code: "P2025",
                    clientVersion: "test"
                }
            );
            (prisma.userEducation.update as jest.Mock).mockRejectedValue(prismaError);
            
            expect(UserRepository.updateUserEducation(mockedUserId, mockedUserEducationId, mockedUpdateUserEducationSchema)).rejects.toThrow(NotFoundException);
            expect(prisma.userEducation.update).toHaveBeenCalledWith({
                where: { id: mockedUserEducationId, userId: mockedUserId  },
                data: {
                    degree: mockedUpdateUserEducationSchema.degree,
                    fieldOfStudy: mockedUpdateUserEducationSchema.field_of_study,
                    institution: mockedUpdateUserEducationSchema.institution,
                    description: mockedUpdateUserEducationSchema.description,
                    gradDate: mockedUpdateUserEducationSchema.grad_date
                }
            });
        });
        it("should delete the user education by id", async () => {
            (prisma.userEducation.delete as jest.Mock).mockResolvedValue(undefined);
            const result = await UserRepository.deleteUserEducation(mockedUserId, mockedUserEducationId);
            expect(result).toBeUndefined();
            expect(prisma.userEducation.delete).toHaveBeenCalledWith({
                where: { id: mockedUserEducationId, userId: mockedUserId }
            });
        });
        it("should throw not found exception if user education to be deleted wan not found", async () => {
            const prismaError = new clientPrisma.PrismaClientKnownRequestError(
                "User education not found",
                {
                    code: "P2025",
                    clientVersion: "test"
                }
            );
            (prisma.userEducation.delete as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.deleteUserEducation(mockedUserId, mockedUserEducationId)).rejects.toThrow(NotFoundException);
            expect(prisma.userEducation.delete).toHaveBeenCalledWith({
                where: { id: mockedUserEducationId, userId: mockedUserId }
            });
        });
    });
    describe("User certification repository functions test", () => {
        it("should get all user certifications of a user", async () => {
            (prisma.userCertification.findMany as jest.Mock).mockResolvedValue([mockedUserCertification]);
            const result = await UserRepository.getAllUserCertifications(mockedUserId);

            expect(prisma.userCertification.findMany).toHaveBeenCalledWith({
                where: { userId: mockedUserId }
            });
            expect(result).toEqual([mockedUserCertification]);
        });
        it("should create a new user certification and return it", async () => {
            (prisma.userCertification.create as jest.Mock).mockResolvedValue(mockedUserCertification);
            const result  = await UserRepository.createUserCertification(mockedUserId, mockedCreateUserCertificationSchema);

            expect(prisma.userCertification.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    certName: mockedCreateUserCertificationSchema.cert_name,
                    issuer: mockedCreateUserCertificationSchema.issuer,
                    issuedAt: mockedCreateUserCertificationSchema.issued_date
                }
            });
            expect(result).toEqual(mockedUserCertification);
        });
        it("should throw an error if the user certification being inserted already exist", async () => {
            const PrismaError = new clientPrisma.PrismaClientKnownRequestError(
                "This user certification already exist",
                {
                    code: "P2002",
                    clientVersion: "test"
                }
            );
            (prisma.userCertification.create as jest.Mock).mockRejectedValue(PrismaError);

            expect(UserRepository.createUserCertification(mockedUserId, mockedCreateUserCertificationSchema)).rejects.toThrow(AlreadyExistsException)
            expect(prisma.userCertification.create).toHaveBeenCalledWith({
                data: {
                    userId: mockedUserId,
                    certName: mockedCreateUserCertificationSchema.cert_name,
                    issuer: mockedCreateUserCertificationSchema.issuer,
                    issuedAt: mockedCreateUserCertificationSchema.issued_date
                }
            });

        });
        it("should update the user certification and return the updated certification", async () => {
            (prisma.userCertification.update as jest.Mock).mockResolvedValue(mockedUserCertification);
            const result = await UserRepository.updateUserCertification(mockedUserId, mockedUserCertificationId, mockedUpdateUserCertificationSchema);

            expect(prisma.userCertification.update).toHaveBeenCalledWith({
                where: { id: mockedUserCertificationId, userId: mockedUserId  },
                data: {
                    certName: mockedUpdateUserCertificationSchema.cert_name,
                    issuer: mockedUpdateUserCertificationSchema.issuer,
                    issuedAt: mockedUpdateUserCertificationSchema.issued_date
            }});
            expect(result).toEqual(mockedUserCertification);
        });
        it("should throw an error if the updated user certification was not found", async () => {
            const prismaError = new clientPrisma.PrismaClientKnownRequestError(
                "User certification not found",
                {
                    code: "P2025",
                    clientVersion: "test"
                }
            );
            (prisma.userCertification.update as jest.Mock).mockRejectedValue(prismaError);
            
            expect(UserRepository.updateUserCertification(mockedUserId, mockedUserCertificationId, mockedUpdateUserCertificationSchema)).rejects.toThrow(NotFoundException);
            expect(prisma.userCertification.update).toHaveBeenCalledWith({
                where: { id: mockedUserCertificationId, userId: mockedUserId  },
                data: {
                    certName: mockedUpdateUserCertificationSchema.cert_name,
                    issuer: mockedUpdateUserCertificationSchema.issuer,
                    issuedAt: mockedUpdateUserCertificationSchema.issued_date
                }
            });
        });
        it("should delete the user certification by id", async () => {
            (prisma.userCertification.delete as jest.Mock).mockResolvedValue(undefined);
            const result = await UserRepository.deleteUserCertification(mockedUserId, mockedUserCertificationId);
            expect(result).toBeUndefined();
            expect(prisma.userCertification.delete).toHaveBeenCalledWith({
                where: { id: mockedUserCertificationId, userId: mockedUserId }
            });
        });
        it("should throw not found exception if user certification to be deleted wan not found", async () => {
            const prismaError = new clientPrisma.PrismaClientKnownRequestError(
                "User certification not found",
                {
                    code: "P2025",
                    clientVersion: "test"
                }
            );
            (prisma.userCertification.delete as jest.Mock).mockRejectedValue(prismaError);
            await expect(UserRepository.deleteUserCertification(mockedUserId, mockedUserCertificationId)).rejects.toThrow(NotFoundException);
            expect(prisma.userCertification.delete).toHaveBeenCalledWith({
                where: { id: mockedUserCertificationId, userId: mockedUserId }
            });
        });
    })
});