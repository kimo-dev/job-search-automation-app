import config from "@/config";
import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { UserCertification, UserEducation } from "@/generated/prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { createUserCertificationsSchema, createUserEducationSchema, updateUserCertificationsSchema, updateUserEducationSchema } from "@/types/user";
import { NextRequest } from "next/server";
import { GET as UserEducationGET } from "@/app/api/users/education/route";
import { POST as UserEducationPOST } from "@/app/api/users/education/route";
import { PUT as UserEducationPUT } from "@/app/api/users/education/[educationId]/route";
import { DELETE as UserEducationDELETE } from "@/app/api/users/education/[educationId]/route";

import { GET as UserCertificationGET } from "@/app/api/users/certifications/route";
import { POST as UserCertificationPOST } from "@/app/api/users/certifications/route";
import { PUT as UserCertificationPUT } from "@/app/api/users/certifications/[certificationId]/route";
import { DELETE as UserCertificationDELETE } from "@/app/api/users/certifications/[certificationId]/route";
import { UserService } from "@/services/user-service";
import { AlreadyExistsException } from "@/exceptions/AlreadyExistsException";
import { NotFoundException } from "@/exceptions/notFoundException";

jest.mock("@/services/user-service", () => ({
    UserService: {
        getAllUserEducations: jest.fn(),
        addUserEducation: jest.fn(),
        updateUserEducation: jest.fn(),
        deleteUserEducation: jest.fn(),
        getAllUserCertifications: jest.fn(),
        addUserCertification: jest.fn(),
        updateUserCertification: jest.fn(),
        deleteUserCertification: jest.fn()
    }
}));
jest.mock("@/lib/auth", () => ({
    getAuthenticatedUser: jest.fn()
}));

const createRequest = (route: string, method: string, body?: object,): NextRequest => {
    return new NextRequest(`${config.web_url}` + route, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        ...(body !== undefined && { body: JSON.stringify(body) })
    });
};

