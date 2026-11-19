import { UserCertification, UserEducation } from "@/generated/prisma/client";
import { UserRepository } from "@/repository/user-repository";
import { UserService } from "@/services/user-service";
import { createUserCertificationsSchema, createUserEducationSchema, updateUserCertificationsSchema, updateUserEducationSchema } from "@/types/user";

jest.mock("@/repository/user-repository", () => ({
    UserRepository: {
        getAllUserEducations: jest.fn(),
        createUserEducation: jest.fn(),
        updateUserEducation: jest.fn(),
        deleteUserEducation: jest.fn(),
        getAllUserCertifications: jest.fn(),
        createUserCertification: jest.fn(),
        updateUserCertification: jest.fn(),
        deleteUserCertification: jest.fn()
    }
}));


describe("User service education and certification functions test", () => {
    const mockedUserId = "51e89c26-72ec-4e27-b606-a4899cbdce15";
    const mockedUserEducationId = "2edb5897-bccf-4fc4-a1f1-dd36574f6445";
    const mockedUserEducation : UserEducation = 
        {
            id: mockedUserEducationId,
            userId: mockedUserId,
            degree: "Master of Science",
            fieldOfStudy: "Computer Science",
            institution: "University of Washington",
            description: "Distributed systems concentration.",
            gradDate: new Date("2018-05-20 00:00:00"),
            createdAt: new Date("2026-10-19 21:08:34.898"),
            updatedAt: new Date("2026-10-19 21:08:34.898")
        };
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


    const mockedUserCertificationId = "0eeb9e9d-1750-4904-96b9-f3bbc1fddc34";
    const mockedUserCertification : UserCertification = 
        {
            id: mockedUserCertificationId,
            userId: mockedUserId,
            certName: "Certification1",
            issuer: "SE2",
            issuedAt: new Date("2026-11-04 00:00:00"),
            createdAt: new Date("2026-10-19 21:08:34.898"),
            updatedAt: new Date("2026-10-19 21:08:34.898")
        };
    const mockedCreateUserCertificationSchema : createUserCertificationsSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: new Date("2026-11-04 00:00:00"),
    }
    const mockedUpdateUserCertificationSchema : updateUserCertificationsSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: new Date("2026-11-04 00:00:00"),
    }
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("User education service functions test", () => {
        it("getAllUserEducations function should call the get all user education repoistory function and return a list of all user Educations", async () => {
            (UserRepository.getAllUserEducations as jest.Mock).mockResolvedValue([mockedUserEducation]);

            const result = await UserService.getAllUserEducations(mockedUserId);

            expect(result).toEqual([mockedUserEducation]);
            expect(UserRepository.getAllUserEducations).toHaveBeenCalledWith(mockedUserId);
        });
        it("getAllUserEducations function should call the get all user education repoistory function and return an empty list if no educations found", async () => {
            (UserRepository.getAllUserEducations as jest.Mock).mockResolvedValue([]);

            const result = await UserService.getAllUserEducations(mockedUserId);

            expect(result).toEqual([]);
            expect(UserRepository.getAllUserEducations).toHaveBeenCalledWith(mockedUserId);

        });
        it("addUserEducation should call createUserEducation repository function and return the create user education", async () => {
            (UserRepository.createUserEducation as jest.Mock).mockResolvedValue(mockedUserEducation);
            const result = await UserService.addUserEducation(mockedUserId, mockedCreateUserEducationSchema);

            expect(result).toEqual(mockedUserEducation);
            expect(UserRepository.createUserEducation).toHaveBeenCalledWith(mockedUserId, mockedCreateUserEducationSchema);
        });
        it("updateUserEducation service function should call updateUserEducation repository function and return the updated user education", async () => {
            (UserRepository.updateUserEducation as jest.Mock).mockResolvedValue(mockedUserEducation);
            const result = await UserService.updateUserEducation(mockedUserId, mockedUserEducationId, mockedUpdateUserEducationSchema);

            expect(result).toEqual(mockedUserEducation);
            expect(UserRepository.updateUserEducation).toHaveBeenCalledWith(mockedUserId, mockedUserEducationId, mockedUpdateUserEducationSchema);
        });
        it("deleteUserEducation service function should call deleteUserEducation repository function", async () => {
            (UserRepository.deleteUserEducation as jest.Mock).mockResolvedValue(undefined);

            const result = await UserService.deleteUserEducation(mockedUserId, mockedUserEducationId);

            expect(result).toBeUndefined();
            expect(UserRepository.deleteUserEducation).toHaveBeenCalledWith(mockedUserId, mockedUserEducationId);
        })
    });

    describe("User certificaiton service functions test", () => {
        it("getAllUserCertifications service  function should call the getAllUserCertifications repoistory function and return a list of all user certifications", async () => {
            (UserRepository.getAllUserCertifications as jest.Mock).mockResolvedValue([mockedUserCertification]);

            const result = await UserService.getAllUserCertifications(mockedUserId);

            expect(result).toEqual([mockedUserCertification]);
            expect(UserRepository.getAllUserCertifications).toHaveBeenCalledWith(mockedUserId);
        });
        it("getAllUserCertifications function should call the getAllUserCertifications repoistory function and return an empty list if no certification found", async () => {
            (UserRepository.getAllUserCertifications as jest.Mock).mockResolvedValue([]);

            const result = await UserService.getAllUserCertifications(mockedUserId);

            expect(result).toEqual([]);
            expect(UserRepository.getAllUserCertifications).toHaveBeenCalledWith(mockedUserId);

        });
        it("addUserCertification should call createUserCertification repository function and return the create user certification", async () => {
            (UserRepository.createUserCertification as jest.Mock).mockResolvedValue(mockedUserCertification);
            const result = await UserService.addUserCertification(mockedUserId, mockedCreateUserCertificationSchema);

            expect(result).toEqual(mockedUserCertification);
            expect(UserRepository.createUserCertification).toHaveBeenCalledWith(mockedUserId, mockedCreateUserCertificationSchema);
        });
        it("updateUserCertification service function should call updateUserCertification repository function and return the updated user certification", async () => {
            (UserRepository.updateUserCertification as jest.Mock).mockResolvedValue(mockedUserCertification);
            const result = await UserService.updateUserCertification(mockedUserId, mockedUserCertificationId, mockedUpdateUserCertificationSchema);

            expect(result).toEqual(mockedUserCertification);
            expect(UserRepository.updateUserCertification).toHaveBeenCalledWith(mockedUserId, mockedUserCertificationId, mockedUpdateUserCertificationSchema);
        });
        it("deleteUserCertification service function should call deleteUserCertification repository function", async () => {
            (UserRepository.deleteUserCertification as jest.Mock).mockResolvedValue(undefined);

            const result = await UserService.deleteUserCertification(mockedUserId, mockedUserCertificationId);

            expect(result).toBeUndefined();
            expect(UserRepository.deleteUserCertification).toHaveBeenCalledWith(mockedUserId, mockedUserCertificationId);
        })
    });
});
