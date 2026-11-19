import { CVAlreadyUploadedException } from "@/exceptions/cvAlreadyExistException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ParsedCvData } from "@/mappers/cv-mapper";
import { UserRepository } from "@/repository/user-repository";
import { ReturnedSaveToStorageType } from "@/types/file";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        userCV: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        userSkill: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        userExperience: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        userEducation: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        userCertification: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));



describe("User repository user cv function tests", () => {
    const mockUserId = "51e89c26-72ec-4e27-b606-a4899cbdce15";
    const mockCvId = "4837ff7a-9c92-4deb-95ef-1b6a08d28ade";

    const mockCV = {
        id: mockCvId,
        userId: mockUserId,
        fileUrl: "uploads/cv/resume.pdf",
        fileName: "resume.pdf",
        fileSize: 1024,
        parsedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockParsedData: ParsedCvData = {
        skills: [
            {
                skill_name: "JavaScript",
                profiency: "advanced",
                years_exp: 3,
            },
        ],
        experiences: [
            {
                job_title: "Software Engineer",
                company_name: "ABC Company",
                start_date: new Date("2022-01-01"),
                end_date: null,
                is_current: true,
                description: "Developed web applications",
            },
        ],
        educations: [
            {
                degree: "Bachelor",
                field_of_study: "Computer Science",
                institution: "University",
                description: "Computer Science degree",
                grad_date: new Date("2022-06-01"),
            },
        ],
        certifications: [
            {
                cert_name: "AWS Certified",
                issuer: "Amazon",
                issued_date: new Date("2023-01-01"),
            },
        ],
    };

    const mockFileInfo: ReturnedSaveToStorageType = {
        fileKey: "uploads/cv/resume.pdf",
        fileType: "pdf",
        fileName: "resume.pdf",
        fileSize: 1024,
        buffer: Buffer.from("CV content"),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("check already uploaded function test", () => {
        it("should return null when a user have no uploaded cv", async () => {
            (prisma.userCV.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await UserRepository.checkAlreadyUploaded(mockUserId);

            expect(prisma.userCV.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: mockUserId
                }
            });
            expect(result).toBeNull();
        });
        it("should throw CVAlreadyUploadedException when CV already exists", async () => {
            (prisma.userCV.findFirst as jest.Mock).mockResolvedValue(mockCV);


            await expect(UserRepository.checkAlreadyUploaded(mockUserId)).rejects.toThrow(CVAlreadyUploadedException);
            expect(prisma.userCV.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: mockUserId
                }
            });
        });
    });
    describe("save extracted data repository function test", () => {
        it("should save cv and extracted sections inside a transaction", async () => {
            const mockTransaction = [
                mockCV,
                { count: 1 },
                { count: 1 },
                { count: 1 },
                { count: 1 },
            ];

            (prisma.$transaction as jest.Mock).mockResolvedValue(mockTransaction);

            jest.mocked(prisma.userCV.create).mockResolvedValue(mockCV);

            jest.mocked(prisma.userSkill.createMany).mockResolvedValue({ count: 1 });

            jest.mocked(prisma.userExperience.createMany).mockResolvedValue({ count: 1 });

            jest.mocked(prisma.userEducation.createMany).mockResolvedValue({ count: 1 });

            jest.mocked(prisma.userCertification.createMany).mockResolvedValue({ count: 1 });

            const result = await UserRepository.saveExtractedData(mockParsedData, mockFileInfo, mockUserId);

            expect(prisma.userCV.create).toHaveBeenCalledWith({
                data: {
                    userId: mockUserId,
                    fileUrl: mockFileInfo.fileKey,
                    fileName: mockFileInfo.fileName,
                    fileSize: mockFileInfo.fileSize,
                }
            });
            expect(prisma.userSkill.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        userId: mockUserId,
                        skillName: "JavaScript",
                        proficiency: "advanced",
                        yearsExp: 3,
                    },
                ],
            });

            expect(prisma.userExperience.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        userId: mockUserId,
                        jobTitle: "Software Engineer",
                        companyName: "ABC Company",
                        startDate: new Date("2022-01-01"),
                        endDate: null,
                        isCurrent: true,
                        description: "Developed web applications",
                    },
                ],
            });

            expect(prisma.userEducation.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        userId: mockUserId,
                        degree: "Bachelor",
                        fieldOfStudy: "Computer Science",
                        institution: "University",
                        description: "Computer Science degree",
                        gradDate: new Date("2022-06-01"),
                    },
                ],
            });

            expect(prisma.userCertification.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        userId: mockUserId,
                        certName: "AWS Certified",
                        issuer: "Amazon",
                        issuedAt: new Date("2023-01-01"),
                    },
                ],
            });

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            expect(result).toEqual(mockCV);
        });
    });

    describe("get user cv repository function test", () => {
        it("should return cv metada when cv exidt", async () => {
            (prisma.userCV.findUnique as jest.Mock).mockResolvedValue(mockCV);

            const result = await UserRepository.getUserCV(mockUserId);

            expect(prisma.userCV.findUnique).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });

            expect(result).toEqual(mockCV);
        });
        it("should throw NotFoundException when CV doesn't exist", async () => {

            jest.mocked(prisma.userCV.findUnique)
                .mockResolvedValue(null);

            await expect(
                UserRepository.getUserCV(mockUserId)
            ).rejects.toThrow(NotFoundException);

            expect(prisma.userCV.findUnique).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });
        });

    });
    describe("delete user metada repository function test", () => {
        const mockTx = {
            userCV: {
                delete: jest.fn(),
            },
            userSkill: {
                deleteMany: jest.fn(),
            },
            userExperience: {
                deleteMany: jest.fn(),
            },
            userEducation: {
                deleteMany: jest.fn(),
            },
            userCertification: {
                deleteMany: jest.fn(),
            },
        };

        beforeEach(() => {
            Object.values(mockTx).forEach((model) => {
                Object.values(model).forEach((method) => {
                    method.mockReset();
                });
            });
        });
        it("should delete CV and all associated metadata inside a transaction", async () => {


            Object.values(mockTx).forEach((model) => {
                Object.values(model).forEach((method) => {
                    method.mockResolvedValue({ count: 1 });
                });
            });

            (prisma.$transaction as jest.Mock).mockImplementation(
                async (callback) => callback(mockTx)
            );


            await UserRepository.deleteUserMetada(mockUserId, mockCvId);


            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            expect(mockTx.userCV.delete).toHaveBeenCalledWith({
                where: {
                    id: mockCvId,
                    userId: mockUserId,
                },
            });

            expect(mockTx.userSkill.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });

            expect(mockTx.userExperience.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });

            expect(mockTx.userEducation.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });

            expect(mockTx.userCertification.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
            });
        });
        it("should throw NotFoundException when Prisma returns P2025", async () => {


            const prismaError = new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                {
                    code: "P2025",
                    clientVersion: "test",
                }
            );

            mockTx.userCV.delete.mockRejectedValue(prismaError);

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(mockTx));


            await expect(UserRepository.deleteUserMetada(mockUserId, mockCvId)).rejects.toThrow(NotFoundException);

            expect(mockTx.userCV.delete).toHaveBeenCalledWith({
                where: {
                    id: mockCvId,
                    userId: mockUserId,
                },
            });

            expect(mockTx.userSkill.deleteMany).not.toHaveBeenCalled();
        });
    });
})