describe("testing user education and certification api endpoints", () => {
    const mockedUser = {
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        email: "test@example.com",
        role: "USER"
    };
    const mockedUserEducationId = "2edb5897-bccf-4fc4-a1f1-dd36574f6445";
    const mockedUserEducation: UserEducation =
    {
        id: "2edb5897-bccf-4fc4-a1f1-dd36574f6445",
        userId: mockedUser.userId,
        degree: "Master of Science",
        fieldOfStudy: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        gradDate: new Date("2018-05-20 00:00:00"),
        createdAt: new Date("2026-10-19 21:08:34.898"),
        updatedAt: new Date("2026-10-19 21:08:34.898")
    };
    const mockedCreateUserEducationSchema = {
        degree: "Master of Science",
        field_of_study: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        grad_date: "2018-05-20",
    }
    const mockedUpdateUserEducationSchema = {
        degree: "Master of Science",
        field_of_study: "Computer Science",
        institution: "University of Washington",
        description: "Distributed systems concentration.",
        grad_date: "2018-05-20",
    }
    const mockedUserCertificationId = "0eeb9e9d-1750-4904-96b9-f3bbc1fddc34";
    const mockedUserCertification: UserCertification =
    {
        id: "0eeb9e9d-1750-4904-96b9-f3bbc1fddc34",
        userId: mockedUser.userId,
        certName: "Certification1",
        issuer: "SE2",
        issuedAt: new Date("2026-11-04 00:00:00"),
        createdAt: new Date("2026-10-19 21:08:34.898"),
        updatedAt: new Date("2026-10-19 21:08:34.898")
    };
    const mockedCreateUserCertificationSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: "2026-11-04",
    }
    const mockedUpdateUserCertificationSchema = {
        cert_name: "Certification1",
        issuer: "SE2",
        issued_date: "2026-11-04",
    }
    const createContext = <T extends string>(
        paramName: T,
        id?: string
    ) => ({
        params: Promise.resolve({
            [paramName]: id ?? (
                paramName === "userEducationId"
                    ? mockedUserEducationId
                    : mockedUserCertificationId
            )
        }) as Promise<Record<T, string>>
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("GET User education api endpoints test /api/users/education", () => {
        it("should return 401 if user not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            const request = createRequest("/api/users/education", "GET");

            const response = await UserEducationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getAllUserEducations).not.toHaveBeenCalled();
        });
        it("should return a list of all user educations if the user is authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUserEducations as jest.Mock).mockResolvedValue([mockedUserEducation]);
            const request = createRequest("/api/users/education", "GET");

            const response = await UserEducationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Education retrieved successfully");
            expect(result.educations).toEqual(JSON.parse(JSON.stringify([mockedUserEducation])));

            expect(UserService.getAllUserEducations).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return an empty array if no user educaitons found", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUserEducations as jest.Mock).mockResolvedValue([]);
            const request = createRequest("/api/users/education", "GET");

            const response = await UserEducationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Education retrieved successfully");
            expect(result.educations).toEqual(JSON.parse(JSON.stringify([])));

            expect(UserService.getAllUserEducations).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 500 internal server error if an unexpected error occured", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            (UserService.getAllUserEducations as jest.Mock).mockResolvedValue(new Error("Database error"));
            const request = createRequest("/api/users/education", "GET");

            const response = await UserEducationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getAllUserEducations).not.toHaveBeenCalled();
        });
    });
    describe("POST User education api endpoints test /api/users/education", () => {
        it("should return 401 if user not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            const request = createRequest("/api/users/education", "POST");

            const response = await UserEducationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.addUserEducation).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const invalidData = {
                degree: "Master of Science",
                fieldOfStudy: "",
                institution: "",
                description: "Distributed systems concentration.",
            };

            const request = createRequest("/api/users/education", "POST", invalidData);

            const response = await UserEducationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(UserService.addUserEducation).not.toHaveBeenCalled();
        });
        it("should add a User Education successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserEducation as jest.Mock).mockResolvedValue(mockedUserEducation);

            const request = createRequest("/api/users/education", "POST", mockedCreateUserEducationSchema);

            const response = await UserEducationPOST(request, {});
            const result = await response.json();
            expect(response.status).toBe(201);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Education added successfully");

            expect(result.education).toEqual(
                JSON.parse(JSON.stringify(mockedUserEducation))
            );
            expect(UserService.addUserEducation).toHaveBeenCalledTimes(1);
            expect(UserService.addUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserEducationSchema,
                    grad_date: new Date("2018-05-20"),
                }
            );
        });
        it("should return 400 if the user education already exists", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserEducation as jest.Mock).mockRejectedValue(
                new AlreadyExistsException("This user education already exist")
            );

            const request = createRequest("/api/users/education", "POST", mockedCreateUserEducationSchema);

            const response = await UserEducationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("This user education already exist");

            expect(UserService.addUserEducation).toHaveBeenCalledTimes(1);
            expect(UserService.addUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserEducationSchema,
                    grad_date: new Date("2018-05-20"),
                }
            );

        });
        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserEducation as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest("/api/users/education", "POST", mockedCreateUserEducationSchema);

            const response = await UserEducationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to add the user education!"
            );
            expect(UserService.addUserEducation).toHaveBeenCalledTimes(1);
            expect(UserService.addUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserEducationSchema,
                    grad_date: new Date("2018-05-20"),
                }
            );
        });
    });
    describe("PUT user education api endpoints test /api/users/education/[educationId]", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(`/api/users/education/${mockedUserEducationId}`, "PUT", mockedUpdateUserEducationSchema);

            const response = await UserEducationPUT(request, createContext("educationId", mockedUserEducationId));
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.updateUserEducation).not.toHaveBeenCalled();
        });
        it("should update a user education successfully", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserEducation as jest.Mock).mockResolvedValue(mockedUserEducation);

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "PUT",
                mockedUpdateUserEducationSchema,
            );

            const response = await UserEducationPUT(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();
            expect(response.status).toBe(200);
            expect(responseBody.success).toBe(true);
            expect(responseBody.education).toEqual(JSON.parse(JSON.stringify(mockedUserEducation)));
            expect(responseBody.message).toBe("Education updated successfully");

            expect(UserService.updateUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId,
                {
                    ...mockedUpdateUserEducationSchema,
                    grad_date: new Date(mockedUpdateUserEducationSchema.grad_date),
                }
            );
        });
        it("should return 400 if the user education ID is missing", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const request = createRequest(
                "/api/users/education/",
                "PUT",
                mockedUpdateUserEducationSchema
            );

            const response = await UserEducationPUT(request, createContext("educationId", ""));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("Education ID is required");

            expect(UserService.updateUserEducation).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const invalidUerEducation = {
                degree: "",
                field_of_study: "Software engineer",
                institution: ""
            };

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "PUT",
                invalidUerEducation,
            );

            const response = await UserEducationPUT(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBeDefined();

            expect(UserService.updateUserEducation).not.toHaveBeenCalled();
        });
        it("should return 404 if the user education does not exist", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserEducation as jest.Mock).mockRejectedValue(
                new NotFoundException("User education not found")
            );

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "PUT",
                mockedUpdateUserEducationSchema,
            );

            const response = await UserEducationPUT(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(404);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("User education not found");

            expect(UserService.updateUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId,
                {
                    ...mockedUpdateUserEducationSchema,
                    grad_date: new Date(mockedUpdateUserEducationSchema.grad_date),
                }
            );
        });
        it("should return 500 if updating the user education fails with unexpected error", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserEducation as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "PUT",
                mockedUpdateUserEducationSchema,
            );

            const response = await UserEducationPUT(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(500);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe(
                "Something went wrong while updating user education."
            );
            expect(UserService.updateUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId,
                {
                    ...mockedUpdateUserEducationSchema,
                    grad_date: new Date(mockedUpdateUserEducationSchema.grad_date),
                }
            );
        });
    });
    describe("DELETE user education by id endpoint test /api/users/education/[educationId]", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(`/api/users/education/${mockedUserEducationId}`, "DELETE");

            const response = await UserEducationDELETE(request, createContext("educationId", mockedUserEducationId));
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.deleteUserEducation).not.toHaveBeenCalled();
        });
        it("should delete a user education successfully", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserEducation as jest.Mock).mockResolvedValue(undefined);

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserEducationDELETE(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.success).toBe(true);
            expect(responseBody.message).toBe("Education deleted successfully");

            expect(UserService.deleteUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId
            );
        });

        it("should return 400 if the education ID is missing", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const request = createRequest(
                "/api/users/education/",
                "DELETE",
                undefined,
            );

            const response = await UserEducationDELETE(request, createContext("educationId", ""));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("Education ID is required");

            expect(UserService.deleteUserEducation).not.toHaveBeenCalled();
        });

        it("should return 404 if the user education does not exist", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserEducation as jest.Mock).mockRejectedValue(
                new NotFoundException("User education not found")
            );

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserEducationDELETE(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(404);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("User education not found");
            expect(UserService.deleteUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId
            );
        });

        it("should return 500 if deleting the user education fails with an unexpected error", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserEducation as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                `/api/users/education/${mockedUserEducationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserEducationDELETE(request, createContext("educationId", mockedUserEducationId));
            const responseBody = await response.json();

            expect(response.status).toBe(500);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe(
                "Something went wrong while updating user education."
            );
            expect(UserService.deleteUserEducation).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserEducationId
            );
        });
    });





        describe("GET User certification api endpoints test /api/users/certifications", () => {
        it("should return 401 if user not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            const request = createRequest("/api/users/certifications", "GET");

            const response = await UserCertificationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getAllUserCertifications).not.toHaveBeenCalled();
        });
        it("should return a list of all user certifications if the user is authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUserCertifications as jest.Mock).mockResolvedValue([mockedUserCertification]);
            const request = createRequest("/api/users/certifications", "GET");

            const response = await UserCertificationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Certifications retrieved successfully");
            expect(result.certifications).toEqual(JSON.parse(JSON.stringify([mockedUserCertification])));

            expect(UserService.getAllUserCertifications).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return an empty array if no user certifications found", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUserCertifications as jest.Mock).mockResolvedValue([]);
            const request = createRequest("/api/users/certifications", "GET");

            const response = await UserCertificationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Certifications retrieved successfully");
            expect(result.certifications).toEqual(JSON.parse(JSON.stringify([])));

            expect(UserService.getAllUserCertifications).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 500 internal server error if an unexpected error occured", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            (UserService.getAllUserCertifications as jest.Mock).mockResolvedValue(new Error("Database error"));
            const request = createRequest("/api/users/certifications", "GET");

            const response = await UserCertificationGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getAllUserCertifications).not.toHaveBeenCalled();
        });
    });
    describe("POST User certificaitons api endpoints test /api/users/certifications", () => {
        it("should return 401 if user not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            const request = createRequest("/api/users/certifications", "POST");

            const response = await UserCertificationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.addUserCertification).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const invalidData = {
                cert_name: "Master of Science",
                issuer: "",
                issued_date: "",
            };

            const request = createRequest("/api/users/certifications", "POST", invalidData);

            const response = await UserCertificationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(UserService.addUserCertification).not.toHaveBeenCalled();
        });
        it("should add a User certification successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserCertification as jest.Mock).mockResolvedValue(mockedUserCertification);

            const request = createRequest("/api/users/certifications", "POST", mockedCreateUserCertificationSchema);

            const response = await UserCertificationPOST(request, {});
            const result = await response.json();
            expect(response.status).toBe(201);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Certification added successfully");

            expect(result.certification).toEqual(
                JSON.parse(JSON.stringify(mockedUserCertification))
            );
            expect(UserService.addUserCertification).toHaveBeenCalledTimes(1);
            expect(UserService.addUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserCertificationSchema,
                    issued_date: new Date("2026-11-04"),
                }
            );
        });
        it("should return 400 if the user certification already exists", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserCertification as jest.Mock).mockRejectedValue(
                new AlreadyExistsException("This user certification already exist")
            );

            const request = createRequest("/api/users/certifications", "POST", mockedCreateUserCertificationSchema);

            const response = await UserCertificationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("This user certification already exist");

            expect(UserService.addUserCertification).toHaveBeenCalledTimes(1);
            expect(UserService.addUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserCertificationSchema,
                    issued_date: new Date("2026-11-04"),
                }
            );

        });
        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserCertification as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest("/api/users/certifications", "POST", mockedCreateUserCertificationSchema);

            const response = await UserCertificationPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to add the user certification!"
            );
            expect(UserService.addUserCertification).toHaveBeenCalledTimes(1);
            expect(UserService.addUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedCreateUserCertificationSchema,
                    issued_date: new Date("2026-11-04"),
                }
            );
        });
    });
    describe("PUT user certification api endpoints test /api/users/certifications/[certificationId]", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(`/api/users/certifications/${mockedUserCertificationId}`, "PUT", mockedUpdateUserCertificationSchema);

            const response = await UserCertificationPUT(request, createContext("certificationId", mockedUserCertificationId));
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.updateUserCertification).not.toHaveBeenCalled();
        });
        it("should update a user certification successfully", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserCertification as jest.Mock).mockResolvedValue(mockedUserCertification);

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "PUT",
                mockedUpdateUserCertificationSchema,
            );

            const response = await UserCertificationPUT(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();
            expect(response.status).toBe(200);
            expect(responseBody.success).toBe(true);
            expect(responseBody.certification).toEqual(JSON.parse(JSON.stringify(mockedUserCertification)));
            expect(responseBody.message).toBe("Certification updated successfully");

            expect(UserService.updateUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId,
                {
                    ...mockedUpdateUserCertificationSchema,
                    issued_date: new Date(mockedUpdateUserCertificationSchema.issued_date),
                }
            );
        });
        it("should return 400 if the user certificaiton ID is missing", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const request = createRequest(
                "/api/users/certifications/",
                "PUT",
                mockedUpdateUserCertificationSchema
            );

            const response = await UserCertificationPUT(request, createContext("certificationId", ""));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("Certification ID is required");

            expect(UserService.updateUserCertification).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const invalidCertificaiton = {
                cert_name: "",
                issuer: "SE2",
                issued_date: ""
            };

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "PUT",
                invalidCertificaiton,
            );

            const response = await UserCertificationPUT(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBeDefined();

            expect(UserService.updateUserCertification).not.toHaveBeenCalled();
        });
        it("should return 404 if the user certification does not exist", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserCertification as jest.Mock).mockRejectedValue(
                new NotFoundException("User certification not found")
            );

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "PUT",
                mockedUpdateUserCertificationSchema,
            );

            const response = await UserCertificationPUT(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(404);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("User certification not found");

            expect(UserService.updateUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId,
                {
                    ...mockedUpdateUserCertificationSchema,
                    issued_date: new Date(mockedUpdateUserCertificationSchema.issued_date),
                }
            );
        });
        it("should return 500 if updating the user certificaiton fails with unexpected error", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateUserCertification as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "PUT",
                mockedUpdateUserCertificationSchema,
            );

            const response = await UserCertificationPUT(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(500);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe(
                "Something went wrong while updating your certification."
            );
            expect(UserService.updateUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId,
                {
                    ...mockedUpdateUserCertificationSchema,
                    issued_date: new Date(mockedUpdateUserCertificationSchema.issued_date),
                }
            );
        });
    });
    describe("DELETE user certification by id endpoint test /api/users/certifications/[certificationId]", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(`/api/users/certifications/${mockedUserCertificationId}`, "DELETE");

            const response = await UserCertificationDELETE(request, createContext("certificationId", mockedUserCertificationId));
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.deleteUserCertification).not.toHaveBeenCalled();
        });
        it("should delete a user certification successfully", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserCertification as jest.Mock).mockResolvedValue(undefined);

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserCertificationDELETE(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.success).toBe(true);
            expect(responseBody.message).toBe("Certification deleted successfully");

            expect(UserService.deleteUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId
            );
        });

        it("should return 400 if the certification ID is missing", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const request = createRequest(
                "/api/users/certifications/",
                "DELETE",
                undefined,
            );

            const response = await UserCertificationDELETE(request, createContext("certificationId", ""));
            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("Certification ID is required");

            expect(UserService.deleteUserCertification).not.toHaveBeenCalled();
        });

        it("should return 404 if the user certification does not exist", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserCertification as jest.Mock).mockRejectedValue(
                new NotFoundException("User certification not found")
            );

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserCertificationDELETE(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(404);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe("User certification not found");
            expect(UserService.deleteUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId
            );
        });

        it("should return 500 if deleting the user certification fails with an unexpected error", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserCertification as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                `/api/users/certifications/${mockedUserCertificationId}`,
                "DELETE",
                undefined,
            );

            const response = await UserCertificationDELETE(request, createContext("certificationId", mockedUserCertificationId));
            const responseBody = await response.json();

            expect(response.status).toBe(500);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe(
                "Something went wrong while deleting your certification."
            );
            expect(UserService.deleteUserCertification).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCertificationId
            );
        });
    });
});