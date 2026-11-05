import { UserExperience, UserProfile, UserSkill } from "@/generated/prisma/client";
import { UserService } from "@/services/user-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { GET as profileGET } from "@/app/api/users/profile/route";
import { PUT as profilePUT } from "@/app/api/users/profile/route";
import { GET as experienceGET } from "@/app/api/users/experience/route";
import { POST as experiencePOST } from "@/app/api/users/experience/route";
import { GET as skillsGET } from "@/app/api/users/skills/route";
import { POST as skillsPOST } from "@/app/api/users/skills/route";

import { NextRequest } from "next/server";
import config from "@/config";
import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { UserProfileSchema } from "@/types/user";
import { AlreadyExistsException } from "@/exceptions/AlreadyExistException";

jest.mock("@/services/user-service", () => ({
    UserService: {
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
        getAllUsersExperiences: jest.fn(),
        addUserExperience: jest.fn(),
        updateUserExperience: jest.fn(),
        deleteUserExperience: jest.fn(),
        getAllSkills: jest.fn(),
        addSkill: jest.fn(),
        updateSkill: jest.fn(),
        deleteSkill: jest.fn(),
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


describe("testing user api endpoints", () => {
    const mockedUser = {
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        email: "test@example.com",
        role: "USER"
    };
    const mockedProfile : UserProfile = {
        id: "51e89c26-72ec-4e27-b606-a4899cbdce15",
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        cvEmail: "test@example.com",
        title: "Software Engineer",
        position: "full stack dveloper",
        yearsExp: 3,
        githubUrl: "https://github.com/test",
        linkedinUrl: "https://linkedin.com/in/test",
        bio: "Software engineer",
        createdAt: new Date("2026-11-04T09:56:59.289Z"),
        updatedAt: new Date("2026-11-04T09:56:59.289Z"),
    }
    const mockedUpdateProfileSchema :  UserProfileSchema = {
        title: "Software Engineer",
        position: "full stack dveloper",
        yearsExp: 3,
        bio: "Software engineer",
        githubUrl: "https://github.com/test",
        linkedinUrl: "https://linkedin.com/in/test",
    }
    const mockedExperience : UserExperience = {
        id: "51e89c26-72ec-4e27-b606-a4899cbdce15",
        userId: mockedUser.userId,
        jobTitle: "Software Engineer",
        companyName: "Test Company",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2026-01-01"),
        isCurrent: false,
        description: "Working as a full stack developer",
        createdAt: new Date("2026-11-04T09:56:59.289Z"),
        updatedAt: new Date("2026-11-04T09:56:59.289Z")
    };
    const mockedvalidExperienceData = {
        job_title: "Software Engineer",
        company_name: "Test Company",
        start_date: "2023-01-01",
        end_date: "2026-01-01",
        is_current: false,
        description: "Working as a full stack developer"
    };
    const mockedskill : UserSkill = {
        id: "607d7ba3-af5a-48a0-833b-d6f85cb83721",
        userId: mockedUser.userId,
        skillName: "Python",
        proficiency: "Beginner",
        yearsExp: 1,
        createdAt: new Date("2026-10-19T21:08:33.671Z"),
        updatedAt: new Date("2026-10-19T21:08:33.671Z")
    };
    const mockedvalidSkillData= {
        skill_name: "Javascript",
        proficiency: "beginner",
        years_exp: 3
    };
    beforeEach(() => {
            jest.clearAllMocks();
    });
    describe("GET user profile test endpoints /api/users/profile", () => {
        it("should return 401 if authentication fails", async () => {

            (getAuthenticatedUser as jest.Mock).mockRejectedValue(
                new AuthenticationFailedException()
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getProfile).not.toHaveBeenCalled();
        });
        it("should return the profile if the user is authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getProfile as jest.Mock).mockResolvedValue(mockedProfile);

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User profile retreived successfully");
            expect(result.profile).toEqual(
                JSON.parse(JSON.stringify(mockedProfile))
            );

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getProfile).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 404 if the profile does not exist", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getProfile as jest.Mock).mockRejectedValue(
                new NotFoundException("Profile not found")
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGET(request, {});
            const result = await response.json();
            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Profile not found");

            expect(UserService.getProfile).toHaveBeenCalledWith(mockedUser.userId);

        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getProfile as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to get the profile!"
            );
        });
    });
    describe("PUT user profile test endpoints /api/users/profile", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.updateProfile).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                {}
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error.length).toBeGreaterThan(0);

            expect(UserService.updateProfile).not.toHaveBeenCalled();
        });

        it("should update the profile successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateProfile as jest.Mock).mockResolvedValue(mockedProfile);

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User profile updated successfully");
            expect(result.profile).toEqual(
                JSON.parse(JSON.stringify(mockedProfile))
            );

            expect(UserService.updateProfile).toHaveBeenCalledTimes(1);
            expect(UserService.updateProfile).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUpdateProfileSchema
            );
        });

        it("should return 404 if the profile does not exist", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.updateProfile as jest.Mock).mockRejectedValue(
                new NotFoundException("Profile not found")
            );

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Profile not found");
        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.updateProfile as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong while updating your profile."
            );
        });
    });
    describe("Get user experience test endpoints /api/users/experience", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(
                "/api/users/experience",
                "GET",
            );

            const response = await experienceGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllUsersExperiences).not.toHaveBeenCalled();
        });
        it("should return all user experiences if authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUsersExperiences as jest.Mock).mockResolvedValue([mockedExperience])

            const request = createRequest("/api/user/experience", "GET");

            const response = await experienceGET(request, {});

            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Experiences retrieved successfully");

            expect(result.experiences).toEqual(
                JSON.parse(JSON.stringify([mockedExperience]))
            );
            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllUsersExperiences).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return an empty array if no experiences found", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUsersExperiences as jest.Mock).mockResolvedValue([])

            const request = createRequest("/api/users/experience", "GET");

            const response = await experienceGET(request, {});

            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Experiences retrieved successfully");

            expect(result.experiences).toEqual([]);
            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllUsersExperiences).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 500 if an unexpected error occur", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllUsersExperiences as jest.Mock).mockRejectedValue(new Error("Database error"));

            const request = createRequest("/api/user/experience", "GET");

            const response = await experienceGET(request, {});

            const result = await response.json(); 

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Something went wrong. Failed to get the user Experiences!");

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllUsersExperiences).toHaveBeenCalledWith(mockedUser.userId);
        });
    });
    describe("POST user experience endpoint test /api/users/experience", () => {
       it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest("/api/users/experience","POST",mockedvalidExperienceData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.addUserExperience).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            const invalidData = {
                job_title: "",
                company_name: "",
                is_current: "not-a-boolean"
            };

            const request = createRequest("/api/users/experiences","POST", invalidData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(UserService.addUserExperience).not.toHaveBeenCalled();
        });
        it("should add an experience successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserExperience as jest.Mock).mockResolvedValue(mockedExperience);

            const request = createRequest("/api/users/experience", "POST", mockedvalidExperienceData);

            const response = await experiencePOST(request, {});
            const result = await response.json();
            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Experience added successfully");

            expect(result.experience).toEqual(
                JSON.parse(JSON.stringify(mockedExperience))
            );
            expect(UserService.addUserExperience).toHaveBeenCalledTimes(1);
            expect(UserService.addUserExperience).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedvalidExperienceData,
                    start_date: new Date("2023-01-01"),
                    end_date: new Date("2026-01-01")
                }
            );
        });
        it("should return 400 if the experience already exists", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserExperience as jest.Mock).mockRejectedValue(
                new AlreadyExistsException()
            );

            const request = createRequest("/api/users/experiences", "POST", mockedvalidExperienceData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("This property already exists");

            expect(UserService.addUserExperience).toHaveBeenCalledTimes(1);
            expect(UserService.addUserExperience).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedvalidExperienceData,
                    start_date: new Date("2023-01-01"),
                    end_date: new Date("2026-01-01")
                }
            );

        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addUserExperience as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest( "/api/users/experiences", "POST", mockedvalidExperienceData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to add the user experience!"
            );
            expect(UserService.addUserExperience).toHaveBeenCalledTimes(1);
            expect(UserService.addUserExperience).toHaveBeenCalledWith(
                mockedUser.userId,
                {
                    ...mockedvalidExperienceData,
                    start_date: new Date("2023-01-01"),
                    end_date: new Date("2026-01-01")
                }
            );
        });
    });
    describe("Get user skills endpoins test /api/users/skills", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(
                "/api/users/skills",
                "GET",
            );

            const response = await skillsGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllSkills).not.toHaveBeenCalled();
        });
        it("should return all user experiences if authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllSkills as jest.Mock).mockResolvedValue([mockedskill])

            const request = createRequest("/api/users/skills", "GET");

            const response = await skillsGET(request, {});

            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Skills retrieved successfully");

            expect(result.skills).toEqual(
                JSON.parse(JSON.stringify([mockedskill]))
            );
            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllSkills).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return an empty array if no skills found", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllSkills as jest.Mock).mockResolvedValue([])

            const request = createRequest("/api/users/skills", "GET");

            const response = await skillsGET(request, {});

            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Skills retrieved successfully");

            expect(result.skills).toEqual([]);
            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllSkills).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 500 if an unexpected error occur", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getAllSkills as jest.Mock).mockRejectedValue(new Error("Database error"));

            const request = createRequest("/api/users/skills", "GET");

            const response = await skillsGET(request, {});

            const result = await response.json(); 

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Something went wrong. Failed to get the skills!");

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getAllSkills).toHaveBeenCalledWith(mockedUser.userId);
        });
    });
    describe("POST user skills endpoint test /api/users/skills", () => {
       it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest("/api/users/skills","POST",mockedvalidSkillData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.addSkill).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            const invalidData = {
                skill_name: "",
                proficiency: "",
                years_exp: "not-a-boolean"
            };

            const request = createRequest("/api/users/skills","POST", invalidData);

            const response = await experiencePOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(UserService.addSkill).not.toHaveBeenCalled();
        });
        it("should add an skill successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addSkill as jest.Mock).mockResolvedValue(mockedskill);

            const request = createRequest("/api/users/skills", "POST", mockedvalidSkillData);

            const response = await skillsPOST(request, {});
            const result = await response.json();
            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Skill added successfully");

            expect(result.skill).toEqual(
                JSON.parse(JSON.stringify(mockedskill))
            );
            expect(UserService.addSkill).toHaveBeenCalledTimes(1);
            expect(UserService.addSkill).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedvalidSkillData
            );
        });
        it("should return 400 if the skill already exists", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addSkill as jest.Mock).mockRejectedValue(
                new AlreadyExistsException()
            );

            const request = createRequest("/api/users/skills", "POST", mockedvalidSkillData);

            const response = await skillsPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("This property already exists");

            expect(UserService.addSkill).toHaveBeenCalledTimes(1);
            expect(UserService.addSkill).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedvalidSkillData
            );

        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.addSkill as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest( "/api/users/skills", "POST", mockedvalidSkillData);

            const response = await skillsPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to add the skill!"
            );
            expect(UserService.addSkill).toHaveBeenCalledTimes(1);
            expect(UserService.addSkill).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedvalidSkillData
            );
        });
    });
});